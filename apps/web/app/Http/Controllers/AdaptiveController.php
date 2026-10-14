<?php

namespace App\Http\Controllers;

use App\Models\AdaptiveAdjustment;
use App\Models\User;
use App\Models\WeightLog;
use App\Services\AdaptiveAdjustmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class AdaptiveController extends Controller
{
    public function __construct(
        protected AdaptiveAdjustmentService $adaptiveService
    ) {}

    /**
     * Display adaptive strategy and checkpoint page.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        /** @var AdaptiveAdjustment|null $pending */
        $pending = AdaptiveAdjustment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        /** @var AdaptiveAdjustment|null $latest */
        $latest = AdaptiveAdjustment::where('user_id', $user->id)
            ->latest('id')
            ->first();

        $history = AdaptiveAdjustment::where('user_id', $user->id)
            ->with('appliedTargetProfile')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        $weightLogs = WeightLog::where('user_id', $user->id)
            ->orderBy('date', 'asc')
            ->take(40)
            ->get();

        $ewmaSeries = $this->adaptiveService->calculateEwmaSeries($weightLogs);

        $weightTrends = $weightLogs->map(function ($log) use ($ewmaSeries) {
            $date = $log->date->format('Y-m-d');

            return [
                'date' => $date,
                'weight_kg' => (float) $log->weight_kg,
                'ewma_kg' => $ewmaSeries[$date] ?? (float) $log->weight_kg,
            ];
        })->values();

        return Inertia::render('strategy/index', [
            'pendingAdjustment' => $pending,
            'latestAdjustment' => $latest,
            'activeTarget' => $user->activeTargetProfile,
            'history' => $history,
            'weightTrends' => $weightTrends,
        ]);
    }

    /**
     * Accept proposed adaptive adjustment.
     */
    public function accept(Request $request, AdaptiveAdjustment $adjustment): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($adjustment->user_id !== $user->id) {
            abort(403, 'Unauthorized adjustment access.');
        }

        try {
            $this->adaptiveService->acceptAdjustment($user, $adjustment);

            return redirect()->back()->with('success', 'Adaptive target plan accepted and activated!');
        } catch (InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reject proposed adaptive adjustment.
     */
    public function reject(Request $request, AdaptiveAdjustment $adjustment): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($adjustment->user_id !== $user->id) {
            abort(403, 'Unauthorized adjustment access.');
        }

        try {
            $this->adaptiveService->rejectAdjustment($user, $adjustment);

            return redirect()->back()->with('info', 'Adjustment proposal rejected. Your current targets remain unchanged.');
        } catch (InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Manually trigger adjustment calculation.
     */
    public function trigger(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $adj = $this->adaptiveService->calculateWeeklyAdjustment($user);

        if (! $adj) {
            return redirect()->back()->with('error', 'Not enough weight data to calculate an adaptive trend. Please log your weight first.');
        }

        return redirect()->back()->with('success', 'New adaptive adjustment calculated!');
    }
}
