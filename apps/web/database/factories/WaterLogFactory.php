<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WaterLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WaterLog>
 */
class WaterLogFactory extends Factory
{
    protected $model = WaterLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => fake()->dateTimeBetween('-7 days', 'now')->format('Y-m-d'),
            'amount_ml' => fake()->numberBetween(250, 750),
        ];
    }
}
