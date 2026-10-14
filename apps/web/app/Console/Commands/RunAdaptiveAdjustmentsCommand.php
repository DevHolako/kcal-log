<?php

namespace App\Console\Commands;

use App\Jobs\CalculateAdaptiveAdjustmentsJob;
use Illuminate\Console\Command;

class RunAdaptiveAdjustmentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adaptive:calculate {--user= : Optional specific user ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Trigger weekly EWMA adaptive adjustment calculation for users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $userId = $this->option('user') ? (int) $this->option('user') : null;

        $this->info($userId ? "Queuing adaptive adjustment for user #{$userId}..." : 'Queuing adaptive adjustments for active users...');

        CalculateAdaptiveAdjustmentsJob::dispatch($userId);

        $this->info('Job dispatched successfully.');

        return Command::SUCCESS;
    }
}
