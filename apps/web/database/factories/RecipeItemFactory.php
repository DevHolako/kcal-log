<?php

namespace Database\Factories;

use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\RecipeItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecipeItem>
 */
class RecipeItemFactory extends Factory
{
    protected $model = RecipeItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'meal_recipe_id' => MealRecipe::factory(),
            'food_id' => Food::factory(),
            'food_serving_id' => null,
            'quantity' => 1.00,
            'grams' => 100.00,
            'calories' => 150.00,
            'protein' => 10.00,
            'carbs' => 15.00,
            'fat' => 5.00,
            'fiber' => 2.00,
        ];
    }
}
