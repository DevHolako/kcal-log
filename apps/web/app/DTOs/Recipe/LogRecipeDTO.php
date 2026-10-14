<?php

namespace App\DTOs\Recipe;

use Illuminate\Http\Request;

readonly class LogRecipeDTO
{
    public function __construct(
        public string $date,
        public string $mealSlot,
        public float $servings = 1.0,
        public bool $logAsIndividual = true,
    ) {}

    /**
     * @param  array{
     *     date: string,
     *     meal_slot: string,
     *     servings?: float|int|string|null,
     *     log_as_individual?: bool|int|string|null
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            date: (string) $data['date'],
            mealSlot: (string) $data['meal_slot'],
            servings: isset($data['servings']) ? (float) $data['servings'] : 1.0,
            logAsIndividual: isset($data['log_as_individual']) ? (bool) $data['log_as_individual'] : true,
        );
    }

    public static function fromRequest(Request $request): self
    {
        /** @var array{
         *     date: string,
         *     meal_slot: string,
         *     servings?: float|int|string|null,
         *     log_as_individual?: bool|int|string|null
         * } $validated */
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'servings' => ['nullable', 'numeric', 'min:0.1', 'max:50'],
            'log_as_individual' => ['nullable', 'boolean'],
        ]);

        return self::fromArray($validated);
    }
}
