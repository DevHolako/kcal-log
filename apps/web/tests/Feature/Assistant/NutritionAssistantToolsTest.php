<?php

use App\Ai\Tools\GetDailySummaryTool;
use App\Ai\Tools\GetDiaryEntriesTool;
use App\Ai\Tools\GetTargetProfileTool;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use Laravel\Ai\Tools\Request as ToolRequest;

function createToolTestUser(): User
{
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create([
        'user_id' => $user->id,
        'calories' => 2000,
        'protein_g' => 150,
        'carbs_g' => 200,
        'fat_g' => 65,
        'is_active' => true,
    ]);

    return $user;
}

test('get daily summary tool returns calculated totals and remaining budgets', function () {
    $user = createToolTestUser();

    $food = Food::factory()->create([
        'calories' => 500,
        'protein' => 40,
        'carbs' => 50,
        'fat' => 15,
        'is_custom' => false,
    ]);

    DiaryEntry::factory()->create([
        'user_id' => $user->id,
        'food_id' => $food->id,
        'date' => '2026-10-16',
        'meal_slot' => 'lunch',
        'quantity' => 1,
        'unit' => 'serving',
        'grams' => 100,
        'calories' => 500,
        'protein' => 40,
        'carbs' => 50,
        'fat' => 15,
    ]);

    $tool = new GetDailySummaryTool($user);
    $result = json_decode((string) $tool->handle(new ToolRequest(['date' => '2026-10-16'])), true);

    expect($result['date'])->toBe('2026-10-16');
    expect($result['entries_count'])->toBe(1);
    expect($result['consumed']['calories'])->toEqual(500);
    expect($result['consumed']['protein'])->toEqual(40);
    expect($result['target']['calories'])->toEqual(2000);
    expect($result['remaining']['calories'])->toEqual(1500);
});

test('get daily summary tool returns structured zero state for unlogged day', function () {
    $user = createToolTestUser();

    $tool = new GetDailySummaryTool($user);
    $result = json_decode((string) $tool->handle(new ToolRequest(['date' => '2026-10-10'])), true);

    expect($result['date'])->toBe('2026-10-10');
    expect($result['entries_count'])->toBe(0);
    expect($result['consumed']['calories'])->toEqual(0);
    expect($result['target']['calories'])->toEqual(2000);
    expect($result['remaining']['calories'])->toEqual(2000);
});

test('get diary entries tool returns logged foods and enforces 30 day limit', function () {
    $user = createToolTestUser();

    $food = Food::factory()->create(['name' => 'Protein Shake', 'is_custom' => false]);

    DiaryEntry::factory()->create([
        'user_id' => $user->id,
        'food_id' => $food->id,
        'date' => '2026-09-15',
        'meal_slot' => 'breakfast',
        'quantity' => 1,
        'unit' => 'scoop',
        'grams' => 30,
        'calories' => 250,
        'protein' => 30,
        'carbs' => 5,
        'fat' => 3,
    ]);

    $tool = new GetDiaryEntriesTool($user);
    // Request range spanning 60 days
    $result = json_decode((string) $tool->handle(new ToolRequest([
        'start_date' => '2026-09-01',
        'end_date' => '2026-11-01',
    ])), true);

    // Range must be clamped to 30 days
    expect($result['range_clamped'])->toBe(true);
    expect($result['total_entries'])->toBe(1);
    expect($result['entries'][0]['food_name'])->toBe('Protein Shake');
    expect($result['entries'][0]['meal_slot'])->toBe('breakfast');
});

test('tools strictly isolate data between users', function () {
    $user1 = createToolTestUser();
    $user2 = createToolTestUser();

    $food = Food::factory()->create(['name' => 'Secret User2 Meal']);

    DiaryEntry::factory()->create([
        'user_id' => $user2->id,
        'food_id' => $food->id,
        'date' => '2026-10-16',
        'meal_slot' => 'dinner',
        'quantity' => 1,
        'unit' => 'plate',
        'grams' => 300,
        'calories' => 800,
    ]);

    $tool = new GetDiaryEntriesTool($user1);
    $result = json_decode((string) $tool->handle(new ToolRequest(['start_date' => '2026-10-16'])), true);

    expect($result['total_entries'])->toBe(0);
});

test('get target profile tool returns active formula and macros', function () {
    $user = createToolTestUser();

    $tool = new GetTargetProfileTool($user);
    $result = json_decode((string) $tool->handle(new ToolRequest([])), true);

    expect($result['has_active_target'])->toBe(true);
    expect($result['calorie_target'])->toEqual(2000);
    expect($result['protein_target'])->toEqual(150);
    expect($result['carb_target'])->toEqual(200);
    expect($result['fat_target'])->toEqual(65);
});
