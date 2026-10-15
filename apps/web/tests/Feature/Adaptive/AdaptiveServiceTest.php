<?php

use App\Events\AdaptiveAdjustmentProposed;
use App\Models\AdaptiveAdjustment;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use App\Services\AdaptiveAdjustmentService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('AdaptiveAdjustmentService calculates EWMA smoothed weight series', function () {
    $user = User::factory()->create();
    $service = app(AdaptiveAdjustmentService::class);

    $logs = collect([
        WeightLog::create(['user_id' => $user->id, 'date' => '2026-10-01', 'weight_kg' => 80.0]),
        WeightLog::create(['user_id' => $user->id, 'date' => '2026-10-02', 'weight_kg' => 81.0]), // spike
        WeightLog::create(['user_id' => $user->id, 'date' => '2026-10-03', 'weight_kg' => 80.2]),
    ]);

    $ewma = $service->calculateEwmaSeries($logs);

    // Day 1: 80.0
    expect($ewma['2026-10-01'])->toBe(80.0);
    // Day 2: 0.25 * 81.0 + 0.75 * 80.0 = 20.25 + 60.0 = 80.25 (dampened from 81.0!)
    expect($ewma['2026-10-02'])->toBe(80.25);
    // Day 3: 0.25 * 80.2 + 0.75 * 80.25 = 20.05 + 60.1875 = 80.24
    expect($ewma['2026-10-03'])->toBe(80.24);
});

test('calculateWeeklyAdjustment creates pending adjustment and calculates realized TDEE', function () {
    Event::fake([AdaptiveAdjustmentProposed::class]);

    $user = User::factory()->create();
    Profile::create([
        'user_id' => $user->id,
        'date_of_birth' => '1995-05-15',
        'sex' => 'female',
        'height_cm' => 168.0,
        'timezone' => 'UTC',
    ]);

    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 1800,
        'protein_g' => 135,
        'carbs_g' => 180,
        'fat_g' => 60,
        'fiber_g' => 25,
        'water_ml' => 2500,
        'activity_level' => 'moderately_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'is_active' => true,
        'formula_inputs' => [],
    ]);

    $today = Carbon::parse('2026-10-14');
    $periodEnd = $today->copy()->subDay(); // 2026-10-13
    $periodStart = $periodEnd->copy()->subDays(6); // 2026-10-07

    // Weight logs: lost 0.5 kg smoothed over the week (4 weigh-ins to satisfy calibration)
    WeightLog::create(['user_id' => $user->id, 'date' => $periodStart->format('Y-m-d'), 'weight_kg' => 70.0]);
    WeightLog::create(['user_id' => $user->id, 'date' => $periodStart->copy()->addDays(2)->format('Y-m-d'), 'weight_kg' => 69.8]);
    WeightLog::create(['user_id' => $user->id, 'date' => $periodStart->copy()->addDays(4)->format('Y-m-d'), 'weight_kg' => 69.6]);
    WeightLog::create(['user_id' => $user->id, 'date' => $periodEnd->format('Y-m-d'), 'weight_kg' => 69.5]);

    // Food logs: logged daily 1800 kcal
    $food = Food::factory()->create(['calories' => 600, 'serving_size' => 100]);
    for ($i = 0; $i < 7; $i++) {
        DiaryEntry::create([
            'user_id' => $user->id,
            'food_id' => $food->id,
            'date' => $periodStart->copy()->addDays($i)->format('Y-m-d'),
            'meal_slot' => 'lunch',
            'quantity' => 3,
            'unit' => 'g',
            'grams' => 300,
            'calories' => 1800,
            'protein' => 135,
            'carbs' => 180,
            'fat' => 60,
        ]);
    }

    $service = app(AdaptiveAdjustmentService::class);
    $adjustment = $service->calculateWeeklyAdjustment($user, $today);

    expect($adjustment)->not->toBeNull()
        ->and($adjustment->status)->toBe('pending')
        ->and((float) $adjustment->average_daily_calories)->toBe(1800.0)
        ->and((int) $adjustment->current_target_calories)->toBe(1800)
        ->and((int) $adjustment->proposed_target_calories)->toBeGreaterThanOrEqual(1200);

    Event::assertDispatched(AdaptiveAdjustmentProposed::class, function (AdaptiveAdjustmentProposed $e) use ($user, $adjustment) {
        return $e->userId === $user->id && $e->adjustmentId === $adjustment->id;
    });
});

