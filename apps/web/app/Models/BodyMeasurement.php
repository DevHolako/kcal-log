<?php

namespace App\Models;

use Database\Factories\BodyMeasurementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $date
 * @property float|string|null $neck_cm
 * @property float|string|null $waist_cm
 * @property float|string|null $hips_cm
 * @property float|string|null $chest_cm
 * @property float|string|null $biceps_cm
 * @property float|string|null $thighs_cm
 * @property float|string|null $calves_cm
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
class BodyMeasurement extends Model
{
    /** @use HasFactory<BodyMeasurementFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'neck_cm',
        'waist_cm',
        'hips_cm',
        'chest_cm',
        'biceps_cm',
        'thighs_cm',
        'calves_cm',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'neck_cm' => 'decimal:2',
            'waist_cm' => 'decimal:2',
            'hips_cm' => 'decimal:2',
            'chest_cm' => 'decimal:2',
            'biceps_cm' => 'decimal:2',
            'thighs_cm' => 'decimal:2',
            'calves_cm' => 'decimal:2',
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
