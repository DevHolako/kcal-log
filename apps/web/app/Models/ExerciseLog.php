<?php

namespace App\Models;

use Database\Factories\ExerciseLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $date
 * @property string $name
 * @property string $exercise_type
 * @property int $duration_minutes
 * @property float|string $calories_burned
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
class ExerciseLog extends Model
{
    /** @use HasFactory<ExerciseLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'name',
        'exercise_type',
        'duration_minutes',
        'calories_burned',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'duration_minutes' => 'integer',
            'calories_burned' => 'decimal:2',
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
