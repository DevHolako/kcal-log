<?php

use App\Models\UserOffConnection;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->service = new OpenFoodFactsService;
});

test('transforms OFF product payload to food attributes accurately', function () {
    $product = [
        'code' => '3017620422003',
        'product_name' => 'Nutella Hazelnut Spread',
        'brands' => 'Ferrero',
        'serving_size' => '15g',
        'serving_quantity' => 15,
        'nutriscore_grade' => 'E',
        'nova_group' => 4,
        'ecoscore_grade' => 'D',
        'nutriments' => [
            'energy-kcal_100g' => 539.0,
            'proteins_100g' => 6.3,
            'carbohydrates_100g' => 57.5,
            'fat_100g' => 30.9,
            'fiber_100g' => 3.0,
            'sugars_100g' => 56.3,
            'saturated-fat_100g' => 10.6,
            'sodium_100g' => 0.043,
        ],
    ];

    $data = $this->service->transformProductToFoodData($product, '3017620422003');

    expect($data['name'])->toBe('Nutella Hazelnut Spread')
        ->and($data['brand'])->toBe('Ferrero')
        ->and($data['barcode'])->toBe('3017620422003')
        ->and($data['calories'])->toBe(539.0)
        ->and($data['protein'])->toBe(6.3)
        ->and($data['carbs'])->toBe(57.5)
        ->and($data['fat'])->toBe(30.9)
        ->and($data['fiber'])->toBe(3.0)
        ->and($data['sugar'])->toBe(56.3)
        ->and($data['saturated_fat'])->toBe(10.6)
        ->and($data['sodium'])->toBe(0.043)
        ->and($data['nutri_score'])->toBe('e')
        ->and($data['nova_group'])->toBe(4)
        ->and($data['eco_score'])->toBe('d')
        ->and($data['is_custom'])->toBeFalse()
        ->and($data['user_id'])->toBeNull();
});

test('extracts servings from OFF product with 100g and portion size', function () {
    $product = [
        'serving_size' => '1 portion (15g)',
        'serving_quantity' => 15.0,
    ];

    $servings = $this->service->extractServingsFromProduct($product);

    expect($servings)->toHaveCount(2)
        ->and($servings[0]['serving_name'])->toBe('100g')
        ->and($servings[0]['gram_equivalent'])->toBe(100.0)
        ->and($servings[0]['is_default'])->toBeTrue()
        ->and($servings[1]['serving_name'])->toBe('1 portion (15g)')
        ->and($servings[1]['gram_equivalent'])->toBe(15.0)
        ->and($servings[1]['is_default'])->toBeFalse();
});

test('findBarcode returns product when found on anonymous OFF', function () {
    Http::fake([
        '*/api/v2/product/3017620422003.json' => Http::response([
            'status' => 1,
            'code' => '3017620422003',
            'product' => [
                'code' => '3017620422003',
                'product_name' => 'Nutella',
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

    $result = $this->service->findBarcode('3017620422003');

    expect($result)->not->toBeNull()
        ->and($result['source'])->toBe('off_anonymous')
        ->and($result['product']['product_name'])->toBe('Nutella');
});

test('findBarcode uses authenticated source when connection is provided', function () {
    Http::fake([
        '*/api/v2/product/3017620422003.json' => Http::response([
            'status' => 1,
            'code' => '3017620422003',
            'product' => [
                'code' => '3017620422003',
                'product_name' => 'Nutella',
            ],
        ], 200),
    ]);

    $connection = new UserOffConnection([
        'username' => 'testuser',
        'password' => 'secret123',
        'is_connected' => true,
    ]);

    $result = $this->service->findBarcode('3017620422003', $connection);

    expect($result)->not->toBeNull()
        ->and($result['source'])->toBe('off_authenticated');
});

test('findBarcode returns null when OFF status is 0 (product not found)', function () {
    Http::fake([
        '*/api/v2/product/9999999999999.json' => Http::response([
            'status' => 0,
            'status_verbose' => 'product not found',
        ], 200),
    ]);

    $result = $this->service->findBarcode('9999999999999');

    expect($result)->toBeNull();
});

test('findBarcode throws exception when network error or timeout occurs', function () {
    Http::fake([
        '*/api/v2/product/*' => Http::response(null, 500),
    ]);

    $this->service->findBarcode('123456');
})->throws(RequestException::class);
