<?php

use App\Models\AdaptiveAdjustment;
use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('unauthenticated API requests to adaptive endpoints return 401', function () {
    $this->getJson('/api/v1/adaptive/current')->assertUnauthorized();
    $this->getJson('/api/v1/adaptive/history')->assertUnauthorized();
    $this->postJson('/api/v1/adaptive/1/accept')->assertUnauthorized();
});

test('authenticated user can query current adaptive state and history', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $target = TargetProfile::create([
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

    $adj = AdaptiveAdjustment::create([
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

    $response = $this->getJson('/api/v1/adaptive/current');
    $response->assertOk()
        ->assertJsonPath('pending.id', $adj->id)
        ->assertJsonPath('active_target.calories', 2000);

    $historyResponse = $this->getJson('/api/v1/adaptive/history');
    $historyResponse->assertOk()
        ->assertJsonCount(1, 'data');
});

test('user can accept adjustment via API', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $target = TargetProfile::create([
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

    $adj = AdaptiveAdjustment::create([
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

    $response = $this->postJson("/api/v1/adaptive/{$adj->id}/accept");
    $response->assertOk()
        ->assertJsonPath('target_profile.calories', 1950)
        ->assertJsonPath('adjustment.status', 'accepted');

    $adj->refresh();
    expect($adj->status)->toBe('accepted');
});

test('user can reject adjustment via API', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $adj = AdaptiveAdjustment::create([
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

    $response = $this->postJson("/api/v1/adaptive/{$adj->id}/reject");
    $response->assertOk()
        ->assertJsonPath('adjustment.status', 'rejected');

    $adj->refresh();
    expect($adj->status)->toBe('rejected');
});
