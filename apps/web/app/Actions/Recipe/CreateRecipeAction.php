<?php

namespace App\Actions\Recipe;

use App\DTOs\Recipe\CreateRecipeDTO;
use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\RecipeItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateRecipeAction
{
    /**
     * Create a composite meal recipe with items and calculated totals.
     */
    public function execute(User $user, CreateRecipeDTO $dto): MealRecipe
    {
        return DB::transaction(function () use ($user, $dto) {
            /** @var MealRecipe $recipe */
            $recipe = MealRecipe::create([
                'user_id' => $user->id,
                'name' => $dto->name,
                'description' => $dto->description,
                'servings' => $dto->servings,
                'is_recipe' => true,
            ]);

            foreach ($dto->items as $itemDto) {
                /** @var Food $food */
                $food = Food::availableTo($user->id)->findOrFail($itemDto->foodId);

                $grams = $itemDto->grams;
                $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
                $factor = $grams / $baseSize;

                RecipeItem::create([
                    'meal_recipe_id' => $recipe->id,
                    'food_id' => $food->id,
                    'food_serving_id' => $itemDto->foodServingId,
                    'quantity' => $itemDto->quantity,
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

            return $recipe->fresh(['items.food.servings', 'items.serving']);
        });
    }
}
