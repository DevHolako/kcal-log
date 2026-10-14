<?php

namespace App\DTOs\Diary;

use App\Http\Requests\Diary\QuickAddRequest;
use Illuminate\Http\Request;

readonly class QuickAddDTO
{
    public function __construct(
        public string $date,
        public string $mealSlot,
        public float $calories,
        public ?string $description = null,
    ) {}

    /**
     * @param  array{
     *     date: string,
     *     meal_slot: string,
     *     calories: float|int|string,
     *     description?: ?string
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            date: (string) $data['date'],
            mealSlot: (string) $data['meal_slot'],
            calories: (float) $data['calories'],
            description: isset($data['description']) ? (string) $data['description'] : null,
        );
    }

    public static function fromRequest(QuickAddRequest|Request $request): self
    {
        /** @var array{
         *     date: string,
         *     meal_slot: string,
         *     calories: float|int|string,
         *     description?: ?string
         * } $validated */
        $validated = $request instanceof QuickAddRequest
            ? $request->validated()
            : $request->validate([
                'date' => ['required', 'date_format:Y-m-d'],
                'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
                'calories' => ['required', 'numeric', 'min:1', 'max:10000'],
                'description' => ['nullable', 'string', 'max:255'],
            ]);

        return self::fromArray($validated);
    }
}
