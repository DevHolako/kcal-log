<?php

use Illuminate\Support\Facades\Schema;

it('verifies all domain tables exist with proper columns', function () {
    $expectedTables = [
        'users',
        'profiles',
        'target_profiles',
        'user_off_connections',
        'foods',
        'food_servings',
        'diary_entries',
        'meals_recipes',
        'recipe_items',
        'water_logs',
        'weight_logs',
        'body_measurements',
        'exercise_logs',
        'reports_exports',
        'adaptive_adjustments',
    ];

    foreach ($expectedTables as $table) {
        expect(Schema::hasTable($table))->toBeTrue("Table {$table} should exist");
    }

    // Check critical columns on profiles
    expect(Schema::hasColumns('profiles', [
        'id', 'user_id', 'date_of_birth', 'sex', 'height_cm', 'activity_level', 'timezone', 'locale', 'unit_preference', 'theme_preference',
    ]))->toBeTrue();

    // Check critical columns on target_profiles
    expect(Schema::hasColumns('target_profiles', [
        'id', 'user_id', 'is_active', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'water_ml', 'bmr', 'tdee', 'goal_type', 'weekly_rate_kg', 'diet_type', 'formula_inputs', 'source',
    ]))->toBeTrue();

    // Check critical columns on user_off_connections
    expect(Schema::hasColumns('user_off_connections', [
        'id', 'user_id', 'username', 'password', 'auth_token', 'is_connected', 'last_synced_at',
    ]))->toBeTrue();

    // Check critical columns on foods
    expect(Schema::hasColumns('foods', [
        'id', 'off_id', 'user_id', 'is_custom', 'name', 'brand', 'barcode', 'serving_size', 'serving_unit', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'saturated_fat', 'sodium', 'nutri_score', 'nova_group', 'eco_score', 'raw_off_data', 'last_synced_at',
    ]))->toBeTrue();

    // Check critical columns on food_servings
    expect(Schema::hasColumns('food_servings', [
        'id', 'food_id', 'serving_name', 'gram_equivalent', 'is_default',
    ]))->toBeTrue();

    // Check critical columns on diary_entries
    expect(Schema::hasColumns('diary_entries', [
        'id', 'user_id', 'food_id', 'food_serving_id', 'date', 'meal_slot', 'quantity', 'unit', 'grams', 'calories', 'protein', 'carbs', 'fat', 'fiber',
    ]))->toBeTrue();

    // Check critical columns on meals_recipes and recipe_items
    expect(Schema::hasColumns('meals_recipes', [
        'id', 'user_id', 'name', 'description', 'servings', 'is_recipe', 'total_calories', 'total_protein', 'total_carbs', 'total_fat', 'total_fiber',
    ]))->toBeTrue();
    expect(Schema::hasColumns('recipe_items', [
        'id', 'meal_recipe_id', 'food_id', 'food_serving_id', 'quantity', 'grams', 'calories', 'protein', 'carbs', 'fat', 'fiber',
    ]))->toBeTrue();

    // Check critical columns on tracking logs
    expect(Schema::hasColumns('water_logs', ['id', 'user_id', 'date', 'amount_ml']))->toBeTrue();
    expect(Schema::hasColumns('weight_logs', ['id', 'user_id', 'date', 'weight_kg', 'body_fat_pct', 'photo_path', 'note', 'source']))->toBeTrue();
    expect(Schema::hasColumns('body_measurements', ['id', 'user_id', 'date', 'neck_cm', 'waist_cm', 'hips_cm', 'chest_cm', 'biceps_cm', 'thighs_cm', 'calves_cm', 'notes']))->toBeTrue();
    expect(Schema::hasColumns('exercise_logs', ['id', 'user_id', 'date', 'name', 'exercise_type', 'duration_minutes', 'calories_burned', 'notes']))->toBeTrue();

    // Check critical columns on reports_exports
    expect(Schema::hasColumns('reports_exports', ['id', 'user_id', 'type', 'date_from', 'date_to', 'status', 'file_path', 'expires_at', 'error_message']))->toBeTrue();

    // Check critical columns on adaptive_adjustments
    expect(Schema::hasColumns('adaptive_adjustments', [
        'id', 'user_id', 'review_date', 'period_start', 'period_end', 'starting_weight_kg', 'ending_weight_kg', 'ewma_weight_change_kg', 'average_daily_calories', 'calculated_tdee', 'current_target_calories', 'proposed_target_calories', 'proposed_protein_g', 'proposed_carbs_g', 'proposed_fat_g', 'status', 'user_decision_at', 'applied_target_profile_id',
    ]))->toBeTrue();
});
