<?php

namespace App\Actions\Adaptive;

use App\Models\AdaptiveAdjustment;
use App\Models\TargetProfile;
use App\Models\User;
use App\Services\AdaptiveAdjustmentService;

class ApplyAdaptiveAdjustmentAction
{
    public function __construct(
        protected AdaptiveAdjustmentService $adaptiveService
    ) {}

    /**
     * Accept and apply a proposed adaptive adjustment.
     */
    public function execute(User $user, AdaptiveAdjustment $adjustment): TargetProfile
    {
        if ($adjustment->user_id !== $user->id) {
            abort(403, 'Unauthorized adjustment access.');
        }

        return $this->adaptiveService->acceptAdjustment($user, $adjustment);
    }
}
