<?php

namespace App\Actions\Adaptive;

use App\Models\AdaptiveAdjustment;
use App\Models\User;
use App\Services\AdaptiveAdjustmentService;

class RejectAdaptiveAdjustmentAction
{
    public function __construct(
        protected AdaptiveAdjustmentService $adaptiveService
    ) {}

    /**
     * Reject a proposed adaptive adjustment.
     */
    public function execute(User $user, AdaptiveAdjustment $adjustment): AdaptiveAdjustment
    {
        if ($adjustment->user_id !== $user->id) {
            abort(403, 'Unauthorized adjustment access.');
        }

        return $this->adaptiveService->rejectAdjustment($user, $adjustment);
    }
}
