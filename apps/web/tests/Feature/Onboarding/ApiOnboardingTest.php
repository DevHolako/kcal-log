<?php

use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use Laravel\Sanctum\Sanctum;

it('completes onboarding via mobile api and returns structured response', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'date_of_birth' => '1992-03-20',
        'sex' => 'female',
        'height_cm' => 165.0,
        'current_weight_kg' => 62.0,
        'activity_level' => 'lightly_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.25,
        'diet_type' => 'high_protein',
        'unit_preference' => 'metric',
    ];

    $response = $this->postJson(route('api.v1.onboarding.store'), $payload);

    $response->assertOk()
        ->assertJsonStructure([
            'message',
            'profile' => ['id', 'user_id', 'sex', 'height_cm', 'activity_level'],
            'target_profile' => ['id', 'user_id', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
            'weight_log' => ['id', 'user_id', 'weight_kg'],
        ]);

    expect(Profile::where('user_id', $user->id)->count())->toBe(1)
        ->and(TargetProfile::where('user_id', $user->id)->count())->toBe(1)
        ->and(WeightLog::where('user_id', $user->id)->count())->toBe(1);
});
