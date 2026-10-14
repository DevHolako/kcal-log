<?php

use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;
use App\Models\UserOffConnection;
use Illuminate\Support\Facades\Http;

test('barcode lookup retrieves item from Open Food Facts and caches locally', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/api/v2/product/3017620422003.json' => Http::response([
            'status' => 1,
            'code' => '3017620422003',
            'product' => [
                'code' => '3017620422003',
                'product_name' => 'Nutella Hazelnut Spread',
                'brands' => 'Ferrero',
                'serving_size' => '15g',
                'serving_quantity' => 15,
                'nutriscore_grade' => 'e',
                'nova_group' => 4,
                'ecoscore_grade' => 'd',
                'nutriments' => [
                    'energy-kcal_100g' => 539,
                    'proteins_100g' => 6.3,
                    'carbohydrates_100g' => 57.5,
                    'fat_100g' => 30.9,
                    'fiber_100g' => 3.0,
                    'sugars_100g' => 56.3,
                    'saturated-fat_100g' => 10.6,
                    'sodium_100g' => 0.043,
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/barcode/3017620422003');

    $response->assertOk()
        ->assertJson([
            'source' => 'off_anonymous',
            'is_degraded' => false,
            'data' => [
                'barcode' => '3017620422003',
                'name' => 'Nutella Hazelnut Spread',
                'brand' => 'Ferrero',
                'is_custom' => false,
            ],
        ]);

    // Verify it is cached in the local database
    $this->assertDatabaseHas('foods', [
        'barcode' => '3017620422003',
        'is_custom' => false,
        'user_id' => null,
    ]);

    // Verify servings were created
    $food = Food::where('barcode', '3017620422003')->first();
    expect($food->servings)->toHaveCount(2);
});

test('barcode lookup uses authenticated source when user has connected OFF account', function () {
    $user = User::factory()->create();
    UserOffConnection::create([
        'user_id' => $user->id,
        'username' => 'myoffuser',
        'password' => 'secretpass',
        'is_connected' => true,
    ]);

    Http::fake([
        '*/api/v2/product/3017620422003.json' => Http::response([
            'status' => 1,
            'code' => '3017620422003',
            'product' => [
                'code' => '3017620422003',
                'product_name' => 'Nutella Hazelnut Spread',
                'brands' => 'Ferrero',
                'nutriments' => [
                    'energy-kcal_100g' => 539,
                    'proteins_100g' => 6.3,
                    'carbohydrates_100g' => 57.5,
                    'fat_100g' => 30.9,
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/barcode/3017620422003');

    $response->assertOk()
        ->assertJson([
            'source' => 'off_authenticated',
            'is_degraded' => false,
        ]);
});

test('barcode lookup falls back gracefully to local database when OFF is down (Tier 3 degraded mode)', function () {
    $user = User::factory()->create();

    // Seed local food in cache
    $localFood = Food::create([
        'barcode' => '3229820129488',
        'off_id' => '3229820129488',
        'name' => 'Flocons d\'avoine complets bio',
        'brand' => 'Bjorg',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 375,
        'protein' => 13.5,
        'carbs' => 58.5,
        'fat' => 7.0,
        'is_custom' => false,
    ]);
    FoodServing::create([
        'food_id' => $localFood->id,
        'serving_name' => '1 bol (40g)',
        'gram_equivalent' => 40,
        'is_default' => true,
    ]);

    // Simulate OFF API failure (500 server error)
    Http::fake([
        '*/api/v2/product/*' => Http::response(null, 500),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/barcode/3229820129488');

    $response->assertOk()
        ->assertJson([
            'source' => 'cache',
            'is_degraded' => true,
            'data' => [
                'barcode' => '3229820129488',
                'name' => 'Flocons d\'avoine complets bio',
            ],
        ]);
});

test('barcode lookup returns 404 when product is not found on OFF or in local cache', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/api/v2/product/9999999999999.json' => Http::response([
            'status' => 0,
            'status_verbose' => 'product not found',
        ], 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/foods/barcode/9999999999999');

    $response->assertNotFound();
});
