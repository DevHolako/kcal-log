<?php

namespace Database\Factories;

use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DiaryEntry>
 */
class DiaryEntryFactory extends Factory
{
    protected $model = DiaryEntry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grams = fake()->randomFloat(2, 50, 300);
        $factor = $grams / 100.00;
        $protein = round(12.0 * $factor, 2);
        $carbs = round(20.0 * $factor, 2);
        $fat = round(5.0 * $factor, 2);
        $calories = round(($protein * 4) + ($carbs * 4) + ($fat * 9), 2);

        return [
            'user_id' => User::factory(),
            'food_id' => Food::factory(),
            'food_serving_id' => null,
            'date' => fake()->dateTimeBetween('-7 days', 'now')->format('Y-m-d'),
            'meal_slot' => fake()->randomElement(['breakfast', 'lunch', 'dinner', 'snack']),
            'quantity' => 1.00,
            'unit' => 'serving',
            'grams' => $grams,
            'calories' => $calories,
            'protein' => $protein,
            'carbs' => $carbs,
            'fat' => $fat,
            'fiber' => round(2.5 * $factor, 2),
        ];
    }
}
