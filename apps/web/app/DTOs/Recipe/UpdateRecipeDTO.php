<?php

namespace App\DTOs\Recipe;

use Illuminate\Http\Request;

readonly class UpdateRecipeDTO
{
    /**
     * @param  list<RecipeItemDTO>  $items
     */
    public function __construct(
        public string $name,
        public ?string $description,
        public float $servings,
        public array $items,
    ) {}

    /**
     * @param  array{
     *     name: string,
     *     description?: ?string,
     *     servings: float|int|string,
     *     items: list<array{
     *         food_id: int|string,
     *         food_serving_id?: int|string|null,
     *         quantity: float|int|string,
     *         grams: float|int|string
     *     }>
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        $items = array_map(
            fn (array $item) => RecipeItemDTO::fromArray($item),
            $data['items']
        );

        return new self(
            name: (string) $data['name'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            servings: (float) $data['servings'],
            items: $items,
        );
    }

    public static function fromRequest(Request $request): self
    {
        /** @var array{
         *     name: string,
         *     description?: ?string,
         *     servings: float|int|string,
         *     items: list<array{
         *         food_id: int|string,
         *         food_serving_id?: int|string|null,
         *         quantity: float|int|string,
         *         grams: float|int|string
         *     }>
         * } $validated */
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'servings' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'integer', 'exists:foods,id'],
            'items.*.food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.grams' => ['required', 'numeric', 'min:0.01'],
        ]);

        return self::fromArray($validated);
    }
}
