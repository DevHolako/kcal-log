<?php

namespace App\Console\Commands;

use App\Jobs\SyncOpenFoodFactsJob;
use App\Services\FoodService;
use App\Services\OpenFoodFactsService;
use Illuminate\Console\Command;

class SyncOpenFoodFactsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'off:sync
        {--terms= : Comma-separated list of search terms (e.g. "chicken,oats,milk")}
        {--pages=1 : Number of search result pages per term}
        {--page-size=20 : Number of items per page}
        {--no-stale : Skip refreshing existing stale foods}
        {--sync : Run synchronously in foreground instead of queuing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch staple and popular foods from Open Food Facts and sync them to local database';

    /**
     * Execute the console command.
     */
    public function handle(OpenFoodFactsService $offService, FoodService $foodService): int
    {
        $rawTerms = $this->option('terms');
        $terms = $rawTerms
            ? array_values(array_filter(array_map('trim', explode(',', (string) $rawTerms))))
            : null;

        $pages = max(1, (int) $this->option('pages'));
        $pageSize = max(1, (int) $this->option('page-size'));
        $refreshStale = ! $this->option('no-stale');
        $runSync = (bool) $this->option('sync');

        $job = new SyncOpenFoodFactsJob(
            terms: $terms,
            pagesPerTerm: $pages,
            pageSize: $pageSize,
            refreshStale: $refreshStale,
            sleepMs: $runSync ? 100 : 0,
        );

        if ($runSync) {
            $this->info('Running Open Food Facts sync synchronously in foreground...');
            $result = $job->handle($offService, $foodService);
            $this->info("Sync completed: {$result['saved']} foods cached, {$result['refreshed']} refreshed, {$result['failed_queries']} failed queries.");

            return Command::SUCCESS;
        }

        $this->info('Dispatching SyncOpenFoodFactsJob to default queue...');
        dispatch($job);
        $this->info('Open Food Facts sync job dispatched successfully.');

        return Command::SUCCESS;
    }
}
