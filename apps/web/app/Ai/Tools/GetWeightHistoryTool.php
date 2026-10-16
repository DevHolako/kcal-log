<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\WeightLog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetWeightHistoryTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Retrieve timestamped weigh-in logs, trajectory, and weight changes over a recent window (up to 90 days).';
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

        $logs = WeightLog::where('user_id', $this->user->id)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date', 'asc')
            ->get();

        if ($logs->isEmpty()) {
            return (string) json_encode([
                'window_days' => $days,
                'total_logs' => 0,
                'start_weight_kg' => null,
                'latest_weight_kg' => null,
                'weight_change_kg' => null,
                'logs' => [],
            ]);
        }

        $first = $logs->first();
        $latest = $logs->last();

        $startWeight = (float) $first->weight_kg;
        $latestWeight = (float) $latest->weight_kg;
        $delta = round($latestWeight - $startWeight, 2);

        $mappedLogs = $logs->map(function (WeightLog $log) {
            return [
                'date' => $log->date ? $log->date->format('Y-m-d') : null,
                'weight_kg' => (float) $log->weight_kg,
                'body_fat_pct' => $log->body_fat_pct ? (float) $log->body_fat_pct : null,
            ];
        });

        return (string) json_encode([
            'window_days' => $days,
            'total_logs' => $logs->count(),
            'start_weight_kg' => $startWeight,
            'latest_weight_kg' => $latestWeight,
            'weight_change_kg' => $delta,
            'logs' => $mappedLogs->values()->all(),
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'days' => $schema->integer()->description('Number of recent days of weight logs to inspect (defaults to 30, max 90).'),
        ];
    }
}
