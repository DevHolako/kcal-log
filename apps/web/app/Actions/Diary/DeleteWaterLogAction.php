<?php

namespace App\Actions\Diary;

use App\Events\DiaryUpdated;
use App\Models\User;
use App\Models\WaterLog;

class DeleteWaterLogAction
{
    /**
     * Delete a water log entry.
     */
    public function execute(User $user, WaterLog $waterLog): bool
    {
        if ($waterLog->user_id !== $user->id) {
            abort(403, 'Unauthorized action on water log.');
        }

        $date = $waterLog->date->format('Y-m-d');
        $waterLogId = $waterLog->id;

        $deleted = (bool) $waterLog->delete();

        if ($deleted) {
            DiaryUpdated::dispatch($user->id, $date, 'water_deleted', [
                'water_log_id' => $waterLogId,
            ]);
        }

        return $deleted;
    }
}
