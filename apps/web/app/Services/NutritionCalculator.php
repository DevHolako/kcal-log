<?php

namespace App\Services;

use Carbon\Carbon;
use InvalidArgumentException;

class NutritionCalculator
{
    /**
     * Activity level physical activity level (PAL) multipliers.
     *
     * @var array<string, float>
     */
    public const ACTIVITY_MULTIPLIERS = [
        'sedentary' => 1.2,
        'lightly_active' => 1.375,
        'moderately_active' => 1.55,
        'very_active' => 1.725,
        'extremely_active' => 1.9,
    ];

    /**
     * Calorie safety floors by biological sex.
     *
     * @var array<string, int>
     */
    public const CALORIE_FLOORS = [
        'female' => 1200,
        'male' => 1500,
    ];

    /**
     * Macro distribution percentages [protein, carbs, fat] by diet preset.
     *
     * @var array<string, array{protein: float, carbs: float, fat: float}>
     */
    public const DIET_PRESETS = [
        'balanced' => ['protein' => 0.30, 'carbs' => 0.40, 'fat' => 0.30],
        'low_carb' => ['protein' => 0.35, 'carbs' => 0.25, 'fat' => 0.40],
        'high_protein' => ['protein' => 0.40, 'carbs' => 0.35, 'fat' => 0.25],
        'keto' => ['protein' => 0.25, 'carbs' => 0.05, 'fat' => 0.70],
    ];

    /**
     * Calculate chronological age from birthdate.
     */
    public function calculateAge(string $birthDate, ?Carbon $referenceDate = null): int
    {
        $birth = Carbon::parse($birthDate);
        $ref = $referenceDate ?? Carbon::now();

        return (int) $birth->diffInYears($ref);
    }

    /**
     * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula.
     *
     * Men: (10 * weight_kg) + (6.25 * height_cm) - (5 * age_years) + 5
     * Women: (10 * weight_kg) + (6.25 * height_cm) - (5 * age_years) - 161
     */
    public function calculateBmr(float $weightKg, float $heightCm, int $ageYears, string $sex): float
    {
        $base = (10 * $weightKg) + (6.25 * $heightCm) - (5 * $ageYears);

        return match ($sex) {
            'male' => round($base + 5, 2),
            'female' => round($base - 161, 2),
            default => throw new InvalidArgumentException("Invalid sex: {$sex}. Allowed: male, female."),
        };
    }

    /**
     * Calculate Total Daily Energy Expenditure (TDEE) based on activity level.
     */
    public function calculateTdee(float $bmr, string $activityLevel): float
    {
        $multiplier = self::ACTIVITY_MULTIPLIERS[$activityLevel] ?? null;

        if ($multiplier === null) {
            throw new InvalidArgumentException("Unknown activity level: {$activityLevel}");
        }

        return round($bmr * $multiplier, 2);
    }

    /**
     * Calculate target calories from TDEE, goal type, and weekly rate.
     * Applies safety floor (1200 kcal for females, 1500 kcal for males).
     *
     * 1 kg of fat ~= 7700 kcal -> daily delta = weekly_rate * 1100.
     *
     * @return array{calories: int, raw_calories: int, is_floor_applied: bool, floor: int, daily_delta: int}
     */
    public function calculateTargetCalories(
        float $tdee,
        string $goalType,
        float $weeklyRateKg,
        string $sex
    ): array {
        $floor = self::CALORIE_FLOORS[$sex] ?? 1200;

        $dailyDelta = match ($goalType) {
            'lose' => (int) round($weeklyRateKg * 1100), // e.g. -0.5 * 1100 = -550
            'gain' => (int) round(abs($weeklyRateKg) * 1100), // e.g. +0.25 * 1100 = +275
            'maintain' => 0,
            default => throw new InvalidArgumentException("Invalid goal type: {$goalType}"),
        };

        $rawCalories = (int) round($tdee + $dailyDelta);
        $isFloorApplied = false;
        $calories = $rawCalories;

        if ($calories < $floor) {
            $calories = $floor;
            $isFloorApplied = true;
        }

        return [
            'calories' => $calories,
            'raw_calories' => $rawCalories,
            'is_floor_applied' => $isFloorApplied,
            'floor' => $floor,
            'daily_delta' => $dailyDelta,
        ];
    }

    /**
     * Calculate macronutrient gram targets from total calories and percentage split.
     *
     * @param  array{protein: float, carbs: float, fat: float}  $percentages
     * @return array{protein_g: float, carbs_g: float, fat_g: float, fiber_g: float}
     */
    public function calculateMacroGrams(int $calories, array $percentages): array
    {
        $proteinGrams = round(($calories * $percentages['protein']) / 4, 2);
        $carbsGrams = round(($calories * $percentages['carbs']) / 4, 2);
        $fatGrams = round(($calories * $percentages['fat']) / 9, 2);

        // Standard fiber recommendation: 14g per 1,000 kcal
        $fiberGrams = round(($calories / 1000) * 14, 2);

        return [
            'protein_g' => $proteinGrams,
            'carbs_g' => $carbsGrams,
            'fat_g' => $fatGrams,
            'fiber_g' => $fiberGrams,
        ];
    }

    /**
     * Helper to compute complete target plan in one invocation.
     *
     * @param  array{protein?: float, carbs?: float, fat?: float}  $customPercentages
     * @return array{
     *     age: int,
     *     bmr: float,
     *     tdee: float,
     *     calories: int,
     *     is_floor_applied: bool,
     *     protein_g: float,
     *     carbs_g: float,
     *     fat_g: float,
     *     fiber_g: float,
     *     water_ml: int,
     *     percentages: array{protein: float, carbs: float, fat: float}
     * }
     */
    public function calculatePlan(
        string $birthDate,
        string $sex,
        float $heightCm,
        float $weightKg,
        string $activityLevel,
        string $goalType,
        float $weeklyRateKg,
        string $dietType = 'balanced',
        array $customPercentages = []
    ): array {
        $age = $this->calculateAge($birthDate);
        $bmr = $this->calculateBmr($weightKg, $heightCm, $age, $sex);
        $tdee = $this->calculateTdee($bmr, $activityLevel);
        $calorieResult = $this->calculateTargetCalories($tdee, $goalType, $weeklyRateKg, $sex);

        $percentages = match ($dietType) {
            'custom' => [
                'protein' => (float) ($customPercentages['protein'] ?? 0.30),
                'carbs' => (float) ($customPercentages['carbs'] ?? 0.40),
                'fat' => (float) ($customPercentages['fat'] ?? 0.30),
            ],
            default => self::DIET_PRESETS[$dietType] ?? self::DIET_PRESETS['balanced'],
        };

        $macros = $this->calculateMacroGrams($calorieResult['calories'], $percentages);

        // Recommended hydration: ~35ml per kg body weight (capped between 2000ml and 4000ml)
        $waterMl = (int) max(2000, min(4000, round($weightKg * 35)));

        return [
            'age' => $age,
            'bmr' => $bmr,
            'tdee' => $tdee,
            'calories' => $calorieResult['calories'],
            'is_floor_applied' => $calorieResult['is_floor_applied'],
            'protein_g' => $macros['protein_g'],
            'carbs_g' => $macros['carbs_g'],
            'fat_g' => $macros['fat_g'],
            'fiber_g' => $macros['fiber_g'],
            'water_ml' => $waterMl,
            'percentages' => $percentages,
        ];
    }
}
