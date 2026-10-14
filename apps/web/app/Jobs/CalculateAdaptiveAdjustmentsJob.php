<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\AdaptiveAdjustmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateAdaptiveAdjustmentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?int $userId = null
    ) {
        $this->onQueue('default');
    }

    /**
     * Execute the job.
     */
    public function handle(AdaptiveAdjustmentService $adaptiveService): void
    {
        if ($this->userId) {
            $user = User::find($this->userId);
            if ($user) {
                $adaptiveService->calculateWeeklyAdjustment($user);
            }

            return;
        }

        // Process all users who have active target profiles
        User::whereHas('targetProfiles', function ($q) {
            $q->where('is_active', true);
        })->chunk(100, function ($users) use ($adaptiveService) {
            foreach ($users as $user) {
                $adaptiveService->calculateWeeklyAdjustment($user);
            }
        });
    }
}
