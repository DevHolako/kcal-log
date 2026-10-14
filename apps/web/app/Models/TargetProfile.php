<?php

namespace App\Models;

use Database\Factories\TargetProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property bool $is_active
 * @property int $calories
 * @property float $protein_g
 * @property float $carbs_g
 * @property float $fat_g
 * @property float|null $fiber_g
 * @property int|null $water_ml
 * @property float|null $bmr
 * @property float|null $tdee
 * @property string $goal_type
 * @property float $weekly_rate_kg
 * @property string|null $diet_type
 * @property array<string, mixed>|null $formula_inputs
 * @property string|null $source
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
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
