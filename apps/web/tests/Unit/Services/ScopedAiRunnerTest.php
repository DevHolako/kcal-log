<?php

use App\Models\User;
use App\Models\UserAiConnection;
use App\Services\ScopedAiRunner;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('scoped ai runner temporarily sets provider api key and model during execution', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'openai',
        'model' => 'gpt-4o-mini',
        'api_key' => 'sk-user-specific-secret-key',
        'is_connected' => true,
    ]);

    // Initial config state
    config(['ai.providers.openai.key' => 'initial-default-key']);

    $runner = new ScopedAiRunner();

    $executedKey = null;

    $result = $runner->run($user, function () use (&$executedKey) {
        $executedKey = config('ai.providers.openai.key');

        return 'execution-result';
    });

    expect($result)->toBe('execution-result');
    expect($executedKey)->toBe('sk-user-specific-secret-key');

    // Confirms FrankenPHP worker memory is restored
    expect(config('ai.providers.openai.key'))->toBe('initial-default-key');
});

test('scoped ai runner restores configuration even when callback throws exception', function () {
    $user = User::factory()->create();

    UserAiConnection::create([
        'user_id' => $user->id,
        'provider' => 'anthropic',
        'model' => 'claude-3-5-haiku-20241022',
        'api_key' => 'sk-ant-user-key',
        'is_connected' => true,
    ]);

    config(['ai.providers.anthropic.key' => 'initial-anthropic-key']);

    $runner = new ScopedAiRunner();

    try {
        $runner->run($user, function () {
            throw new RuntimeException('Provider exploded');
        });
    } catch (RuntimeException $e) {
        expect($e->getMessage())->toBe('Provider exploded');
    }

    // Config must still be restored
    expect(config('ai.providers.anthropic.key'))->toBe('initial-anthropic-key');
});
