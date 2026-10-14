<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ConnectOffRequest;
use App\Models\User;
use App\Models\UserOffConnection;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OffSettingsController extends Controller
{
    public function __construct(
        protected OpenFoodFactsService $offService,
    ) {}

    /**
     * Show Open Food Facts settings page.
     */
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        /** @var UserOffConnection|null $connection */
        $connection = UserOffConnection::where('user_id', $user->id)->first();

        $isConnected = $connection ? (bool) $connection->is_connected : false;

        return Inertia::render('settings/open-food-facts', [
            'connection' => [
                'connected' => $isConnected,
                'username' => ($connection && $isConnected) ? $connection->username : null,
                'last_synced_at' => ($connection && $connection->last_synced_at) ? $connection->last_synced_at->toIso8601String() : null,
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Connect personal Open Food Facts account.
     */
    public function connect(ConnectOffRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $username = (string) $request->input('username');
        $password = (string) $request->input('password');

        $isValid = $this->offService->verifyCredentials($username, $password);

        if (! $isValid) {
            throw ValidationException::withMessages([
                'username' => ['Invalid Open Food Facts username or password.'],
            ]);
        }

        UserOffConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'username' => $username,
                'password' => $password,
                'is_connected' => true,
                'last_synced_at' => now(),
            ]
        );

        return back()->with('status', 'Open Food Facts account connected successfully.');
    }

    /**
     * Disconnect personal Open Food Facts account.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var UserOffConnection|null $connection */
        $connection = UserOffConnection::where('user_id', $user->id)->first();

        if ($connection) {
            $connection->update([
                'is_connected' => false,
                'password' => null,
                'auth_token' => null,
            ]);
        }

        return back()->with('status', 'Open Food Facts account disconnected.');
    }
}
