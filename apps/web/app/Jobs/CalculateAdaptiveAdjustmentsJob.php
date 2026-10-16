<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\AdaptiveAdjustmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateAdaptiveAdjustmentsJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds after which the job's unique lock will be released.
     */
    public int $uniqueFor = 3600;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ?int $userId = null
    ) {
        $this->onQueue('adaptive');
    }

    /**
     * The unique ID of the job.
     */
    public function uniqueId(): string
    {
        return $this->userId
            ? 'adaptive_user_'.$this->userId.'_'.now()->format('Y-W')
            : 'adaptive_batch_all_'.now()->format('Y-m-d');
    }

    /**
     * Get the tags that should be assigned to the job for Horizon tracing.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return [
            'adaptive:checkpoint',
            $this->userId ? 'user:'.$this->userId : 'batch:all',
            'week:'.now()->format('Y-W'),
        ];
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
