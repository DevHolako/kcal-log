<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Adaptive\ApplyAdaptiveAdjustmentAction;
use App\Actions\Adaptive\CalculateAdaptiveAdjustmentAction;
use App\Actions\Adaptive\RejectAdaptiveAdjustmentAction;
use App\Http\Controllers\Controller;
use App\Models\AdaptiveAdjustment;
use App\Models\User;
use App\Services\AdaptiveAdjustmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class AdaptiveController extends Controller
{
    public function __construct(
        protected AdaptiveAdjustmentService $adaptiveService,
        protected ApplyAdaptiveAdjustmentAction $applyAction,
        protected RejectAdaptiveAdjustmentAction $rejectAction,
        protected CalculateAdaptiveAdjustmentAction $calculateAction,
    ) {}

    /**
     * Get current pending adjustment or latest adjustment.
     */
    public function current(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var AdaptiveAdjustment|null $pending */
        $pending = AdaptiveAdjustment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        /** @var AdaptiveAdjustment|null $latest */
        $latest = $pending ?: AdaptiveAdjustment::where('user_id', $user->id)
            ->latest('id')
            ->first();

        return response()->json([
            'pending' => $pending,
            'latest' => $latest,
            'active_target' => $user->activeTargetProfile,
        ]);
    }

    /**
     * Get adaptive adjustment history.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $history = AdaptiveAdjustment::where('user_id', $user->id)
            ->with('appliedTargetProfile')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json($history);
    }

    /**
     * Accept proposed adaptive adjustment.
     */
    public function accept(Request $request, AdaptiveAdjustment $adjustment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $newTarget = $this->applyAction->execute($user, $adjustment);

            return response()->json([
                'message' => 'Adaptive adjustment accepted and activated.',
                'target_profile' => $newTarget,
                'adjustment' => $adjustment->fresh(),
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Reject proposed adaptive adjustment.
     */
    public function reject(Request $request, AdaptiveAdjustment $adjustment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $updated = $this->rejectAction->execute($user, $adjustment);

            return response()->json([
                'message' => 'Adaptive adjustment rejected.',
                'adjustment' => $updated,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Manually trigger adjustment calculation.
     */
    public function trigger(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $adjustment = $this->calculateAction->execute($user);

        if (! $adjustment) {
            return response()->json([
                'message' => 'Not enough weight or diary data to compute an adaptive adjustment. Log weights to seed your EWMA trend.',
                'adjustment' => null,
            ], 200);
        }

        return response()->json([
            'message' => 'Adaptive adjustment computed successfully.',
            'adjustment' => $adjustment,
        ], 201);
    }
}
