<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OnboardingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes: kcal-log API v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Mobile Token Authentication (Rate limited to prevent brute force)
    Route::post('auth/tokens', [AuthController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('api.v1.auth.tokens.store');

    // Authenticated Mobile & Client Endpoints
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        // Token Management
        Route::get('auth/tokens', [AuthController::class, 'index'])->name('api.v1.auth.tokens.index');
        Route::delete('auth/tokens/{id}', [AuthController::class, 'destroy'])->name('api.v1.auth.tokens.destroy');
        Route::delete('auth/tokens', [AuthController::class, 'destroyAll'])->name('api.v1.auth.tokens.destroy-all');

        // Authenticated User & Profile
        Route::get('user', [AuthController::class, 'me'])->name('api.v1.user');

        // Onboarding Completion
        Route::post('onboarding', [OnboardingController::class, 'store'])->name('api.v1.onboarding.store');
    });
});
