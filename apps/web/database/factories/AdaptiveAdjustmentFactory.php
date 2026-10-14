<?php

namespace Database\Factories;

use App\Models\AdaptiveAdjustment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdaptiveAdjustment>
 */
class AdaptiveAdjustmentFactory extends Factory
{
    protected $model = AdaptiveAdjustment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'review_date' => now()->format('Y-m-d'),
            'period_start' => now()->subDays(7)->format('Y-m-d'),
            'period_end' => now()->format('Y-m-d'),
            'starting_weight_kg' => 80.50,
            'ending_weight_kg' => 80.10,
            'ewma_weight_change_kg' => -0.40,
            'average_daily_calories' => 2100.00,
            'calculated_tdee' => 2550.00,
            'current_target_calories' => 2050,
            'proposed_target_calories' => 2000,
            'proposed_protein_g' => 150.00,
            'proposed_carbs_g' => 200.00,
            'proposed_fat_g' => 67.00,
            'status' => 'pending',
            'user_decision_at' => null,
            'applied_target_profile_id' => null,
        ];
    }
}
