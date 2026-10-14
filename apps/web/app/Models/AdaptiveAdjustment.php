<?php

namespace App\Models;

use Database\Factories\AdaptiveAdjustmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $review_date
 * @property Carbon $period_start
 * @property Carbon $period_end
 * @property float $starting_weight_kg
 * @property float $ending_weight_kg
 * @property float $ewma_weight_change_kg
 * @property float $average_daily_calories
 * @property float $calculated_tdee
 * @property int $current_target_calories
 * @property int $proposed_target_calories
 * @property float $proposed_protein_g
 * @property float $proposed_carbs_g
 * @property float $proposed_fat_g
 * @property string $status
 * @property Carbon|null $user_decision_at
 * @property int|null $applied_target_profile_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read TargetProfile|null $appliedTargetProfile
 */
class AdaptiveAdjustment extends Model
{
    /** @use HasFactory<AdaptiveAdjustmentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'review_date',
        'period_start',
        'period_end',
        'starting_weight_kg',
        'ending_weight_kg',
        'ewma_weight_change_kg',
        'average_daily_calories',
        'calculated_tdee',
        'current_target_calories',
        'proposed_target_calories',
        'proposed_protein_g',
        'proposed_carbs_g',
        'proposed_fat_g',
        'status',
        'user_decision_at',
        'applied_target_profile_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'review_date' => 'date',
            'period_start' => 'date',
            'period_end' => 'date',
            'starting_weight_kg' => 'decimal:2',
            'ending_weight_kg' => 'decimal:2',
            'ewma_weight_change_kg' => 'decimal:2',
            'average_daily_calories' => 'decimal:2',
            'calculated_tdee' => 'decimal:2',
            'current_target_calories' => 'integer',
            'proposed_target_calories' => 'integer',
            'proposed_protein_g' => 'decimal:2',
            'proposed_carbs_g' => 'decimal:2',
            'proposed_fat_g' => 'decimal:2',
            'user_decision_at' => 'datetime',
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
     * @return BelongsTo<TargetProfile, $this>
     */
    public function appliedTargetProfile(): BelongsTo
    {
        return $this->belongsTo(TargetProfile::class, 'applied_target_profile_id');
    }
}
