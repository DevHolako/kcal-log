<?php

use App\Models\AdaptiveAdjustment;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected from strategy page', function () {
    $this->get('/strategy')->assertRedirect('/login');
});

test('authenticated user can view strategy page with active targets and trends', function () {
    $user = User::factory()->create();
    Profile::create([
        'user_id' => $user->id,
        'date_of_birth' => '1990-01-01',
        'sex' => 'male',
        'height_cm' => 180,
        'timezone' => 'UTC',
    ]);

    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2200,
        'protein_g' => 165,
        'carbs_g' => 220,
        'fat_g' => 73,
        'is_active' => true,
        'activity_level' => 'moderately_active',
        'goal_type' => 'maintain',
        'weekly_rate_kg' => 0.0,
        'formula_inputs' => [],
    ]);

    WeightLog::create(['user_id' => $user->id, 'date' => '2026-10-10', 'weight_kg' => 82.5]);

    $this->actingAs($user)
        ->get('/strategy')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('strategy/index')
            ->has('activeTarget')
            ->has('weightTrends', 1)
            ->where('activeTarget.calories', 2200)
        );
});

test('user can accept pending adaptive adjustment on web', function () {
    $user = User::factory()->create();
    Profile::create([
        'user_id' => $user->id,
        'date_of_birth' => '1990-01-01',
        'sex' => 'male',
        'height_cm' => 180,
        'timezone' => 'UTC',
    ]);

    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2200,
        'protein_g' => 165,
        'carbs_g' => 220,
        'fat_g' => 73,
        'is_active' => true,
        'activity_level' => 'moderately_active',
        'goal_type' => 'maintain',
        'weekly_rate_kg' => 0.0,
        'formula_inputs' => [],
    ]);

    $adj = AdaptiveAdjustment::create([
        'user_id' => $user->id,
        'review_date' => '2026-10-14',
        'period_start' => '2026-10-07',
        'period_end' => '2026-10-13',
        'starting_weight_kg' => 82.5,
        'ending_weight_kg' => 82.5,
        'ewma_weight_change_kg' => 0.0,
        'average_daily_calories' => 2200.0,
        'calculated_tdee' => 2200.0,
        'current_target_calories' => 2200,
        'proposed_target_calories' => 2100,
        'proposed_protein_g' => 160.0,
        'proposed_carbs_g' => 210.0,
        'proposed_fat_g' => 70.0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post("/strategy/{$adj->id}/accept")
        ->assertRedirect()
        ->assertSessionHas('success');

    $adj->refresh();
    expect($adj->status)->toBe('accepted');

    $active = $user->activeTargetProfile;
    expect((int) $active->calories)->toBe(2100);
});

test('user cannot accept foreign adjustment', function () {
    $user1 = User::factory()->create();
    Profile::create([
        'user_id' => $user1->id,
        'date_of_birth' => '1990-01-01',
        'sex' => 'male',
        'height_cm' => 180,
        'timezone' => 'UTC',
    ]);
    TargetProfile::create([
        'user_id' => $user1->id,
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

    $user2 = User::factory()->create();

    $adj = AdaptiveAdjustment::create([
        'user_id' => $user2->id,
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

    $this->actingAs($user1)
        ->post("/strategy/{$adj->id}/accept")
        ->assertForbidden();
});
