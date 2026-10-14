<?php

namespace App\Actions\Diary;

use App\DTOs\Diary\LogFoodDTO;
use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\User;

class LogFoodAction
{
    use ResolvePortionGrams;

    /**
     * Log a food item to user's daily diary.
     */
    public function execute(User $user, LogFoodDTO $dto): DiaryEntry
    {
        /** @var Food $food */
        $food = Food::availableTo($user->id)->findOrFail($dto->foodId);

        $portionData = $this->resolvePortionGramsAndUnit(
            $food,
            $dto->foodServingId,
            $dto->quantity,
            $dto->customGrams
        );

        $grams = $portionData['grams'];
        $unit = $portionData['unit'];
        $calcQuantity = $portionData['quantity'];

        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
        $factor = $grams / $baseSize;

        /** @var DiaryEntry $entry */
        $entry = DiaryEntry::create([
            'user_id' => $user->id,
            'food_id' => $food->id,
            'food_serving_id' => $dto->foodServingId,
            'date' => $dto->date,
            'meal_slot' => $dto->mealSlot,
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

        DiaryUpdated::dispatch($user->id, $dto->date, 'created', [
            'entry_id' => $entry->id,
            'meal_slot' => $entry->meal_slot,
            'calories' => $entry->calories,
        ]);

        return $entry;
    }
}
