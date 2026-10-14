<?php

use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users with completed onboarding can visit the dashboard', function () {
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create(['user_id' => $user->id, 'is_active' => true]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
