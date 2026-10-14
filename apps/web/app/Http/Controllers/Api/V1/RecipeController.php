<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Recipe\CreateRecipeAction;
use App\Actions\Recipe\DeleteRecipeAction;
use App\Actions\Recipe\LogRecipeAction;
use App\Actions\Recipe\UpdateRecipeAction;
use App\DTOs\Recipe\CreateRecipeDTO;
use App\DTOs\Recipe\LogRecipeDTO;
use App\DTOs\Recipe\UpdateRecipeDTO;
use App\Http\Controllers\Controller;
use App\Models\MealRecipe;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function __construct(
        protected CreateRecipeAction $createRecipeAction,
        protected UpdateRecipeAction $updateRecipeAction,
        protected DeleteRecipeAction $deleteRecipeAction,
        protected LogRecipeAction $logRecipeAction,
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
     * Create a new recipe.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = CreateRecipeDTO::fromRequest($request);
        $recipe = $this->createRecipeAction->execute($user, $dto);

        return response()->json([
            'message' => 'Recipe created successfully.',
            'data' => $recipe,
        ], 201);
    }

    /**
     * Show a specific recipe.
     */
    public function show(MealRecipe $recipe, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
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

        $dto = UpdateRecipeDTO::fromRequest($request);
        $recipe = $this->updateRecipeAction->execute($user, $recipe, $dto);

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

        $this->deleteRecipeAction->execute($user, $recipe);

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

        $dto = LogRecipeDTO::fromRequest($request);
        $entries = $this->logRecipeAction->execute($user, $recipe, $dto);

        return response()->json([
            'message' => 'Recipe logged to diary.',
            'data' => $entries,
        ], 201);
    }
}
