<?php

namespace App\Http\Controllers;

use App\Actions\Recipe\CreateRecipeAction;
use App\Actions\Recipe\DeleteRecipeAction;
use App\Actions\Recipe\LogRecipeAction;
use App\Actions\Recipe\UpdateRecipeAction;
use App\DTOs\Recipe\CreateRecipeDTO;
use App\DTOs\Recipe\LogRecipeDTO;
use App\DTOs\Recipe\UpdateRecipeDTO;
use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function __construct(
        protected CreateRecipeAction $createRecipeAction,
        protected UpdateRecipeAction $updateRecipeAction,
        protected DeleteRecipeAction $deleteRecipeAction,
        protected LogRecipeAction $logRecipeAction,
    ) {}

    /**
     * Display a listing of user's recipes.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $recipes = MealRecipe::where('user_id', $user->id)
            ->where('is_recipe', true)
            ->with(['items.food.servings', 'items.serving'])
            ->latest('id')
            ->get();

        $availableFoods = Food::availableTo($user->id)
            ->with('servings')
            ->latest('id')
            ->take(50)
            ->get();

        return Inertia::render('recipes/index', [
            'recipes' => $recipes,
            'availableFoods' => $availableFoods,
        ]);
    }

    /**
     * Store a newly created recipe.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = CreateRecipeDTO::fromRequest($request);
        $this->createRecipeAction->execute($user, $dto);

        return redirect()->route('recipes.index')->with('status', 'Recipe created successfully.');
    }

    /**
     * Update an existing recipe.
     */
    public function update(Request $request, MealRecipe $recipe): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $dto = UpdateRecipeDTO::fromRequest($request);
        $this->updateRecipeAction->execute($user, $recipe, $dto);

        return redirect()->route('recipes.index')->with('status', 'Recipe updated successfully.');
    }

    /**
     * Delete a recipe.
     */
    public function destroy(Request $request, MealRecipe $recipe): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteRecipeAction->execute($user, $recipe);

        return redirect()->route('recipes.index')->with('status', 'Recipe deleted successfully.');
    }

    /**
     * Log a recipe to the daily diary.
     */
    public function log(Request $request, MealRecipe $recipe): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $dto = LogRecipeDTO::fromRequest($request);
        $this->logRecipeAction->execute($user, $recipe, $dto);

        return redirect()->route('diary.index', ['date' => $dto->date])->with('status', 'Recipe logged to diary.');
    }
}
