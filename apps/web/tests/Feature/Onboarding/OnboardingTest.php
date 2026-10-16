<?php

use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;

it('redirects an un-onboarded user accessing dashboard to onboarding', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('onboarding'));
});

it('allows an onboarded user to access dashboard directly', function () {
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create(['user_id' => $user->id, 'is_active' => true]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();
});

it('renders the onboarding view for authenticated users without profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('onboarding'));

    $response->assertOk();
});

it('completes onboarding and calculates Mifflin-St Jeor targets accurately', function () {
    $user = User::factory()->create();

    // 30yo male, 80kg, 180cm, moderately active (1.55), losing 0.5kg/week (-550 kcal)
    // BMR = (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
    // TDEE = 1780 * 1.55 = 2759
    // Target = 2759 - 550 = 2209 kcal
    $payload = [
        'date_of_birth' => '1996-10-14',
        'sex' => 'male',
        'height_cm' => 180.0,
        'current_weight_kg' => 80.0,
        'activity_level' => 'moderately_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'diet_type' => 'balanced',
        'timezone' => 'Europe/Paris',
        'locale' => 'fr',
        'unit_preference' => 'metric',
        'theme_preference' => 'dark',
    ];

    $response = $this->actingAs($user)->post(route('onboarding.store'), $payload);

    $response->assertRedirect(route('dashboard'));

    // 1. Verify Profile created
    $profile = Profile::where('user_id', $user->id)->first();
    expect($profile)->not->toBeNull()
        ->and($profile->sex)->toBe('male')
        ->and((float) $profile->height_cm)->toBe(180.0)
        ->and($profile->activity_level)->toBe('moderately_active')
        ->and($profile->timezone)->toBe('Europe/Paris')
        ->and($profile->locale)->toBe('fr');

    // 2. Verify Initial Weight Log recorded
    $weightLog = WeightLog::where('user_id', $user->id)->first();
    expect($weightLog)->not->toBeNull()
        ->and((float) $weightLog->weight_kg)->toBe(80.0)
        ->and($weightLog->source)->toBe('manual');

    // 3. Verify Target Profile calculated
    $target = TargetProfile::where('user_id', $user->id)->where('is_active', true)->first();
    expect($target)->not->toBeNull()
        ->and($target->calories)->toBe(2209)
        ->and((float) $target->bmr)->toBe(1780.0)
        ->and((float) $target->tdee)->toBe(2759.0)
        ->and($target->goal_type)->toBe('lose')
        ->and((float) $target->weekly_rate_kg)->toBe(-0.5)
        ->and($target->formula_inputs)->toBeArray()
        ->and($target->formula_inputs['formula'])->toBe('mifflin_st_jeor')
        ->and($target->formula_inputs['is_floor_applied'])->toBeFalse();
});

it('enforces safety floors when deficit is overly aggressive', function () {
    $user = User::factory()->create();

    // 25yo female, 48kg, 155cm, sedentary (1.2)
    // BMR = (10*48) + (6.25*155) - (5*25) - 161 = 480 + 968.75 - 125 - 161 = 1162.75 -> 1163
    // TDEE = 1163 * 1.2 = 1395
    // Loss of 0.5kg/week = -550 kcal -> 845 kcal, which is below the 1200 kcal female safety floor!
    $payload = [
        'date_of_birth' => '2001-01-01',
        'sex' => 'female',
        'height_cm' => 155.0,
        'current_weight_kg' => 48.0,
        'activity_level' => 'sedentary',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'diet_type' => 'balanced',
    ];

    $response = $this->actingAs($user)->post(route('onboarding.store'), $payload);

    $response->assertRedirect(route('dashboard'));

    $target = TargetProfile::where('user_id', $user->id)->where('is_active', true)->first();
    expect($target)->not->toBeNull()
        ->and($target->calories)->toBe(1200) // Clamped to 1200 kcal floor!
        ->and($target->formula_inputs['is_floor_applied'])->toBeTrue();
});

it('rejects invalid custom macro percentages that do not sum to 100%', function () {
    $user = User::factory()->create();

    $payload = [
        'date_of_birth' => '1995-05-15',
        'sex' => 'male',
        'height_cm' => 175.0,
        'current_weight_kg' => 75.0,
        'activity_level' => 'moderately_active',
        'goal_type' => 'maintain',
        'diet_type' => 'custom',
        'custom_percentages' => [
            'protein' => 0.50,
            'carbs' => 0.50,
            'fat' => 0.30, // Sum = 130%!
        ],
    ];

    $response = $this->actingAs($user)->post(route('onboarding.store'), $payload);

    $response->assertSessionHasErrors(['custom_percentages']);
});

it('redirects an onboarded user away from onboarding unless recalibrate flag is provided', function () {
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create(['user_id' => $user->id, 'is_active' => true]);

    $response = $this->actingAs($user)->get(route('onboarding'));

    $response->assertRedirect(route('dashboard'));
});

it('allows an onboarded user to access onboarding when recalibrate flag is present', function () {
    $user = User::factory()->create();
    $profile = Profile::factory()->create([
        'user_id' => $user->id,
        'sex' => 'female',
        'height_cm' => 168.0,
        'activity_level' => 'moderately_active',
    ]);
    TargetProfile::factory()->create([
        'user_id' => $user->id,
        'is_active' => true,
        'goal_type' => 'lose',
        'diet_type' => 'balanced',
    ]);
    WeightLog::factory()->create([
        'user_id' => $user->id,
        'weight_kg' => 64.5,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding', ['recalibrate' => 1]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('onboarding')
        ->where('isRecalibrating', true)
        ->where('initialData.sex', 'female')
        ->where('initialData.height_cm', 168)
        ->where('initialData.current_weight_kg', 64.5)
        ->where('initialData.activity_level', 'moderately_active')
    );
});
