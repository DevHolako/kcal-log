<?php

namespace Database\Factories;

use App\Models\ExerciseLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExerciseLog>
 */
class ExerciseLogFactory extends Factory
{
    protected $model = ExerciseLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $duration = fake()->numberBetween(20, 60);

        return [
            'user_id' => User::factory(),
            'date' => fake()->dateTimeBetween('-7 days', 'now')->format('Y-m-d'),
            'name' => fake()->randomElement(['Running', 'Cycling', 'Weight Lifting', 'Swimming', 'Walking']),
            'exercise_type' => fake()->randomElement(['cardio', 'strength', 'other']),
            'duration_minutes' => $duration,
            'calories_burned' => round($duration * fake()->randomFloat(2, 6.0, 10.0), 2),
            'notes' => fake()->boolean(20) ? fake()->sentence() : null,
        ];
    }
}
