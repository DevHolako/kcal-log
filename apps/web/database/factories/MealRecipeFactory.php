<?php

namespace Database\Factories;

use App\Models\MealRecipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MealRecipe>
 */
class MealRecipeFactory extends Factory
{
    protected $model = MealRecipe::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'servings' => fake()->randomFloat(2, 1, 4),
            'is_recipe' => true,
            'total_calories' => 550.00,
            'total_protein' => 35.00,
            'total_carbs' => 45.00,
            'total_fat' => 20.00,
            'total_fiber' => 6.00,
        ];
    }
}
