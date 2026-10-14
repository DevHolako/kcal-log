<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CompleteOnboardingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CompleteOnboardingRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OnboardingController extends Controller
{
    /**
     * Complete onboarding for the mobile API client.
     */
    public function store(CompleteOnboardingRequest $request, CompleteOnboardingAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $result = $action->execute($user, $request->toPayload());

        return response()->json([
            'message' => 'Onboarding completed successfully.',
            'profile' => $result['profile'],
            'target_profile' => $result['target_profile'],
            'weight_log' => $result['weight_log'],
        ], 200);
    }
}
