<?php

namespace App\Http\Controllers;

use App\Actions\CompleteOnboardingAction;
use App\Http\Requests\CompleteOnboardingRequest;
use App\Models\User;
use App\Services\NutritionCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Render the onboarding wizard view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $isRecalibrating = $request->boolean('recalibrate') || $request->has('recalibrate');

        // If user already has both a profile and an active target, redirect to dashboard unless recalibrating
        if (! $isRecalibrating && $user->profile()->exists() && $user->targetProfiles()->where('is_active', true)->exists()) {
            return redirect()->route('dashboard');
        }

        $profile = $user->profile;
        /** @var \App\Models\TargetProfile|null $activeTarget */
        $activeTarget = $user->activeTargetProfile;
        $latestWeight = $user->weightLogs()->latest('date')->first();

        return Inertia::render('onboarding', [
            'activityLevels' => [
                ['id' => 'sedentary', 'label' => 'Sedentary', 'multiplier' => 1.2, 'description' => 'Little or no exercise, desk job'],
                ['id' => 'lightly_active', 'label' => 'Lightly Active', 'multiplier' => 1.375, 'description' => 'Light exercise or sports 1-3 days/week'],
                ['id' => 'moderately_active', 'label' => 'Moderately Active', 'multiplier' => 1.55, 'description' => 'Moderate exercise or sports 3-5 days/week'],
                ['id' => 'very_active', 'label' => 'Very Active', 'multiplier' => 1.725, 'description' => 'Hard exercise or sports 6-7 days/week'],
                ['id' => 'extremely_active', 'label' => 'Extremely Active', 'multiplier' => 1.9, 'description' => 'Very hard exercise, physical job or 2x training'],
            ],
            'dietPresets' => NutritionCalculator::DIET_PRESETS,
            'calorieFloors' => NutritionCalculator::CALORIE_FLOORS,
            'initialData' => $profile ? [
                'date_of_birth' => $profile->date_of_birth->format('Y-m-d'),
                'sex' => (string) $profile->sex,
                'height_cm' => (float) $profile->height_cm,
                'current_weight_kg' => (float) ($latestWeight->weight_kg ?? 75),
                'activity_level' => (string) $profile->activity_level,
                'goal_type' => (string) ($activeTarget->goal_type ?? 'lose'),
                'weekly_rate_kg' => (float) ($activeTarget->weekly_rate_kg ?? -0.5),
                'diet_type' => (string) ($activeTarget->diet_type ?? 'balanced'),
                'custom_percentages' => is_array($activeTarget?->formula_inputs) && isset($activeTarget->formula_inputs['macro_percentages'])
                    ? $activeTarget->formula_inputs['macro_percentages']
                    : [
                        'protein' => 0.3,
                        'carbs' => 0.4,
                        'fat' => 0.3,
                    ],
                'unit_preference' => (string) ($profile->unit_preference ?? 'metric'),
            ] : null,
            'isRecalibrating' => $isRecalibrating,
        ]);
    }

    /**
     * Handle the onboarding submission.
     */
    public function store(CompleteOnboardingRequest $request, CompleteOnboardingAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = \App\DTOs\Onboarding\OnboardingDTO::fromRequest($request);
        $action->execute($user, $dto);

        return redirect()->route('dashboard')->with('success', 'Your personalized nutrition targets have been calibrated and applied to your diary!');
    }
}
