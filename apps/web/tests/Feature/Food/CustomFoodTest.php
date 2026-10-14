<?php

use App\Models\Food;
use App\Models\User;

test('authenticated user can create a custom food with multiple servings', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Custom Protein Pancake',
        'brand' => 'Homemade',
        'serving_size' => 100.0,
        'serving_unit' => 'g',
        'calories' => 210.0,
        'protein' => 20.0,
        'carbs' => 25.0,
        'fat' => 3.5,
        'fiber' => 2.0,
        'sugar' => 4.0,
        'saturated_fat' => 0.8,
        'sodium' => 150.0,
        'servings' => [
            [
                'serving_name' => '1 pancake (80g)',
                'gram_equivalent' => 80.0,
                'is_default' => true,
            ],
            [
                'serving_name' => 'Stack of 3 (240g)',
                'gram_equivalent' => 240.0,
                'is_default' => false,
            ],
        ],
    ];

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/foods/custom', $payload);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'name' => 'Custom Protein Pancake',
                'brand' => 'Homemade',
                'is_custom' => true,
                'calories' => '210.00',
                'protein' => '20.00',
            ],
        ]);

    $this->assertDatabaseHas('foods', [
        'name' => 'Custom Protein Pancake',
        'user_id' => $user->id,
        'is_custom' => true,
    ]);

    $food = Food::where('name', 'Custom Protein Pancake')->first();
    expect($food->servings)->toHaveCount(2);
});

test('user can list only their own custom foods', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Food::factory()->create([
        'user_id' => $user->id,
        'is_custom' => true,
        'name' => 'User Food A',
    ]);
    Food::factory()->create([
        'user_id' => $otherUser->id,
        'is_custom' => true,
        'name' => 'Other User Food B',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/custom');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonFragment(['name' => 'User Food A'])
        ->assertJsonMissing(['name' => 'Other User Food B']);
});

test('user can update their own custom food', function () {
    $user = User::factory()->create();

    $food = Food::factory()->create([
        'user_id' => $user->id,
        'is_custom' => true,
        'name' => 'Old Pancake Name',
        'calories' => 200,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/foods/custom/{$food->id}", [
            'name' => 'New Delicious Pancake',
            'calories' => 220,
            'protein' => 22,
            'carbs' => 24,
            'fat' => 4,
            'serving_size' => 100,
            'serving_unit' => 'g',
        ]);

    $response->assertOk()
        ->assertJsonFragment([
            'name' => 'New Delicious Pancake',
            'calories' => '220.00',
        ]);

    $this->assertDatabaseHas('foods', [
        'id' => $food->id,
        'name' => 'New Delicious Pancake',
    ]);
});

test('user cannot update or delete another users custom food', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $food = Food::factory()->create([
        'user_id' => $otherUser->id,
        'is_custom' => true,
        'name' => 'Private Food',
    ]);

    $updateResponse = $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/foods/custom/{$food->id}", [
            'name' => 'Hacked Food',
            'calories' => 100,
            'protein' => 10,
            'carbs' => 10,
            'fat' => 1,
            'serving_size' => 100,
            'serving_unit' => 'g',
        ]);

    $updateResponse->assertForbidden();

    $deleteResponse = $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/foods/custom/{$food->id}");

    $deleteResponse->assertForbidden();
});

test('user can delete their own custom food', function () {
    $user = User::factory()->create();

    $food = Food::factory()->create([
        'user_id' => $user->id,
        'is_custom' => true,
        'name' => 'Food To Delete',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/foods/custom/{$food->id}");

    $response->assertOk();

    $this->assertDatabaseMissing('foods', [
        'id' => $food->id,
    ]);
});
