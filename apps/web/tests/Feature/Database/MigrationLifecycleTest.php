<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

it('runs migrations, rolls back, and re-runs cleanly', function () {
    // 1. Rollback all Phase 2 migrations
    $rollbackExit = Artisan::call('migrate:rollback', ['--step' => 10]);
    expect($rollbackExit)->toBe(0);

    // Verify Phase 2 tables were dropped
    expect(Schema::hasTable('profiles'))->toBeFalse()
        ->and(Schema::hasTable('target_profiles'))->toBeFalse()
        ->and(Schema::hasTable('foods'))->toBeFalse()
        ->and(Schema::hasTable('diary_entries'))->toBeFalse()
        ->and(Schema::hasTable('adaptive_adjustments'))->toBeFalse();

    // 2. Re-run migrations
    $migrateExit = Artisan::call('migrate');
    expect($migrateExit)->toBe(0);

    // Verify Phase 2 tables are recreated
    expect(Schema::hasTable('profiles'))->toBeTrue()
        ->and(Schema::hasTable('target_profiles'))->toBeTrue()
        ->and(Schema::hasTable('foods'))->toBeTrue()
        ->and(Schema::hasTable('diary_entries'))->toBeTrue()
        ->and(Schema::hasTable('adaptive_adjustments'))->toBeTrue();
});
