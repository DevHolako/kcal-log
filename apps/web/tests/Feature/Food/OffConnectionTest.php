<?php

use App\Models\User;
use App\Models\UserOffConnection;
use Illuminate\Support\Facades\Http;

test('user can connect their Open Food Facts account', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/cgi/session.pl' => Http::response('Welcome user123', 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/settings/off/connect', [
            'username' => 'user123',
            'password' => 'supersecret',
        ]);

    $response->assertOk()
        ->assertJson([
            'connected' => true,
            'username' => 'user123',
        ]);

    $this->assertDatabaseHas('user_off_connections', [
        'user_id' => $user->id,
        'username' => 'user123',
        'is_connected' => true,
    ]);

    // Password must be encrypted and never stored in plain text
    $connection = UserOffConnection::where('user_id', $user->id)->first();
    expect($connection->getRawOriginal('password'))->not->toBe('supersecret');
});

test('connecting OFF account fails if OFF credentials are invalid', function () {
    $user = User::factory()->create();

    Http::fake([
        '*/cgi/session.pl' => Http::response('Incorrect user name or password', 200),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/settings/off/connect', [
            'username' => 'wronguser',
            'password' => 'wrongpass',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['username']);
});

test('user can check OFF connection status and sensitive credentials are never leaked', function () {
    $user = User::factory()->create();

    UserOffConnection::create([
        'user_id' => $user->id,
        'username' => 'connecteduser',
        'password' => 'mysecretpassword',
        'is_connected' => true,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/settings/off/status');

    $response->assertOk()
        ->assertJson([
            'connected' => true,
            'username' => 'connecteduser',
        ])
        ->assertJsonMissing(['password'])
        ->assertJsonMissing(['auth_token']);
});

test('user can disconnect their OFF account', function () {
    $user = User::factory()->create();

    UserOffConnection::create([
        'user_id' => $user->id,
        'username' => 'connecteduser',
        'password' => 'mysecretpassword',
        'is_connected' => true,
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/settings/off/disconnect');

    $response->assertOk()
        ->assertJson([
            'connected' => false,
            'username' => null,
        ]);

    $this->assertDatabaseHas('user_off_connections', [
        'user_id' => $user->id,
        'is_connected' => false,
    ]);
});
