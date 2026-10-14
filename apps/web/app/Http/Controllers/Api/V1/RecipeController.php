<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\RecipeItem;
use App\Models\User;
use App\Services\DiaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    public function __construct(
        protected DiaryService $diaryService,
    ) {}

    /**
     * List user's recipes.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $recipes = MealRecipe::where('user_id', $user->id)
            ->where('is_recipe', true)
            ->with(['items.food.servings', 'items.serving'])
            ->latest('id')
            ->paginate(20);

        return response()->json($recipes);
    }

    /**
     * Store a new recipe.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'servings' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'integer', 'exists:foods,id'],
            'items.*.food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.grams' => ['required', 'numeric', 'min:0.01'],
        ]);

        /** @var MealRecipe $recipe */
        $recipe = DB::transaction(function () use ($user, $validated) {
            /** @var MealRecipe $recipe */
            $recipe = MealRecipe::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'servings' => (float) $validated['servings'],
                'is_recipe' => true,
            ]);

            /** @var list<array{food_id: int, food_serving_id: int|null, quantity: float, grams: float}> $items */
            $items = $validated['items'];

            foreach ($items as $itemData) {
                /** @var Food $food */
                $food = Food::availableTo($user->id)->findOrFail((int) $itemData['food_id']);

                $grams = (float) $itemData['grams'];
                $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
                $factor = $grams / $baseSize;

                RecipeItem::create([
                    'meal_recipe_id' => $recipe->id,
                    'food_id' => $food->id,
                    'food_serving_id' => ! empty($itemData['food_serving_id']) ? (int) $itemData['food_serving_id'] : null,
                    'quantity' => (float) $itemData['quantity'],
                    'grams' => round($grams, 2),
                    'calories' => round((float) $food->calories * $factor, 2),
                    'protein' => round((float) $food->protein * $factor, 2),
                    'carbs' => round((float) $food->carbs * $factor, 2),
                    'fat' => round((float) $food->fat * $factor, 2),
                    'fiber' => $food->fiber !== null ? round((float) $food->fiber * $factor, 2) : null,
                    'sugar' => $food->sugar !== null ? round((float) $food->sugar * $factor, 2) : null,
                    'saturated_fat' => $food->saturated_fat !== null ? round((float) $food->saturated_fat * $factor, 2) : null,
                    'sodium' => $food->sodium !== null ? round((float) $food->sodium * $factor, 4) : null,
                ]);
            }

            $recipe->recalculateTotals();

            return $recipe;
        });

        $recipe->load(['items.food.servings', 'items.serving']);

        return response()->json([
            'message' => 'Recipe created successfully.',
            'data' => $recipe,
        ], 201);
    }

    /**
     * Show single recipe.
     */
    public function show(MealRecipe $recipe, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized access to recipe.');
        }

        $recipe->load(['items.food.servings', 'items.serving']);

        return response()->json([
            'data' => $recipe,
        ]);
    }

    /**
     * Update an existing recipe.
     */
    public function update(Request $request, MealRecipe $recipe): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'servings' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'integer', 'exists:foods,id'],
            'items.*.food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.grams' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($user, $recipe, $validated) {
            $recipe->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'servings' => (float) $validated['servings'],
            ]);

            $recipe->items()->delete();

            /** @var list<array{food_id: int, food_serving_id: int|null, quantity: float, grams: float}> $items */
            $items = $validated['items'];

            foreach ($items as $itemData) {
                /** @var Food $food */
                $food = Food::availableTo($user->id)->findOrFail((int) $itemData['food_id']);

                $grams = (float) $itemData['grams'];
                $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
                $factor = $grams / $baseSize;

                RecipeItem::create([
                    'meal_recipe_id' => $recipe->id,
                    'food_id' => $food->id,
                    'food_serving_id' => ! empty($itemData['food_serving_id']) ? (int) $itemData['food_serving_id'] : null,
                    'quantity' => (float) $itemData['quantity'],
                    'grams' => round($grams, 2),
                    'calories' => round((float) $food->calories * $factor, 2),
                    'protein' => round((float) $food->protein * $factor, 2),
                    'carbs' => round((float) $food->carbs * $factor, 2),
                    'fat' => round((float) $food->fat * $factor, 2),
                    'fiber' => $food->fiber !== null ? round((float) $food->fiber * $factor, 2) : null,
                    'sugar' => $food->sugar !== null ? round((float) $food->sugar * $factor, 2) : null,
                    'saturated_fat' => $food->saturated_fat !== null ? round((float) $food->saturated_fat * $factor, 2) : null,
                    'sodium' => $food->sodium !== null ? round((float) $food->sodium * $factor, 4) : null,
                ]);
            }

            $recipe->recalculateTotals();
        });

        $recipe->load(['items.food.servings', 'items.serving']);

        return response()->json([
            'message' => 'Recipe updated successfully.',
            'data' => $recipe,
        ]);
    }

    /**
     * Delete a recipe.
     */
    public function destroy(MealRecipe $recipe, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $recipe->delete();

        return response()->json([
            'message' => 'Recipe deleted successfully.',
        ]);
    }

    /**
     * Log recipe to diary.
     */
    public function log(Request $request, MealRecipe $recipe): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'servings' => ['nullable', 'numeric', 'min:0.1', 'max:50'],
            'log_as_individual' => ['nullable', 'boolean'],
        ]);

        $servings = isset($validated['servings']) ? (float) $validated['servings'] : 1.0;
        $asIndividual = isset($validated['log_as_individual']) ? (bool) $validated['log_as_individual'] : true;

        $entries = $this->diaryService->logRecipe(
            $user,
            $recipe,
            (string) $validated['date'],
            (string) $validated['meal_slot'],
            $servings,
            $asIndividual
        );

        return response()->json([
            'message' => 'Recipe logged to diary.',
            'data' => [
                'entries_count' => count($entries),
                'servings' => $servings,
                'meal_slot' => $validated['meal_slot'],
                'date' => $validated['date'],
            ],
        ], 201);
    }
}
