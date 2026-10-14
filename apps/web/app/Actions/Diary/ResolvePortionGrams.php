<?php

namespace App\Actions\Diary;

use App\Models\Food;
use App\Models\FoodServing;

trait ResolvePortionGrams
{
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
}