test('calculateWeeklyAdjustment maintains current target when diary entries are empty', function () {
    Event::fake([AdaptiveAdjustmentProposed::class]);

    $user = User::factory()->create();
    Profile::create([
        'user_id' => $user->id,
        'date_of_birth' => '1995-05-15',
        'sex' => 'male',
        'height_cm' => 178.0,
        'timezone' => 'UTC',
    ]);

    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 1637,
        'protein_g' => 164,
        'carbs_g' => 143,
        'fat_g' => 45,
        'fiber_g' => 25,
        'water_ml' => 2500,
        'activity_level' => 'sedentary',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'is_active' => true,
        'formula_inputs' => [],
    ]);

    $today = Carbon::parse('2026-10-15');
    $periodEnd = $today->copy()->subDay();
    $periodStart = $periodEnd->copy()->subDays(6);

    // 2 weigh-ins, same weight
    WeightLog::create(['user_id' => $user->id, 'date' => $periodStart->format('Y-m-d'), 'weight_kg' => 83.0]);
    WeightLog::create(['user_id' => $user->id, 'date' => $periodEnd->format('Y-m-d'), 'weight_kg' => 83.0]);

    // Zero diary entries!

    $service = app(AdaptiveAdjustmentService::class);
    $adjustment = $service->calculateWeeklyAdjustment($user, $today);

    expect($adjustment)->not->toBeNull()
        ->and($adjustment->status)->toBe('pending')
        ->and((float) $adjustment->average_daily_calories)->toBe(0.0)
        ->and((int) $adjustment->current_target_calories)->toBe(1637)
        ->and((int) $adjustment->proposed_target_calories)->toBe(1637) // Maintained, not decreased!
        ->and((float) $adjustment->proposed_protein_g)->toBe(164.0)
        ->and((float) $adjustment->proposed_carbs_g)->toBe(143.0)
        ->and((float) $adjustment->proposed_fat_g)->toBe(45.0);
});

test('calculateWeeklyAdjustment maintains current target when in initial calibration phase', function () {
    Event::fake([AdaptiveAdjustmentProposed::class]);

    $user = User::factory()->create();
    Profile::create([
        'user_id' => $user->id,
        'date_of_birth' => '1995-05-15',
        'sex' => 'male',
        'height_cm' => 180.0,
        'timezone' => 'UTC',
    ]);

    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2000,
        'protein_g' => 150,
        'carbs_g' => 200,
        'fat_g' => 65,
        'is_active' => true,
        'activity_level' => 'moderately_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'formula_inputs' => [],
    ]);

    $today = Carbon::parse('2026-10-15');
    $periodEnd = $today->copy()->subDay();
    $periodStart = $periodEnd->copy()->subDays(6);

    // Only 2 weigh-ins (< 4)
    WeightLog::create(['user_id' => $user->id, 'date' => $periodStart->format('Y-m-d'), 'weight_kg' => 80.0]);
    WeightLog::create(['user_id' => $user->id, 'date' => $periodEnd->format('Y-m-d'), 'weight_kg' => 80.0]);

    // 7 days of food logged
    $food = Food::factory()->create(['calories' => 500, 'serving_size' => 100]);
    for ($i = 0; $i < 7; $i++) {
        DiaryEntry::create([
            'user_id' => $user->id,
            'food_id' => $food->id,
            'date' => $periodStart->copy()->addDays($i)->format('Y-m-d'),
            'meal_slot' => 'lunch',
            'quantity' => 4,
            'unit' => 'g',
            'grams' => 400,
            'calories' => 2000,
            'protein' => 150,
            'carbs' => 200,
            'fat' => 65,
        ]);
    }

    $service = app(AdaptiveAdjustmentService::class);
    $adjustment = $service->calculateWeeklyAdjustment($user, $today);

    expect($adjustment)->not->toBeNull()
        ->and((int) $adjustment->current_target_calories)->toBe(2000)
        ->and((int) $adjustment->proposed_target_calories)->toBe(2000); // Maintained during calibration
});

