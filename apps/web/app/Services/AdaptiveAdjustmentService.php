<?php

namespace App\Services;

use App\Events\AdaptiveAdjustmentProposed;
use App\Models\AdaptiveAdjustment;
use App\Models\DiaryEntry;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WeightLog;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AdaptiveAdjustmentService
{
    /**
     * Smoothing factor for EWMA weight calculations (alpha).
     */
    public const EWMA_ALPHA = 0.25;

    public function __construct(
        protected NutritionCalculator $nutritionCalculator
    ) {}

    /**
     * Calculate and propose a weekly adaptive adjustment based on EWMA weight trends and actual intake.
     */
    public function calculateWeeklyAdjustment(User $user, ?CarbonInterface $reviewDate = null): ?AdaptiveAdjustment
    {
        $review = $reviewDate ? $reviewDate->copy()->startOfDay() : Carbon::today();
        $periodEnd = $review->copy()->subDay();
        $periodStart = $periodEnd->copy()->subDays(6);

        // Check if there is already a pending adjustment
        /** @var AdaptiveAdjustment|null $existingPending */
        $existingPending = AdaptiveAdjustment::where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        if ($existingPending) {
            return $existingPending;
        }

        // Fetch weight logs up to the end of the review period
        /** @var Collection<int, WeightLog> $weightLogs */
        $weightLogs = WeightLog::where('user_id', $user->id)
            ->whereDate('date', '<=', $periodEnd->format('Y-m-d'))
            ->whereDate('date', '>=', $periodStart->copy()->subDays(21)->format('Y-m-d'))
            ->orderBy('date', 'asc')
            ->get();

        if ($weightLogs->isEmpty()) {
            return null;
        }

        // Calculate EWMA series
        $smoothedWeights = $this->calculateEwmaSeries($weightLogs);

        // Find smoothed weight closest to periodStart and periodEnd
        $startWeight = $this->findClosestSmoothedWeight($smoothedWeights, $periodStart);
        $endWeight = $this->findClosestSmoothedWeight($smoothedWeights, $periodEnd);

        if ($startWeight === null || $endWeight === null) {
            return null;
        }

        $ewmaWeightChangeKg = round($endWeight - $startWeight, 2);

        // Calculate average daily calories over period
        /** @var Collection<int, DiaryEntry> $diaryEntries */
        $diaryEntries = DiaryEntry::where('user_id', $user->id)
            ->whereDate('date', '>=', $periodStart->format('Y-m-d'))
            ->whereDate('date', '<=', $periodEnd->format('Y-m-d'))
            ->get();

        /** @var TargetProfile|null $activeTarget */
        $activeTarget = TargetProfile::where('user_id', $user->id)
            ->where('is_active', true)
            ->latest('id')
            ->first();

        $currentTargetCalories = $activeTarget ? (int) $activeTarget->calories : 2000;

        if ($diaryEntries->isEmpty()) {
            $averageDailyCalories = (float) $currentTargetCalories;
        } else {
            $caloriesByDate = $diaryEntries->groupBy(function ($entry) {
                return $entry->date->format('Y-m-d');
            })->map(function ($dayEntries) {
                return (float) $dayEntries->sum('calories');
            });

            $averageDailyCalories = round((float) $caloriesByDate->avg(), 2);
        }

        // Calculate realized metabolic TDEE
        // 1 kg weight change ~ 7700 kcal
        $dailyDeltaEnergy = ($ewmaWeightChangeKg * 7700) / 7;
        $calculatedTdee = round($averageDailyCalories - $dailyDeltaEnergy, 2);
        $calculatedTdee = max(1000.0, min(5000.0, $calculatedTdee));

        $goalType = $activeTarget ? (string) $activeTarget->goal_type : 'maintain';
        $weeklyRateKg = $activeTarget ? (float) $activeTarget->weekly_rate_kg : 0.0;
        $sex = $user->profile !== null ? $user->profile->sex : 'female';

        $calorieResult = $this->nutritionCalculator->calculateTargetCalories(
            $calculatedTdee,
            $goalType,
            $weeklyRateKg,
            $sex
        );

        $proposedTargetCalories = $calorieResult['calories'];

        // Compute proposed macros using existing distribution
        $macroPercentages = $this->deriveMacroPercentages($activeTarget);
        $proposedMacros = $this->nutritionCalculator->calculateMacroGrams($proposedTargetCalories, $macroPercentages);

        /** @var AdaptiveAdjustment $adjustment */
        $adjustment = AdaptiveAdjustment::create([
            'user_id' => $user->id,
            'review_date' => $review->format('Y-m-d'),
            'period_start' => $periodStart->format('Y-m-d'),
            'period_end' => $periodEnd->format('Y-m-d'),
            'starting_weight_kg' => round($startWeight, 2),
            'ending_weight_kg' => round($endWeight, 2),
            'ewma_weight_change_kg' => $ewmaWeightChangeKg,
            'average_daily_calories' => $averageDailyCalories,
            'calculated_tdee' => $calculatedTdee,
            'current_target_calories' => $currentTargetCalories,
            'proposed_target_calories' => $proposedTargetCalories,
            'proposed_protein_g' => $proposedMacros['protein_g'],
            'proposed_carbs_g' => $proposedMacros['carbs_g'],
            'proposed_fat_g' => $proposedMacros['fat_g'],
            'status' => 'pending',
        ]);

        AdaptiveAdjustmentProposed::dispatch($user->id, $adjustment->id, [
            'period_start' => $adjustment->period_start->format('Y-m-d'),
            'period_end' => $adjustment->period_end->format('Y-m-d'),
            'current_target_calories' => $adjustment->current_target_calories,
            'proposed_target_calories' => $adjustment->proposed_target_calories,
            'calculated_tdee' => $adjustment->calculated_tdee,
            'ewma_weight_change_kg' => $adjustment->ewma_weight_change_kg,
        ]);

        return $adjustment;
    }

    /**
     * Accept a pending adjustment, deactivating old target and activating new target.
     */
    public function acceptAdjustment(User $user, AdaptiveAdjustment $adjustment): TargetProfile
    {
        if ($adjustment->user_id !== $user->id) {
            throw new InvalidArgumentException('Unauthorized adjustment acceptance.');
        }

        if ($adjustment->status !== 'pending') {
            throw new InvalidArgumentException("Adjustment cannot be accepted with status: {$adjustment->status}");
        }

        return DB::transaction(function () use ($user, $adjustment) {
            /** @var TargetProfile|null $currentActive */
            $currentActive = TargetProfile::where('user_id', $user->id)
                ->where('is_active', true)
                ->latest('id')
                ->first();

            // Deactivate all existing profiles
            TargetProfile::where('user_id', $user->id)->update(['is_active' => false]);

            $fiberG = ($currentActive !== null && $currentActive->fiber_g !== null) ? $currentActive->fiber_g : 30.0;
            $waterMl = ($currentActive !== null && $currentActive->water_ml !== null) ? $currentActive->water_ml : 2000;
            $goalType = $currentActive !== null ? $currentActive->goal_type : 'maintain';
            $weeklyRate = $currentActive !== null ? $currentActive->weekly_rate_kg : 0.0;
            $formulaInputs = $currentActive !== null ? $currentActive->formula_inputs : [];
            $dietType = ($currentActive !== null && $currentActive->diet_type !== null) ? $currentActive->diet_type : 'balanced';

            /** @var TargetProfile $newTarget */
            $newTarget = TargetProfile::create([
                'user_id' => $user->id,
                'calories' => $adjustment->proposed_target_calories,
                'protein_g' => $adjustment->proposed_protein_g,
                'carbs_g' => $adjustment->proposed_carbs_g,
                'fat_g' => $adjustment->proposed_fat_g,
                'fiber_g' => $fiberG,
                'water_ml' => $waterMl,
                'bmr' => $currentActive !== null ? $currentActive->bmr : null,
                'tdee' => $adjustment->calculated_tdee,
                'goal_type' => $goalType,
                'weekly_rate_kg' => $weeklyRate,
                'diet_type' => $dietType,
                'is_active' => true,
                'formula_inputs' => $formulaInputs,
                'source' => 'adaptive_checkpoint',
            ]);

            $adjustment->update([
                'status' => 'accepted',
                'user_decision_at' => now(),
                'applied_target_profile_id' => $newTarget->id,
            ]);

            return $newTarget;
        });
    }

    /**
     * Reject a pending adjustment.
     */
    public function rejectAdjustment(User $user, AdaptiveAdjustment $adjustment): AdaptiveAdjustment
    {
        if ($adjustment->user_id !== $user->id) {
            throw new InvalidArgumentException('Unauthorized adjustment rejection.');
        }

        if ($adjustment->status !== 'pending') {
            throw new InvalidArgumentException("Adjustment cannot be rejected with status: {$adjustment->status}");
        }

        $adjustment->update([
            'status' => 'rejected',
            'user_decision_at' => now(),
        ]);

        return $adjustment;
    }

    /**
     * Calculate EWMA smoothed series from chronological weight logs.
     *
     * @param  iterable<WeightLog>  $logs
     * @return array<string, float> [date_string => smoothed_weight]
     */
    public function calculateEwmaSeries(iterable $logs): array
    {
        $series = [];
        $currentEwma = null;

        foreach ($logs as $log) {
            $rawWeight = (float) $log->weight_kg;
            $date = $log->date->format('Y-m-d');

            if ($currentEwma === null) {
                $currentEwma = $rawWeight;
            } else {
                $currentEwma = (self::EWMA_ALPHA * $rawWeight) + ((1.0 - self::EWMA_ALPHA) * $currentEwma);
            }

            $series[$date] = round($currentEwma, 2);
        }

        return $series;
    }

    /**
     * Find smoothed weight for a target date, or the closest date prior to it.
     *
     * @param  array<string, float>  $series
     */
    protected function findClosestSmoothedWeight(array $series, CarbonInterface $targetDate): ?float
    {
        if (empty($series)) {
            return null;
        }

        $targetKey = $targetDate->format('Y-m-d');
        if (isset($series[$targetKey])) {
            return $series[$targetKey];
        }

        // Find nearest date on or before targetDate
        $bestVal = null;
        foreach ($series as $dateStr => $val) {
            if ($dateStr <= $targetKey) {
                $bestVal = $val;
            } else {
                break;
            }
        }

        // If no prior date, take first available date
        if ($bestVal === null) {
            $bestVal = (float) reset($series);
        }

        return $bestVal;
    }

    /**
     * Derive macro distribution percentages from active target or defaults.
     *
     * @return array{protein: float, carbs: float, fat: float}
     */
    protected function deriveMacroPercentages(?TargetProfile $target): array
    {
        if (! $target || (int) $target->calories <= 0) {
            return ['protein' => 0.30, 'carbs' => 0.40, 'fat' => 0.30];
        }

        $cal = (float) $target->calories;
        $proteinPct = round(((float) $target->protein_g * 4.0) / $cal, 2);
        $carbsPct = round(((float) $target->carbs_g * 4.0) / $cal, 2);
        $fatPct = max(0.1, round(1.0 - $proteinPct - $carbsPct, 2));

        return [
            'protein' => $proteinPct,
            'carbs' => $carbsPct,
            'fat' => $fatPct,
        ];
    }
}
