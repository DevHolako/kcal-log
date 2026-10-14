<?php

namespace App\Models;

use Database\Factories\DiaryEntryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $food_id
 * @property int|null $food_serving_id
 * @property Carbon $date
 * @property string $meal_slot
 * @property float|string $quantity
 * @property string $unit
 * @property float|string $grams
 * @property float|string $calories
 * @property float|string $protein
 * @property float|string $carbs
 * @property float|string $fat
 * @property float|string|null $fiber
 * @property float|string|null $sugar
 * @property float|string|null $saturated_fat
 * @property float|string|null $sodium
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Food $food
 * @property-read FoodServing|null $serving
 */
class DiaryEntry extends Model
{
    /** @use HasFactory<DiaryEntryFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'food_id',
        'food_serving_id',
        'date',
        'meal_slot',
        'quantity',
        'unit',
        'grams',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'sugar',
        'saturated_fat',
        'sodium',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'quantity' => 'decimal:2',
            'grams' => 'decimal:2',
            'calories' => 'decimal:2',
            'protein' => 'decimal:2',
            'carbs' => 'decimal:2',
            'fat' => 'decimal:2',
            'fiber' => 'decimal:2',
            'sugar' => 'decimal:2',
            'saturated_fat' => 'decimal:2',
            'sodium' => 'decimal:4',
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

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('date', $date);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForSlot(Builder $query, string $slot): Builder
    {
        return $query->where('meal_slot', $slot);
    }
}
