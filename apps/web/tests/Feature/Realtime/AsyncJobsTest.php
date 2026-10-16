<?php

use App\Events\ExportReady;
use App\Jobs\CalculateAdaptiveAdjustmentsJob;
use App\Jobs\ProcessReportExportJob;
use App\Models\AdaptiveAdjustment;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use App\Services\AdaptiveAdjustmentService;
use App\Services\ExportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('ProcessReportExportJob generates export and dispatches ExportReady', function () {
    Event::fake([ExportReady::class]);
    Storage::fake('local');

    $user = User::factory()->create();
    $export = ReportExport::create([
        'user_id' => $user->id,
        'type' => 'csv',
        'date_from' => '2026-10-01',
        'date_to' => '2026-10-07',
        'status' => 'pending',
    ]);

    $job = new ProcessReportExportJob($export);
    expect($job->queue)->toBe('reports');

    $job->handle(app(ExportService::class));

    $export->refresh();
    expect($export->status)->toBe('completed')
        ->and($export->file_path)->not->toBeNull();

    Event::assertDispatched(ExportReady::class, function (ExportReady $e) use ($user, $export) {
        return $e->userId === $user->id && $e->exportId === $export->id && $e->status === 'completed';
    });
});

test('ExportService dispatches ProcessReportExportJob when async is requested', function () {
    Queue::fake();

    config(['queue.default' => 'redis']);

    $user = User::factory()->create();
    $service = app(ExportService::class);

    $export = $service->requestExport($user, 'json', '2026-10-01', '2026-10-07', async: true);

    Queue::assertPushed(ProcessReportExportJob::class, function (ProcessReportExportJob $job) use ($export) {
        return $job->export->id === $export->id;
    });
});

test('CalculateAdaptiveAdjustmentsJob executes calculation for target users', function () {
    $user = User::factory()->create();
    TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 2000,
        'protein_g' => 150,
        'carbs_g' => 200,
        'fat_g' => 65,
        'fiber_g' => 30,
        'water_ml' => 2500,
        'activity_level' => 'moderately_active',
        'goal_type' => 'lose',
        'weekly_rate_kg' => -0.5,
        'is_active' => true,
        'formula_inputs' => [],
    ]);

    WeightLog::create(['user_id' => $user->id, 'date' => now()->subDays(10)->format('Y-m-d'), 'weight_kg' => 80.0]);
    WeightLog::create(['user_id' => $user->id, 'date' => now()->subDays(1)->format('Y-m-d'), 'weight_kg' => 79.5]);

    $job = new CalculateAdaptiveAdjustmentsJob($user->id);
    $job->handle(app(AdaptiveAdjustmentService::class));

    $adjustment = AdaptiveAdjustment::where('user_id', $user->id)->first();
    expect($adjustment)->not->toBeNull()
        ->and($adjustment->status)->toBe('pending');
});
