<?php

namespace App\Ai\Tools;

use App\Models\DiaryEntry;
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
        return 'Retrieve daily consumed calories, protein, carbs, fat, water intake, and compare against active targets for a given date.';
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
