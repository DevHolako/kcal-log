<?php

namespace App\DTOs\Diary;

use App\Http\Requests\Diary\StoreWaterLogRequest;
use Illuminate\Http\Request;

readonly class LogWaterDTO
{
    public function __construct(
        public string $date,
        public int $amountMl,
    ) {}

    /**
     * @param  array{
     *     date: string,
     *     amount_ml: int|string
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            date: (string) $data['date'],
            amountMl: (int) $data['amount_ml'],
        );
    }

    public static function fromRequest(StoreWaterLogRequest|Request $request): self
    {
        /** @var array{
         *     date: string,
         *     amount_ml: int|string
         * } $validated */
        $validated = $request instanceof StoreWaterLogRequest
            ? $request->validated()
            : $request->validate([
                'date' => ['required', 'date_format:Y-m-d'],
                'amount_ml' => ['required', 'integer', 'min:1', 'max:10000'],
            ]);

        return self::fromArray($validated);
    }
}
