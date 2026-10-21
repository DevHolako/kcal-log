<?php

namespace App\Ai\Tools;

use App\Models\BodyMeasurement;
use App\Models\DiaryEntry;
use App\Models\ExerciseLog;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetDailySummaryTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Retrieve daily consumed calories, protein, carbs, fat, water intake, exercise sessions/calories burned, and body measurements, compared against active targets for a given date.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $date = (string) ($request['date'] ?? now()->format('Y-m-d'));

        $entries = DiaryEntry::where('user_id', $this->user->id)
            ->whereDate('date', $date)
            ->get();

        $waterLogs = WaterLog::where('user_id', $this->user->id)
            ->whereDate('date', $date)
            ->get();

        $exerciseLogs = ExerciseLog::where('user_id', $this->user->id)
            ->whereDate('date', $date)
            ->get();

        $measurement = BodyMeasurement::where('user_id', $this->user->id)
            ->whereDate('date', $date)
            ->latest('id')
            ->first();

        /** @var TargetProfile|null $target */
        $target = $this->user->activeTargetProfile
            ?? TargetProfile::where('user_id', $this->user->id)
                ->where('is_active', true)
                ->latest('id')
                ->first();

        $consumedCalories = (float) $entries->sum('calories');
        $consumedProtein = (float) $entries->sum('protein');
        $consumedCarbs = (float) $entries->sum('carbs');
        $consumedFat = (float) $entries->sum('fat');

        $targetCalories = $target ? (float) $target->calories : 0.0;
        $targetProtein = $target ? (float) $target->protein_g : 0.0;
        $targetCarbs = $target ? (float) $target->carbs_g : 0.0;
        $targetFat = $target ? (float) $target->fat_g : 0.0;

        $consumedWaterMl = (int) $waterLogs->sum('amount_ml');
        $targetWaterMl = $target && $target->water_ml ? (int) $target->water_ml : null;

        $caloriesBurned = (float) $exerciseLogs->sum('calories_burned');
        $durationMinutes = (int) $exerciseLogs->sum('duration_minutes');
        $exerciseSessions = $exerciseLogs->map(fn (ExerciseLog $log) => [
            'id' => $log->id,
            'name' => $log->name,
            'exercise_type' => $log->exercise_type,
            'duration_minutes' => $log->duration_minutes,
            'calories_burned' => (float) $log->calories_burned,
            'notes' => $log->notes,
        ])->values()->all();

        $measurementData = $measurement ? [
            'neck_cm' => $measurement->neck_cm !== null ? (float) $measurement->neck_cm : null,
            'waist_cm' => $measurement->waist_cm !== null ? (float) $measurement->waist_cm : null,
            'hips_cm' => $measurement->hips_cm !== null ? (float) $measurement->hips_cm : null,
            'chest_cm' => $measurement->chest_cm !== null ? (float) $measurement->chest_cm : null,
            'biceps_cm' => $measurement->biceps_cm !== null ? (float) $measurement->biceps_cm : null,
            'thighs_cm' => $measurement->thighs_cm !== null ? (float) $measurement->thighs_cm : null,
            'calves_cm' => $measurement->calves_cm !== null ? (float) $measurement->calves_cm : null,
            'notes' => $measurement->notes,
        ] : null;

        return (string) json_encode([
            'date' => $date,
            'entries_count' => $entries->count(),
            'consumed' => [
                'calories' => round($consumedCalories, 2),
                'protein' => round($consumedProtein, 2),
                'carbs' => round($consumedCarbs, 2),
                'fat' => round($consumedFat, 2),
            ],
            'target' => [
                'calories' => $targetCalories,
                'protein' => $targetProtein,
                'carbs' => $targetCarbs,
                'fat' => $targetFat,
            ],
            'remaining' => [
                'calories' => round(max(0.0, $targetCalories - $consumedCalories), 2),
                'protein' => round(max(0.0, $targetProtein - $consumedProtein), 2),
                'carbs' => round(max(0.0, $targetCarbs - $consumedCarbs), 2),
                'fat' => round(max(0.0, $targetFat - $consumedFat), 2),
            ],
            'water' => [
                'consumed_ml' => $consumedWaterMl,
                'target_ml' => $targetWaterMl,
                'remaining_ml' => $targetWaterMl !== null ? max(0, $targetWaterMl - $consumedWaterMl) : null,
            ],
            'exercise' => [
                'calories_burned' => round($caloriesBurned, 2),
                'duration_minutes' => $durationMinutes,
                'sessions_count' => count($exerciseSessions),
                'sessions' => $exerciseSessions,
            ],
            'body_measurement' => $measurementData,
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'date' => $schema->string()->description('The date in YYYY-MM-DD format (defaults to current date if omitted).'),
        ];
    }
}
