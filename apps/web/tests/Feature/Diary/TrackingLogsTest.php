<?php

use App\Events\DiaryUpdated;
use App\Models\BodyMeasurement;
use App\Models\ExerciseLog;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create(['user_id' => $this->user->id, 'is_active' => true]);
});

test('user can log and update body measurements via web route', function () {
    Event::fake([DiaryUpdated::class]);

    $response = $this->actingAs($this->user)
        ->post(route('diary.measurements.store'), [
            'date' => '2026-10-15',
            'waist_cm' => 82.5,
            'hips_cm' => 96.0,
            'chest_cm' => 102.0,
            'neck_cm' => 38.5,
            'biceps_cm' => 35.0,
            'thighs_cm' => 58.0,
            'calves_cm' => 37.5,
            'notes' => 'Measured in morning fasted state',
        ]);

    $response->assertRedirect();

    $measurement = BodyMeasurement::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($measurement)->not->toBeNull()
        ->and((float) $measurement->waist_cm)->toBe(82.5)
        ->and((float) $measurement->hips_cm)->toBe(96.0)
        ->and((float) $measurement->chest_cm)->toBe(102.0)
        ->and((float) $measurement->neck_cm)->toBe(38.5)
        ->and((float) $measurement->biceps_cm)->toBe(35.0)
        ->and((float) $measurement->thighs_cm)->toBe(58.0)
        ->and((float) $measurement->calves_cm)->toBe(37.5)
        ->and($measurement->notes)->toBe('Measured in morning fasted state');

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'measurements_updated'
            && (float) $event->payload['waist_cm'] === 82.5;
    });

    // Update measurements for the same day
    $updateResponse = $this->actingAs($this->user)
        ->post(route('diary.measurements.store'), [
            'date' => '2026-10-15',
            'waist_cm' => 81.8,
        ]);
    $updateResponse->assertSessionHasNoErrors();

    expect(BodyMeasurement::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->count())->toBe(1);
    $updated = BodyMeasurement::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($updated)->not->toBeNull()
        ->and((float) $updated->waist_cm)->toBe(81.8);
});

test('user can delete body measurements via web route', function () {
    Event::fake([DiaryUpdated::class]);

    BodyMeasurement::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-15',
        'waist_cm' => 82.5,
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('diary.measurements.destroy'), [
            'date' => '2026-10-15',
        ]);

    $response->assertRedirect();
    expect(BodyMeasurement::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->count())->toBe(0);

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'measurements_deleted';
    });
});

test('user can log and delete exercise via web route', function () {
    Event::fake([DiaryUpdated::class]);

    $response = $this->actingAs($this->user)
        ->post(route('diary.exercises.store'), [
            'date' => '2026-10-15',
            'name' => 'Morning Run',
            'exercise_type' => 'cardio',
            'duration_minutes' => 35,
            'calories_burned' => 320,
            'notes' => 'Outdoor trail run',
        ]);

    $response->assertRedirect();

    $exercise = ExerciseLog::where('user_id', $this->user->id)->whereDate('date', '2026-10-15')->first();
    expect($exercise)->not->toBeNull()
        ->and($exercise->name)->toBe('Morning Run')
        ->and($exercise->exercise_type)->toBe('cardio')
        ->and($exercise->duration_minutes)->toBe(35)
        ->and((float) $exercise->calories_burned)->toBe(320.0)
        ->and($exercise->notes)->toBe('Outdoor trail run');

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'exercise_logged'
            && (float) $event->payload['calories_burned'] === 320.0;
    });

    // Delete exercise
    $deleteResponse = $this->actingAs($this->user)
        ->delete(route('diary.exercises.destroy', $exercise));

    $deleteResponse->assertRedirect();
    expect(ExerciseLog::where('id', $exercise->id)->exists())->toBeFalse();

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $event) {
        return $event->userId === $this->user->id
            && $event->action === 'exercise_deleted';
    });
});

test('user cannot delete another user exercise log', function () {
    $otherUser = User::factory()->create();
    $exercise = ExerciseLog::create([
        'user_id' => $otherUser->id,
        'date' => '2026-10-15',
        'name' => 'Other User Cycling',
        'exercise_type' => 'cardio',
        'duration_minutes' => 45,
        'calories_burned' => 400,
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('diary.exercises.destroy', $exercise));

    $response->assertForbidden();
    expect(ExerciseLog::where('id', $exercise->id)->exists())->toBeTrue();
});

test('user can log and delete measurements and exercise via API v1', function () {
    $token = $this->user->createToken('test-token')->plainTextToken;

    // Store measurements via API
    $measurementResp = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/diary/measurements', [
            'date' => '2026-10-15',
            'waist_cm' => 84.0,
            'hips_cm' => 98.0,
        ]);

    $measurementResp->assertStatus(201)
        ->assertJsonPath('data.waist_cm', '84.00');

    // Store exercise via API
    $exerciseResp = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/diary/exercises', [
            'date' => '2026-10-15',
            'name' => 'HIIT Session',
            'exercise_type' => 'cardio',
            'duration_minutes' => 25,
            'calories_burned' => 250,
        ]);

    $exerciseResp->assertStatus(201)
        ->assertJsonPath('data.name', 'HIIT Session');

    $exerciseId = $exerciseResp->json('data.id');

    // Check day summary via API
    $dayResp = $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/diary?date=2026-10-15');

    $dayResp->assertOk()
        ->assertJsonPath('summary.exercise_calories_burned', 250)
        ->assertJsonPath('summary.exercise_duration_minutes', 25)
        ->assertJsonPath('summary.body_measurement.waist_cm', '84.00');

    // Delete exercise via API
    $deleteExResp = $this->withHeader('Authorization', 'Bearer '.$token)
        ->deleteJson("/api/v1/diary/exercises/{$exerciseId}");
    $deleteExResp->assertOk();

    // Delete measurement via API
    $deleteMeasResp = $this->withHeader('Authorization', 'Bearer '.$token)
        ->deleteJson('/api/v1/diary/measurements', [
            'date' => '2026-10-15',
        ]);
    $deleteMeasResp->assertOk();
});
