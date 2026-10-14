<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'sex' => fake()->randomElement(['male', 'female']),
            'height_cm' => fake()->randomFloat(2, 150, 195),
            'activity_level' => fake()->randomElement([
                'sedentary',
                'lightly_active',
                'moderately_active',
                'very_active',
                'extremely_active',
            ]),
            'timezone' => 'Europe/Paris',
            'locale' => fake()->randomElement(['en', 'fr']),
            'unit_preference' => 'metric',
            'theme_preference' => 'system',
        ];
    }
}
