<?php

use App\Events\AdaptiveAdjustmentProposed;
use App\Events\DiaryUpdated;
use App\Events\ExportReady;
use App\Models\Food;
use App\Models\User;
use App\Services\DiaryService;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('DiaryUpdated broadcasts on user private channel with correct structure', function () {
    $event = new DiaryUpdated(42, '2026-10-14', 'added', ['entry_id' => 99]);

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1)
        ->and($channels[0])->toBeInstanceOf(PrivateChannel::class)
        ->and($channels[0]->name)->toBe('private-user.42');

    expect($event->broadcastAs())->toBe('DiaryUpdated');

    $payload = $event->broadcastWith();
    expect($payload['user_id'])->toBe(42)
        ->and($payload['date'])->toBe('2026-10-14')
        ->and($payload['action'])->toBe('added')
        ->and($payload['payload']['entry_id'])->toBe(99);
});

test('ExportReady broadcasts on user private channel with download url and status', function () {
    $event = new ExportReady(
        userId: 10,
        exportId: 5,
        type: 'pdf',
        status: 'completed',
        downloadUrl: 'http://localhost/reports/5/download',
        fileSizeBytes: 2048
    );

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1)
        ->and($channels[0]->name)->toBe('private-user.10');

    expect($event->broadcastAs())->toBe('ExportReady');

    $payload = $event->broadcastWith();
    expect($payload['export_id'])->toBe(5)
        ->and($payload['status'])->toBe('completed')
        ->and($payload['download_url'])->toBe('http://localhost/reports/5/download')
        ->and($payload['file_size_bytes'])->toBe(2048);
});

test('AdaptiveAdjustmentProposed broadcasts on user private channel', function () {
    $event = new AdaptiveAdjustmentProposed(7, 12, [
        'proposed_target_calories' => 1950,
        'calculated_tdee' => 2450,
    ]);

    $channels = $event->broadcastOn();
    expect($channels)->toHaveCount(1)
        ->and($channels[0]->name)->toBe('private-user.7');

    expect($event->broadcastAs())->toBe('AdaptiveAdjustmentProposed');

    $payload = $event->broadcastWith();
    expect($payload['user_id'])->toBe(7)
        ->and($payload['adjustment_id'])->toBe(12)
        ->and($payload['details']['proposed_target_calories'])->toBe(1950);
});

test('DiaryService mutations dispatch DiaryUpdated event', function () {
    Event::fake([DiaryUpdated::class]);

    $user = User::factory()->create();
    $food = Food::factory()->create(['calories' => 250, 'serving_size' => 100]);
    $service = app(DiaryService::class);

    $entry = $service->addEntry($user, [
        'food_id' => $food->id,
        'date' => '2026-10-14',
        'meal_slot' => 'breakfast',
        'quantity' => 1,
    ]);

    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $e) use ($user) {
        return $e->userId === $user->id && $e->action === 'added' && $e->date === '2026-10-14';
    });

    $service->updateEntry($user, $entry, ['quantity' => 2]);
    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $e) use ($user) {
        return $e->userId === $user->id && $e->action === 'updated';
    });

    $water = $service->logWater($user, '2026-10-14', 350);
    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $e) use ($user) {
        return $e->userId === $user->id && $e->action === 'water_logged';
    });

    $service->deleteWaterLog($user, $water);
    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $e) use ($user) {
        return $e->userId === $user->id && $e->action === 'water_deleted';
    });

    $service->deleteEntry($user, $entry);
    Event::assertDispatched(DiaryUpdated::class, function (DiaryUpdated $e) use ($user) {
        return $e->userId === $user->id && $e->action === 'deleted';
    });
});
