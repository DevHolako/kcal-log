<?php

namespace App\Actions\Recipe;

use App\DTOs\Recipe\LogRecipeDTO;
use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\User;

class LogRecipeAction
{
    /**
     * Log a saved recipe into the user's daily diary.
     *
     * @return list<DiaryEntry>
     */
    public function execute(User $user, MealRecipe $recipe, LogRecipeDTO $dto): array
    {
        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $recipe->loadMissing('items.food', 'items.serving');
        $recipeServings = (float) $recipe->servings > 0 ? (float) $recipe->servings : 1.0;
        $servingRatio = $dto->servings / $recipeServings;

        $createdEntries = [];

        if ($dto->logAsIndividual) {
            foreach ($recipe->items as $item) {
                /** @var Food $food */
                $food = $item->food;
                $grams = (float) $item->grams * $servingRatio;
                $quantity = (float) $item->quantity * $servingRatio;
                $unit = $item->serving->serving_name ?? 'g';

                $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
                $factor = $grams / $baseSize;

                /** @var DiaryEntry $entry */
                $entry = DiaryEntry::create([
                    'user_id' => $user->id,
                    'food_id' => $food->id,
                    'food_serving_id' => $item->food_serving_id,
                    'date' => $dto->date,
                    'meal_slot' => $dto->mealSlot,
                    'quantity' => round($quantity, 2),
                    'unit' => $unit,
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

                $entry->load(['food.servings', 'serving']);
                $createdEntries[] = $entry;
            }
        } else {
            /** @var Food $recipeFood */
            $recipeFood = Food::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $recipe->name.' (Recipe)',
                    'is_custom' => true,
                ],
                [
                    'brand' => 'Homemade Recipe',
                    'serving_size' => 1.0,
                    'serving_unit' => 'serving',
                    'calories' => $recipe->calories_per_serving,
                    'protein' => $recipe->protein_per_serving,
                    'carbs' => $recipe->carbs_per_serving,
                    'fat' => $recipe->fat_per_serving,
                    'fiber' => $recipe->fiber_per_serving,
                    'sugar' => $recipe->sugar_per_serving,
                    'saturated_fat' => $recipe->saturated_fat_per_serving,
                    'sodium' => $recipe->sodium_per_serving,
                ]
            );

            /** @var DiaryEntry $entry */
            $entry = DiaryEntry::create([
                'user_id' => $user->id,
                'food_id' => $recipeFood->id,
                'food_serving_id' => null,
                'date' => $dto->date,
                'meal_slot' => $dto->mealSlot,
                'quantity' => round($dto->servings, 2),
                'unit' => 'serving',
                'grams' => round($dto->servings * 100, 2),
                'calories' => round($recipe->calories_per_serving * $dto->servings, 2),
                'protein' => round($recipe->protein_per_serving * $dto->servings, 2),
                'carbs' => round($recipe->carbs_per_serving * $dto->servings, 2),
                'fat' => round($recipe->fat_per_serving * $dto->servings, 2),
                'fiber' => round($recipe->fiber_per_serving * $dto->servings, 2),
                'sugar' => round($recipe->sugar_per_serving * $dto->servings, 2),
                'saturated_fat' => round($recipe->saturated_fat_per_serving * $dto->servings, 2),
                'sodium' => round($recipe->sodium_per_serving * $dto->servings, 4),
            ]);

            $entry->load(['food.servings', 'serving']);
            $createdEntries[] = $entry;
        }

        DiaryUpdated::dispatch($user->id, $dto->date, 'added_recipe', [
            'recipe_id' => $recipe->id,
            'meal_slot' => $dto->mealSlot,
            'entries_count' => count($createdEntries),
        ]);

        return $createdEntries;
    }
}
