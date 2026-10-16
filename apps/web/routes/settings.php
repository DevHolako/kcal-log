<?php

use App\Http\Controllers\Settings\AiSettingsController;
use App\Http\Controllers\Settings\OffSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('settings/profile/reset-data', [ProfileController::class, 'resetData'])->name('profile.reset-data');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    // Open Food Facts Integration Settings
    Route::get('settings/open-food-facts', [OffSettingsController::class, 'edit'])->name('settings.off.edit');
    Route::post('settings/open-food-facts/connect', [OffSettingsController::class, 'connect'])->name('settings.off.connect');
    Route::post('settings/open-food-facts/disconnect', [OffSettingsController::class, 'disconnect'])->name('settings.off.disconnect');

    // AI Assistant Integration Settings
    Route::get('settings/ai', [AiSettingsController::class, 'edit'])->name('settings.ai.edit');
    Route::post('settings/ai/connect', [AiSettingsController::class, 'connect'])->name('settings.ai.connect');
    Route::post('settings/ai/disconnect', [AiSettingsController::class, 'disconnect'])->name('settings.ai.disconnect');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
