<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserAiConnection;
use RuntimeException;

class ScopedAiRunner
{
    /**
     * Run an AI operation safely scoped with the user's decrypted API key.
     * Restores configuration in a guaranteed finally block to prevent FrankenPHP worker bleed.
     *
     * @template T
     *
     * @param  callable(UserAiConnection): T  $callback
     * @return T
     */
    public function run(User $user, callable $callback): mixed
    {
        /** @var UserAiConnection|null $connection */
        $connection = UserAiConnection::where('user_id', $user->id)
            ->where('is_connected', true)
            ->first();

        if (! $connection || empty($connection->api_key)) {
            throw new RuntimeException('No active AI provider connection found for user.');
        }

        $provider = $connection->provider;
        $originalKey = config("ai.providers.{$provider}.key");
        $originalDefault = config('ai.default');

        try {
            config([
                "ai.providers.{$provider}.key" => $connection->api_key,
                'ai.default' => $provider,
            ]);

            return $callback($connection);
        } finally {
            config([
                "ai.providers.{$provider}.key" => $originalKey,
                'ai.default' => $originalDefault,
            ]);
        }
    }
}
