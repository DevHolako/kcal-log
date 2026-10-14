<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Food>
 */
class FoodFactory extends Factory
{
    protected $model = Food::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $servingSize = 100.00;
        $protein = fake()->randomFloat(2, 0, 30);
        $carbs = fake()->randomFloat(2, 0, 60);
        $fat = fake()->randomFloat(2, 0, 25);
        $fiber = fake()->randomFloat(2, 0, 10);
        $calories = round(($protein * 4) + ($carbs * 4) + ($fat * 9), 2);

        return [
            'off_id' => fake()->boolean(70) ? (string) fake()->unique()->numerify('3017620######') : null,
            'user_id' => null,
            'is_custom' => false,
            'name' => fake()->words(2, true),
            'brand' => fake()->company(),
            'barcode' => fake()->unique()->ean13(),
            'serving_size' => $servingSize,
            'serving_unit' => 'g',
            'calories' => $calories,
            'protein' => $protein,
            'carbs' => $carbs,
            'fat' => $fat,
            'fiber' => $fiber,
            'sugar' => fake()->randomFloat(2, 0, 20),
            'saturated_fat' => fake()->randomFloat(2, 0, 10),
            'sodium' => fake()->randomFloat(2, 0, 1000),
            'nutri_score' => fake()->randomElement(['a', 'b', 'c', 'd', 'e']),
            'nova_group' => fake()->numberBetween(1, 4),
            'eco_score' => fake()->randomElement(['a', 'b', 'c', 'd', 'e']),
            'raw_off_data' => null,
            'last_synced_at' => now(),
        ];
    }

    public function custom(?User $user = null): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user !== null ? $user->id : User::factory(),
            'is_custom' => true,
            'off_id' => null,
        ]);
    }
}
