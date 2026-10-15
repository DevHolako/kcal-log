<?php

namespace App\Jobs;

use App\Models\ReportExport;
use App\Services\ExportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessReportExportJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 180;

    /**
     * The number of seconds after which the job's unique lock will be released.
     */
    public int $uniqueFor = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ReportExport $export
    ) {
        $this->onQueue('reports');
    }

    /**
     * The unique ID of the job.
     */
    public function uniqueId(): string
    {
        return 'report_export_' . $this->export->id;
    }

    /**
     * Get the tags that should be assigned to the job for Horizon tracing.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return [
            'user:' . $this->export->user_id,
            'export:' . $this->export->id,
            'format:' . $this->export->type,
        ];
    }

    /**
     * Execute the job.
     */
    public function handle(ExportService $exportService): void
    {
        $exportService->generate($this->export);
    }
}
