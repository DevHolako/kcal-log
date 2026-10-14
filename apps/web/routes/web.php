<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Middleware\EnsureOnboardingIsComplete;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

use App\Http\Controllers\FoodController as WebFoodController;

Route::middleware(['auth', 'verified', EnsureOnboardingIsComplete::class])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('foods', [WebFoodController::class, 'index'])->name('foods.index');
    Route::post('foods/custom', [WebFoodController::class, 'storeCustom'])->name('foods.custom.store');
    Route::delete('foods/custom/{food}', [WebFoodController::class, 'destroyCustom'])->name('foods.custom.destroy');
});

require __DIR__.'/settings.php';
