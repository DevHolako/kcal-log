<?php

use App\Models\Food;
use App\Models\MealRecipe;
use App\Models\Profile;
use App\Models\RecipeItem;
use App\Models\TargetProfile;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    Profile::factory()->create(['user_id' => $this->user->id]);
    TargetProfile::factory()->create([
        'user_id' => $this->user->id,
        'is_active' => true,
        'calories' => 2000,
        'protein_g' => 150.0,
        'carbs_g' => 200.0,
        'fat_g' => 65.0,
    ]);

    $this->food1 = Food::create([
        'name' => 'Oats',
        'serving_size' => 100.0,
        'serving_unit' => 'g',
        'calories' => 389.0,
        'protein' => 16.9,
        'carbs' => 66.3,
        'fat' => 6.9,
        'sugar' => 1.0,
        'saturated_fat' => 1.2,
        'sodium' => 0.0020,
        'is_custom' => false,
    ]);

    $this->food2 = Food::create([
        'name' => 'Whole Milk',
        'serving_size' => 100.0,
        'serving_unit' => 'ml',
        'calories' => 62.0,
        'protein' => 3.2,
        'carbs' => 4.8,
        'fat' => 3.3,
        'sugar' => 4.8,
        'saturated_fat' => 1.9,
        'sodium' => 0.0440,
        'is_custom' => false,
    ]);
});

test('guest cannot view recipes page', function () {
    $this->get('/recipes')->assertRedirect('/login');
});

test('user can view recipes page with list of their recipes', function () {
    $recipe = MealRecipe::create([
        'user_id' => $this->user->id,
        'name' => 'Morning Oatmeal',
        'description' => 'Nutritious breakfast bowl',
        'servings' => 1,
        'total_calories' => 451.0,
        'total_protein' => 20.1,
        'total_carbs' => 71.1,
        'total_fat' => 10.2,
    ]);

    $this->actingAs($this->user)
        ->get('/recipes')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('recipes/index')
            ->has('recipes', 1)
            ->where('recipes.0.name', 'Morning Oatmeal')
        );
});

test('user can create a new recipe with items and auto-calculated nutrition', function () {
    $response = $this->actingAs($this->user)
        ->post('/recipes', [
            'name' => 'Protein Porridge',
            'description' => 'Hearty oats with milk',
            'servings' => 2,
            'items' => [
                [
                    'food_id' => $this->food1->id,
                    'quantity' => 1.0,
                    'grams' => 100.0,
                ],
                [
                    'food_id' => $this->food2->id,
                    'quantity' => 2.0,
                    'grams' => 200.0,
                ],
            ],
        ]);

    $response->assertRedirect('/recipes');

    $this->assertDatabaseHas('meals_recipes', [
        'user_id' => $this->user->id,
        'name' => 'Protein Porridge',
        'servings' => 2,
    ]);

    $recipe = MealRecipe::where('name', 'Protein Porridge')->firstOrFail();
    expect($recipe->items)->toHaveCount(2);

    // 100g oats (389 kcal) + 200ml milk (124 kcal) = 513 kcal total, 256.5 per serving
    expect((float) $recipe->total_calories)->toEqualWithDelta(513.0, 0.5);
    expect($recipe->calories_per_serving)->toEqualWithDelta(256.5, 0.5);
    // Oats sugar (1.0) + milk sugar (2 * 4.8 = 9.6) = 10.6 total sugar
    expect((float) $recipe->total_sugar)->toEqualWithDelta(10.6, 0.5);
    expect($recipe->sugar_per_serving)->toEqualWithDelta(5.3, 0.5);
});

test('user can update their recipe', function () {
    $recipe = MealRecipe::create([
        'user_id' => $this->user->id,
        'name' => 'Old Recipe',
        'servings' => 1,
    ]);

    $response = $this->actingAs($this->user)
        ->put("/recipes/{$recipe->id}", [
            'name' => 'Updated Oatmeal',
            'description' => 'Updated description',
            'servings' => 1,
            'items' => [
                [
                    'food_id' => $this->food1->id,
                    'quantity' => 0.5,
                    'grams' => 50.0,
                ],
            ],
        ]);

    $response->assertRedirect('/recipes');
    $this->assertDatabaseHas('meals_recipes', [
        'id' => $recipe->id,
        'name' => 'Updated Oatmeal',
    ]);
});

