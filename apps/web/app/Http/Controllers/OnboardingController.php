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

        // If user already has both a profile and an active target, redirect to dashboard
        if ($user->profile()->exists() && $user->targetProfiles()->where('is_active', true)->exists()) {
            return redirect()->route('dashboard');
        }

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
        ]);
    }

    /**
     * Handle the onboarding submission.
     */
    public function store(CompleteOnboardingRequest $request, CompleteOnboardingAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->toPayload());

        return redirect()->route('dashboard')->with('success', 'Welcome to kcal-log! Your personalized plan is ready.');
    }
}
