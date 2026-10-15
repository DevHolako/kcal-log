<?php

use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);
});

test('user can visit foods catalog web page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('foods.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('foods/index')
            ->has('initialFoods')
            ->has('customFoods')
        );
});

test('user can create and delete custom food through web route', function () {
    $response = $this->actingAs($this->user)
        ->post(route('foods.custom.store'), [
            'name' => 'Web Protein Oats',
            'serving_size' => 100,
            'serving_unit' => 'g',
            'calories' => 350,
            'protein' => 25,
            'carbs' => 50,
            'fat' => 6,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('foods', [
        'name' => 'Web Protein Oats',
        'user_id' => $this->user->id,
        'is_custom' => true,
    ]);

    $food = Food::where('name', 'Web Protein Oats')->first();

    $deleteResponse = $this->actingAs($this->user)
        ->delete(route('foods.custom.destroy', $food));

    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('foods', ['id' => $food->id]);
});

test('user can visit open food facts settings page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('settings.off.edit'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/open-food-facts')
            ->has('connection')
        );
});

test('user can connect and disconnect OFF account through web settings', function () {
    Http::fake([
        '*/cgi/session.pl' => Http::response('Logged in OK', 200),
    ]);

    $connectResponse = $this->actingAs($this->user)
        ->post(route('settings.off.connect'), [
            'username' => 'off_web_user',
            'password' => 'secret123',
        ]);

    $connectResponse->assertRedirect();
    $this->assertDatabaseHas('user_off_connections', [
        'user_id' => $this->user->id,
        'username' => 'off_web_user',
        'is_connected' => true,
    ]);

    $disconnectResponse = $this->actingAs($this->user)
        ->post(route('settings.off.disconnect'));

    $disconnectResponse->assertRedirect();
    $this->assertDatabaseHas('user_off_connections', [
        'user_id' => $this->user->id,
        'is_connected' => false,
    ]);
});

test('user can search foods via web search ajax endpoint', function () {
    Food::factory()->create([
        'name' => 'Searchable Granola',
        'is_custom' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson(route('foods.search', ['q' => 'Granola']));

    $response->assertOk()
        ->assertJsonStructure(['items', 'source', 'is_degraded', 'total']);
});

test('user can lookup barcode via web barcode endpoint', function () {
    $food = Food::factory()->create([
        'name' => 'Barcoded Milk',
        'barcode' => '7622210449283',
        'is_custom' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson(route('foods.barcode', ['barcode' => '7622210449283']));

    $response->assertOk()
        ->assertJsonPath('food.barcode', '7622210449283');
});

