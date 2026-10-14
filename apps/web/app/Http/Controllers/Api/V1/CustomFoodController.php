<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Food\CreateCustomFoodAction;
use App\Actions\Food\DeleteCustomFoodAction;
use App\Actions\Food\UpdateCustomFoodAction;
use App\DTOs\Food\CreateCustomFoodDTO;
use App\DTOs\Food\UpdateCustomFoodDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Food\StoreCustomFoodRequest;
use App\Http\Requests\Food\UpdateCustomFoodRequest;
use App\Models\Food;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomFoodController extends Controller
{
    public function __construct(
        protected CreateCustomFoodAction $createCustomFoodAction,
        protected UpdateCustomFoodAction $updateCustomFoodAction,
        protected DeleteCustomFoodAction $deleteCustomFoodAction,
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

        $dto = CreateCustomFoodDTO::fromRequest($request);
        $food = $this->createCustomFoodAction->execute($user, $dto);

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

        $dto = UpdateCustomFoodDTO::fromRequest($request);
        $updatedFood = $this->updateCustomFoodAction->execute($user, $food, $dto);

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

        $this->deleteCustomFoodAction->execute($user, $food);

        return response()->json([
            'message' => 'Custom food deleted successfully.',
        ]);
    }
}