test('acceptAdjustment deactivates old target profile and activates new proposed plan', function () {
    $user = User::factory()->create();

    $oldTarget = TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2000,
        'protein_g' => 150,
        'carbs_g' => 200,
        'fat_g' => 65,
        'fiber_g' => 30,
        'water_ml' => 2500,
        'activity_level' => 'moderately_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'is_active' => true,
        'formula_inputs' => [],
    ]);

    $adjustment = AdaptiveAdjustment::create([
        'user_id' => $user->id,
        'review_date' => '2026-10-14',
        'period_start' => '2026-10-07',
        'period_end' => '2026-10-13',
        'starting_weight_kg' => 80.0,
        'ending_weight_kg' => 79.8,
        'ewma_weight_change_kg' => -0.2,
        'average_daily_calories' => 2000.0,
        'calculated_tdee' => 2220.0,
        'current_target_calories' => 2000,
        'proposed_target_calories' => 1920,
        'proposed_protein_g' => 144.0,
        'proposed_carbs_g' => 192.0,
        'proposed_fat_g' => 64.0,
        'status' => 'pending',
    ]);

    $service = app(AdaptiveAdjustmentService::class);
    $newTarget = $service->acceptAdjustment($user, $adjustment);

    $oldTarget->refresh();
    $adjustment->refresh();

    expect($oldTarget->is_active)->toBeFalse()
        ->and($newTarget->is_active)->toBeTrue()
        ->and((int) $newTarget->calories)->toBe(1920)
        ->and((float) $newTarget->protein_g)->toBe(144.0)
        ->and($adjustment->status)->toBe('accepted')
        ->and($adjustment->applied_target_profile_id)->toBe($newTarget->id)
        ->and($adjustment->user_decision_at)->not->toBeNull();
});

test('rejectAdjustment marks adjustment rejected and keeps active target intact', function () {
    $user = User::factory()->create();

    $activeTarget = TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2000,
        'protein_g' => 150,
        'carbs_g' => 200,
        'fat_g' => 65,
        'is_active' => true,
        'activity_level' => 'sedentary',
        'goal_type' => 'maintain',
        'weekly_rate_kg' => 0.0,
        'formula_inputs' => [],
    ]);

    $adjustment = AdaptiveAdjustment::create([
        'user_id' => $user->id,
        'review_date' => '2026-10-14',
        'period_start' => '2026-10-07',
        'period_end' => '2026-10-13',
        'starting_weight_kg' => 80.0,
        'ending_weight_kg' => 80.0,
        'ewma_weight_change_kg' => 0.0,
        'average_daily_calories' => 2000.0,
        'calculated_tdee' => 2000.0,
        'current_target_calories' => 2000,
        'proposed_target_calories' => 1950,
        'proposed_protein_g' => 145.0,
        'proposed_carbs_g' => 195.0,
        'proposed_fat_g' => 65.0,
        'status' => 'pending',
    ]);

    $service = app(AdaptiveAdjustmentService::class);
    $service->rejectAdjustment($user, $adjustment);

    $activeTarget->refresh();
    $adjustment->refresh();

    expect($activeTarget->is_active)->toBeTrue()
        ->and($adjustment->status)->toBe('rejected')
        ->and($adjustment->user_decision_at)->not->toBeNull();
});
