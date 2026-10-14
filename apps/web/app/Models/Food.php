<?php

namespace App\Models;

use Database\Factories\FoodFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Food extends Model
{
    /** @use HasFactory<FoodFactory> */
    use HasFactory;

    protected $table = 'foods';

    protected $fillable = [
        'off_id',
        'user_id',
        'is_custom',
        'name',
        'brand',
        'barcode',
        'serving_size',
        'serving_unit',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'sugar',
        'saturated_fat',
        'sodium',
        'nutri_score',
        'nova_group',
        'eco_score',
        'raw_off_data',
        'last_synced_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_custom' => 'boolean',
            'serving_size' => 'decimal:2',
            'calories' => 'decimal:2',
            'protein' => 'decimal:2',
            'carbs' => 'decimal:2',
            'fat' => 'decimal:2',
            'fiber' => 'decimal:2',
            'sugar' => 'decimal:2',
            'saturated_fat' => 'decimal:2',
            'sodium' => 'decimal:2',
            'nova_group' => 'integer',
            'raw_off_data' => 'array',
            'last_synced_at' => 'datetime',
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
     * @return HasMany<FoodServing, $this>
     */
    public function servings(): HasMany
    {
        return $this->hasMany(FoodServing::class);
    }

    /**
     * @return HasMany<FoodServing, $this>
     */
    public function defaultServing(): HasMany
    {
        return $this->hasMany(FoodServing::class)->where('is_default', true);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeCustom(Builder $query): Builder
    {
        return $query->where('is_custom', true);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOffCached(Builder $query): Builder
    {
        return $query->where('is_custom', false)->whereNotNull('off_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeAvailableTo(Builder $query, ?int $userId): Builder
    {
        return $query->where(function (Builder $q) use ($userId) {
            $q->whereNull('user_id');
            if ($userId) {
                $q->orWhere('user_id', $userId);
            }
        });
    }
}
