<?php

namespace App\Actions\Diary;

use App\DTOs\Diary\LogWaterDTO;
use App\Events\DiaryUpdated;
use App\Models\User;
use App\Models\WaterLog;

class LogWaterAction
{
    /**
     * Log water intake in milliliters.
     */
    public function execute(User $user, LogWaterDTO $dto): WaterLog
    {
        /** @var WaterLog $log */
        $log = WaterLog::create([
            'user_id' => $user->id,
            'date' => $dto->date,
            'amount_ml' => $dto->amountMl,
        ]);

        DiaryUpdated::dispatch($user->id, $dto->date, 'water_logged', [
            'water_log_id' => $log->id,
            'amount_ml' => $dto->amountMl,
        ]);

        return $log;
    }
}
