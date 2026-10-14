<?php

namespace App\Actions\Profile;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class ResetTrackingDataAction
{
    /**
     * Reset all tracking logs, diary entries, targets, and profile metrics for a fresh start.
     */
    public function execute(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->diaryEntries()->delete();
            $user->weightLogs()->delete();
            $user->waterLogs()->delete();
            $user->bodyMeasurements()->delete();
            $user->exerciseLogs()->delete();
            $user->adaptiveAdjustments()->delete();
            $user->targetProfiles()->delete();
            $user->reportExports()->delete();
            $user->profile()->delete();
        });
    }
}
