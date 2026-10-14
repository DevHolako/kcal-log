<?php

namespace App\Models;

use Database\Factories\TargetProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TargetProfile extends Model
{
    /** @use HasFactory<TargetProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_active',
        'calories',
        'protein_g',
        'carbs_g',
        'fat_g',
        'fiber_g',
        'water_ml',
        'bmr',
        'tdee',
        'goal_type',
        'weekly_rate_kg',
        'diet_type',
        'formula_inputs',
        'source',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'calories' => 'integer',
            'protein_g' => 'decimal:2',
            'carbs_g' => 'decimal:2',
            'fat_g' => 'decimal:2',
            'fiber_g' => 'decimal:2',
            'water_ml' => 'integer',
            'bmr' => 'decimal:2',
            'tdee' => 'decimal:2',
            'weekly_rate_kg' => 'decimal:2',
            'formula_inputs' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
