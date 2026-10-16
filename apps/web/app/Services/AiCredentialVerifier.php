<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class AiCredentialVerifier
{
    /**
     * Verify API key against the provider.
     */
    public function verify(string $provider, string $apiKey, ?string $model = null): bool
    {
        try {
            return match ($provider) {
                'openai' => $this->verifyOpenAi($apiKey),
                'anthropic' => $this->verifyAnthropic($apiKey),
                default => false,
            };
        } catch (Throwable) {
            return false;
        }
    }

    protected function verifyOpenAi(string $apiKey): bool
    {
        $response = Http::withToken($apiKey)
            ->timeout(6)
            ->get('https://api.openai.com/v1/models');

        return $response->successful();
    }

    protected function verifyAnthropic(string $apiKey): bool
    {
        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(6)
            ->get('https://api.anthropic.com/v1/models');

        return $response->successful();
    }
}
