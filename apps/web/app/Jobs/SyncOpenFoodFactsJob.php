<?php

namespace App\Jobs;

use App\Events\FoodCatalogSynced;
use App\Models\Food;
use App\Services\FoodService;
use App\Services\OpenFoodFactsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
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

        Log::info('Starting scheduled Open Food Facts daily sync', [
            'terms_count' => count($terms),
            'pages_per_term' => $this->pagesPerTerm,
            'page_size' => $this->pageSize,
            'refresh_stale' => $this->refreshStale,
        ]);

        // 1. Fetch & cache staple products by terms
        foreach ($terms as $term) {
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
}
