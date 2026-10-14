<?php

namespace App\Actions\Diary;

use App\DTOs\Diary\QuickAddDTO;
use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuickAddCaloriesAction
{
    /**
     * Quick add calories directly to a meal slot.
     */
    public function execute(User $user, QuickAddDTO $dto): DiaryEntry
    {
        return DB::transaction(function () use ($user, $dto) {
            /** @var Food $food */
            $food = Food::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $dto->description ?: 'Quick Add Calories',
                    'is_custom' => true,
                ],
                [
                    'serving_size' => 1.0,
                    'serving_unit' => 'portion',
                    'calories' => 1.0,
                    'protein' => 0.0,
                    'carbs' => 0.0,
                    'fat' => 0.0,
                ]
            );

            /** @var DiaryEntry $entry */
            $entry = DiaryEntry::create([
                'user_id' => $user->id,
                'food_id' => $food->id,
                'date' => $dto->date,
                'meal_slot' => $dto->mealSlot,
                'quantity' => round($dto->calories, 2),
                'unit' => 'kcal',
                'grams' => round($dto->calories, 2),
                'calories' => round($dto->calories, 2),
                'protein' => 0.0,
                'carbs' => 0.0,
                'fat' => 0.0,
            ]);

            DiaryUpdated::dispatch($user->id, $dto->date, 'quick_add', [
                'entry_id' => $entry->id,
                'meal_slot' => $dto->mealSlot,
                'calories' => $dto->calories,
            ]);

            return $entry;
        });
    }
}
