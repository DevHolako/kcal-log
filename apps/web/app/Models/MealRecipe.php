<?php

namespace App\Models;

use Database\Factories\MealRecipeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MealRecipe extends Model
{
    /** @use HasFactory<MealRecipeFactory> */
    use HasFactory;

    protected $table = 'meals_recipes';

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'servings',
        'is_recipe',
        'total_calories',
        'total_protein',
        'total_carbs',
        'total_fat',
        'total_fiber',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'servings' => 'decimal:2',
            'is_recipe' => 'boolean',
            'total_calories' => 'decimal:2',
            'total_protein' => 'decimal:2',
            'total_carbs' => 'decimal:2',
            'total_fat' => 'decimal:2',
            'total_fiber' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<RecipeItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(RecipeItem::class, 'meal_recipe_id');
    }
}
