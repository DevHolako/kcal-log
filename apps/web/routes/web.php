<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Middleware\EnsureOnboardingIsComplete;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

use App\Http\Controllers\AdaptiveController as WebAdaptiveController;
use App\Http\Controllers\DiaryController as WebDiaryController;
use App\Http\Controllers\ExportController as WebExportController;
use App\Http\Controllers\FoodController as WebFoodController;
use App\Http\Controllers\RecipeController as WebRecipeController;

Route::middleware(['auth', 'verified', EnsureOnboardingIsComplete::class])->group(function () {
    Route::get('dashboard', [WebDiaryController::class, 'index'])->name('dashboard');

    // Daily Nutrition Diary & Logging
    Route::get('diary', [WebDiaryController::class, 'index'])->name('diary.index');
    Route::post('diary', [WebDiaryController::class, 'store'])->name('diary.store');
    Route::post('diary/quick-add', [WebDiaryController::class, 'quickAdd'])->name('diary.quick-add');
    Route::post('diary/water', [WebDiaryController::class, 'storeWater'])->name('diary.water.store');
    Route::delete('diary/water/{waterLog}', [WebDiaryController::class, 'destroyWater'])->name('diary.water.destroy');
    Route::post('diary/weight', [WebDiaryController::class, 'storeWeight'])->name('diary.weight.store');
    Route::delete('diary/weight', [WebDiaryController::class, 'destroyWeight'])->name('diary.weight.destroy');
    Route::put('diary/{entry}', [WebDiaryController::class, 'update'])->name('diary.update');
    Route::delete('diary/{entry}', [WebDiaryController::class, 'destroy'])->name('diary.destroy');

    // Food Catalog & Management
    Route::get('foods/search', [WebFoodController::class, 'search'])->name('foods.search');
    Route::get('foods/barcode/{barcode}', [WebFoodController::class, 'barcode'])->name('foods.barcode');
    Route::get('foods', [WebFoodController::class, 'index'])->name('foods.index');
    Route::post('foods/custom', [WebFoodController::class, 'storeCustom'])->name('foods.custom.store');
    Route::delete('foods/custom/{food}', [WebFoodController::class, 'destroyCustom'])->name('foods.custom.destroy');

    // Recipes & Multi-Ingredient Meals
    Route::get('recipes', [WebRecipeController::class, 'index'])->name('recipes.index');
    Route::post('recipes', [WebRecipeController::class, 'store'])->name('recipes.store');
    Route::put('recipes/{recipe}', [WebRecipeController::class, 'update'])->name('recipes.update');
    Route::delete('recipes/{recipe}', [WebRecipeController::class, 'destroy'])->name('recipes.destroy');
    Route::post('recipes/{recipe}/log', [WebRecipeController::class, 'log'])->name('recipes.log');

    // Reports & Exports
    Route::get('reports', [WebExportController::class, 'index'])->name('reports.index');
    Route::post('reports/exports', [WebExportController::class, 'store'])->name('reports.store');
    Route::get('reports/exports/{export}/download', [WebExportController::class, 'download'])->name('reports.download');

    // Adaptive Strategy & Checkpoint
    Route::get('strategy', [WebAdaptiveController::class, 'index'])->name('strategy.index');
    Route::post('strategy/{adjustment}/accept', [WebAdaptiveController::class, 'accept'])->name('strategy.accept');
    Route::post('strategy/{adjustment}/reject', [WebAdaptiveController::class, 'reject'])->name('strategy.reject');
    Route::post('strategy/trigger', [WebAdaptiveController::class, 'trigger'])->name('strategy.trigger');
});

require __DIR__.'/settings.php';
