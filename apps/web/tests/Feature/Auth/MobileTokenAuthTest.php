<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

it('issues a personal access token for valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'mobile@example.com',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson(route('api.v1.auth.tokens.store'), [
        'email' => 'mobile@example.com',
        'password' => 'secret123',
        'device_name' => 'Pixel 9 Pro (Android 15)',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'token',
            'token_type',
            'user' => ['id', 'name', 'email'],
        ]);

    expect($user->tokens()->count())->toBe(1)
        ->and($user->tokens()->first()->name)->toBe('Pixel 9 Pro (Android 15)');
});

it('rejects invalid mobile login credentials', function () {
    User::factory()->create([
        'email' => 'valid@example.com',
        'password' => Hash::make('correct-password'),
    ]);

    $response = $this->postJson(route('api.v1.auth.tokens.store'), [
        'email' => 'valid@example.com',
        'password' => 'wrong-password',
        'device_name' => 'Pixel 9 Pro',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('lists all active tokens for the authenticated user', function () {
    $user = User::factory()->create();
    $user->createToken('Device A');
    $user->createToken('Device B');

    Sanctum::actingAs($user);

    $response = $this->getJson(route('api.v1.auth.tokens.index'));

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'created_at'],
            ],
        ]);
});

it('revokes a specific personal access token', function () {
    $user = User::factory()->create();
    $token1 = $user->createToken('Tablet');
    $token2 = $user->createToken('Phone');

    Sanctum::actingAs($user);

    $response = $this->deleteJson(route('api.v1.auth.tokens.destroy', ['id' => $token1->accessToken->id]));

    $response->assertOk()
        ->assertJson(['message' => 'Token revoked successfully.']);

    expect($user->tokens()->count())->toBe(1)
        ->and($user->tokens()->first()->name)->toBe('Phone');
});

it('revokes all personal access tokens for the user', function () {
    $user = User::factory()->create();
    $user->createToken('Device 1');
    $user->createToken('Device 2');
    $user->createToken('Device 3');

    Sanctum::actingAs($user);

    $response = $this->deleteJson(route('api.v1.auth.tokens.destroy-all'));

    $response->assertOk()
        ->assertJson(['message' => 'All tokens revoked successfully.']);

    expect($user->tokens()->count())->toBe(0);
});

it('returns authenticated user details via api', function () {
    $user = User::factory()->create(['name' => 'Athlete John']);
    Sanctum::actingAs($user);

    $response = $this->getJson(route('api.v1.user'));

    $response->assertOk()
        ->assertJson([
            'user' => [
                'id' => $user->id,
                'name' => 'Athlete John',
                'email' => $user->email,
            ],
        ]);
});
