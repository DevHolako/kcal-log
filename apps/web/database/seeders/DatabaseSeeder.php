<?php

namespace Database\Seeders;

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
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Global Open Food Facts products (French & English)
        $this->call(FoodSeeder::class);

        // 2. Create primary demo user
        /** @var User $user */
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Demo Athlete',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 3. User Profile
        Profile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'date_of_birth' => '1995-06-15',
                'sex' => 'male',
                'height_cm' => 180.00,
                'activity_level' => 'moderately_active',
                'timezone' => 'Europe/Paris',
                'locale' => 'fr',
                'unit_preference' => 'metric',
                'theme_preference' => 'dark',
            ]
        );

        // 4. Target Profile (Goal: fat loss, 2100 kcal)
        TargetProfile::updateOrCreate(
            ['user_id' => $user->id, 'is_active' => true],
            [
                'calories' => 2100,
                'protein_g' => 160.00,
                'carbs_g' => 210.00,
                'fat_g' => 70.00,
                'fiber_g' => 30.00,
                'water_ml' => 2500,
                'bmr' => 1780.00,
                'tdee' => 2550.00,
                'goal_type' => 'lose',
                'weekly_rate_kg' => -0.50,
                'diet_type' => 'balanced',
                'formula_inputs' => [
                    'formula' => 'mifflin_st_jeor',
                    'age' => 31,
                    'sex' => 'male',
                    'weight_kg' => 80.5,
                    'height_cm' => 180.0,
                    'activity_multiplier' => 1.55,
                ],
                'source' => 'onboarding',
            ]
        );

        // 5. Encrypted OFF Connection
        UserOffConnection::updateOrCreate(
            ['user_id' => $user->id],
            [
                'username' => 'demo_nutritionist_fr',
                'password' => 'encrypted_off_secure_password_99',
                'auth_token' => 'off_session_token_'.md5('test-token'),
                'is_connected' => true,
                'last_synced_at' => now(),
            ]
        );

        // 6. User Custom Food
        /** @var Food $customFood */
        $customFood = Food::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Quiche Lorraine Maison de Grand-Mère'],
            [
                'is_custom' => true,
                'brand' => 'Fait Maison',
                'serving_size' => 150.00,
                'serving_unit' => 'g',
                'calories' => 395.00,
                'protein' => 14.50,
                'carbs' => 22.00,
                'fat' => 28.00,
                'fiber' => 1.50,
                'sugar' => 2.00,
                'saturated_fat' => 12.00,
                'sodium' => 450.00,
                'nutri_score' => 'd',
                'nova_group' => 3,
            ]
        );

        FoodServing::updateOrCreate(
            ['food_id' => $customFood->id, 'serving_name' => '1 part généreuse (180g)'],
            ['gram_equivalent' => 180.00, 'is_default' => true]
        );

        // 7. Meal / Recipe
        /** @var MealRecipe $recipe */
        $recipe = MealRecipe::updateOrCreate(
            ['user_id' => $user->id, 'name' => 'Bol Avoine & Protéine du Matin'],
            [
                'description' => 'Flocons d\'avoine Bjorg, lait bio, scoop de whey vanilla et beurre de cacahuète',
                'servings' => 1.00,
                'is_recipe' => true,
                'total_calories' => 540.00,
                'total_protein' => 42.00,
                'total_carbs' => 52.00,
                'total_fat' => 16.00,
                'total_fiber' => 7.00,
            ]
        );

        $oats = Food::where('off_id', '3229820129488')->first();
        $whey = Food::where('off_id', '748927028669')->first();
        if ($oats && $whey) {
            RecipeItem::updateOrCreate(
                ['meal_recipe_id' => $recipe->id, 'food_id' => $oats->id],
                [
                    'quantity' => 1.00,
                    'grams' => 50.00,
                    'calories' => 187.50,
                    'protein' => 6.75,
                    'carbs' => 29.25,
                    'fat' => 3.50,
                    'fiber' => 5.00,
                ]
            );

            RecipeItem::updateOrCreate(
                ['meal_recipe_id' => $recipe->id, 'food_id' => $whey->id],
                [
                    'quantity' => 1.00,
                    'grams' => 30.00,
                    'calories' => 112.50,
                    'protein' => 25.00,
                    'carbs' => 1.00,
                    'fat' => 0.50,
                    'fiber' => 0.00,
                ]
            );
        }

        // 8. Diary Entries for the last 5 days
        $chicken = Food::where('off_id', '3266980112345')->first();
        $rice = Food::where('off_id', '054800011111')->first();
        $apple = Food::where('off_id', '3760000000012')->first();
        $greekYogurt = Food::where('off_id', '5201051001046')->first();

        for ($i = 4; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');

            // Breakfast
            if ($oats) {
                DiaryEntry::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date, 'meal_slot' => 'breakfast'],
                    [
                        'food_id' => $oats->id,
                        'quantity' => 1.00,
                        'unit' => 'bol',
                        'grams' => 50.00,
                        'calories' => 187.50,
                        'protein' => 6.75,
                        'carbs' => 29.25,
                        'fat' => 3.50,
                        'fiber' => 5.00,
                    ]
                );
            }

            // Lunch
            if ($chicken) {
                DiaryEntry::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date, 'meal_slot' => 'lunch'],
                    [
                        'food_id' => $chicken->id,
                        'quantity' => 1.00,
                        'unit' => 'filet',
                        'grams' => 150.00,
                        'calories' => 165.00,
                        'protein' => 35.25,
                        'carbs' => 0.00,
                        'fat' => 2.70,
                        'fiber' => 0.00,
                    ]
                );
            }

            // Dinner
            if ($rice) {
                DiaryEntry::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date, 'meal_slot' => 'dinner'],
                    [
                        'food_id' => $rice->id,
                        'quantity' => 1.00,
                        'unit' => 'portion',
                        'grams' => 150.00,
                        'calories' => 166.50,
                        'protein' => 3.90,
                        'carbs' => 34.50,
                        'fat' => 1.35,
                        'fiber' => 2.70,
                    ]
                );
            }

            // Snack
            if ($greekYogurt) {
                DiaryEntry::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date, 'meal_slot' => 'snack'],
                    [
                        'food_id' => $greekYogurt->id,
                        'quantity' => 1.00,
                        'unit' => 'pot',
                        'grams' => 170.00,
                        'calories' => 204.00,
                        'protein' => 15.30,
                        'carbs' => 6.80,
                        'fat' => 12.75,
                        'fiber' => 0.00,
                    ]
                );
            }

            // Water logs
            WaterLog::updateOrCreate(
                ['user_id' => $user->id, 'date' => $date],
                ['amount_ml' => 2400]
            );
        }

        // 9. Weight tracking logs for the past 14 days (smooth downward trend)
        $initialWeight = 81.80;
        for ($w = 13; $w >= 0; $w--) {
            $wDate = Carbon::now()->subDays($w)->format('Y-m-d');
            $currentWeight = round($initialWeight - ((13 - $w) * 0.11) + (sin($w) * 0.15), 2);

            WeightLog::updateOrCreate(
                ['user_id' => $user->id, 'date' => $wDate],
                [
                    'weight_kg' => $currentWeight,
                    'body_fat_pct' => round(18.5 - ((13 - $w) * 0.05), 2),
                    'source' => 'manual',
                    'note' => $w === 0 ? 'Pesée à jeun après réveil' : null,
                ]
            );
        }

        // 10. Body measurements
        BodyMeasurement::updateOrCreate(
            ['user_id' => $user->id, 'date' => Carbon::now()->subDays(14)->format('Y-m-d')],
            [
                'neck_cm' => 39.00,
                'waist_cm' => 86.50,
                'hips_cm' => 99.00,
                'chest_cm' => 102.00,
                'biceps_cm' => 36.50,
                'thighs_cm' => 58.00,
                'calves_cm' => 38.00,
                'notes' => 'Mesures initiales',
            ]
        );

        BodyMeasurement::updateOrCreate(
            ['user_id' => $user->id, 'date' => Carbon::now()->format('Y-m-d')],
            [
                'neck_cm' => 38.80,
                'waist_cm' => 84.80,
                'hips_cm' => 98.20,
                'chest_cm' => 102.50,
                'biceps_cm' => 36.80,
                'thighs_cm' => 57.50,
                'calves_cm' => 38.00,
                'notes' => 'Tour de taille réduit de 1.7 cm !',
            ]
        );

        // 11. Exercise logs
        ExerciseLog::updateOrCreate(
            ['user_id' => $user->id, 'date' => Carbon::now()->subDays(2)->format('Y-m-d'), 'name' => 'Séance Haut du Corps (Pectoraux/Dos)'],
            [
                'exercise_type' => 'strength',
                'duration_minutes' => 60,
                'calories_burned' => 380.00,
                'notes' => 'Bonne congestion, augmentation charges développé couché',
            ]
        );

        ExerciseLog::updateOrCreate(
            ['user_id' => $user->id, 'date' => Carbon::now()->subDays(1)->format('Y-m-d'), 'name' => 'Course à pied modérée'],
            [
                'exercise_type' => 'cardio',
                'duration_minutes' => 45,
                'calories_burned' => 420.00,
                'notes' => '7 km en endurance fondamentale',
            ]
        );

        // 12. Adaptive Adjustment Checkpoint Review
        AdaptiveAdjustment::updateOrCreate(
            ['user_id' => $user->id, 'review_date' => Carbon::now()->format('Y-m-d')],
            [
                'period_start' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'period_end' => Carbon::now()->format('Y-m-d'),
                'starting_weight_kg' => 81.00,
                'ending_weight_kg' => 80.30,
                'ewma_weight_change_kg' => -0.55,
                'average_daily_calories' => 2080.00,
                'calculated_tdee' => 2580.00,
                'current_target_calories' => 2100,
                'proposed_target_calories' => 2050,
                'proposed_protein_g' => 160.00,
                'proposed_carbs_g' => 200.00,
                'proposed_fat_g' => 68.00,
                'status' => 'pending',
                'user_decision_at' => null,
            ]
        );

        // 13. Reports Export
        ReportExport::updateOrCreate(
            ['user_id' => $user->id, 'date_from' => Carbon::now()->subDays(30)->format('Y-m-d'), 'date_to' => Carbon::now()->format('Y-m-d')],
            [
                'type' => 'csv',
                'status' => 'completed',
                'file_path' => 'exports/sample_export_30d.csv',
                'expires_at' => Carbon::now()->addDays(7),
            ]
        );
    }
}