test('user cannot update another user recipe', function () {
    $otherUser = User::factory()->create();
    $recipe = MealRecipe::create([
        'user_id' => $otherUser->id,
        'name' => 'Other User Recipe',
        'servings' => 1,
    ]);

    $this->actingAs($this->user)
        ->put("/recipes/{$recipe->id}", [
            'name' => 'Hacked Recipe',
            'servings' => 1,
            'items' => [],
        ])
        ->assertForbidden();
});

test('user can delete their recipe', function () {
    $recipe = MealRecipe::create([
        'user_id' => $this->user->id,
        'name' => 'To Be Deleted',
        'servings' => 1,
    ]);

    $this->actingAs($this->user)
        ->delete("/recipes/{$recipe->id}")
        ->assertRedirect('/recipes');

    $this->assertDatabaseMissing('meals_recipes', [
        'id' => $recipe->id,
    ]);
});

test('user can log recipe to diary as combined item', function () {
    $recipe = MealRecipe::create([
        'user_id' => $this->user->id,
        'name' => 'Power Breakfast',
        'servings' => 2,
        'total_calories' => 500.0,
        'total_protein' => 30.0,
        'total_carbs' => 60.0,
        'total_fat' => 10.0,
        'total_sugar' => 8.0,
        'total_saturated_fat' => 2.0,
        'total_sodium' => 0.0500,
    ]);

    $response = $this->actingAs($this->user)
        ->post("/recipes/{$recipe->id}/log", [
            'date' => '2026-10-14',
            'meal_slot' => 'breakfast',
            'servings' => 1.0,
            'log_as_individual' => false,
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('diary_entries', [
        'user_id' => $this->user->id,
        'meal_slot' => 'breakfast',
        'calories' => 250.0,
        'protein' => 15.0,
        'carbs' => 30.0,
        'fat' => 5.0,
        'sugar' => 4.0,
    ]);
});

test('user can log recipe to diary as individual items', function () {
    $recipe = MealRecipe::create([
        'user_id' => $this->user->id,
        'name' => 'Oat Bowl',
        'servings' => 1,
    ]);

    RecipeItem::create([
        'meal_recipe_id' => $recipe->id,
        'food_id' => $this->food1->id,
        'quantity' => 1.0,
        'grams' => 100.0,
        'calories' => 389.0,
        'protein' => 16.9,
        'carbs' => 66.3,
        'fat' => 6.9,
    ]);

    $response = $this->actingAs($this->user)
        ->post("/recipes/{$recipe->id}/log", [
            'date' => '2026-10-14',
            'meal_slot' => 'breakfast',
            'servings' => 1.0,
            'log_as_individual' => true,
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('diary_entries', [
        'user_id' => $this->user->id,
        'food_id' => $this->food1->id,
        'meal_slot' => 'breakfast',
        'grams' => 100.0,
    ]);
});

test('api endpoints can list, create and log recipes', function () {
    // List recipes
    $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/recipes')
        ->assertOk()
        ->assertJsonStructure(['data']);

    // Create recipe via API
    $createResponse = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/recipes', [
            'name' => 'API Smoothie',
            'servings' => 1,
            'items' => [
                [
                    'food_id' => $this->food2->id,
                    'quantity' => 2.5,
                    'grams' => 250.0,
                ],
            ],
        ]);

    $createResponse->assertCreated()
        ->assertJson([
            'data' => [
                'name' => 'API Smoothie',
                'servings' => 1,
            ],
        ]);

    $recipeId = $createResponse->json('data.id');

    // Show recipe via API
    $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/v1/recipes/{$recipeId}")
        ->assertOk()
        ->assertJson([
            'data' => [
                'id' => $recipeId,
                'name' => 'API Smoothie',
            ],
        ]);

    // Log recipe via API
    $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/recipes/{$recipeId}/log", [
            'date' => '2026-10-14',
            'meal_slot' => 'lunch',
            'servings' => 1,
            'log_as_individual' => false,
        ])
        ->assertCreated()
        ->assertJsonStructure(['data']);
});
