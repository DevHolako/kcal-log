<?php

use App\Models\User;
use App\Models\UserAiConnection;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('ai settings page is displayed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('settings.ai.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/ai')
            ->has('connection')
            ->where('connection.connected', false)
            ->where('connection.provider', 'openai')
            ->where('connection.model', 'gpt-4o-mini')
        );
});

test('user can connect OpenAI credentials with valid API key', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://api.openai.com/v1/models' => Http::response(['data' => [['id' => 'gpt-4o-mini']]], 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.connect'), [
            'provider' => 'openai',
            'model' => 'gpt-4o-mini',
            'api_key' => 'sk-test-valid-openai-key',
        ]);

    $response->assertRedirect(route('settings.ai.edit'));

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'is_connected' => true,
    ]);

    $connection = UserAiConnection::where('user_id', $user->id)->first();
    expect($connection)->not->toBeNull();
    // Raw database value must be encrypted, not plain text
    expect($connection->getRawOriginal('api_key'))->not->toBe('sk-test-valid-openai-key');
    expect($connection->api_key)->toBe('sk-test-valid-openai-key');
});

test('connecting AI credentials fails if provider rejects the API key', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://api.openai.com/v1/models' => Http::response(['error' => ['message' => 'Incorrect API key']], 401),
    ]);

    $response = $this->actingAs($user)
        ->from(route('settings.ai.edit'))
        ->post(route('settings.ai.connect'), [
            'provider' => 'openai',
            'model' => 'gpt-4o-mini',
            'api_key' => 'sk-invalid-key',
        ]);

    $response->assertRedirect(route('settings.ai.edit'))
        ->assertSessionHasErrors(['api_key']);

    $this->assertDatabaseMissing('user_ai_connections', [
        'user_id' => $user->id,
        'is_connected' => true,
    ]);
});

test('user can connect Anthropic credentials with valid API key', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://api.anthropic.com/v1/models' => Http::response(['data' => [['id' => 'claude-3-5-haiku-20241022']]], 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.connect'), [
            'provider' => 'anthropic',
            'model' => 'claude-3-5-haiku-20241022',
            'api_key' => 'sk-ant-valid-key',
        ]);

    $response->assertRedirect(route('settings.ai.edit'));

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'provider' => 'anthropic',
        'model' => 'claude-3-5-haiku-20241022',
        'is_connected' => true,
    ]);
});

test('user can connect Gemini credentials with valid API key', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://generativelanguage.googleapis.com/v1beta/models*' => Http::response(['models' => [['name' => 'models/gemini-2.5-flash']]], 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.connect'), [
            'provider' => 'gemini',
            'model' => 'gemini-2.5-flash',
            'api_key' => 'AIzaSy-valid-gemini-key',
        ]);

    $response->assertRedirect(route('settings.ai.edit'));

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'provider' => 'gemini',
        'model' => 'gemini-2.5-flash',
        'is_connected' => true,
    ]);
});

test('user can connect DeepSeek credentials with valid API key', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://api.deepseek.com/models*' => Http::response(['data' => [['id' => 'deepseek-chat']]], 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.connect'), [
            'provider' => 'deepseek',
            'model' => 'deepseek-chat',
            'api_key' => 'sk-valid-deepseek-key',
        ]);

    $response->assertRedirect(route('settings.ai.edit'));

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'provider' => 'deepseek',
        'model' => 'deepseek-chat',
        'is_connected' => true,
    ]);
});

test('ai settings page never leaks API key in inertia props', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-super-secret-key-12345',
        'is_connected' => true,
        'last_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->get(route('settings.ai.edit'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/ai')
            ->where('connection.connected', true)
            ->where('connection.provider', 'openai')
            ->where('connection.model', 'gpt-4o-mini')
            ->missing('connection.api_key')
        );
});

test('user can disconnect their AI credentials', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-secret',
        'is_connected' => true,
        'last_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.disconnect'));

    $response->assertRedirect(route('settings.ai.edit'));

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'is_connected' => false,
    ]);
});

test('user can fetch models dynamically for their connected provider', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-test-key',
        'is_connected' => true,
        'last_verified_at' => now(),
    ]);

    Http::fake([
        'https://api.openai.com/v1/models' => Http::response([
            'data' => [
                ['id' => 'gpt-4o-mini'],
                ['id' => 'gpt-4o'],
                ['id' => 'text-embedding-3-small'],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user)
        ->get(route('settings.ai.models'));

    $response->assertOk()
        ->assertJson([
            'connected' => true,
            'provider' => 'openai',
            'active_model' => 'gpt-4o-mini',
        ])
        ->assertJsonFragment(['id' => 'gpt-4o-mini'])
        ->assertJsonFragment(['id' => 'gpt-4o'])
        ->assertJsonMissing(['id' => 'text-embedding-3-small']);
});

test('user can dynamically preview models with API key before connecting', function () {
    $user = User::factory()->create();

    Http::fake([
        'https://api.anthropic.com/v1/models' => Http::response([
            'data' => [
                ['id' => 'claude-3-5-sonnet-20241022', 'display_name' => 'Claude 3.5 Sonnet'],
                ['id' => 'claude-3-5-haiku-20241022', 'display_name' => 'Claude 3.5 Haiku'],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($user)
        ->post(route('settings.ai.fetch-models'), [
            'provider' => 'anthropic',
            'api_key' => 'sk-ant-test-key-1234',
        ]);

    $response->assertOk()
        ->assertJson([
            'provider' => 'anthropic',
        ])
        ->assertJsonFragment(['id' => 'claude-3-5-sonnet-20241022'])
        ->assertJsonFragment(['id' => 'claude-3-5-haiku-20241022']);
});

test('user can dynamically update their active model', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-test-key',
        'is_connected' => true,
        'last_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->patch(route('settings.ai.update-model'), [
            'model' => 'gpt-4o',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('user_ai_connections', [
        'user_id' => $user->id,
        'model' => 'gpt-4o',
        'is_connected' => true,
    ]);
});

