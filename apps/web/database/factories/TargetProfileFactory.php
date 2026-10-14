<?php

namespace Database\Factories;

use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TargetProfile>
 */
class TargetProfileFactory extends Factory
{
    protected $model = TargetProfile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $calories = fake()->numberBetween(1600, 2600);
        $proteinG = round(($calories * 0.30) / 4, 2);
        $carbsG = round(($calories * 0.40) / 4, 2);
        $fatG = round(($calories * 0.30) / 9, 2);
        $fiberG = round(($calories / 1000) * 14, 2);

        return [
            'user_id' => User::factory(),
            'is_active' => true,
            'calories' => $calories,
            'protein_g' => $proteinG,
            'carbs_g' => $carbsG,
            'fat_g' => $fatG,
            'fiber_g' => $fiberG,
            'water_ml' => 2500,
            'bmr' => 1750.00,
            'tdee' => 2400.00,
            'goal_type' => fake()->randomElement(['lose', 'maintain', 'gain']),
            'weekly_rate_kg' => -0.50,
            'diet_type' => 'balanced',
            'formula_inputs' => [
                'formula' => 'mifflin_st_jeor',
                'age' => 30,
                'sex' => 'male',
                'weight_kg' => 80.0,
                'height_cm' => 180.0,
                'activity_multiplier' => 1.375,
            ],
            'source' => 'onboarding',
        ];
    }
}
