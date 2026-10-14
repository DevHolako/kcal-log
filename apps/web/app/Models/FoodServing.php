<?php

namespace App\Models;

use Database\Factories\FoodServingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodServing extends Model
{
    /** @use HasFactory<FoodServingFactory> */
    use HasFactory;

    protected $fillable = [
        'food_id',
        'serving_name',
        'gram_equivalent',
        'is_default',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gram_equivalent' => 'decimal:2',
            'is_default' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Food, $this>
     */
    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }
}
