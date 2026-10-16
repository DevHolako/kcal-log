<?php

namespace App\Jobs;

use App\Events\FoodCatalogSynced;
use App\Events\FoodCatalogSyncProgress;
use App\Models\Food;
use App\Services\FoodService;
use App\Services\OpenFoodFactsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncOpenFoodFactsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Default staple food search terms across common dietary categories.
     *
     * @var list<string>
     */
    public const DEFAULT_TERMS = [
        'chicken breast',
        'eggs',
        'rolled oats',
        'whole milk',
        'greek yogurt',
        'brown rice',
        'salmon fillet',
        'banana',
        'apple',
        'peanut butter',
        'extra virgin olive oil',
        'canned tuna',
        'whey protein',
        'almonds',
        'sweet potato',
        'spinach',
        'broccoli',
        'avocado',
        'black beans',
        'cottage cheese',
    ];

    /**
     * @param  list<string>|null  $terms
     */
    public function __construct(
        public ?array $terms = null,
        public int $pagesPerTerm = 1,
        public int $pageSize = 20,
        public bool $refreshStale = true,
        public int $staleDays = 14,
        public int $sleepMs = 0,
        public ?int $userId = null,
    ) {
        $this->onQueue('default');
    }

    /**
     * Get the tags that should be assigned to the job for Horizon tracing.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return [
            'sync:open-food-facts',
            'catalog:staples',
        ];
    }

    /**
     * Execute the job.
     *
     * @return array{saved: int, refreshed: int, failed_queries: int}
     */
    public function handle(OpenFoodFactsService $offService, FoodService $foodService): array
    {
        $terms = (! empty($this->terms)) ? $this->terms : self::DEFAULT_TERMS;
        $savedCount = 0;
        $failedQueries = 0;
        $refreshedCount = 0;
        $totalTerms = count($terms);

        Log::info('Starting scheduled Open Food Facts daily sync', [
            'terms_count' => $totalTerms,
            'pages_per_term' => $this->pagesPerTerm,
            'page_size' => $this->pageSize,
            'refresh_stale' => $this->refreshStale,
        ]);

        $this->updateProgress(
            current: 0,
            total: $totalTerms,
            percent: 0,
            status: 'Starting Open Food Facts catalog sync...',
            savedCount: 0,
        );

        // 1. Fetch & cache staple products by terms
        foreach ($terms as $index => $term) {
            $percent = (int) round((($index) / max(1, $totalTerms)) * 100);
            $this->updateProgress(
                current: $index + 1,
                total: $totalTerms,
                percent: $percent,
                status: "Syncing '{$term}' from Open Food Facts...",
                savedCount: $savedCount,
            );

            for ($page = 1; $page <= $this->pagesPerTerm; $page++) {
                try {
                    $result = $offService->search($term, page: $page, perPage: $this->pageSize);
                    $products = $result['products'];

                    foreach ($products as $product) {

                        // Ensure product has a name and valid barcode/code
                        $name = $product['product_name'] ?? $product['product_name_en'] ?? $product['product_name_fr'] ?? null;
                        $code = $product['code'] ?? null;

                        if (empty($name) || empty($code)) {
                            continue;
                        }

                        $foodService->cacheOffProduct($product, (string) $code);
                        $savedCount++;
                    }
                } catch (\Throwable $e) {
                    $failedQueries++;
                    Log::warning('OpenFoodFacts daily sync query failed for term', [
                        'term' => $term,
                        'page' => $page,
                        'error' => $e->getMessage(),
                    ]);
                }

                if ($this->sleepMs > 0) {
                    usleep($this->sleepMs * 1000);
                }
            }
        }

        // 2. Refresh stale cached foods
        if ($this->refreshStale) {
            try {
                /** @var Collection<int, Food> $staleFoods */
                $staleFoods = Food::whereNotNull('barcode')
                    ->where('is_custom', false)
                    ->where(function ($q) {
                        $q->whereNull('last_synced_at')
                            ->orWhere('last_synced_at', '<', now()->subDays($this->staleDays));
                    })
                    ->limit(50)
                    ->get();

                foreach ($staleFoods as $food) {
                    try {
                        $barcodeResult = $offService->findBarcode($food->barcode);
                        if ($barcodeResult && ! empty($barcodeResult['product'])) {
                            $foodService->cacheOffProduct($barcodeResult['product'], $food->barcode);
                            $refreshedCount++;
                        }
                    } catch (\Throwable $e) {
                        Log::warning('Failed refreshing stale OFF product', [
                            'barcode' => $food->barcode,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    if ($this->sleepMs > 0) {
                        usleep($this->sleepMs * 1000);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Error during stale food refresh pass', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Open Food Facts daily sync completed', [
            'saved' => $savedCount,
            'refreshed' => $refreshedCount,
            'failed_queries' => $failedQueries,
        ]);

        $totalCount = Food::where('is_custom', false)->count();

        $this->updateProgress(
            current: $totalTerms,
            total: $totalTerms,
            percent: 100,
            status: "Catalog sync complete! {$savedCount} items added.",
            savedCount: $savedCount,
            isCompleted: true,
        );

        try {
            FoodCatalogSynced::dispatch(
                $savedCount,
                $totalCount,
                $this->userId,
                [
                    'refreshed' => $refreshedCount,
                    'failed_queries' => $failedQueries,
                ]
            );
        } catch (\Throwable $e) {
            Log::warning('Failed broadcasting FoodCatalogSynced event', [
                'error' => $e->getMessage(),
            ]);
        }

        return [
            'saved' => $savedCount,
            'refreshed' => $refreshedCount,
            'failed_queries' => $failedQueries,
        ];
    }

    /**
     * Report and cache current sync progress for WebSockets and HTTP polling.
     */
    protected function updateProgress(int $current, int $total, int $percent, string $status, int $savedCount, bool $isCompleted = false): void
    {
        $payload = [
            'active' => ! $isCompleted,
            'current' => $current,
            'total' => $total,
            'percent' => $percent,
            'status' => $status,
            'saved_count' => $savedCount,
            'completed' => $isCompleted,
            'user_id' => $this->userId,
            'updated_at' => now()->toIso8601String(),
        ];

        if ($this->userId !== null) {
            Cache::put("food_sync_progress_{$this->userId}", $payload, now()->addMinutes(10));
        }
        Cache::put('food_sync_progress_global', $payload, now()->addMinutes(10));

        try {
            FoodCatalogSyncProgress::dispatch(
                current: $current,
                total: $total,
                percent: $percent,
                status: $status,
                savedCount: $savedCount,
                userId: $this->userId,
                isCompleted: $isCompleted,
            );
        } catch (\Throwable $e) {
            Log::warning('Broadcast failed for FoodCatalogSyncProgress', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
