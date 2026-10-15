<?php

use App\Console\Commands\SyncOpenFoodFactsCommand;
use App\Jobs\SyncOpenFoodFactsJob;
use App\Models\Food;
use App\Models\FoodServing;
use App\Services\FoodService;
use App\Services\OpenFoodFactsService;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('SyncOpenFoodFactsJob fetches and caches products from Open Food Facts', function () {
    Http::fake([
        '*/cgi/search.pl*' => Http::response([
            'count' => 2,
            'page' => 1,
            'page_size' => 20,
            'products' => [
                [
                    'code' => '001234567890',
                    'product_name' => 'Organic Rolled Oats',
                    'brands' => 'Staple Brand',
                    'image_front_small_url' => 'https://images.openfoodfacts.org/oats.jpg',
                    'serving_size' => '40g',
                    'serving_quantity' => 40,
                    'nutriments' => [
                        'energy-kcal_100g' => 370,
                        'proteins_100g' => 13.5,
                        'carbohydrates_100g' => 60.0,
                        'fat_100g' => 7.0,
                        'fiber_100g' => 10.0,
                    ],
                ],
                [
                    'code' => '009876543210',
                    'product_name' => 'Greek Whole Milk Yogurt',
                    'brands' => 'Dairy Best',
                    'image_front_small_url' => 'https://images.openfoodfacts.org/yogurt.jpg',
                    'serving_size' => '150g',
                    'serving_quantity' => 150,
                    'nutriments' => [
                        'energy-kcal_100g' => 95,
                        'proteins_100g' => 9.0,
                        'carbohydrates_100g' => 4.0,
                        'fat_100g' => 5.0,
                    ],
                ],
            ],
        ], 200),
    ]);

    $job = new SyncOpenFoodFactsJob(
        terms: ['oats'],
        pagesPerTerm: 1,
        pageSize: 20,
        refreshStale: false,
    );

    $result = $job->handle(app(OpenFoodFactsService::class), app(FoodService::class));

    expect($result['saved'])->toBe(2)
        ->and($result['failed_queries'])->toBe(0);

    $this->assertDatabaseHas('foods', [
        'barcode' => '001234567890',
        'name' => 'Organic Rolled Oats',
        'brand' => 'Staple Brand',
        'is_custom' => false,
    ]);

    $this->assertDatabaseHas('foods', [
        'barcode' => '009876543210',
        'name' => 'Greek Whole Milk Yogurt',
        'brand' => 'Dairy Best',
        'is_custom' => false,
    ]);

    $oats = Food::where('barcode', '001234567890')->first();
    expect($oats->servings)->toHaveCount(2) // 100g default + 40g portion
        ->and($oats->image_url)->toBe('https://images.openfoodfacts.org/oats.jpg');
});

test('SyncOpenFoodFactsJob continues gracefully when a query fails', function () {
    Http::fake([
        '*/cgi/search.pl*' => Http::response(['error' => 'Rate limit or server error'], 500),
    ]);

    $job = new SyncOpenFoodFactsJob(
        terms: ['broken-term'],
        pagesPerTerm: 1,
        pageSize: 10,
        refreshStale: false,
    );

    $result = $job->handle(app(OpenFoodFactsService::class), app(FoodService::class));

    expect($result['saved'])->toBe(0)
        ->and($result['failed_queries'])->toBe(1);
});

test('SyncOpenFoodFactsJob refreshes stale cached foods', function () {
    $staleFood = Food::create([
        'off_id' => '111222333444',
        'barcode' => '111222333444',
        'name' => 'Old Chicken Breast',
        'brand' => 'Old Brand',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 120,
        'protein' => 25,
        'carbs' => 0,
        'fat' => 2,
        'is_custom' => false,
        'last_synced_at' => now()->subDays(20),
    ]);

    Http::fake([
        '*/api/v2/product/111222333444.json' => Http::response([
            'status' => 1,
            'product' => [
                'code' => '111222333444',
                'product_name' => 'Updated Chicken Breast Fillets',
                'brands' => 'Premium Poultry',
                'nutriments' => [
                    'energy-kcal_100g' => 125,
                    'proteins_100g' => 26,
                    'carbohydrates_100g' => 0,
                    'fat_100g' => 2.2,
                ],
            ],
        ], 200),
    ]);

    $job = new SyncOpenFoodFactsJob(
        terms: [],
        pagesPerTerm: 1,
        refreshStale: true,
        staleDays: 14,
    );

    $result = $job->handle(app(OpenFoodFactsService::class), app(FoodService::class));

    expect($result['refreshed'])->toBe(1);

    $staleFood->refresh();
    expect($staleFood->name)->toBe('Updated Chicken Breast Fillets')
        ->and($staleFood->brand)->toBe('Premium Poultry')
        ->and($staleFood->calories)->toEqual(125.0);
});

test('SyncOpenFoodFactsCommand dispatches job to queue by default', function () {
    Queue::fake();

    $this->artisan('off:sync', ['--terms' => 'chicken,rice'])
        ->expectsOutput('Dispatching SyncOpenFoodFactsJob to default queue...')
        ->expectsOutput('Open Food Facts sync job dispatched successfully.')
        ->assertExitCode(0);

    Queue::assertPushed(SyncOpenFoodFactsJob::class, function (SyncOpenFoodFactsJob $job) {
        return $job->terms === ['chicken', 'rice']
            && $job->queue === 'default';
    });
});

test('SyncOpenFoodFactsCommand runs synchronously with --sync flag', function () {
    Http::fake([
        '*/cgi/search.pl*' => Http::response([
            'count' => 1,
            'page' => 1,
            'page_size' => 20,
            'products' => [
                [
                    'code' => '333444555666',
                    'product_name' => 'Sync Test Salmon',
                    'brands' => 'Ocean Catch',
                    'nutriments' => [
                        'energy-kcal_100g' => 208,
                        'proteins_100g' => 20.0,
                        'carbohydrates_100g' => 0.0,
                        'fat_100g' => 13.0,
                    ],
                ],
            ],
        ], 200),
    ]);

    $this->artisan('off:sync', [
        '--terms' => 'salmon',
        '--sync' => true,
        '--no-stale' => true,
    ])
        ->expectsOutput('Running Open Food Facts sync synchronously in foreground...')
        ->assertExitCode(0);

    $this->assertDatabaseHas('foods', [
        'barcode' => '333444555666',
        'name' => 'Sync Test Salmon',
    ]);
});

test('daily off:sync command is registered in Laravel schedule', function () {
    $schedule = app(Schedule::class);
    $events = collect($schedule->events());

    $offSyncEvent = $events->first(function ($event) {
        return str_contains((string) $event->command, 'off:sync');
    });

    expect($offSyncEvent)->not->toBeNull()
        ->and($offSyncEvent->expression)->toBe('0 2 * * *'); // daily at 02:00
});
