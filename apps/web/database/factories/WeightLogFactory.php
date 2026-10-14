<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WeightLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeightLog>
 */
class WeightLogFactory extends Factory
{
    protected $model = WeightLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => fake()->unique()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'weight_kg' => fake()->randomFloat(2, 65, 95),
            'body_fat_pct' => fake()->randomFloat(2, 12, 28),
            'photo_path' => null,
            'note' => fake()->boolean(20) ? fake()->sentence() : null,
            'source' => 'manual',
        ];
    }
}
