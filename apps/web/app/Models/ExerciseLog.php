<?php

namespace App\Models;

use Database\Factories\ExerciseLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
