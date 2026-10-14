<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CustomFoodController;
use App\Http\Controllers\Api\V1\DiaryController;
use App\Http\Controllers\Api\V1\ExportController;
use App\Http\Controllers\Api\V1\FoodController;
use App\Http\Controllers\Api\V1\OffConnectionController;
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

        // Food Catalog & Resolution (Open Food Facts + Local Cache)
        Route::get('foods/search', [FoodController::class, 'search'])->name('api.v1.foods.search');
        Route::get('foods/barcode/{barcode}', [FoodController::class, 'barcode'])->name('api.v1.foods.barcode');

        // Custom Foods Management
        Route::get('foods/custom', [CustomFoodController::class, 'index'])->name('api.v1.foods.custom.index');
        Route::post('foods/custom', [CustomFoodController::class, 'store'])->name('api.v1.foods.custom.store');
        Route::get('foods/custom/{food}', [CustomFoodController::class, 'show'])->name('api.v1.foods.custom.show');
        Route::put('foods/custom/{food}', [CustomFoodController::class, 'update'])->name('api.v1.foods.custom.update');
        Route::delete('foods/custom/{food}', [CustomFoodController::class, 'destroy'])->name('api.v1.foods.custom.destroy');

        // Food Details & Portion Scaling
        Route::get('foods/{food}', [FoodController::class, 'show'])->name('api.v1.foods.show');
        Route::post('foods/{food}/calculate', [FoodController::class, 'calculate'])->name('api.v1.foods.calculate');

        // Open Food Facts Account Connection
        Route::get('settings/off/status', [OffConnectionController::class, 'status'])->name('api.v1.settings.off.status');
        Route::post('settings/off/connect', [OffConnectionController::class, 'connect'])->name('api.v1.settings.off.connect');
        Route::post('settings/off/disconnect', [OffConnectionController::class, 'disconnect'])->name('api.v1.settings.off.disconnect');

        // Daily Nutrition Diary & Meal Logging
        Route::get('diary', [DiaryController::class, 'index'])->name('api.v1.diary.index');
        Route::post('diary', [DiaryController::class, 'store'])->name('api.v1.diary.store');
        Route::put('diary/{entry}', [DiaryController::class, 'update'])->name('api.v1.diary.update');
        Route::delete('diary/{entry}', [DiaryController::class, 'destroy'])->name('api.v1.diary.destroy');
        Route::post('diary/quick-add', [DiaryController::class, 'quickAdd'])->name('api.v1.diary.quick-add');
        Route::post('diary/water', [DiaryController::class, 'storeWater'])->name('api.v1.diary.water.store');
        Route::delete('diary/water/{waterLog}', [DiaryController::class, 'destroyWater'])->name('api.v1.diary.water.destroy');

        // Reports & Data Exports
        Route::get('reports/exports', [ExportController::class, 'index'])->name('api.v1.reports.exports.index');
        Route::post('reports/exports', [ExportController::class, 'store'])->name('api.v1.reports.exports.store');
        Route::get('reports/exports/{export}', [ExportController::class, 'show'])->name('api.v1.reports.exports.show');
        Route::get('reports/exports/{export}/download', [ExportController::class, 'download'])->name('api.v1.reports.exports.download');
    });
});
