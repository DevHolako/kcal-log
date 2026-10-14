<?php

use App\Models\AdaptiveAdjustment;
use App\Models\BodyMeasurement;
use App\Models\DiaryEntry;
use App\Models\ExerciseLog;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\MealRecipe;
use App\Models\Profile;
use App\Models\RecipeItem;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\UserOffConnection;
use App\Models\WaterLog;
use App\Models\WeightLog;
use Illuminate\Database\QueryException;

it('creates all models and asserts proper Eloquent relationships', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $profile = Profile::factory()->create(['user_id' => $user->id]);
    $targetProfile = TargetProfile::factory()->create(['user_id' => $user->id, 'is_active' => true]);
    $offConn = UserOffConnection::factory()->create(['user_id' => $user->id]);
    $customFood = Food::factory()->custom($user)->create();
    $serving = FoodServing::factory()->create(['food_id' => $customFood->id, 'is_default' => true]);
    $diaryEntry = DiaryEntry::factory()->create([
        'user_id' => $user->id,
        'food_id' => $customFood->id,
        'food_serving_id' => $serving->id,
    ]);
    $meal = MealRecipe::factory()->create(['user_id' => $user->id]);
    $recipeItem = RecipeItem::factory()->create([
        'meal_recipe_id' => $meal->id,
        'food_id' => $customFood->id,
    ]);
    $water = WaterLog::factory()->create(['user_id' => $user->id]);
    $weight = WeightLog::factory()->create(['user_id' => $user->id, 'date' => '2026-10-14']);
    $measurement = BodyMeasurement::factory()->create(['user_id' => $user->id, 'date' => '2026-10-14']);
    $exercise = ExerciseLog::factory()->create(['user_id' => $user->id]);
    $export = ReportExport::factory()->create(['user_id' => $user->id]);
    $adjustment = AdaptiveAdjustment::factory()->create(['user_id' => $user->id]);

    // Assert User relations
    expect($user->profile->id)->toBe($profile->id)
        ->and($user->targetProfiles)->toHaveCount(1)
        ->and($user->activeTargetProfile->id)->toBe($targetProfile->id)
        ->and($user->offConnection->id)->toBe($offConn->id)
        ->and($user->customFoods)->toHaveCount(1)
        ->and($user->diaryEntries)->toHaveCount(1)
        ->and($user->mealsRecipes)->toHaveCount(1)
        ->and($user->waterLogs)->toHaveCount(1)
        ->and($user->weightLogs)->toHaveCount(1)
        ->and($user->bodyMeasurements)->toHaveCount(1)
        ->and($user->exerciseLogs)->toHaveCount(1)
        ->and($user->reportExports)->toHaveCount(1)
        ->and($user->adaptiveAdjustments)->toHaveCount(1);

    // Assert inverse relations
    expect($diaryEntry->food->id)->toBe($customFood->id)
        ->and($diaryEntry->serving->id)->toBe($serving->id)
        ->and($recipeItem->mealRecipe->id)->toBe($meal->id)
        ->and($serving->food->id)->toBe($customFood->id);
});

it('enforces foreign key cascading when user is deleted', function () {
    /** @var User $user */
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);
    TargetProfile::factory()->create(['user_id' => $user->id]);
    UserOffConnection::factory()->create(['user_id' => $user->id]);
    DiaryEntry::factory()->create(['user_id' => $user->id]);
    WaterLog::factory()->create(['user_id' => $user->id]);
    WeightLog::factory()->create(['user_id' => $user->id, 'date' => '2026-10-14']);

    expect(Profile::where('user_id', $user->id)->count())->toBe(1);

    // Delete user
    $user->delete();

    // Cascaded deletions
    expect(Profile::where('user_id', $user->id)->count())->toBe(0)
        ->and(TargetProfile::where('user_id', $user->id)->count())->toBe(0)
        ->and(UserOffConnection::where('user_id', $user->id)->count())->toBe(0)
        ->and(DiaryEntry::where('user_id', $user->id)->count())->toBe(0)
        ->and(WaterLog::where('user_id', $user->id)->count())->toBe(0)
        ->and(WeightLog::where('user_id', $user->id)->count())->toBe(0);
});

it('enforces unique constraints on user profiles and daily weight logs', function () {
    /** @var User $user */
    $user = User::factory()->create();

    // Duplicate profile should fail
    Profile::factory()->create(['user_id' => $user->id]);
    expect(fn () => Profile::factory()->create(['user_id' => $user->id]))
        ->toThrow(QueryException::class);

    // Duplicate weight log for same date should fail
    WeightLog::factory()->create(['user_id' => $user->id, 'date' => '2026-10-14']);
    expect(fn () => WeightLog::factory()->create(['user_id' => $user->id, 'date' => '2026-10-14']))
        ->toThrow(QueryException::class);
});

it('encrypts OFF connection credentials and hides them from serialization', function () {
    /** @var User $user */
    $user = User::factory()->create();

    $offConn = UserOffConnection::create([
        'user_id' => $user->id,
        'username' => 'test_nutrition_user',
        'password' => 'super_secret_off_key_123',
        'auth_token' => 'bearer_token_abc_xyz',
        'is_connected' => true,
    ]);

    // Transparent decryption
    expect($offConn->password)->toBe('super_secret_off_key_123')
        ->and($offConn->auth_token)->toBe('bearer_token_abc_xyz');

    // Hidden from serialization
    $array = $offConn->toArray();
    expect($array)->not->toHaveKey('password')
        ->and($array)->not->toHaveKey('auth_token');

    $json = json_encode($offConn);
    expect($json)->not->toContain('super_secret_off_key_123')
        ->and($json)->not->toContain('bearer_token_abc_xyz');
});

it('preserves exact decimal precision for nutritional and anthropometric values', function () {
    $food = Food::factory()->create([
        'calories' => 245.75,
        'protein' => 28.35,
        'carbs' => 12.40,
        'fat' => 8.65,
        'fiber' => 3.25,
    ]);

    $reloaded = Food::find($food->id);
    expect((float) $reloaded->calories)->toBe(245.75)
        ->and((float) $reloaded->protein)->toBe(28.35)
        ->and((float) $reloaded->carbs)->toBe(12.40)
        ->and((float) $reloaded->fat)->toBe(8.65)
        ->and((float) $reloaded->fiber)->toBe(3.25);
});
