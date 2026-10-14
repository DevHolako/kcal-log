<?php

use App\Models\AdaptiveAdjustment;
use App\Models\BodyMeasurement;
use App\Models\DiaryEntry;
use App\Models\ExerciseLog;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\MealRecipe;
use App\Models\Profile;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\UserOffConnection;
use App\Models\WaterLog;
use App\Models\WeightLog;
use Database\Seeders\DatabaseSeeder;

it('seeds the database with comprehensive French and English food data and demo user', function () {
    $this->seed(DatabaseSeeder::class);

    // 1. Verify Demo User exists
    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    // 2. Verify Profile and Target Profile
    expect(Profile::where('user_id', $user->id)->exists())->toBeTrue()
        ->and(TargetProfile::where('user_id', $user->id)->where('is_active', true)->exists())->toBeTrue();

    // 3. Verify OFF Connection
    $conn = UserOffConnection::where('user_id', $user->id)->first();
    expect($conn)->not->toBeNull()
        ->and($conn->is_connected)->toBeTrue()
        ->and($conn->password)->toBe('encrypted_off_secure_password_99');

    // 4. Verify French & English Foods exist with servings
    $frenchBaguette = Food::where('off_id', '3017620422003')->first();
    expect($frenchBaguette)->not->toBeNull()
        ->and($frenchBaguette->name)->toContain('Baguette')
        ->and($frenchBaguette->nutri_score)->toBe('a');

    expect(FoodServing::where('food_id', $frenchBaguette->id)->count())->toBeGreaterThanOrEqual(1);

    $englishOats = Food::where('off_id', '030000010204')->first();
    expect($englishOats)->not->toBeNull()
        ->and($englishOats->name)->toContain('Oats');

    // 5. Verify Custom Food
    $customFood = Food::where('user_id', $user->id)->where('is_custom', true)->first();
    expect($customFood)->not->toBeNull()
        ->and($customFood->name)->toContain('Quiche');

    // 6. Verify Recipe & Items
    $recipe = MealRecipe::where('user_id', $user->id)->first();
    expect($recipe)->not->toBeNull()
        ->and($recipe->items()->count())->toBeGreaterThanOrEqual(2);

    // 7. Verify Diary Entries across meal slots
    expect(DiaryEntry::where('user_id', $user->id)->count())->toBeGreaterThanOrEqual(4);

    // 8. Verify Tracking Logs
    expect(WaterLog::where('user_id', $user->id)->count())->toBeGreaterThanOrEqual(5)
        ->and(WeightLog::where('user_id', $user->id)->count())->toBe(14)
        ->and(BodyMeasurement::where('user_id', $user->id)->count())->toBe(2)
        ->and(ExerciseLog::where('user_id', $user->id)->count())->toBe(2);

    // 9. Verify Adaptive Adjustment & Report Export
    expect(AdaptiveAdjustment::where('user_id', $user->id)->count())->toBe(1)
        ->and(ReportExport::where('user_id', $user->id)->count())->toBe(1);
});
