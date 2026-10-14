<?php

use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\Profile;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;
use App\Models\WeightLog;
use App\Services\ExportService;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');

    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create([
        'user_id' => $this->user->id,
        'is_active' => true,
    ]);

    $food = Food::create([
        'name' => 'Oatmeal',
        'serving_size' => 100,
        'serving_unit' => 'g',
        'calories' => 389,
        'protein' => 16.9,
        'carbs' => 66.3,
        'fat' => 6.9,
        'is_custom' => false,
    ]);

    DiaryEntry::create([
        'user_id' => $this->user->id,
        'food_id' => $food->id,
        'date' => '2026-10-14',
        'meal_slot' => 'breakfast',
        'quantity' => 1.0,
        'unit' => 'g',
        'grams' => 100,
        'calories' => 389,
        'protein' => 16.9,
        'carbs' => 66.3,
        'fat' => 6.9,
    ]);

    WaterLog::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-14',
        'amount_ml' => 1500,
    ]);

    WeightLog::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-14',
        'weight_kg' => 75.5,
    ]);
});

test('user can request a PDF report and file is generated', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/reports/exports', [
            'type' => 'pdf',
            'date_from' => '2026-10-01',
            'date_to' => '2026-10-14',
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'type' => 'pdf',
                'status' => 'completed',
            ],
        ]);

    $exportId = $response->json('data.id');
    $export = ReportExport::find($exportId);
    expect($export)->not->toBeNull()
        ->and($export->status)->toBe('completed')
        ->and($export->file_path)->not->toBeNull();

    Storage::disk('local')->assertExists($export->file_path);
});

test('user can request a CSV export archive and file is generated', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/reports/exports', [
            'type' => 'csv',
            'date_from' => '2026-10-01',
            'date_to' => '2026-10-14',
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'type' => 'csv',
                'status' => 'completed',
            ],
        ]);

    $export = ReportExport::find($response->json('data.id'));
    Storage::disk('local')->assertExists($export->file_path);
    $content = Storage::disk('local')->get($export->file_path);
    expect($content)->toContain('Oatmeal')
        ->and($content)->toContain('389');
});

test('user can request a JSON export containing portable nutrition history', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/reports/exports', [
            'type' => 'json',
            'date_from' => '2026-10-01',
            'date_to' => '2026-10-14',
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'type' => 'json',
                'status' => 'completed',
            ],
        ]);

    $export = ReportExport::find($response->json('data.id'));
    Storage::disk('local')->assertExists($export->file_path);
    $json = json_decode((string) Storage::disk('local')->get($export->file_path), true);
    expect($json)->toHaveKey('user')
        ->and($json)->toHaveKey('diary_entries')
        ->and($json)->toHaveKey('water_logs')
        ->and($json)->toHaveKey('weight_logs')
        ->and($json['user'])->not->toHaveKey('password')
        ->and($json['user'])->not->toHaveKey('remember_token');
});

test('user can download their completed export file', function () {
    $exportService = app(ExportService::class);
    $export = $exportService->requestExport($this->user, 'csv', '2026-10-01', '2026-10-14');

    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/v1/reports/exports/{$export->id}/download");

    $response->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('user cannot download another users export file', function () {
    $otherUser = User::factory()->create();
    $exportService = app(ExportService::class);
    $export = $exportService->requestExport($otherUser, 'csv', '2026-10-01', '2026-10-14');

    $response = $this->actingAs($this->user, 'sanctum')
        ->get("/api/v1/reports/exports/{$export->id}/download");

    $response->assertForbidden();
});
