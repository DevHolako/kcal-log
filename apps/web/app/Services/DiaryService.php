<?php

namespace App\Services;

use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\MealRecipe;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;
use App\Models\WeightLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class DiaryService
{
    /**
     * Get day's diary including grouped meal slots and calculated summary.
     *
     * @return array{
     *     date: string,
     *     summary: array<string, mixed>,
     *     slots: array<string, array{entries: Collection<int, DiaryEntry>, calories: float}>
     * }
     */
    public function getDayDiary(User $user, string $date): array
    {
        /** @var Collection<int, DiaryEntry> $entries */
        $entries = DiaryEntry::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->with(['food.servings', 'serving'])
            ->get();

        $slots = [
            'breakfast' => $entries->where('meal_slot', 'breakfast')->values(),
            'lunch' => $entries->where('meal_slot', 'lunch')->values(),
            'dinner' => $entries->where('meal_slot', 'dinner')->values(),
            'snack' => $entries->where('meal_slot', 'snack')->values(),
        ];

        $totalCalories = (float) $entries->sum('calories');
        $totalProtein = (float) $entries->sum('protein');
        $totalCarbs = (float) $entries->sum('carbs');
        $totalFat = (float) $entries->sum('fat');
        $totalFiber = (float) $entries->sum('fiber');
        $totalSugar = (float) $entries->sum('sugar');
        $totalSaturatedFat = (float) $entries->sum('saturated_fat');
        $totalSodium = (float) $entries->sum('sodium');

        /** @var TargetProfile|null $target */
        $target = TargetProfile::where('user_id', $user->id)
            ->where('is_active', true)
            ->latest('id')
            ->first();

        $targetCalories = $target ? (float) $target->calories : 2000.0;
        $remainingCalories = max(0.0, round($targetCalories - $totalCalories, 2));

        $targetProtein = $target ? (float) $target->protein_g : 150.0;
        $targetCarbs = $target ? (float) $target->carbs_g : 200.0;
        $targetFat = $target ? (float) $target->fat_g : 65.0;
        $targetFiber = $target && $target->fiber_g ? (float) $target->fiber_g : 30.0;
        $targetWater = $target && $target->water_ml ? (int) $target->water_ml : 2000;

        $waterTotal = (int) WaterLog::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->sum('amount_ml');

        /** @var WeightLog|null $weightLog */
        $weightLog = WeightLog::where('user_id', $user->id)
            ->whereDate('date', $date)
            ->first();

        return [
            'date' => $date,
            'summary' => [
                'total_calories' => round($totalCalories, 2),
                'target_calories' => round($targetCalories, 2),
                'remaining_calories' => round($remainingCalories, 2),
                'total_protein' => round($totalProtein, 2),
                'target_protein' => round($targetProtein, 2),
                'total_carbs' => round($totalCarbs, 2),
                'target_carbs' => round($targetCarbs, 2),
                'total_fat' => round($totalFat, 2),
                'target_fat' => round($targetFat, 2),
                'total_fiber' => round($totalFiber, 2),
                'target_fiber' => round($targetFiber, 2),
                'total_sugar' => round($totalSugar, 2),
                'total_saturated_fat' => round($totalSaturatedFat, 2),
                'total_sodium' => round($totalSodium, 4),
                'total_sodium_mg' => round($totalSodium * 1000, 0),
                'water_ml' => $waterTotal,
                'target_water_ml' => $targetWater,
                'weight_kg' => $weightLog ? (float) $weightLog->weight_kg : null,
            ],
            'slots' => [
                'breakfast' => [
                    'entries' => $slots['breakfast'],
                    'calories' => round((float) $slots['breakfast']->sum('calories'), 2),
                ],
                'lunch' => [
                    'entries' => $slots['lunch'],
                    'calories' => round((float) $slots['lunch']->sum('calories'), 2),
                ],
                'dinner' => [
                    'entries' => $slots['dinner'],
                    'calories' => round((float) $slots['dinner']->sum('calories'), 2),
                ],
                'snack' => [
                    'entries' => $slots['snack'],
                    'calories' => round((float) $slots['snack']->sum('calories'), 2),
                ],
            ],
        ];
    }

    /**
     * Log a food portion to a meal slot.
     *
     * @param  array<string, mixed>  $data
     */
    public function addEntry(User $user, array $data): DiaryEntry
    {
        /** @var Food $food */
        $food = Food::availableTo($user->id)->findOrFail((int) $data['food_id']);

        $quantity = isset($data['quantity']) ? (float) $data['quantity'] : 1.0;
        $servingId = ! empty($data['food_serving_id']) ? (int) $data['food_serving_id'] : null;
        $customGrams = ! empty($data['custom_grams']) ? (float) $data['custom_grams'] : null;

        $portionData = $this->resolvePortionGramsAndUnit($food, $servingId, $quantity, $customGrams);

        $grams = $portionData['grams'];
        $unit = $portionData['unit'];
        $calcQuantity = $portionData['quantity'];

        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
        $factor = $grams / $baseSize;

        $calories = round((float) $food->calories * $factor, 2);
        $protein = round((float) $food->protein * $factor, 2);
        $carbs = round((float) $food->carbs * $factor, 2);
        $fat = round((float) $food->fat * $factor, 2);
        $fiber = $food->fiber !== null ? round((float) $food->fiber * $factor, 2) : null;
        $sugar = $food->sugar !== null ? round((float) $food->sugar * $factor, 2) : null;
        $saturatedFat = $food->saturated_fat !== null ? round((float) $food->saturated_fat * $factor, 2) : null;
        $sodium = $food->sodium !== null ? round((float) $food->sodium * $factor, 4) : null;

        /** @var DiaryEntry $entry */
        $entry = DiaryEntry::create([
            'user_id' => $user->id,
            'food_id' => $food->id,
            'food_serving_id' => $servingId,
            'date' => (string) $data['date'],
            'meal_slot' => (string) $data['meal_slot'],
            'quantity' => round($calcQuantity, 2),
            'unit' => $unit,
            'grams' => round($grams, 2),
            'calories' => $calories,
            'protein' => $protein,
            'carbs' => $carbs,
            'fat' => $fat,
            'fiber' => $fiber,
            'sugar' => $sugar,
            'saturated_fat' => $saturatedFat,
            'sodium' => $sodium,
        ]);

        $entry->load(['food.servings', 'serving']);

        DiaryUpdated::dispatch($user->id, (string) $data['date'], 'added', [
            'entry_id' => $entry->id,
            'meal_slot' => $entry->meal_slot,
            'calories' => $entry->calories,
        ]);

        return $entry;
    }

    /**
     * Update an existing diary entry portion.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateEntry(User $user, DiaryEntry $entry, array $data): DiaryEntry
    {
        if ($entry->user_id !== $user->id) {
            abort(403, 'Unauthorized action on diary entry.');
        }

        /** @var Food $food */
        $food = $entry->food;

        $quantity = isset($data['quantity']) ? (float) $data['quantity'] : (float) $entry->quantity;
        $servingId = array_key_exists('food_serving_id', $data) ? ($data['food_serving_id'] ? (int) $data['food_serving_id'] : null) : $entry->food_serving_id;
        $customGrams = ! empty($data['custom_grams']) ? (float) $data['custom_grams'] : null;

        $portionData = $this->resolvePortionGramsAndUnit($food, $servingId, $quantity, $customGrams);

        $grams = $portionData['grams'];
        $unit = $portionData['unit'];
        $calcQuantity = $portionData['quantity'];

        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;
        $factor = $grams / $baseSize;

        $entry->update([
            'meal_slot' => (string) ($data['meal_slot'] ?? $entry->meal_slot),
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

    /**
     * Delete a diary entry.
     */
    public function deleteEntry(User $user, DiaryEntry $entry): bool
    {
        if ($entry->user_id !== $user->id) {
            abort(403, 'Unauthorized action on diary entry.');
        }

        $date = $entry->date->format('Y-m-d');
        $mealSlot = $entry->meal_slot;
        $entryId = $entry->id;

        $deleted = (bool) $entry->delete();

        if ($deleted) {
            DiaryUpdated::dispatch($user->id, $date, 'deleted', [
                'entry_id' => $entryId,
                'meal_slot' => $mealSlot,
            ]);
        }

        return $deleted;
    }

    /**
     * Quick add calories directly to a meal slot.
     */
    public function quickAdd(User $user, string $date, string $mealSlot, float $calories, ?string $description = null): DiaryEntry
    {
        return DB::transaction(function () use ($user, $date, $mealSlot, $calories, $description) {
            /** @var Food $food */
            $food = Food::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $description ?: 'Quick Add Calories',
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
                'date' => $date,
                'meal_slot' => $mealSlot,
                'quantity' => round($calories, 2),
                'unit' => 'kcal',
                'grams' => round($calories, 2),
                'calories' => round($calories, 2),
                'protein' => 0.0,
                'carbs' => 0.0,
                'fat' => 0.0,
            ]);

            DiaryUpdated::dispatch($user->id, $date, 'quick_add', [
                'entry_id' => $entry->id,
                'meal_slot' => $mealSlot,
                'calories' => $calories,
            ]);

            return $entry;
        });
    }

    /**
     * Log water intake in milliliters.
     */
    public function logWater(User $user, string $date, int $amountMl): WaterLog
    {
        /** @var WaterLog $log */
        $log = WaterLog::create([
            'user_id' => $user->id,
            'date' => $date,
            'amount_ml' => $amountMl,
        ]);

        DiaryUpdated::dispatch($user->id, $date, 'water_logged', [
            'water_log_id' => $log->id,
            'amount_ml' => $amountMl,
        ]);

        return $log;
    }

    /**
     * Delete water log.
     */
    public function deleteWaterLog(User $user, WaterLog $waterLog): bool
    {
        if ($waterLog->user_id !== $user->id) {
            abort(403, 'Unauthorized action on water log.');
        }

        $date = $waterLog->date->format('Y-m-d');
        $waterLogId = $waterLog->id;

        $deleted = (bool) $waterLog->delete();

        if ($deleted) {
            DiaryUpdated::dispatch($user->id, $date, 'water_deleted', [
                'water_log_id' => $waterLogId,
            ]);
        }

        return $deleted;
    }

    /**
     * @return array{grams: float, unit: string, quantity: float}
     */
    protected function resolvePortionGramsAndUnit(Food $food, ?int $servingId, float $quantity, ?float $customGrams): array
    {
        if ($customGrams !== null && $customGrams > 0) {
            $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;

            return [
                'grams' => $customGrams,
                'unit' => 'g',
                'quantity' => $customGrams / $baseSize,
            ];
        }

        if ($servingId) {
            /** @var FoodServing|null $serving */
            $serving = FoodServing::where('food_id', $food->id)->find($servingId);
            if ($serving) {
                return [
                    'grams' => (float) $serving->gram_equivalent * $quantity,
                    'unit' => $serving->serving_name,
                    'quantity' => $quantity,
                ];
            }
        }

        $baseSize = (float) $food->serving_size > 0 ? (float) $food->serving_size : 100.0;

        return [
            'grams' => $baseSize * $quantity,
            'unit' => $food->serving_unit ?: 'g',
            'quantity' => $quantity,
        ];
    }

    /**
     * Log a saved recipe into a meal slot.
     *
     * @return list<DiaryEntry>
     */
    public function logRecipe(User $user, MealRecipe $recipe, string $date, string $mealSlot, float $servings = 1.0, bool $asIndividual = true): array
    {
        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        $recipe->loadMissing('items.food', 'items.serving');
        $recipeServings = (float) $recipe->servings > 0 ? (float) $recipe->servings : 1.0;
        $servingRatio = $servings / $recipeServings;

        $createdEntries = [];

        if ($asIndividual) {
            foreach ($recipe->items as $item) {
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
                    'date' => $date,
                    'meal_slot' => $mealSlot,
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
                    'name' => $recipe->name . ' (Recipe)',
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
                'date' => $date,
                'meal_slot' => $mealSlot,
                'quantity' => round($servings, 2),
                'unit' => 'serving',
                'grams' => round($servings * 100, 2),
                'calories' => round($recipe->calories_per_serving * $servings, 2),
                'protein' => round($recipe->protein_per_serving * $servings, 2),
                'carbs' => round($recipe->carbs_per_serving * $servings, 2),
                'fat' => round($recipe->fat_per_serving * $servings, 2),
                'fiber' => round($recipe->fiber_per_serving * $servings, 2),
                'sugar' => round($recipe->sugar_per_serving * $servings, 2),
                'saturated_fat' => round($recipe->saturated_fat_per_serving * $servings, 2),
                'sodium' => round($recipe->sodium_per_serving * $servings, 4),
            ]);

            $entry->load(['food.servings', 'serving']);
            $createdEntries[] = $entry;
        }

        DiaryUpdated::dispatch($user->id, $date, 'added_recipe', [
            'recipe_id' => $recipe->id,
            'meal_slot' => $mealSlot,
            'entries_count' => count($createdEntries),
        ]);

        return $createdEntries;
    }
}
