<?php

namespace App\DTOs\Diary;

use App\Http\Requests\Diary\UpdateDiaryEntryRequest;
use Illuminate\Http\Request;

readonly class UpdateFoodLogDTO
{
    public function __construct(
        public ?string $mealSlot = null,
        public ?int $foodServingId = null,
        public bool $hasFoodServingId = false,
        public ?float $quantity = null,
        public ?float $customGrams = null,
    ) {}

    /**
     * @param  array{
     *     meal_slot?: string|null,
     *     food_serving_id?: int|string|null,
     *     quantity?: float|int|string|null,
     *     custom_grams?: float|int|string|null
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            mealSlot: isset($data['meal_slot']) ? (string) $data['meal_slot'] : null,
            foodServingId: ! empty($data['food_serving_id']) ? (int) $data['food_serving_id'] : null,
            hasFoodServingId: array_key_exists('food_serving_id', $data),
            quantity: isset($data['quantity']) ? (float) $data['quantity'] : null,
            customGrams: ! empty($data['custom_grams']) ? (float) $data['custom_grams'] : null,
        );
    }

    public static function fromRequest(UpdateDiaryEntryRequest|Request $request): self
    {
        /** @var array{
         *     meal_slot?: string|null,
         *     food_serving_id?: int|string|null,
         *     quantity?: float|int|string|null,
         *     custom_grams?: float|int|string|null
         * } $validated */
        $validated = $request instanceof UpdateDiaryEntryRequest
            ? $request->validated()
            : $request->validate([
                'meal_slot' => ['sometimes', 'required', 'string', 'in:breakfast,lunch,dinner,snack'],
                'food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
                'quantity' => ['nullable', 'numeric', 'min:0.01', 'max:100'],
                'custom_grams' => ['nullable', 'numeric', 'min:0.1', 'max:10000'],
            ]);

        return self::fromArray($validated);
    }
}
