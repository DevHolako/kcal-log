<?php

namespace App\Services;

use App\Events\ExportReady;
use App\Jobs\ProcessReportExportJob;
use App\Models\BodyMeasurement;
use App\Models\DiaryEntry;
use App\Models\ExerciseLog;
use App\Models\ReportExport;
use App\Models\TargetProfile;
use App\Models\User;
use App\Models\WaterLog;
use App\Models\WeightLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExportService
{
    /**
     * Request an export job and dispatch async or run immediately.
     */
    public function requestExport(User $user, string $type, string $dateFrom, string $dateTo, bool $async = true): ReportExport
    {
        /** @var ReportExport $export */
        $export = ReportExport::create([
            'user_id' => $user->id,
            'type' => $type,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'status' => 'pending',
        ]);

        if ($async && config('queue.default') !== 'sync') {
            ProcessReportExportJob::dispatch($export);
        } else {
            $this->generate($export);
        }

        return $export;
    }

    /**
     * Generate export file and save to secure local storage.
     */
    public function generate(ReportExport $export): void
    {
        $export->update(['status' => 'processing']);

        try {
            $user = $export->user;
            $dateFrom = $export->date_from->format('Y-m-d');
            $dateTo = $export->date_to->format('Y-m-d');

            $data = $this->gatherExportData($user, $dateFrom, $dateTo);

            $filename = sprintf('exports/%s-%d-%d.%s', $export->type, $user->id, $export->id, $export->type);

            switch ($export->type) {
                case 'pdf':
                    $pdf = Pdf::loadView('reports.nutrition-report', $data)
                        ->setPaper('a4', 'portrait');
                    Storage::disk('local')->put($filename, $pdf->output());
                    break;

                case 'csv':
                    $csvContent = $this->generateCsvContent($data);
                    Storage::disk('local')->put($filename, $csvContent);
                    break;

                case 'json':
                    $jsonContent = json_encode($this->generateJsonPayload($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                    Storage::disk('local')->put($filename, (string) $jsonContent);
                    break;

                default:
                    throw new \InvalidArgumentException("Unsupported export type: {$export->type}");
            }

            $export->update([
                'status' => 'completed',
                'file_path' => $filename,
                'expires_at' => now()->addHours(24),
            ]);

            $fileSize = Storage::disk('local')->exists($filename) ? Storage::disk('local')->size($filename) : null;
            $downloadUrl = route('reports.download', $export->id);

            ExportReady::dispatch($user->id, $export->id, $export->type, 'completed', $downloadUrl, $fileSize);
        } catch (\Throwable $e) {
            Log::error('Export generation failed', [
                'export_id' => $export->id,
                'error' => $e->getMessage(),
            ]);

            $export->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            ExportReady::dispatch($export->user_id, $export->id, $export->type, 'failed', null, null, $e->getMessage());
        }
    }

    /**
     * Gather comprehensive nutrition and tracking data for export period.
     *
     * @return array<string, mixed>
     */
    public function gatherExportData(User $user, string $dateFrom, string $dateTo): array
    {
        $startDate = Carbon::parse($dateFrom)->startOfDay();
        $endDate = Carbon::parse($dateTo)->endOfDay();

        /** @var Collection<int, DiaryEntry> $entries */
        $entries = DiaryEntry::where('user_id', $user->id)
            ->where(function ($q) use ($dateFrom, $dateTo, $startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                    ->orWhereBetween('date', [$dateFrom, $dateTo]);
            })
            ->with(['food', 'serving'])
            ->orderBy('date')
            ->get();

        /** @var Collection<int, WaterLog> $waterLogs */
        $waterLogs = WaterLog::where('user_id', $user->id)
            ->where(function ($q) use ($dateFrom, $dateTo, $startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                    ->orWhereBetween('date', [$dateFrom, $dateTo]);
            })
            ->get();

        /** @var Collection<int, WeightLog> $weightLogs */
        $weightLogs = WeightLog::where('user_id', $user->id)
            ->where(function ($q) use ($dateFrom, $dateTo, $startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                    ->orWhereBetween('date', [$dateFrom, $dateTo]);
            })
            ->orderBy('date')
            ->get();

        /** @var Collection<int, BodyMeasurement> $measurements */
        $measurements = BodyMeasurement::where('user_id', $user->id)
            ->where(function ($q) use ($dateFrom, $dateTo, $startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                    ->orWhereBetween('date', [$dateFrom, $dateTo]);
            })
            ->orderBy('date')
            ->get();

        /** @var Collection<int, ExerciseLog> $exerciseLogs */
        $exerciseLogs = ExerciseLog::where('user_id', $user->id)
            ->where(function ($q) use ($dateFrom, $dateTo, $startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                    ->orWhereBetween('date', [$dateFrom, $dateTo]);
            })
            ->orderBy('date')
            ->get();

        /** @var TargetProfile|null $target */
        $target = TargetProfile::where('user_id', $user->id)
            ->where('is_active', true)
            ->latest('id')
            ->first();

        $targetCalories = $target ? (float) $target->calories : 2000.0;

        $period = CarbonPeriod::create($dateFrom, $dateTo);
        $dailyRows = [];

        $totalCalories = 0.0;
        $totalProtein = 0.0;
        $totalCarbs = 0.0;
        $totalFat = 0.0;
        $totalDaysWithEntries = 0;

        foreach ($period as $dateObj) {
            $dateStr = $dateObj->format('Y-m-d');
            $dayEntries = $entries->filter(fn (DiaryEntry $e) => $e->date->format('Y-m-d') === $dateStr);

            $dayCalories = (float) $dayEntries->sum('calories');
            $dayProtein = (float) $dayEntries->sum('protein');
            $dayCarbs = (float) $dayEntries->sum('carbs');
            $dayFat = (float) $dayEntries->sum('fat');
            $dayFiber = $dayEntries->isNotEmpty() ? (float) $dayEntries->sum('fiber') : null;

            $dayWater = (int) $waterLogs->filter(fn (WaterLog $w) => $w->date->format('Y-m-d') === $dateStr)->sum('amount_ml');
            $dayWeight = $weightLogs->first(fn (WeightLog $w) => $w->date->format('Y-m-d') === $dateStr);
            $dayMeasurement = $measurements->first(fn (BodyMeasurement $m) => $m->date->format('Y-m-d') === $dateStr);
            $dayExercises = $exerciseLogs->filter(fn (ExerciseLog $x) => $x->date->format('Y-m-d') === $dateStr);

            if ($dayEntries->isNotEmpty()) {
                $totalDaysWithEntries++;
                $totalCalories += $dayCalories;
                $totalProtein += $dayProtein;
                $totalCarbs += $dayCarbs;
                $totalFat += $dayFat;
            }

            $dailyRows[] = [
                'date' => $dateStr,
                'calories' => $dayCalories,
                'target_calories' => $targetCalories,
                'variance' => $dayCalories - $targetCalories,
                'protein' => $dayProtein,
                'carbs' => $dayCarbs,
                'fat' => $dayFat,
                'fiber' => $dayFiber,
                'water_ml' => $dayWater,
                'weight_kg' => $dayWeight ? (float) $dayWeight->weight_kg : null,
                'waist_cm' => $dayMeasurement && $dayMeasurement->waist_cm !== null ? (float) $dayMeasurement->waist_cm : null,
                'hips_cm' => $dayMeasurement && $dayMeasurement->hips_cm !== null ? (float) $dayMeasurement->hips_cm : null,
                'exercise_calories_burned' => (float) $dayExercises->sum('calories_burned'),
                'exercise_duration_minutes' => (int) $dayExercises->sum('duration_minutes'),
            ];
        }

        $divisor = max(1, $totalDaysWithEntries);

        // Calculate most frequent foods
        $foodCounts = [];
        foreach ($entries as $entry) {
            $foodName = $entry->food->name;
            $brand = $entry->food->brand;
            $key = $foodName.'_'.($brand ?? '');
            if (! isset($foodCounts[$key])) {
                $foodCounts[$key] = [
                    'name' => $foodName,
                    'brand' => $brand,
                    'count' => 0,
                    'total_calories' => 0.0,
                ];
            }
            $foodCounts[$key]['count']++;
            $foodCounts[$key]['total_calories'] += (float) $entry->calories;
        }

        uasort($foodCounts, fn ($a, $b) => $b['count'] <=> $a['count']);
        $recentItems = array_slice(array_values($foodCounts), 0, 8);

        $daysAdherent = 0;
        foreach ($dailyRows as $row) {
            if ($row['calories'] > 0 && $row['calories'] >= ($targetCalories * 0.9) && $row['calories'] <= ($targetCalories * 1.1)) {
                $daysAdherent++;
            }
        }
        $adherenceRate = $totalDaysWithEntries > 0
            ? (int) round(($daysAdherent / $totalDaysWithEntries) * 100)
            : 0;

        $weightDelta = null;
        if ($weightLogs->count() >= 2) {
            $weightDelta = round((float) $weightLogs->last()->weight_kg - (float) $weightLogs->first()->weight_kg, 1);
        }

        $avgWater = $totalDaysWithEntries > 0
            ? (int) round($waterLogs->sum('amount_ml') / $totalDaysWithEntries)
            : 0;

        return [
            'user' => $user,
            'target' => $target,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'avgCalories' => $totalCalories / $divisor,
            'avgProtein' => $totalProtein / $divisor,
            'avgCarbs' => $totalCarbs / $divisor,
            'avgFat' => $totalFat / $divisor,
            'adherenceRate' => $adherenceRate,
            'totalDaysWithEntries' => $totalDaysWithEntries,
            'weightDelta' => $weightDelta,
            'avgWater' => $avgWater,
            'dailyRows' => $dailyRows,
            'entries' => $entries,
            'waterLogs' => $waterLogs,
            'weightLogs' => $weightLogs,
            'bodyMeasurements' => $measurements,
            'exerciseLogs' => $exerciseLogs,
            'recentItems' => $recentItems,
        ];
    }

    /**
     * Get user's executive tracking dashboard statistics for the last N days.
     *
     * @return array<string, mixed>
     */
    public function getUserStats(User $user, int $days = 30): array
    {
        $dateFrom = now()->subDays($days - 1)->format('Y-m-d');
        $dateTo = now()->format('Y-m-d');
        $data = $this->gatherExportData($user, $dateFrom, $dateTo);

        $targetCalories = $data['target'] ? (float) $data['target']->calories : 2000.0;

        $pCal = $data['avgProtein'] * 4;
        $cCal = $data['avgCarbs'] * 4;
        $fCal = $data['avgFat'] * 9;
        $totalMacroCal = max(1.0, $pCal + $cCal + $fCal);

        return [
            'periodDays' => $days,
            'totalDaysLogged' => $data['totalDaysWithEntries'],
            'loggingRate' => (int) round(($data['totalDaysWithEntries'] / $days) * 100),
            'avgCalories' => (int) round($data['avgCalories']),
            'targetCalories' => (int) round($targetCalories),
            'calorieVariance' => (int) round($data['avgCalories'] - $targetCalories),
            'adherenceRate' => $data['adherenceRate'],
            'avgProtein' => round($data['avgProtein'], 1),
            'avgCarbs' => round($data['avgCarbs'], 1),
            'avgFat' => round($data['avgFat'], 1),
            'proteinPct' => (int) round(($pCal / $totalMacroCal) * 100),
            'carbsPct' => (int) round(($cCal / $totalMacroCal) * 100),
            'fatPct' => (int) round(($fCal / $totalMacroCal) * 100),
            'weightDelta' => $data['weightDelta'],
            'avgWater' => $data['avgWater'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function generateCsvContent(array $data): string
    {
        $handle = fopen('php://memory', 'r+');
        if (! $handle) {
            return '';
        }

        // Section 1: Summary Info
        fputcsv($handle, ['# KCAL-LOG DATA EXPORT'], ',', '"', '\\');
        fputcsv($handle, ['User', $data['user']->name, 'Email', $data['user']->email], ',', '"', '\\');
        fputcsv($handle, ['Period', $data['dateFrom'], 'to', $data['dateTo']], ',', '"', '\\');
        fputcsv($handle, ['Avg Daily Calories', round((float) $data['avgCalories'])], ',', '"', '\\');
        fputcsv($handle, [], ',', '"', '\\');

        // Section 2: Daily Totals
        fputcsv($handle, ['# DAILY TOTALS'], ',', '"', '\\');
        fputcsv($handle, ['Date', 'Calories', 'Target Calories', 'Deficit/Surplus', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Water (ml)', 'Weight (kg)'], ',', '"', '\\');
        foreach ($data['dailyRows'] as $row) {
            fputcsv($handle, [
                $row['date'],
                round($row['calories'], 2),
                round($row['target_calories'], 2),
                round($row['variance'], 2),
                round($row['protein'], 2),
                round($row['carbs'], 2),
                round($row['fat'], 2),
                $row['fiber'] !== null ? round($row['fiber'], 2) : '',
                $row['water_ml'],
                $row['weight_kg'] ?? '',
            ], ',', '"', '\\');
        }
        fputcsv($handle, [], ',', '"', '\\');

        // Section 3: Diary Entries
        fputcsv($handle, ['# DIARY ENTRIES'], ',', '"', '\\');
        fputcsv($handle, ['Date', 'Meal Slot', 'Food Item', 'Brand', 'Quantity', 'Unit', 'Grams', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)'], ',', '"', '\\');
        foreach ($data['entries'] as $entry) {
            fputcsv($handle, [
                $entry->date->format('Y-m-d'),
                $entry->meal_slot,
                $entry->food->name,
                $entry->food->brand ?? '',
                (float) $entry->quantity,
                $entry->unit,
                (float) $entry->grams,
                (float) $entry->calories,
                (float) $entry->protein,
                (float) $entry->carbs,
                (float) $entry->fat,
                $entry->fiber !== null ? (float) $entry->fiber : '',
            ], ',', '"', '\\');
        }
        fputcsv($handle, [], ',', '"', '\\');

        // Section 4: Body Measurements
        fputcsv($handle, ['# BODY MEASUREMENTS'], ',', '"', '\\');
        fputcsv($handle, ['Date', 'Waist (cm)', 'Hips (cm)', 'Neck (cm)', 'Chest (cm)', 'Biceps (cm)', 'Thighs (cm)', 'Calves (cm)', 'Notes'], ',', '"', '\\');
        foreach ($data['bodyMeasurements'] as $m) {
            fputcsv($handle, [
                $m->date->format('Y-m-d'),
                $m->waist_cm !== null ? (float) $m->waist_cm : '',
                $m->hips_cm !== null ? (float) $m->hips_cm : '',
                $m->neck_cm !== null ? (float) $m->neck_cm : '',
                $m->chest_cm !== null ? (float) $m->chest_cm : '',
                $m->biceps_cm !== null ? (float) $m->biceps_cm : '',
                $m->thighs_cm !== null ? (float) $m->thighs_cm : '',
                $m->calves_cm !== null ? (float) $m->calves_cm : '',
                $m->notes ?? '',
            ], ',', '"', '\\');
        }
        fputcsv($handle, [], ',', '"', '\\');

        // Section 5: Exercise Logs
        fputcsv($handle, ['# EXERCISE LOGS'], ',', '"', '\\');
        fputcsv($handle, ['Date', 'Exercise Name', 'Type', 'Duration (min)', 'Calories Burned', 'Notes'], ',', '"', '\\');
        foreach ($data['exerciseLogs'] as $x) {
            fputcsv($handle, [
                $x->date->format('Y-m-d'),
                $x->name,
                $x->exercise_type,
                (int) $x->duration_minutes,
                (float) $x->calories_burned,
                $x->notes ?? '',
            ], ',', '"', '\\');
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return (string) $content;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function generateJsonPayload(array $data): array
    {
        $user = $data['user'];

        return [
            'meta' => [
                'generator' => 'kcal-log',
                'repository' => 'https://github.com/DevHolako/kcal-log',
                'exported_at' => now()->toIso8601String(),
                'date_from' => $data['dateFrom'],
                'date_to' => $data['dateTo'],
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile' => $user->profile ? [
                    'date_of_birth' => $user->profile->date_of_birth?->format('Y-m-d'),
                    'sex' => $user->profile->sex,
                    'height_cm' => (float) $user->profile->height_cm,
                    'activity_level' => $user->profile->activity_level,
                    'unit_preference' => $user->profile->unit_preference,
                ] : null,
            ],
            'target_profile' => $data['target'] ? [
                'target_calories' => (float) $data['target']->calories,
                'target_protein_g' => (float) $data['target']->protein_g,
                'target_carbs_g' => (float) $data['target']->carbs_g,
                'target_fat_g' => (float) $data['target']->fat_g,
                'target_water_ml' => (int) $data['target']->water_ml,
            ] : null,
            'daily_summaries' => $data['dailyRows'],
            'diary_entries' => $data['entries']->map(fn (DiaryEntry $entry) => [
                'id' => $entry->id,
                'date' => $entry->date->format('Y-m-d'),
                'meal_slot' => $entry->meal_slot,
                'food' => [
                    'name' => $entry->food->name,
                    'brand' => $entry->food->brand,
                    'barcode' => $entry->food->barcode,
                    'is_custom' => (bool) $entry->food->is_custom,
                ],
                'quantity' => (float) $entry->quantity,
                'unit' => $entry->unit,
                'grams' => (float) $entry->grams,
                'calories' => (float) $entry->calories,
                'protein' => (float) $entry->protein,
                'carbs' => (float) $entry->carbs,
                'fat' => (float) $entry->fat,
                'fiber' => $entry->fiber !== null ? (float) $entry->fiber : null,
            ])->values(),
            'water_logs' => $data['waterLogs']->map(fn (WaterLog $log) => [
                'date' => $log->date->format('Y-m-d'),
                'amount_ml' => (int) $log->amount_ml,
            ])->values(),
            'weight_logs' => $data['weightLogs']->map(fn (WeightLog $log) => [
                'date' => $log->date->format('Y-m-d'),
                'weight_kg' => (float) $log->weight_kg,
            ])->values(),
            'body_measurements' => $data['bodyMeasurements']->map(fn (BodyMeasurement $m) => [
                'date' => $m->date->format('Y-m-d'),
                'waist_cm' => $m->waist_cm !== null ? (float) $m->waist_cm : null,
                'hips_cm' => $m->hips_cm !== null ? (float) $m->hips_cm : null,
                'neck_cm' => $m->neck_cm !== null ? (float) $m->neck_cm : null,
                'chest_cm' => $m->chest_cm !== null ? (float) $m->chest_cm : null,
                'biceps_cm' => $m->biceps_cm !== null ? (float) $m->biceps_cm : null,
                'thighs_cm' => $m->thighs_cm !== null ? (float) $m->thighs_cm : null,
                'calves_cm' => $m->calves_cm !== null ? (float) $m->calves_cm : null,
                'notes' => $m->notes,
            ])->values(),
            'exercise_logs' => $data['exerciseLogs']->map(fn (ExerciseLog $x) => [
                'date' => $x->date->format('Y-m-d'),
                'name' => $x->name,
                'exercise_type' => $x->exercise_type,
                'duration_minutes' => (int) $x->duration_minutes,
                'calories_burned' => (float) $x->calories_burned,
                'notes' => $x->notes,
            ])->values(),
        ];
    }
}
