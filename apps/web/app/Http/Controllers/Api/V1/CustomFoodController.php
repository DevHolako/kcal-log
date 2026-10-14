<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Food\StoreCustomFoodRequest;
use App\Http\Requests\Food\UpdateCustomFoodRequest;
use App\Models\Food;
use App\Models\User;
use App\Services\FoodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomFoodController extends Controller
{
    public function __construct(
        protected FoodService $foodService,
    ) {}

    /**
     * List authenticated user's custom foods.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $foods = Food::custom()
            ->where('user_id', $user->id)
            ->with('servings')
            ->latest()
            ->paginate(20);

        return response()->json($foods);
    }

    /**
     * Create a new custom food item.
     */
    public function store(StoreCustomFoodRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $food = $this->foodService->createCustomFood($user, $request->validated());

        return response()->json([
            'message' => 'Custom food created successfully.',
            'data' => $food,
        ], 201);
    }

    /**
     * Display a specific custom food item.
     */
    public function show(Food $food, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($food->user_id !== $user->id || ! $food->is_custom) {
            abort(403, 'Unauthorized access to custom food item.');
        }

        $food->load('servings');

        return response()->json([
            'data' => $food,
        ]);
    }

    /**
     * Update an existing custom food item.
     */
    public function update(UpdateCustomFoodRequest $request, Food $food): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $updatedFood = $this->foodService->updateCustomFood($user, $food, $request->validated());

        return response()->json([
            'message' => 'Custom food updated successfully.',
            'data' => $updatedFood,
        ]);
    }

    /**
     * Delete a custom food item.
     */
    public function destroy(Food $food, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->foodService->deleteCustomFood($user, $food);

        return response()->json([
            'message' => 'Custom food deleted successfully.',
        ]);
    }
}
