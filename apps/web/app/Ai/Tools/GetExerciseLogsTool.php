<?php

namespace App\Ai\Tools;

use App\Models\ExerciseLog;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetExerciseLogsTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Retrieve logged physical activities, exercise sessions, and calories burned over a recent time window (up to 90 days).';
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

        $logs = ExerciseLog::where('user_id', $this->user->id)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date', 'desc')
            ->get();

        $totalCalories = (float) $logs->sum('calories_burned');
        $totalDuration = (int) $logs->sum('duration_minutes');

        $mappedLogs = $logs->map(function (ExerciseLog $log) {
            return [
                'id' => $log->id,
                'date' => $log->date->format('Y-m-d'),
                'name' => $log->name,
                'exercise_type' => $log->exercise_type,
                'duration_minutes' => $log->duration_minutes,
                'calories_burned' => (float) $log->calories_burned,
                'notes' => $log->notes,
            ];
        });

        return (string) json_encode([
            'window_days' => $days,
            'total_sessions' => $logs->count(),
            'total_calories_burned' => round($totalCalories, 2),
            'total_duration_minutes' => $totalDuration,
            'logs' => $mappedLogs->values()->all(),
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
