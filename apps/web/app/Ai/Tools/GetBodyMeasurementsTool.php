<?php

namespace App\Ai\Tools;

use App\Models\BodyMeasurement;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetBodyMeasurementsTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Retrieve body circumference measurements (waist, hips, chest, biceps, thighs, calves, neck) and tracking progress over a recent window (up to 90 days).';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $days = (int) ($request['days'] ?? 30);
        if ($days < 1) {
            $days = 30;
        }
        if ($days > 90) {
            $days = 90;
        }

        $records = BodyMeasurement::where('user_id', $this->user->id)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        if ($records->isEmpty()) {
            return (string) json_encode([
                'window_days' => $days,
                'total_records' => 0,
                'latest' => null,
                'oldest' => null,
                'deltas' => null,
                'records' => [],
            ]);
        }

        $oldest = $records->first();
        $latest = $records->last();

        $formatMeasurement = function (BodyMeasurement $m) {
            return [
                'date' => $m->date->format('Y-m-d'),
                'neck_cm' => $m->neck_cm !== null ? (float) $m->neck_cm : null,
                'waist_cm' => $m->waist_cm !== null ? (float) $m->waist_cm : null,
                'hips_cm' => $m->hips_cm !== null ? (float) $m->hips_cm : null,
                'chest_cm' => $m->chest_cm !== null ? (float) $m->chest_cm : null,
                'biceps_cm' => $m->biceps_cm !== null ? (float) $m->biceps_cm : null,
                'thighs_cm' => $m->thighs_cm !== null ? (float) $m->thighs_cm : null,
                'calves_cm' => $m->calves_cm !== null ? (float) $m->calves_cm : null,
                'notes' => $m->notes,
            ];
        };

        $calcDelta = function (?string $latestVal, ?string $oldestVal): ?float {
            if ($latestVal === null || $oldestVal === null) {
                return null;
            }

            return round((float) $latestVal - (float) $oldestVal, 2);
        };

        $deltas = [
            'waist_cm_change' => $calcDelta($latest->waist_cm ? (string) $latest->waist_cm : null, $oldest->waist_cm ? (string) $oldest->waist_cm : null),
            'hips_cm_change' => $calcDelta($latest->hips_cm ? (string) $latest->hips_cm : null, $oldest->hips_cm ? (string) $oldest->hips_cm : null),
            'chest_cm_change' => $calcDelta($latest->chest_cm ? (string) $latest->chest_cm : null, $oldest->chest_cm ? (string) $oldest->chest_cm : null),
            'biceps_cm_change' => $calcDelta($latest->biceps_cm ? (string) $latest->biceps_cm : null, $oldest->biceps_cm ? (string) $oldest->biceps_cm : null),
            'thighs_cm_change' => $calcDelta($latest->thighs_cm ? (string) $latest->thighs_cm : null, $oldest->thighs_cm ? (string) $oldest->thighs_cm : null),
        ];

        return (string) json_encode([
            'window_days' => $days,
            'total_records' => $records->count(),
            'latest' => $formatMeasurement($latest),
            'oldest' => $formatMeasurement($oldest),
            'deltas' => $deltas,
            'records' => $records->map($formatMeasurement)->values()->all(),
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'days' => $schema->integer()->description('Number of recent days to look back (default 30, maximum 90).'),
        ];
    }
}
