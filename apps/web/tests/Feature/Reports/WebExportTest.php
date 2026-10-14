<?php

use App\Models\Profile;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');

    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);
});

test('user can visit reports and exports page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('reports.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('exports')
        );
});

test('user can request export generation via web route and download it', function () {
    $postResponse = $this->actingAs($this->user)
        ->post(route('reports.store'), [
            'type' => 'pdf',
            'date_from' => '2026-10-01',
            'date_to' => '2026-10-14',
        ]);

    $postResponse->assertRedirect();

    $export = ReportExport::where('user_id', $this->user->id)->first();
    expect($export)->not->toBeNull()
        ->and($export->status)->toBe('completed');

    $downloadResponse = $this->actingAs($this->user)
        ->get(route('reports.download', $export));

    $downloadResponse->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
