<?php

use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);

    $this->food = Food::create([
        'name' => 'Eggs',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 143,
        'protein' => 12.6,
        'carbs' => 0.7,
        'fat' => 9.5,
        'is_custom' => false,
    ]);
});

test('user can visit daily diary web page and view slots', function () {
    $response = $this->actingAs($this->user)
        ->get(route('diary.index', ['date' => '2026-10-14']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('diary/index')
            ->has('diary')
            ->has('recentFoods')
            ->where('selectedDate', '2026-10-14')
        );
});

test('user can log food via web diary route', function () {
    $response = $this->actingAs($this->user)
        ->post(route('diary.store'), [
            'food_id' => $this->food->id,
            'date' => '2026-10-14',
            'meal_slot' => 'breakfast',
            'quantity' => 1,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('diary_entries', [
        'user_id' => $this->user->id,
        'food_id' => $this->food->id,
        'meal_slot' => 'breakfast',
    ]);
});

test('user can log water via web diary route', function () {
    $response = $this->actingAs($this->user)
        ->post(route('diary.water.store'), [
            'date' => '2026-10-14',
            'amount_ml' => 350,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('water_logs', [
        'user_id' => $this->user->id,
        'amount_ml' => 350,
    ]);
});
