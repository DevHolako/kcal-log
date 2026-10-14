<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ConnectOffRequest;
use App\Models\User;
use App\Models\UserOffConnection;
use App\Services\OpenFoodFactsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OffConnectionController extends Controller
{
    public function __construct(
        protected OpenFoodFactsService $offService,
    ) {}

    /**
     * Check Open Food Facts connection status.
     */
    public function status(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var UserOffConnection|null $connection */
        $connection = UserOffConnection::where('user_id', $user->id)->first();

        $isConnected = $connection ? (bool) $connection->is_connected : false;

        return response()->json([
            'connected' => $isConnected,
            'username' => ($connection && $isConnected) ? $connection->username : null,
            'last_synced_at' => ($connection && $connection->last_synced_at) ? $connection->last_synced_at->toIso8601String() : null,
        ]);
    }

    /**
     * Connect personal Open Food Facts account.
     */
    public function connect(ConnectOffRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $username = (string) $request->input('username');
        $password = (string) $request->input('password');

        $isValid = $this->offService->verifyCredentials($username, $password);

        if (! $isValid) {
            throw ValidationException::withMessages([
                'username' => ['Invalid Open Food Facts credentials.'],
            ]);
        }

        /** @var UserOffConnection $connection */
        $connection = UserOffConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'username' => $username,
                'password' => $password,
                'is_connected' => true,
                'last_synced_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Successfully connected to Open Food Facts.',
            'connected' => true,
            'username' => $connection->username,
            'last_synced_at' => $connection->last_synced_at?->toIso8601String(),
        ]);
    }

    /**
     * Disconnect personal Open Food Facts account.
     */
    public function disconnect(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'Successfully disconnected from Open Food Facts.',
            'connected' => false,
            'username' => null,
            'last_synced_at' => null,
        ]);
    }
}
