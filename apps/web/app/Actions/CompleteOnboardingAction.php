<?php

namespace App\Actions;

use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use App\Services\NutritionCalculator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CompleteOnboardingAction
{
    public function __construct(
        protected NutritionCalculator $calculator
    ) {}

    /**
     * Execute the onboarding completion transaction.
     *
     * @param  array{
     *     date_of_birth: string,
     *     sex: string,
     *     height_cm: float,
     *     current_weight_kg: float,
     *     activity_level: string,
     *     goal_type: string,
     *     weekly_rate_kg?: float,
     *     diet_type?: string,
     *     custom_percentages?: array{protein?: float, carbs?: float, fat?: float},
     *     timezone?: string,
     *     locale?: string,
     *     unit_preference?: string,
     *     theme_preference?: string
     * }  $data
     * @return array{
     *     user: User,
     *     profile: Profile,
     *     target_profile: TargetProfile,
     *     weight_log: WeightLog
     * }
     */
    public function execute(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $weeklyRateKg = (float) ($data['weekly_rate_kg'] ?? 0.0);
            if ($data['goal_type'] === 'maintain') {
                $weeklyRateKg = 0.0;
            }

            $dietType = $data['diet_type'] ?? 'balanced';
            $customPercentages = $data['custom_percentages'] ?? [];

            // 1. Calculate nutrition targets
            $plan = $this->calculator->calculatePlan(
                birthDate: $data['date_of_birth'],
                sex: $data['sex'],
                heightCm: (float) $data['height_cm'],
                weightKg: (float) $data['current_weight_kg'],
                activityLevel: $data['activity_level'],
                goalType: $data['goal_type'],
                weeklyRateKg: $weeklyRateKg,
                dietType: $dietType,
                customPercentages: $customPercentages
            );

            // 2. Persist Profile
            /** @var Profile $profile */
            $profile = Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => $data['date_of_birth'],
                    'sex' => $data['sex'],
                    'height_cm' => $data['height_cm'],
                    'activity_level' => $data['activity_level'],
                    'timezone' => $data['timezone'] ?? 'UTC',
                    'locale' => $data['locale'] ?? 'en',
                    'unit_preference' => $data['unit_preference'] ?? 'metric',
                    'theme_preference' => $data['theme_preference'] ?? 'system',
                ]
            );

            // 3. Persist Initial Weight Log
            $today = Carbon::now($profile->timezone)->format('Y-m-d');
            /** @var WeightLog $weightLog */
            $weightLog = WeightLog::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'date' => $today,
                ],
                [
                    'weight_kg' => $data['current_weight_kg'],
                    'source' => 'manual',
                    'note' => 'Initial weight recorded during onboarding',
                ]
            );

            // 4. Deactivate old target profiles
            TargetProfile::where('user_id', $user->id)->update(['is_active' => false]);

            // 5. Persist New Target Profile with audit inputs
            /** @var TargetProfile $targetProfile */
            $targetProfile = TargetProfile::create([
                'user_id' => $user->id,
                'is_active' => true,
                'calories' => $plan['calories'],
                'protein_g' => $plan['protein_g'],
                'carbs_g' => $plan['carbs_g'],
                'fat_g' => $plan['fat_g'],
                'fiber_g' => $plan['fiber_g'],
                'water_ml' => $plan['water_ml'],
                'bmr' => $plan['bmr'],
                'tdee' => $plan['tdee'],
                'goal_type' => $data['goal_type'],
                'weekly_rate_kg' => $weeklyRateKg,
                'diet_type' => $dietType,
                'formula_inputs' => [
                    'formula' => 'mifflin_st_jeor',
                    'birth_date' => $data['date_of_birth'],
                    'calculated_age' => $plan['age'],
                    'sex' => $data['sex'],
                    'height_cm' => $data['height_cm'],
                    'weight_kg' => $data['current_weight_kg'],
                    'activity_level' => $data['activity_level'],
                    'goal_type' => $data['goal_type'],
                    'weekly_rate_kg' => $weeklyRateKg,
                    'diet_type' => $dietType,
                    'macro_percentages' => $plan['percentages'],
                    'is_floor_applied' => $plan['is_floor_applied'],
                ],
                'source' => 'onboarding',
            ]);

            return [
                'user' => $user->fresh(),
                'profile' => $profile,
                'target_profile' => $targetProfile,
                'weight_log' => $weightLog,
            ];
        });
    }
}
