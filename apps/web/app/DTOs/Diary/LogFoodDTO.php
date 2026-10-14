<?php

namespace App\DTOs\Diary;

use App\Http\Requests\Diary\StoreDiaryEntryRequest;
use Illuminate\Http\Request;

readonly class LogFoodDTO
{
    public function __construct(
        public int $foodId,
        public ?int $foodServingId,
        public string $date,
        public string $mealSlot,
        public float $quantity = 1.0,
        public ?float $customGrams = null,
    ) {}

    /**
     * @param  array{
     *     food_id: int|string,
     *     food_serving_id?: int|string|null,
     *     date: string,
     *     meal_slot: string,
     *     quantity?: float|int|string|null,
     *     custom_grams?: float|int|string|null
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            foodId: (int) $data['food_id'],
            foodServingId: ! empty($data['food_serving_id']) ? (int) $data['food_serving_id'] : null,
            date: (string) $data['date'],
            mealSlot: (string) $data['meal_slot'],
            quantity: isset($data['quantity']) ? (float) $data['quantity'] : 1.0,
            customGrams: ! empty($data['custom_grams']) ? (float) $data['custom_grams'] : null,
        );
    }

    public static function fromRequest(StoreDiaryEntryRequest|Request $request): self
    {
        /** @var array{
         *     food_id: int|string,
         *     food_serving_id?: int|string|null,
         *     date: string,
         *     meal_slot: string,
         *     quantity?: float|int|string|null,
         *     custom_grams?: float|int|string|null
         * } $validated */
        $validated = $request instanceof StoreDiaryEntryRequest
            ? $request->validated()
            : $request->validate([
                'food_id' => ['required', 'integer', 'exists:foods,id'],
                'food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
                'date' => ['required', 'date_format:Y-m-d'],
                'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
                'quantity' => ['nullable', 'numeric', 'min:0.01', 'max:100'],
                'custom_grams' => ['nullable', 'numeric', 'min:0.1', 'max:10000'],
            ]);

        return self::fromArray($validated);
    }
}
