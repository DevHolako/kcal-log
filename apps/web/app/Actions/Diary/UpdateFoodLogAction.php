<?php

namespace App\Actions\Diary;

use App\DTOs\Diary\UpdateFoodLogDTO;
use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\User;

class UpdateFoodLogAction
{
    use ResolvePortionGrams;

    /**
     * Update an existing diary entry.
     */
    public function execute(User $user, DiaryEntry $entry, UpdateFoodLogDTO $dto): DiaryEntry
    {
        if ($entry->user_id !== $user->id) {
            abort(403, 'Unauthorized action on diary entry.');
        }

        /** @var Food $food */
        $food = $entry->food;

        $quantity = $dto->quantity !== null ? $dto->quantity : (float) $entry->quantity;
        $servingId = $dto->hasFoodServingId ? $dto->foodServingId : $entry->food_serving_id;

        $portionData = $this->resolvePortionGramsAndUnit($food, $servingId, $quantity, $dto->customGrams);

        $grams = $portionData['grams'];
        $unit = $portionData['unit'];
        $calcQuantity = $portionData['quantity'];

        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
        $factor = $grams / $baseSize;

        $entry->update([
            'meal_slot' => $dto->mealSlot ?? $entry->meal_slot,
            'food_serving_id' => $servingId,
            'quantity' => round($calcQuantity, 2),
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

        DiaryUpdated::dispatch($user->id, $entry->date->format('Y-m-d'), 'updated', [
            'entry_id' => $entry->id,
            'meal_slot' => $entry->meal_slot,
            'calories' => $entry->calories,
        ]);

        return $entry;
    }
}
