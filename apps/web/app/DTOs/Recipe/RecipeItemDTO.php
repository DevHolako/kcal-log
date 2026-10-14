<?php

namespace App\DTOs\Recipe;

readonly class RecipeItemDTO
{
    public function __construct(
        public int $foodId,
        public ?int $foodServingId,
        public float $quantity,
        public float $grams,
    ) {}

    /**
     * @param  array{
     *     food_id: int|string,
     *     food_serving_id?: int|string|null,
     *     quantity: float|int|string,
     *     grams: float|int|string
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            foodId: (int) $data['food_id'],
            foodServingId: ! empty($data['food_serving_id']) ? (int) $data['food_serving_id'] : null,
            quantity: (float) $data['quantity'],
            grams: (float) $data['grams'],
        );
    }

    /**
     * @return array{food_id: int, food_serving_id: ?int, quantity: float, grams: float}
     */
    public function toArray(): array
    {
        return [
            'food_id' => $this->foodId,
            'food_serving_id' => $this->foodServingId,
            'quantity' => $this->quantity,
            'grams' => $this->grams,
        ];
    }
}
