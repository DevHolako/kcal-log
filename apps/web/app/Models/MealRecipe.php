<?php

namespace App\Models;

use Database\Factories\MealRecipeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $description
 * @property float|string $servings
 * @property bool $is_recipe
 * @property float|string $total_calories
 * @property float|string $total_protein
 * @property float|string $total_carbs
 * @property float|string $total_fat
 * @property float|string|null $total_fiber
 * @property float|string|null $total_sugar
 * @property float|string|null $total_saturated_fat
 * @property float|string|null $total_sodium
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, RecipeItem> $items
 */
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
        'total_sugar',
        'total_saturated_fat',
        'total_sodium',
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
            'total_sugar' => 'decimal:2',
            'total_saturated_fat' => 'decimal:2',
            'total_sodium' => 'decimal:4',
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

    /**
     * Recalculate total calories and macros from recipe items.
     */
    public function recalculateTotals(): void
    {
        $this->loadMissing('items');

        $this->total_calories = (float) $this->items->sum('calories');
        $this->total_protein = (float) $this->items->sum('protein');
        $this->total_carbs = (float) $this->items->sum('carbs');
        $this->total_fat = (float) $this->items->sum('fat');
        $this->total_fiber = (float) $this->items->sum('fiber');
        $this->total_sugar = (float) $this->items->sum('sugar');
        $this->total_saturated_fat = (float) $this->items->sum('saturated_fat');
        $this->total_sodium = (float) $this->items->sum('sodium');

        $this->save();
    }

    /**
     * Get single serving calorie value.
     */
    public function getCaloriesPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) $this->total_calories / $servings, 2) : 0.0;
    }

    /**
     * Get single serving protein value.
     */
    public function getProteinPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) $this->total_protein / $servings, 2) : 0.0;
    }

    /**
     * Get single serving carbs value.
     */
    public function getCarbsPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) $this->total_carbs / $servings, 2) : 0.0;
    }

    /**
     * Get single serving fat value.
     */
    public function getFatPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) $this->total_fat / $servings, 2) : 0.0;
    }

    /**
     * Get single serving fiber value.
     */
    public function getFiberPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) ($this->total_fiber ?? 0) / $servings, 2) : 0.0;
    }

    /**
     * Get single serving sugar value.
     */
    public function getSugarPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) ($this->total_sugar ?? 0) / $servings, 2) : 0.0;
    }

    /**
     * Get single serving saturated fat value.
     */
    public function getSaturatedFatPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) ($this->total_saturated_fat ?? 0) / $servings, 2) : 0.0;
    }

    /**
     * Get single serving sodium value.
     */
    public function getSodiumPerServingAttribute(): float
    {
        $servings = (float) $this->servings;
        return $servings > 0 ? round((float) ($this->total_sodium ?? 0) / $servings, 4) : 0.0;
    }
}

