<?php

use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;

test('authenticated user can view food details with servings', function () {
    $user = User::factory()->create();

    $food = Food::create([
        'name' => 'Atlantic Salmon',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 208,
        'protein' => 20.4,
        'carbs' => 0,
        'fat' => 13.4,
        'is_custom' => false,
    ]);
    FoodServing::create([
        'food_id' => $food->id,
        'serving_name' => '1 fillet (170g)',
        'gram_equivalent' => 170,
        'is_default' => true,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson("/api/v1/foods/{$food->id}");

    $response->assertOk()
        ->assertJson([
            'data' => [
                'id' => $food->id,
                'name' => 'Atlantic Salmon',
                'servings' => [
                    [
                        'serving_name' => '1 fillet (170g)',
                        'gram_equivalent' => '170.00',
                    ],
                ],
            ],
        ]);
});

test('calculate endpoint scales calories and macros for given portion and quantity', function () {
    $user = User::factory()->create();

    $food = Food::create([
        'name' => 'Greek Yogurt',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 120,
        'protein' => 9,
        'carbs' => 4,
        'fat' => 7.5,
        'fiber' => 0,
        'sugar' => 4,
        'sodium' => 40,
        'is_custom' => false,
    ]);

    // Portion of 170g (1 pot), quantity 1.5 pots = 255g
    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/foods/{$food->id}/calculate", [
            'gram_equivalent' => 170,
            'quantity' => 1.5,
        ]);

    $response->assertOk()
        ->assertJson([
            'data' => [
                'total_grams' => 255.0,
                'factor' => 2.55,
                'calories' => 306.0,  // 120 * 2.55
                'protein' => 22.95,   // 9 * 2.55
                'carbs' => 10.2,      // 4 * 2.55
                'fat' => 19.13,       // 7.5 * 2.55 = 19.125 -> 19.13
                'sugar' => 10.2,      // 4 * 2.55
                'sodium' => 102.0,    // 40 * 2.55
            ],
        ]);
});
