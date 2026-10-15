<?php

use App\Events\DiaryUpdated;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);
});

test('user can log daily weight via web route', function () {
    Event::fake([DiaryUpdated::class]);

    $response = $this->actingAs($this->user)
        ->post(route('diary.weight.store'), [
            'date' => '2026-10-15',
            'weight_kg' => 78.4,
            'note' => 'Morning weigh-in after workout',
        ]);

    $response->assertRedirect();

    $log = WeightLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($log)->not->toBeNull()
        ->and((float) $log->weight_kg)->toBe(78.4)
        ->and($log->note)->toBe('Morning weigh-in after workout')
        ->and($log->source)->toBe('manual');

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'weight_logged'
            && $event->payload['weight_kg'] === 78.4;
    });
});

test('logging weight updates existing record for the same date', function () {
    WeightLog::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-15',
        'weight_kg' => 79.0,
        'source' => 'manual',
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('diary.weight.store'), [
            'date' => '2026-10-15',
            'weight_kg' => 78.2,
        ]);

    $response->assertRedirect();

    expect(WeightLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->count())->toBe(1);

    $updated = WeightLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($updated)->not->toBeNull()
        ->and((float) $updated->weight_kg)->toBe(78.2);
});

test('user can delete daily weight log via web route', function () {
    Event::fake([DiaryUpdated::class]);

    WeightLog::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-15',
        'weight_kg' => 78.2,
        'source' => 'manual',
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('diary.weight.destroy'), [
            'date' => '2026-10-15',
        ]);

    $response->assertRedirect();

    expect(WeightLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->count())->toBe(0);

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'weight_deleted';
    });
});

test('weight logging validates bounds correctly', function () {
    $response = $this->actingAs($this->user)
        ->post(route('diary.weight.store'), [
            'date' => '2026-10-15',
            'weight_kg' => 10.0, // below 20kg
        ]);

    $response->assertSessionHasErrors(['weight_kg']);

    $responseOver = $this->actingAs($this->user)
        ->post(route('diary.weight.store'), [
            'date' => '2026-10-15',
            'weight_kg' => 450.0, // over 400kg
        ]);

    $responseOver->assertSessionHasErrors(['weight_kg']);
});

test('user can log daily weight via API route', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson(route('api.v1.diary.weight.store'), [
            'date' => '2026-10-15',
            'weight_kg' => 77.9,
            'note' => 'API log',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.weight_kg', '77.90');

    $apiLog = WeightLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($apiLog)->not->toBeNull()
        ->and((float) $apiLog->weight_kg)->toBe(77.9);
});
