<?php

use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\Profile;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    $this->target = TargetProfile::factory()->create([
        'user_id' => $this->user->id,
        'is_active' => true,
        'calories' => 2000,
        'protein_g' => 150.0,
        'carbs_g' => 200.0,
        'fat_g' => 65.0,
    ]);

    $this->food = Food::create([
        'name' => 'Chicken Breast',
        'serving_size' => 100.0,
        'serving_unit' => 'g',
        'calories' => 165.0,
        'protein' => 31.0,
        'carbs' => 0.0,
        'fat' => 3.6,
        'is_custom' => false,
    ]);

    $this->serving = FoodServing::create([
        'food_id' => $this->food->id,
        'serving_name' => '1 cooked fillet (150g)',
        'gram_equivalent' => 150.0,
        'is_default' => true,
    ]);
});

test('user can log a food portion to a meal slot in their diary', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/diary', [
            'food_id' => $this->food->id,
            'food_serving_id' => $this->serving->id,
            'date' => '2026-10-14',
            'meal_slot' => 'lunch',
            'quantity' => 1.5, // 1.5 fillets = 225g
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'meal_slot' => 'lunch',
                'quantity' => '1.50',
                'grams' => '225.00',
                'calories' => '371.25', // 165 * 2.25
                'protein' => '69.75',   // 31 * 2.25
            ],
        ]);

    $this->assertDatabaseHas('diary_entries', [
        'user_id' => $this->user->id,
        'food_id' => $this->food->id,
        'meal_slot' => 'lunch',
    ]);
});

test('user can retrieve daily diary with grouped slots and daily summaries', function () {
    // Add breakfast entry
    DiaryEntry::create([
        'user_id' => $this->user->id,
        'food_id' => $this->food->id,
        'date' => '2026-10-14',
        'meal_slot' => 'breakfast',
        'quantity' => 1.0,
        'unit' => 'g',
        'grams' => 100.0,
        'calories' => 165.0,
        'protein' => 31.0,
        'carbs' => 0.0,
        'fat' => 3.6,
    ]);

    // Add water log
    WaterLog::create([
        'user_id' => $this->user->id,
        'date' => '2026-10-14',
        'amount_ml' => 500,
    ]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/diary?date=2026-10-14');

    $response->assertOk()
        ->assertJson([
            'date' => '2026-10-14',
            'summary' => [
                'total_calories' => 165.0,
                'target_calories' => 2000.0,
                'remaining_calories' => 1835.0,
                'total_protein' => 31.0,
                'water_ml' => 500,
            ],
        ])
        ->assertJsonCount(1, 'slots.breakfast.entries');
});

test('user can update and delete a diary entry', function () {
    $entry = DiaryEntry::create([
        'user_id' => $this->user->id,
        'food_id' => $this->food->id,
        'date' => '2026-10-14',
        'meal_slot' => 'dinner',
        'quantity' => 1.0,
        'unit' => 'g',
        'grams' => 100.0,
        'calories' => 165.0,
        'protein' => 31.0,
        'carbs' => 0.0,
        'fat' => 3.6,
    ]);

    $updateResponse = $this->actingAs($this->user, 'sanctum')
        ->putJson("/api/v1/diary/{$entry->id}", [
            'quantity' => 2.0,
        ]);

    $updateResponse->assertOk()
        ->assertJson([
            'data' => [
                'quantity' => '2.00',
                'calories' => '330.00',
            ],
        ]);

    $deleteResponse = $this->actingAs($this->user, 'sanctum')
        ->deleteJson("/api/v1/diary/{$entry->id}");

    $deleteResponse->assertOk();

    $this->assertDatabaseMissing('diary_entries', ['id' => $entry->id]);
});

test('user can quick add calories to a meal slot', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/diary/quick-add', [
            'date' => '2026-10-14',
            'meal_slot' => 'snack',
            'calories' => 250.0,
            'description' => 'Late night snack',
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'meal_slot' => 'snack',
                'calories' => '250.00',
            ],
        ]);

    $this->assertDatabaseHas('diary_entries', [
        'user_id' => $this->user->id,
        'meal_slot' => 'snack',
        'calories' => 250.0,
    ]);
});

test('user can log water intake', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/diary/water', [
            'date' => '2026-10-14',
            'amount_ml' => 250,
        ]);

    $response->assertCreated()
        ->assertJson([
            'data' => [
                'amount_ml' => 250,
            ],
        ]);

    $this->assertDatabaseHas('water_logs', [
        'user_id' => $this->user->id,
        'amount_ml' => 250,
    ]);
});
