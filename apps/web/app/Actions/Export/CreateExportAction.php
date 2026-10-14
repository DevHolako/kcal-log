<?php

namespace App\Actions\Export;

use App\DTOs\Export\CreateExportDTO;
use App\Models\ReportExport;
use App\Models\User;
use App\Services\ExportService;

class CreateExportAction
{
    public function __construct(
        protected ExportService $exportService
    ) {}

    /**
     * Request and generate a data export or PDF report.
     */
    public function execute(User $user, CreateExportDTO $dto): ReportExport
    {
        return $this->exportService->requestExport(
            $user,
            $dto->type,
            $dto->dateFrom,
            $dto->dateTo,
            $dto->async
        );
    }
}
