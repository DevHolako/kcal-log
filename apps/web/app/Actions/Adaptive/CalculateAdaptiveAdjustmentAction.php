<?php

namespace App\Actions\Adaptive;

use App\Models\AdaptiveAdjustment;
use App\Models\User;
use App\Services\AdaptiveAdjustmentService;

class CalculateAdaptiveAdjustmentAction
{
    public function __construct(
        protected AdaptiveAdjustmentService $adaptiveService
    ) {}

    /**
     * Compute a weekly adaptive adjustment based on EWMA weight smoothing and caloric adherence.
     */
    public function execute(User $user): ?AdaptiveAdjustment
    {
        return $this->adaptiveService->calculateWeeklyAdjustment($user);
    }
}
