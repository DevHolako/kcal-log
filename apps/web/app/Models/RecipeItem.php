<?php

namespace App\Models;

use Database\Factories\RecipeItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeItem extends Model
{
    /** @use HasFactory<RecipeItemFactory> */
    use HasFactory;

    protected $fillable = [
        'meal_recipe_id',
        'food_id',
        'food_serving_id',
        'quantity',
        'grams',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'grams' => 'decimal:2',
            'calories' => 'decimal:2',
            'protein' => 'decimal:2',
            'carbs' => 'decimal:2',
            'fat' => 'decimal:2',
            'fiber' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<MealRecipe, $this>
     */
    public function mealRecipe(): BelongsTo
    {
        return $this->belongsTo(MealRecipe::class, 'meal_recipe_id');
    }

    /**
     * @return BelongsTo<Food, $this>
     */
    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }

    /**
     * @return BelongsTo<FoodServing, $this>
     */
    public function serving(): BelongsTo
    {
        return $this->belongsTo(FoodServing::class, 'food_serving_id');
    }
}
