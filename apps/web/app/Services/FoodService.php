<?php

namespace App\Services;

use App\DTOs\FoodLookupResult;
use App\DTOs\FoodSearchResult;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;
use App\Models\UserOffConnection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FoodService
{
    public function __construct(
        protected OpenFoodFactsService $openFoodFactsService,
    ) {}

    /**
     * Resolve food by barcode via the resilient 3-tier fallback chain:
     * Tier 1: OFF Authenticated (if user connected)
     * Tier 2: OFF Anonymous
     * Tier 3: Local database cache (degraded mode if OFF failed)
     */
    public function findByBarcode(string $barcode, ?User $user = null): ?FoodLookupResult
    {
        // Check user's custom food first (if any)
        if ($user) {
            /** @var Food|null $customFood */
            $customFood = Food::where('barcode', $barcode)
                ->where('user_id', $user->id)
                ->where('is_custom', true)
                ->with('servings')
                ->first();

            if ($customFood) {
                $customFood->setAttribute('search_origin', 'custom');

                return new FoodLookupResult($customFood, 'cache', isDegraded: false);
            }
        }

        $connection = $this->getUserOffConnection($user);

        // Tier 1: Authenticated OFF
        if ($connection) {
            try {
                $offResult = $this->openFoodFactsService->findBarcode($barcode, $connection);
                if ($offResult) {
                    $food = $this->cacheOffProduct($offResult['product'], $barcode);
                    $food->setAttribute('search_origin', 'openfoodfacts');

                    return new FoodLookupResult($food, 'off_authenticated', isDegraded: false);
                }
            } catch (\Throwable $e) {
                Log::warning('OFF Tier 1 lookup failed, falling back to Tier 2', [
                    'barcode' => $barcode,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Tier 2: Anonymous OFF
        $offFailed = false;
        try {
            $offResult = $this->openFoodFactsService->findBarcode($barcode, null);
            if ($offResult) {
                $food = $this->cacheOffProduct($offResult['product'], $barcode);
                $food->setAttribute('search_origin', 'openfoodfacts');

                return new FoodLookupResult($food, 'off_anonymous', isDegraded: false);
            }
        } catch (\Throwable $e) {
            Log::warning('OFF Tier 2 lookup failed, falling back to Tier 3 local cache', [
                'barcode' => $barcode,
                'error' => $e->getMessage(),
            ]);
            $offFailed = true;
        }

        // Tier 3: Local database cache fallback
        /** @var Food|null $cachedFood */
        $cachedFood = Food::where('barcode', $barcode)
            ->availableTo($user?->id)
            ->with('servings')
            ->first();

        if ($cachedFood) {
            $cachedFood->setAttribute('search_origin', $cachedFood->is_custom ? 'custom' : 'database');

            return new FoodLookupResult($cachedFood, 'cache', isDegraded: $offFailed);
        }

        return null;
    }

    /**
     * Search foods by text query across OFF and local custom items.
     */
    public function search(string $query, ?User $user = null, int $page = 1, int $perPage = 20): FoodSearchResult
    {
        $connection = $this->getUserOffConnection($user);

        // Fetch user's matching custom foods to prioritize
        $customFoods = $user
            ? Food::custom()
                ->where('user_id', $user->id)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('brand', 'like', "%{$query}%")
                        ->orWhere('barcode', $query);
                })
                ->with('servings')
                ->get()
                ->each(function (Food $f) {
                    $f->setAttribute('search_origin', 'custom');
                })
            : collect();

        // Also check cached non-custom foods in local DB
        /** @var Collection<int, Food> $cachedFoods */
        $cachedFoods = Food::where('is_custom', false)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('brand', 'like', "%{$query}%")
                    ->orWhere('barcode', $query);
            })
            ->with('servings')
            ->limit(20)
            ->get()
            ->each(function (Food $f) {
                $f->setAttribute('search_origin', 'database');
            });

        // Attempt OFF search (Tier 1 or Tier 2)
        try {
            $offResult = $this->openFoodFactsService->search($query, $page, $perPage, $connection);

            $offFoods = collect();
            $existingBarcodes = $cachedFoods->pluck('barcode')->filter()->all();
            foreach ($offResult['products'] as $product) {
                $code = (string) ($product['code'] ?? '');
                if ($code && in_array($code, $existingBarcodes, true)) {
                    continue;
                }
                $food = $this->cacheOffProduct($product, $code ?: null);
                $food->setAttribute('search_origin', 'openfoodfacts');
                $offFoods->push($food);
            }

            /** @var Collection<int, Food> $combined */
            $combined = $customFoods->concat($cachedFoods)->concat($offFoods)->unique('id')->values();

            return new FoodSearchResult(
                items: $combined,
                source: $offResult['source'],
                isDegraded: false,
                total: $offResult['total'] + $customFoods->count() + $cachedFoods->count(),
                page: $page,
                perPage: $perPage,
            );
        } catch (\Throwable $e) {
            Log::warning('OFF search failed, falling back to Tier 3 local cache', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            // Tier 3: Local cache search
            $queryBuilder = Food::availableTo($user?->id)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('brand', 'like', "%{$query}%")
                        ->orWhere('barcode', $query);
                })
                ->with('servings');

            $total = $queryBuilder->count();
            /** @var Collection<int, Food> $items */
            $items = $queryBuilder->forPage($page, $perPage)->get()
                ->each(function (Food $f) {
                    $f->setAttribute('search_origin', $f->is_custom ? 'custom' : 'database');
                });

            return new FoodSearchResult(
                items: $items,
                source: 'cache',
                isDegraded: true,
                total: $total,
                page: $page,
                perPage: $perPage,
            );
        }
    }

    /**
     * Cache an Open Food Facts product locally and ensure standard servings exist.
     *
     * @param  array<string, mixed>  $product
     */
    public function cacheOffProduct(array $product, ?string $barcode = null): Food
    {
        $foodData = $this->openFoodFactsService->transformProductToFoodData($product, $barcode);
        $servingsData = $this->openFoodFactsService->extractServingsFromProduct($product);

        return DB::transaction(function () use ($foodData, $servingsData) {
            $lookup = [];
            if (! empty($foodData['barcode'])) {
                $lookup = ['barcode' => $foodData['barcode'], 'is_custom' => false];
            } elseif (! empty($foodData['off_id'])) {
                $lookup = ['off_id' => $foodData['off_id'], 'is_custom' => false];
            } else {
                $lookup = ['name' => $foodData['name'], 'is_custom' => false];
            }

            /** @var Food $food */
            $food = Food::updateOrCreate($lookup, $foodData);

            foreach ($servingsData as $serving) {
                FoodServing::updateOrCreate(
                    [
                        'food_id' => $food->id,
                        'serving_name' => $serving['serving_name'],
                    ],
                    [
                        'gram_equivalent' => $serving['gram_equivalent'],
                        'is_default' => $serving['is_default'],
                    ]
                );
            }

            $food->load('servings');

            return $food;
        });
    }

    /**
     * Create a user custom food item with servings.
     *
     * @param  array<string, mixed>  $data
     */
    public function createCustomFood(User $user, array $data): Food
    {
        return DB::transaction(function () use ($user, $data) {
            $servings = $data['servings'] ?? [];
            unset($data['servings']);

            $data['user_id'] = $user->id;
            $data['is_custom'] = true;
            $data['off_id'] = null;

            /** @var Food $food */
            $food = Food::create($data);

            if (! empty($servings) && is_array($servings)) {
                foreach ($servings as $serving) {
                    FoodServing::create([
                        'food_id' => $food->id,
                        'serving_name' => (string) $serving['serving_name'],
                        'gram_equivalent' => (float) $serving['gram_equivalent'],
                        'is_default' => ! empty($serving['is_default']),
                    ]);
                }
            } else {
                // Ensure default serving
                FoodServing::create([
                    'food_id' => $food->id,
                    'serving_name' => sprintf('1 %s (%s%s)', $food->serving_unit, (float) $food->serving_size, $food->serving_unit),
                    'gram_equivalent' => (float) $food->serving_size,
                    'is_default' => true,
                ]);
            }

            $food->load('servings');

            return $food;
        });
    }

    /**
     * Update an existing custom food owned by the user.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCustomFood(User $user, Food $food, array $data): Food
    {
        if ($food->user_id !== $user->id || ! $food->is_custom) {
            abort(403, 'Unauthorized action on custom food.');
        }

        return DB::transaction(function () use ($food, $data) {
            $servings = $data['servings'] ?? null;
            unset($data['servings']);

            $food->update($data);

            if ($servings !== null && is_array($servings)) {
                $food->servings()->delete();
                foreach ($servings as $serving) {
                    FoodServing::create([
                        'food_id' => $food->id,
                        'serving_name' => (string) $serving['serving_name'],
                        'gram_equivalent' => (float) $serving['gram_equivalent'],
                        'is_default' => ! empty($serving['is_default']),
                    ]);
                }
            }

            $food->load('servings');

            return $food;
        });
    }

    /**
     * Delete an existing custom food owned by the user.
     */
    public function deleteCustomFood(User $user, Food $food): bool
    {
        if ($food->user_id !== $user->id || ! $food->is_custom) {
            abort(403, 'Unauthorized action on custom food.');
        }

        return (bool) $food->delete();
    }

    /**
     * Calculate scaled nutritional values for a specified portion and quantity.
     *
     * @return array<string, float|null>
     */
    public function calculateNutrition(Food $food, float $gramEquivalent, float $quantity = 1.0): array
    {
        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.00;
        $totalGrams = round($gramEquivalent * $quantity, 2);
        $factor = $totalGrams / $baseSize;

        return [
            'total_grams' => $totalGrams,
            'factor' => round($factor, 4),
            'calories' => round((float) $food->calories * $factor, 2),
            'protein' => round((float) $food->protein * $factor, 2),
            'carbs' => round((float) $food->carbs * $factor, 2),
            'fat' => round((float) $food->fat * $factor, 2),
            'fiber' => $food->fiber !== null ? round((float) $food->fiber * $factor, 2) : null,
            'sugar' => $food->sugar !== null ? round((float) $food->sugar * $factor, 2) : null,
            'saturated_fat' => $food->saturated_fat !== null ? round((float) $food->saturated_fat * $factor, 2) : null,
            'sodium' => $food->sodium !== null ? round((float) $food->sodium * $factor, 4) : null,
        ];
    }

    protected function getUserOffConnection(?User $user): ?UserOffConnection
    {
        if (! $user) {
            return null;
        }

        /** @var UserOffConnection|null $connection */
        $connection = UserOffConnection::where('user_id', $user->id)
            ->where('is_connected', true)
            ->first();

        return $connection;
    }
}
