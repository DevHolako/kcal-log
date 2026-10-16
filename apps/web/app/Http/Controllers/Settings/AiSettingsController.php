<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ConnectAiRequest;
use App\Models\User;
use App\Models\UserAiConnection;
use App\Services\AiCredentialVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    public function __construct(
        protected AiCredentialVerifier $verifier,
    ) {}

    /**
     * Show AI Assistant settings page.
     */
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        /** @var UserAiConnection|null $connection */
        $connection = UserAiConnection::where('user_id', $user->id)->first();

        $isConnected = $connection ? (bool) $connection->is_connected : false;

        return Inertia::render('settings/ai', [
            'connection' => [
                'connected' => $isConnected,
                'provider' => $connection ? $connection->provider : 'openai',
                'model' => $connection ? $connection->model : 'gpt-4o-mini',
                'last_verified_at' => ($connection && $connection->last_verified_at)
                    ? $connection->last_verified_at->toIso8601String()
                    : null,
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Connect and verify personal AI provider credentials.
     */
    public function connect(ConnectAiRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $provider = (string) $request->input('provider');
        $model = (string) $request->input('model');
        $apiKey = (string) $request->input('api_key');

        $isValid = $this->verifier->verify($provider, $apiKey, $model);

        if (! $isValid) {
            throw ValidationException::withMessages([
                'api_key' => ["Unable to verify {$provider} API key. Please check that the key is valid and has active quota."],
            ]);
        }

        UserAiConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'provider' => $provider,
                'model' => $model,
                'api_key' => $apiKey,
                'is_connected' => true,
                'last_verified_at' => now(),
            ],
        );

        return redirect()->route('settings.ai.edit')
            ->with('status', 'AI credentials connected and verified successfully.');
    }

    /**
     * Disconnect AI credentials.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        UserAiConnection::where('user_id', $user->id)->update([
            'is_connected' => false,
        ]);

        return redirect()->route('settings.ai.edit')
            ->with('status', 'AI provider disconnected.');
    }
}
