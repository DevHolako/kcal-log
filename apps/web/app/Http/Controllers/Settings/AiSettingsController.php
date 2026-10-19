<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ConnectAiRequest;
use App\Models\User;
use App\Models\UserAiConnection;
use App\Services\AiCredentialVerifier;
use App\Services\AiModelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    public function __construct(
        protected AiCredentialVerifier $verifier,
        protected AiModelService $modelService,
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

        $availableModels = [];
        if ($connection && $isConnected) {
            $availableModels = $this->modelService->getModelsForConnection($connection);
        }

        return Inertia::render('settings/ai', [
            'connection' => [
                'connected' => $isConnected,
                'provider' => $connection ? $connection->provider : 'openai',
                'model' => $connection ? $connection->model : 'gpt-4o-mini',
                'last_verified_at' => ($connection && $connection->last_verified_at)
                    ? $connection->last_verified_at->toIso8601String()
                    : null,
            ],
            'availableModels' => $availableModels,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Get dynamic models for the currently connected user provider.
     */
    public function models(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var UserAiConnection|null $connection */
        $connection = UserAiConnection::where('user_id', $user->id)
            ->where('is_connected', true)
            ->first();

        if (! $connection) {
            return response()->json([
                'connected' => false,
                'provider' => null,
                'models' => [],
                'active_model' => null,
            ]);
        }

        $models = $this->modelService->getModelsForConnection($connection);

        return response()->json([
            'connected' => true,
            'provider' => $connection->provider,
            'models' => $models,
            'active_model' => $connection->model,
        ]);
    }

    /**
     * Dynamically fetch models from provider before connecting.
     */
    public function fetchModels(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', 'in:openai,anthropic,gemini,deepseek'],
            'api_key' => ['required', 'string', 'min:8', 'max:500'],
        ]);

        $models = $this->modelService->getModels($validated['provider'], $validated['api_key']);

        return response()->json([
            'provider' => $validated['provider'],
            'models' => $models,
        ]);
    }

    /**
     * Update active AI model for connected user.
     */
    public function updateModel(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'model' => ['required', 'string', 'max:100'],
        ]);

        $connection = UserAiConnection::where('user_id', $user->id)
            ->where('is_connected', true)
            ->first();

        if (! $connection) {
            return back()->withErrors(['model' => 'No active AI connection found.']);
        }

        $connection->update([
            'model' => $validated['model'],
        ]);

        return back()->with('status', "Active model updated to {$validated['model']}.");
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

        // If no model specified or model is empty, auto-discover first dynamic model from provider
        if (empty($model)) {
            $models = $this->modelService->getModels($provider, $apiKey);
            $model = ! empty($models) ? $models[0]['id'] : 'gpt-4o-mini';
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

        $redirectTo = (string) $request->input('redirect_to', route('settings.ai.edit'));

        return redirect()->to($redirectTo)
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
