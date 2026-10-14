<?php

use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('food search queries OFF and returns mapped results', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/cgi/search.pl*' => Http::response([
            'count' => 1,
            'page' => 1,
            'page_size' => 20,
            'products' => [
                [
                    'code' => '5411188110835',
                    'product_name' => 'Alpro Soya Unsweetened',
                    'brands' => 'Alpro',
                    'serving_size' => '100ml',
                    'serving_quantity' => 100,
                    'nutriments' => [
                        'energy-kcal_100g' => 33,
                        'proteins_100g' => 3.3,
                        'carbohydrates_100g' => 0.0,
                        'fat_100g' => 1.8,
                    ],
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/search?q=Alpro');

    $response->assertOk()
        ->assertJson([
            'source' => 'off_anonymous',
            'is_degraded' => false,
        ])
        ->assertJsonFragment([
            'barcode' => '5411188110835',
            'name' => 'Alpro Soya Unsweetened',
        ]);

    $this->assertDatabaseHas('foods', [
        'barcode' => '5411188110835',
        'name' => 'Alpro Soya Unsweetened',
    ]);
});

test('food search falls back to local database when OFF search fails', function () {
    $user = User::factory()->create();

    $food = Food::create([
        'off_id' => '030000010204',
        'barcode' => '030000010204',
        'name' => 'Old Fashioned Rolled Oats',
        'brand' => 'Quaker',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 389,
        'protein' => 16.9,
        'carbs' => 66.3,
        'fat' => 6.9,
        'is_custom' => false,
    ]);
    FoodServing::create([
        'food_id' => $food->id,
        'serving_name' => '1/2 cup (40g)',
        'gram_equivalent' => 40,
        'is_default' => true,
    ]);

    // Simulate OFF outage
    Http::fake([
        '*/cgi/search.pl*' => Http::response(null, 500),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/search?q=Quaker');

    $response->assertOk()
        ->assertJson([
            'source' => 'cache',
            'is_degraded' => true,
        ])
        ->assertJsonFragment([
            'name' => 'Old Fashioned Rolled Oats',
        ]);
});

test('food search includes user custom foods alongside OFF results', function () {
    $user = User::factory()->create();

    $customFood = Food::create([
        'user_id' => $user->id,
        'is_custom' => true,
        'name' => 'Homemade Whey Protein Shake',
        'brand' => 'Kitchen',
        'serving_size' => 350,
        'serving_unit' => 'ml',
        'calories' => 280,
        'protein' => 42,
        'carbs' => 15,
        'fat' => 4,
    ]);
    FoodServing::create([
        'food_id' => $customFood->id,
        'serving_name' => '1 shaker (350ml)',
        'gram_equivalent' => 350,
        'is_default' => true,
    ]);

    Http::fake([
        '*/cgi/search.pl*' => Http::response([
            'count' => 0,
            'page' => 1,
            'page_size' => 20,
            'products' => [],
        ], 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/search?q=Shake');

    $response->assertOk()
        ->assertJsonFragment([
            'name' => 'Homemade Whey Protein Shake',
            'is_custom' => true,
        ]);
});
