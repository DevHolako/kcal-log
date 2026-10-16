<?php

use App\Jobs\SyncOpenFoodFactsJob;
use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\UserOffConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);
});

test('user can visit foods catalog web page with accurate total counts', function () {
    Food::factory()->count(5)->create(['is_custom' => false]);
    Food::factory()->count(2)->create(['is_custom' => true, 'user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->get(route('foods.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('foods/index')
            ->has('initialFoods')
            ->has('customFoods')
            ->where('totalCachedFoods', 5)
            ->where('totalCustomFoods', 2)
            ->where('isOffConnected', false)
        );
});

test('user can visit foods catalog web page with isOffConnected true when connected', function () {
    UserOffConnection::create([
        'user_id' => $this->user->id,
        'username' => 'testoffuser',
        'password' => 'secret123',
        'is_connected' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('foods.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('foods/index')
            ->where('isOffConnected', true)
        );
});

test('user can trigger on-demand open food facts sync with custom count and category', function () {
    Queue::fake();

    $response = $this->actingAs($this->user)
        ->post(route('foods.sync'), [
            'count' => 50,
            'category' => 'protein',
        ]);

    $response->assertRedirect();
    Queue::assertPushed(SyncOpenFoodFactsJob::class, function ($job) {
        return $job->pageSize > 0 && $job->userId === $this->user->id;
    });
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

test('user can view food detail page for public or cached food', function () {
    $food = Food::factory()->create([
        'name' => 'Organic Rolled Oats',
        'is_custom' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('foods.show', $food));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('foods/show')
            ->has('food')
            ->where('food.id', $food->id)
            ->where('food.name', 'Organic Rolled Oats')
        );
});

test('user can view their own custom food detail page', function () {
    $customFood = Food::factory()->create([
        'name' => 'My Secret Protein Bowl',
        'is_custom' => true,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('foods.show', $customFood));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('foods/show')
            ->where('food.id', $customFood->id)
            ->where('food.is_custom', true)
        );
});

test('user cannot view another users custom food detail page', function () {
    $otherUser = User::factory()->create();
    $otherCustomFood = Food::factory()->create([
        'name' => 'Other Secret Meal',
        'is_custom' => true,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('foods.show', $otherCustomFood));

    $response->assertForbidden();
});

test('user can fetch sync status via polling endpoint', function () {
    Cache::put("food_sync_progress_{$this->user->id}", [
        'active' => true,
        'percent' => 45,
        'status' => "Syncing 'eggs'...",
        'saved_count' => 12,
        'completed' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson(route('foods.sync.status'));

    $response->assertOk()
        ->assertJsonPath('progress.active', true)
        ->assertJsonPath('progress.percent', 45)
        ->assertJsonPath('progress.saved_count', 12);
});
