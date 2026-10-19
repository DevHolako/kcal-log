<?php

namespace App\Http\Controllers;

use App\Actions\Food\CreateCustomFoodAction;
use App\Actions\Food\DeleteCustomFoodAction;
use App\Actions\Food\UpdateCustomFoodAction;
use App\DTOs\Food\CreateCustomFoodDTO;
use App\DTOs\Food\UpdateCustomFoodDTO;
use App\Http\Requests\Food\StoreCustomFoodRequest;
use App\Http\Requests\Food\UpdateCustomFoodRequest;
use App\Jobs\SyncOpenFoodFactsJob;
use App\Models\Food;
use App\Models\User;
use App\Services\FoodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class FoodController extends Controller
{
    public function __construct(
        protected FoodService $foodService,
        protected CreateCustomFoodAction $createCustomFoodAction,
        protected UpdateCustomFoodAction $updateCustomFoodAction,
        protected DeleteCustomFoodAction $deleteCustomFoodAction,
    ) {}

    /**
     * Search foods across Open Food Facts and local database (JSON for AJAX/modals).
     */
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->query('q', '');
        $barcode = (string) $request->query('barcode', '');
        $recent = $request->boolean('recent');

        /** @var User $user */
        $user = $request->user();

        if (! empty($barcode)) {
            $lookup = $this->foodService->findByBarcode($barcode, $user);
            if ($lookup) {
                return response()->json([
                    'items' => [$lookup->food],
                    'source' => $lookup->source,
                    'is_degraded' => $lookup->isDegraded,
                    'total' => 1,
                ]);
            }

            return response()->json([
                'items' => [],
                'source' => 'cache',
                'is_degraded' => false,
                'total' => 0,
            ]);
        }

        $trimmedQuery = trim($query);

        if ($recent && strlen($trimmedQuery) < 2) {
            $recentFoods = Food::availableTo($user->id)
                ->with('servings')
                ->latest()
                ->take(12)
                ->get()
                ->each(function (Food $f) {
                    $f->setAttribute('search_origin', $f->is_custom ? 'custom' : 'database');
                });

            return response()->json([
                'items' => $recentFoods,
                'source' => 'cache',
                'is_degraded' => false,
                'total' => $recentFoods->count(),
            ]);
        }

        if (strlen($trimmedQuery) < 2) {
            return response()->json([
                'items' => [],
                'source' => 'cache',
                'is_degraded' => false,
                'total' => 0,
            ]);
        }

        // If the query is a barcode (6 to 14 digits)
        if (preg_match('/^\d{6,14}$/', $trimmedQuery)) {
            $lookup = $this->foodService->findByBarcode($trimmedQuery, $user);
            if ($lookup) {
                return response()->json([
                    'items' => [$lookup->food],
                    'source' => $lookup->source,
                    'is_degraded' => $lookup->isDegraded,
                    'total' => 1,
                ]);
            }
        }

        $result = $this->foodService->search($trimmedQuery, $user, 1, 25);

        return response()->json([
            'items' => $result->items,
            'source' => $result->source,
            'is_degraded' => $result->isDegraded,
            'total' => $result->total,
        ]);
    }

    /**
     * Direct barcode lookup (JSON response for modals/camera).
     */
    public function barcode(string $barcode, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $lookup = $this->foodService->findByBarcode($barcode, $user);

        if (! $lookup) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json([
            'food' => $lookup->food,
            'source' => $lookup->source,
            'is_degraded' => $lookup->isDegraded,
        ]);
    }

    /**
     * Show food catalog, search, and custom foods manager.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $rawQuery = $request->query('q') ?? $request->query('barcode');
        $query = ! empty($rawQuery) ? trim((string) $rawQuery) : null;
        $barcode = $request->query('barcode');

        $searchResult = null;
        if (! empty($query)) {
            // If the query is a barcode (6 to 14 digits)
            $isBarcode = (bool) preg_match('/^\d{6,14}$/', $query);

            if ($isBarcode) {
                $lookup = $this->foodService->findByBarcode($query, $user);
                if ($lookup) {
                    $searchResult = [
                        'items' => [$lookup->food],
                        'source' => $lookup->source,
                        'is_degraded' => $lookup->isDegraded,
                        'total' => 1,
                    ];
                } else {
                    // Fallback to text query across DB and catalog
                    $result = $this->foodService->search($query, $user, 1, 25);
                    $searchResult = [
                        'items' => $result->items,
                        'source' => $result->source,
                        'is_degraded' => $result->isDegraded,
                        'total' => $result->total,
                    ];
                }
            } else {
                $result = $this->foodService->search($query, $user, 1, 25);
                $searchResult = [
                    'items' => $result->items,
                    'source' => $result->source,
                    'is_degraded' => $result->isDegraded,
                    'total' => $result->total,
                ];
            }
        }

        // Fetch recent/popular database items for initial view (up to 60 for rich initial view)
        $initialFoods = Food::availableTo($user->id)
            ->with('servings')
            ->latest()
            ->take(60)
            ->get();

        // Real total counts in the database
        $totalCachedFoods = Food::where('is_custom', false)->count();
        $totalCustomFoods = Food::custom()->where('user_id', $user->id)->count();

        // User's custom foods
        $customFoods = Food::custom()
            ->where('user_id', $user->id)
            ->with('servings')
            ->latest()
            ->get();

        $isOffConnected = (bool) $user->offConnection?->is_connected;

        return Inertia::render('foods/index', [
            'initialFoods' => $initialFoods,
            'customFoods' => $customFoods,
            'totalCachedFoods' => $totalCachedFoods,
            'totalCustomFoods' => $totalCustomFoods,
            'searchResult' => $searchResult,
            'searchQuery' => $query,
            'searchBarcode' => $barcode,
            'isOffConnected' => $isOffConnected,
        ]);
    }

    /**
     * Display a specific food item's detail page with nutritional facts and calculator.
     */
    public function show(Food $food, Request $request): Response|JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Ensure user can access custom food if applicable
        if ($food->is_custom && $food->user_id !== $user->id) {
            abort(403, 'Unauthorized access to custom food.');
        }

        $food->load('servings');
        $food->setAttribute('search_origin', $food->is_custom ? 'custom' : 'database');

        if ($request->wantsJson()) {
            return response()->json([
                'food' => $food,
            ]);
        }

        return Inertia::render('foods/show', [
            'food' => $food,
        ]);
    }

    /**
     * Trigger an on-demand sync from Open Food Facts with selectable item count and categories.
     */
    public function sync(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'in:20,50,100,200'],
            'category' => ['nullable', 'string', 'in:all,protein,produce,dairy,grains,staples'],
            'terms' => ['nullable', 'string', 'max:255'],
        ]);

        $count = (int) $validated['count'];
        $category = $validated['category'] ?? 'staples';
        $customTerms = ! empty($validated['terms'])
            ? array_values(array_filter(array_map('trim', explode(',', (string) $validated['terms']))))
            : null;

        $categoryTerms = match ($category) {
            'protein' => ['chicken breast', 'whey protein', 'salmon fillet', 'eggs', 'canned tuna', 'beef steak', 'tofu'],
            'produce' => ['banana', 'apple', 'spinach', 'broccoli', 'avocado', 'sweet potato', 'blueberries'],
            'dairy' => ['greek yogurt', 'whole milk', 'cottage cheese', 'cheddar cheese', 'skyr', 'mozzarella'],
            'grains' => ['rolled oats', 'brown rice', 'quinoa', 'whole wheat bread', 'lentils', 'pasta'],
            default => SyncOpenFoodFactsJob::DEFAULT_TERMS,
        };

        $terms = $customTerms ?: $categoryTerms;

        $termsCount = max(1, count($terms));
        $targetPerTerm = max(5, (int) ceil($count / $termsCount));
        $pageSize = min(50, $targetPerTerm);
        $pagesPerTerm = max(1, (int) ceil($targetPerTerm / $pageSize));

        /** @var User $user */
        $user = $request->user();

        Cache::put("food_sync_progress_{$user->id}", [
            'active' => true,
            'current' => 0,
            'total' => $termsCount,
            'percent' => 5,
            'status' => "Sync queued for {$count} {$category} items...",
            'saved_count' => 0,
            'completed' => false,
            'user_id' => $user->id,
            'updated_at' => now()->toIso8601String(),
        ], now()->addMinutes(10));

        SyncOpenFoodFactsJob::dispatch(
            terms: $terms,
            pagesPerTerm: $pagesPerTerm,
            pageSize: $pageSize,
            refreshStale: false,
            sleepMs: 0,
            userId: $user->id,
        );

        return back()->with('status', "Sync started for {$count} {$category} items from Open Food Facts. Items are streaming in via queue.");
    }

    /**
     * Get current background sync status for polling fallback.
     */
    public function syncStatus(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        /** @var array<string, mixed>|null $progress */
        $progress = ($userId !== null ? Cache::get("food_sync_progress_{$userId}") : null)
            ?? Cache::get('food_sync_progress_global');

        return response()->json([
            'progress' => $progress,
        ]);
    }

    /**
     * Store a custom food item via web.
     */
    public function storeCustom(StoreCustomFoodRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = CreateCustomFoodDTO::fromRequest($request);
        $this->createCustomFoodAction->execute($user, $dto);

        return back()->with('status', 'Custom food created successfully.');
    }

    /**
     * Update an existing custom food item via web.
     */
    public function updateCustom(UpdateCustomFoodRequest $request, Food $food): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = UpdateCustomFoodDTO::fromRequest($request);
        $this->updateCustomFoodAction->execute($user, $food, $dto);

        return back()->with('status', 'Custom food updated successfully.');
    }

    /**
     * Delete a custom food item via web.
     */
    public function destroyCustom(Food $food, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteCustomFoodAction->execute($user, $food);

        return back()->with('status', 'Custom food removed successfully.');
    }
}
