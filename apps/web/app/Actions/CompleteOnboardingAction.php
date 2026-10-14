<?php

namespace App\Actions;

use App\DTOs\Onboarding\OnboardingDTO;
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
     * @param  OnboardingDTO|array{
     *     date_of_birth: string,
     *     sex: string,
     *     height_cm: float|int|string,
     *     current_weight_kg: float|int|string,
     *     activity_level: string,
     *     goal_type: string,
     *     weekly_rate_kg?: float|int|string|null,
     *     diet_type?: ?string,
     *     custom_percentages?: array{protein?: float, carbs?: float, fat?: float}|null,
     *     timezone?: ?string,
     *     locale?: ?string,
     *     unit_preference?: ?string,
     *     theme_preference?: ?string
     * }  $input
     * @return array{
     *     user: User,
     *     profile: Profile,
     *     target_profile: TargetProfile,
     *     weight_log: WeightLog
     * }
     */
    public function execute(User $user, OnboardingDTO|array $input): array
    {
        $dto = $input instanceof OnboardingDTO ? $input : OnboardingDTO::fromArray($input);

        return DB::transaction(function () use ($user, $dto) {
            $weeklyRateKg = $dto->weeklyRateKg;
            $dietType = $dto->dietType;
            $customPercentages = $dto->customPercentages;

            // 1. Calculate nutrition targets
            $plan = $this->calculator->calculatePlan(
                birthDate: $dto->dateOfBirth,
                sex: $dto->sex,
                heightCm: $dto->heightCm,
                weightKg: $dto->currentWeightKg,
                activityLevel: $dto->activityLevel,
                goalType: $dto->goalType,
                weeklyRateKg: $weeklyRateKg,
                dietType: $dietType,
                customPercentages: $customPercentages
            );

            // 2. Persist Profile
            /** @var Profile $profile */
            $profile = Profile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => $dto->dateOfBirth,
                    'sex' => $dto->sex,
                    'height_cm' => $dto->heightCm,
                    'activity_level' => $dto->activityLevel,
                    'timezone' => $dto->timezone ?? 'UTC',
                    'locale' => $dto->locale ?? 'en',
                    'unit_preference' => $dto->unitPreference ?? 'metric',
                    'theme_preference' => $dto->themePreference ?? 'system',
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
                    'weight_kg' => $dto->currentWeightKg,
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
                'goal_type' => $dto->goalType,
                'weekly_rate_kg' => $weeklyRateKg,
                'diet_type' => $dietType,
                'formula_inputs' => [
                    'formula' => 'mifflin_st_jeor',
                    'birth_date' => $dto->dateOfBirth,
                    'calculated_age' => $plan['age'],
                    'sex' => $dto->sex,
                    'height_cm' => $dto->heightCm,
                    'weight_kg' => $dto->currentWeightKg,
                    'activity_level' => $dto->activityLevel,
                    'goal_type' => $dto->goalType,
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
