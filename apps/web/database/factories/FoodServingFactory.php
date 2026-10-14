<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\FoodServing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoodServing>
 */
class FoodServingFactory extends Factory
{
    protected $model = FoodServing::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'food_id' => Food::factory(),
            'serving_name' => fake()->randomElement(['1 portion (150g)', '1 slice (30g)', '1 cup (240ml)', '1 unit (80g)']),
            'gram_equivalent' => fake()->randomFloat(2, 20, 250),
            'is_default' => false,
        ];
    }
}
