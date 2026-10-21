<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Models\User;
use App\Services\FoodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    public function __construct(
        protected FoodService $foodService,
    ) {}

    /**
     * Search foods across Open Food Facts and local database.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = (string) $validated['q'];
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) ($validated['per_page'] ?? 20);

        /** @var User|null $user */
        $user = $request->user();
        $country = (string) ($request->query('country', ''));

        $result = $this->foodService->search($query, $user, $page, $perPage, $country ?: null);

        return response()->json([
            'source' => $result->source,
            'is_degraded' => $result->isDegraded,
            'total' => $result->total,
            'page' => $result->page,
            'per_page' => $result->perPage,
            'data' => $result->items,
        ]);
    }

    /**
     * Look up a food item by barcode via 3-tier fallback chain.
     */
    public function barcode(string $barcode, Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        $result = $this->foodService->findByBarcode($barcode, $user);

        if (! $result) {
            return response()->json([
                'message' => 'Product not found.',
                'barcode' => $barcode,
            ], 404);
        }

        return response()->json([
            'source' => $result->source,
            'is_degraded' => $result->isDegraded,
            'data' => $result->food,
        ]);
    }

    /**
     * Show a specific food item with servings.
     */
    public function show(Food $food, Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($food->is_custom && $food->user_id !== $user?->id) {
            abort(403, 'Unauthorized access to custom food item.');
        }

        $food->load('servings');

        return response()->json([
            'data' => $food,
        ]);
    }

    /**
     * Calculate scaled nutritional values for a specified portion size and quantity.
     */
    public function calculate(Food $food, Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($food->is_custom && $food->user_id !== $user?->id) {
            abort(403, 'Unauthorized access to custom food item.');
        }

        $validated = $request->validate([
            'gram_equivalent' => ['required', 'numeric', 'min:0.01', 'max:10000'],
            'quantity' => ['nullable', 'numeric', 'min:0.01', 'max:100'],
        ]);

        $gramEquivalent = (float) $validated['gram_equivalent'];
        $quantity = (float) ($validated['quantity'] ?? 1.0);

        $nutrition = $this->foodService->calculateNutrition($food, $gramEquivalent, $quantity);

        return response()->json([
            'data' => $nutrition,
        ]);
    }
}
