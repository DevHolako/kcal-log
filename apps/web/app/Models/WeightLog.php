<?php

namespace App\Models;

use Database\Factories\WeightLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property Carbon $date
 * @property float|string $weight_kg
 * @property float|string|null $body_fat_pct
 * @property string|null $photo_path
 * @property string|null $note
 * @property string $source
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
class WeightLog extends Model
{
    /** @use HasFactory<WeightLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'weight_kg',
        'body_fat_pct',
        'photo_path',
        'note',
        'source',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'weight_kg' => 'decimal:2',
            'body_fat_pct' => 'decimal:2',
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
