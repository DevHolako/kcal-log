<?php

namespace App\DTOs\Export;

use App\Http\Requests\Reports\StoreExportRequest;
use Illuminate\Http\Request;

readonly class CreateExportDTO
{
    public function __construct(
        public string $type,
        public string $dateFrom,
        public string $dateTo,
        public bool $async = false,
    ) {}

    /**
     * @param  array{
     *     type: string,
     *     date_from: string,
     *     date_to: string,
     *     async?: bool|null
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            type: (string) $data['type'],
            dateFrom: (string) $data['date_from'],
            dateTo: (string) $data['date_to'],
            async: ! empty($data['async']),
        );
    }

    public static function fromRequest(StoreExportRequest|Request $request, ?bool $async = null): self
    {
        /** @var array{
         *     type: string,
         *     date_from: string,
         *     date_to: string
         * } $validated */
        $validated = $request instanceof StoreExportRequest
            ? $request->validated()
            : $request->validate([
                'type' => ['required', 'string', 'in:pdf,csv,json'],
                'date_from' => ['required', 'date_format:Y-m-d'],
                'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            ]);

        $shouldAsync = $async !== null
            ? $async
            : (! app()->environment('testing', 'local') && config('queue.default') !== 'sync');

        return new self(
            type: (string) $validated['type'],
            dateFrom: (string) $validated['date_from'],
            dateTo: (string) $validated['date_to'],
            async: $shouldAsync,
        );
    }
}
