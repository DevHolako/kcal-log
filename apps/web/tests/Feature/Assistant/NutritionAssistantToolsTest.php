<?php

use App\Ai\Agents\NutritionAssistant;
use App\Ai\Tools\GetDailySummaryTool;
use App\Ai\Tools\GetDiaryEntriesTool;
use App\Ai\Tools\GetTargetProfileTool;
use App\Ai\Tools\GetWeightHistoryTool;
use App\Ai\Tools\SearchFoodDatabaseTool;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;
use App\Models\WeightLog;
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

test('search food database tool finds foods by query and respects custom food ownership', function () {
    $user1 = createToolTestUser();
    $user2 = createToolTestUser();

    Food::factory()->create([
        'name' => 'Organic Rolled Oats',
        'is_custom' => false,
        'calories' => 389,
    ]);

    Food::factory()->create([
        'user_id' => $user1->id,
        'name' => 'Homemade Protein Granola',
        'is_custom' => true,
        'calories' => 450,
    ]);

    Food::factory()->create([
        'user_id' => $user2->id,
        'name' => 'User2 Private Granola',
        'is_custom' => true,
        'calories' => 500,
    ]);

    $tool = new SearchFoodDatabaseTool($user1);
    $result = json_decode((string) $tool->handle(new ToolRequest(['query' => 'Granola'])), true);

    expect($result['count'])->toBe(1);
    expect($result['foods'][0]['name'])->toBe('Homemade Protein Granola');

    $oatsResult = json_decode((string) $tool->handle(new ToolRequest(['query' => 'Oats'])), true);
    expect($oatsResult['count'])->toBe(1);
    expect($oatsResult['foods'][0]['name'])->toBe('Organic Rolled Oats');
});

test('get weight history tool returns timestamped weights and trajectory', function () {
    $user = createToolTestUser();

    WeightLog::factory()->create([
        'user_id' => $user->id,
        'date' => '2026-10-01',
        'weight_kg' => 80.5,
    ]);

    WeightLog::factory()->create([
        'user_id' => $user->id,
        'date' => '2026-10-15',
        'weight_kg' => 79.2,
    ]);

    $tool = new GetWeightHistoryTool($user);
    $result = json_decode((string) $tool->handle(new ToolRequest(['days' => 30])), true);

    expect($result['total_logs'])->toBe(2);
    expect($result['start_weight_kg'])->toEqual(80.5);
    expect($result['latest_weight_kg'])->toEqual(79.2);
    expect($result['weight_change_kg'])->toEqual(-1.3);
});

test('get daily summary tool includes water logs and hydration progress', function () {
    $user = createToolTestUser();
    $user->activeTargetProfile->update(['water_ml' => 2500]);

    WaterLog::create([
        'user_id' => $user->id,
        'date' => '2026-10-16',
        'amount_ml' => 750,
    ]);

    WaterLog::create([
        'user_id' => $user->id,
        'date' => '2026-10-16',
        'amount_ml' => 500,
    ]);

    $tool = new GetDailySummaryTool($user);
    $result = json_decode((string) $tool->handle(new ToolRequest(['date' => '2026-10-16'])), true);

    expect($result['water']['consumed_ml'])->toBe(1250);
    expect($result['water']['target_ml'])->toBe(2500);
    expect($result['water']['remaining_ml'])->toBe(1250);
});

test('nutrition assistant and target profile tool prioritize active target profile over older inactive profiles', function () {
    $user = createToolTestUser();

    // Deactivate initial profile
    $user->activeTargetProfile->update(['is_active' => false]);

    // Create a new updated active profile
    $newTarget = TargetProfile::create([
        'user_id' => $user->id,
        'calories' => 1850,
        'protein_g' => 160,
        'carbs_g' => 180,
        'fat_g' => 55,
        'bmr' => 1700,
        'tdee' => 2300,
        'goal_type' => 'lose',
        'is_active' => true,
    ]);

    $tool = new GetTargetProfileTool($user->fresh());
    $result = json_decode((string) $tool->handle(new ToolRequest([])), true);

    expect($result['calorie_target'])->toEqual(1850);
    expect($result['protein_target'])->toEqual(160);

    $agent = new NutritionAssistant($user->fresh());
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('1850 kcal');
    expect($instructions)->toContain('Protein: 160.00g');
});
