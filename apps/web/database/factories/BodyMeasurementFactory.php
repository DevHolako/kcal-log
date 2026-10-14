<?php

namespace Database\Factories;

use App\Models\BodyMeasurement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BodyMeasurement>
 */
class BodyMeasurementFactory extends Factory
{
    protected $model = BodyMeasurement::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => fake()->unique()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'neck_cm' => fake()->randomFloat(2, 35, 45),
            'waist_cm' => fake()->randomFloat(2, 70, 100),
            'hips_cm' => fake()->randomFloat(2, 85, 110),
            'chest_cm' => fake()->randomFloat(2, 90, 115),
            'biceps_cm' => fake()->randomFloat(2, 28, 42),
            'thighs_cm' => fake()->randomFloat(2, 50, 68),
            'calves_cm' => fake()->randomFloat(2, 34, 44),
            'notes' => fake()->boolean(20) ? fake()->sentence() : null,
        ];
    }
}
