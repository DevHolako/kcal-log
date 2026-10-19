<?php

namespace App\Services;

use App\Models\UserAiConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiModelService
{
    /**
     * Get available models for a given provider and API key.
     * Results are cached for 1 hour to optimize performance.
     *
     * @return array<int, array{id: string, label: string}>
     */
    public function getModels(string $provider, string $apiKey): array
    {
        $cacheKey = "ai_models_{$provider}_" . hash('sha256', $apiKey);

        return Cache::remember($cacheKey, 3600, function () use ($provider, $apiKey) {
            try {
                return match ($provider) {
                    'openai' => $this->fetchOpenAiModels($apiKey),
                    'anthropic' => $this->fetchAnthropicModels($apiKey),
                    'gemini' => $this->fetchGeminiModels($apiKey),
                    'deepseek' => $this->fetchDeepSeekModels($apiKey),
                    default => $this->getFallbackModels($provider),
                };
            } catch (Throwable) {
                return $this->getFallbackModels($provider);
            }
        });
    }

    /**
     * Get models for an established UserAiConnection.
     *
     * @return array<int, array{id: string, label: string}>
     */
    public function getModelsForConnection(UserAiConnection $connection): array
    {
        if (! $connection->is_connected || empty($connection->api_key)) {
            return [];
        }

        $models = $this->getModels($connection->provider, (string) $connection->api_key);

        if (empty($models)) {
            return $this->getFallbackModels($connection->provider);
        }

        return $models;
    }

    /**
     * Fetch models from OpenAI API.
     *
     * @return array<int, array{id: string, label: string}>
     */
    protected function fetchOpenAiModels(string $apiKey): array
    {
        $response = Http::withToken($apiKey)
            ->timeout(8)
            ->get('https://api.openai.com/v1/models');

        if (! $response->successful()) {
            return $this->getFallbackModels('openai');
        }

        $data = $response->json('data') ?? [];
        $models = [];

        foreach ($data as $item) {
            $id = (string) ($item['id'] ?? '');
            if ($this->isOpenAiChatModel($id)) {
                $models[] = [
                    'id' => $id,
                    'label' => $this->formatOpenAiLabel($id),
                ];
            }
        }

        usort($models, function ($a, $b) {
            $priority = [
                'gpt-4o-mini' => 1,
                'gpt-4o' => 2,
                'o3-mini' => 3,
                'o1-mini' => 4,
                'o1' => 5,
                'chatgpt-4o-latest' => 6,
                'gpt-4-turbo' => 7,
                'gpt-4' => 8,
                'gpt-3.5-turbo' => 9,
            ];

            $pa = $priority[$a['id']] ?? 99;
            $pb = $priority[$b['id']] ?? 99;

            if ($pa !== $pb) {
                return $pa <=> $pb;
            }

            return strcasecmp($a['id'], $b['id']);
        });

        return empty($models) ? $this->getFallbackModels('openai') : array_values($models);
    }

    protected function isOpenAiChatModel(string $id): bool
    {
        $lower = strtolower($id);

        foreach (['embedding', 'whisper', 'tts', 'audio', 'realtime', 'dall-e', 'moderation', 'babbage', 'davinci', 'instruct', 'search', 'similarity', 'edit'] as $excluded) {
            if (str_contains($lower, $excluded)) {
                return false;
            }
        }

        return str_starts_with($lower, 'gpt-')
            || str_starts_with($lower, 'o1')
            || str_starts_with($lower, 'o3')
            || str_starts_with($lower, 'chatgpt-');
    }

    protected function formatOpenAiLabel(string $id): string
    {
        return match ($id) {
            'gpt-4o-mini' => 'GPT-4o Mini (Fast & Economical - Recommended)',
            'gpt-4o' => 'GPT-4o (Flagship Multimodal)',
            'o3-mini' => 'o3-mini (High Reasoning)',
            'o1-mini' => 'o1-mini (Fast Reasoning)',
            'o1' => 'o1 (Deep Reasoning)',
            'chatgpt-4o-latest' => 'ChatGPT-4o Latest',
            default => $id,
        };
    }

    /**
     * Fetch models from Anthropic API.
     *
     * @return array<int, array{id: string, label: string}>
     */
    protected function fetchAnthropicModels(string $apiKey): array
    {
        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(8)
            ->get('https://api.anthropic.com/v1/models');

        if (! $response->successful()) {
            return $this->getFallbackModels('anthropic');
        }

        $data = $response->json('data') ?? [];
        $models = [];

        foreach ($data as $item) {
            $id = (string) ($item['id'] ?? '');
            if (str_starts_with($id, 'claude-')) {
                $displayName = $item['display_name'] ?? $id;
                $label = $displayName;
                if (str_contains($id, 'haiku')) {
                    $label .= ' (Fast & Economical - Recommended)';
                } elseif (str_contains($id, 'sonnet')) {
                    $label .= ' (High Reasoning)';
                } elseif (str_contains($id, 'opus')) {
                    $label .= ' (Deep Reasoning)';
                }

                $models[] = [
                    'id' => $id,
                    'label' => $label,
                ];
            }
        }

        return empty($models) ? $this->getFallbackModels('anthropic') : array_values($models);
    }

    /**
     * Fetch models from Google Gemini API.
     *
     * @return array<int, array{id: string, label: string}>
     */
    protected function fetchGeminiModels(string $apiKey): array
    {
        $response = Http::withHeaders([
            'x-goog-api-key' => $apiKey,
        ])
            ->timeout(8)
            ->get('https://generativelanguage.googleapis.com/v1beta/models');

        if (! $response->successful()) {
            return $this->getFallbackModels('gemini');
        }

        $data = $response->json('models') ?? [];
        $models = [];

        foreach ($data as $item) {
            $methods = $item['supportedGenerationMethods'] ?? null;
            if ($methods !== null && ! in_array('generateContent', $methods, true)) {
                continue;
            }

            $rawName = (string) ($item['name'] ?? '');
            $id = str_replace('models/', '', $rawName);
            $displayName = $item['displayName'] ?? $id;

            $label = $displayName;
            if (str_contains($id, '2.5-flash') || str_contains($id, '2.0-flash')) {
                $label .= ' (Fast & Economical - Recommended)';
            } elseif (str_contains($id, 'pro')) {
                $label .= ' (High Reasoning)';
            }

            $models[] = [
                'id' => $id,
                'label' => $label,
            ];
        }

        usort($models, function ($a, $b) {
            $isFlashA = str_contains($a['id'], 'flash');
            $isFlashB = str_contains($b['id'], 'flash');
            if ($isFlashA !== $isFlashB) {
                return $isFlashA ? -1 : 1;
            }

            return strcasecmp($b['id'], $a['id']);
        });

        return empty($models) ? $this->getFallbackModels('gemini') : array_values($models);
    }

    /**
     * Fetch models from DeepSeek API.
     *
     * @return array<int, array{id: string, label: string}>
     */
    protected function fetchDeepSeekModels(string $apiKey): array
    {
        $response = Http::withToken($apiKey)
            ->timeout(8)
            ->get('https://api.deepseek.com/models');

        if (! $response->successful()) {
            return $this->getFallbackModels('deepseek');
        }

        $data = $response->json('data') ?? [];
        $models = [];

        foreach ($data as $item) {
            $id = (string) ($item['id'] ?? '');
            $label = match ($id) {
                'deepseek-chat' => 'DeepSeek-V3 Chat (Fast & Economical - Recommended)',
                'deepseek-reasoner' => 'DeepSeek-R1 Reasoner (Deep Reasoning)',
                default => $id,
            };

            $models[] = [
                'id' => $id,
                'label' => $label,
            ];
        }

        return empty($models) ? $this->getFallbackModels('deepseek') : array_values($models);
    }

    /**
     * Fallback baseline models if the provider API is unreachable.
     *
     * @return array<int, array{id: string, label: string}>
     */
    public function getFallbackModels(string $provider): array
    {
        return match ($provider) {
            'openai' => [
                ['id' => 'gpt-4o-mini', 'label' => 'GPT-4o Mini (Fast & Economical - Recommended)'],
                ['id' => 'gpt-4o', 'label' => 'GPT-4o (Flagship Multimodal)'],
            ],
            'anthropic' => [
                ['id' => 'claude-3-5-haiku-20241022', 'label' => 'Claude 3.5 Haiku (Fast & Economical - Recommended)'],
                ['id' => 'claude-3-5-sonnet-20241022', 'label' => 'Claude 3.5 Sonnet (High Reasoning)'],
            ],
            'gemini' => [
                ['id' => 'gemini-2.5-flash', 'label' => 'Gemini 2.5 Flash (Fast & Economical - Recommended)'],
                ['id' => 'gemini-2.5-pro', 'label' => 'Gemini 2.5 Pro (High Reasoning)'],
                ['id' => 'gemini-1.5-flash', 'label' => 'Gemini 1.5 Flash (Economical)'],
            ],
            'deepseek' => [
                ['id' => 'deepseek-chat', 'label' => 'DeepSeek-V3 Chat (Fast & Economical - Recommended)'],
                ['id' => 'deepseek-reasoner', 'label' => 'DeepSeek-R1 Reasoner (Deep Reasoning)'],
            ],
            default => [],
        };
    }
}
