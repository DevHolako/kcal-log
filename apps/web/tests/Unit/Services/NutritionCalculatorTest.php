<?php

use App\Services\NutritionCalculator;

it('calculates Mifflin-St Jeor BMR for men and women accurately', function () {
    $calculator = new NutritionCalculator;

    // 80kg, 180cm, 30yo male
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    $maleBmr = $calculator->calculateBmr(80.0, 180.0, 30, 'male');
    expect($maleBmr)->toBe(1780.0);

    // 60kg, 165cm, 28yo female
    // BMR = 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25
    $femaleBmr = $calculator->calculateBmr(60.0, 165.0, 28, 'female');
    expect($femaleBmr)->toBe(1330.25);
});

it('calculates TDEE using activity PAL multipliers', function () {
    $calculator = new NutritionCalculator;
    $bmr = 1780.0;

    expect($calculator->calculateTdee($bmr, 'sedentary'))->toBe(2136.0)
        ->and($calculator->calculateTdee($bmr, 'moderately_active'))->toBe(2759.0)
        ->and($calculator->calculateTdee($bmr, 'extremely_active'))->toBe(3382.0);
});

it('calculates target calories with safety floor enforcement', function () {
    $calculator = new NutritionCalculator;

    // Standard deficit
    $result = $calculator->calculateTargetCalories(2500.0, 'lose', -0.5, 'male');
    expect($result['calories'])->toBe(1950)
        ->and($result['is_floor_applied'])->toBeFalse();

    // Floor clamping on extreme female deficit
    $floorResult = $calculator->calculateTargetCalories(1300.0, 'lose', -1.0, 'female');
    // raw = 1300 - 1100 = 200, clamped to 1200
    expect($floorResult['calories'])->toBe(1200)
        ->and($floorResult['is_floor_applied'])->toBeTrue();
});

it('calculates exact macro grams based on diet preset', function () {
    $calculator = new NutritionCalculator;
    $calories = 2000;

    $macros = $calculator->calculateMacroGrams($calories, NutritionCalculator::DIET_PRESETS['balanced']);
    // 30% protein = 600 kcal / 4 = 150g
    // 40% carbs = 800 kcal / 4 = 200g
    // 30% fat = 600 kcal / 9 = 66.67g
    // fiber = (2000 / 1000) * 14 = 28g
    expect($macros['protein_g'])->toBe(150.0)
        ->and($macros['carbs_g'])->toBe(200.0)
        ->and($macros['fat_g'])->toBe(66.67)
        ->and($macros['fiber_g'])->toBe(28.0);
});
