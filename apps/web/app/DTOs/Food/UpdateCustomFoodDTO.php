<?php

namespace App\DTOs\Food;

use App\Http\Requests\Food\UpdateCustomFoodRequest;
use Illuminate\Http\Request;

readonly class UpdateCustomFoodDTO
{
    /**
     * @param  list<array{serving_name: string, gram_equivalent: float, is_default?: bool}>|null  $servings
     */
    public function __construct(
        public ?string $name = null,
        public ?string $brand = null,
        public ?string $barcode = null,
        public ?float $servingSize = null,
        public ?string $servingUnit = null,
        public ?float $calories = null,
        public ?float $protein = null,
        public ?float $carbs = null,
        public ?float $fat = null,
        public ?float $fiber = null,
        public ?float $sugar = null,
        public ?float $saturatedFat = null,
        public ?float $sodium = null,
        public ?array $servings = null,
    ) {}

    /**
     * @param  array{
     *     name?: ?string,
     *     brand?: ?string,
     *     barcode?: ?string,
     *     serving_size?: float|int|string|null,
     *     serving_unit?: ?string,
     *     calories?: float|int|string|null,
     *     protein?: float|int|string|null,
     *     carbs?: float|int|string|null,
     *     fat?: float|int|string|null,
     *     fiber?: float|int|string|null,
     *     sugar?: float|int|string|null,
     *     saturated_fat?: float|int|string|null,
     *     sodium?: float|int|string|null,
     *     servings?: list<array{serving_name: string, gram_equivalent: float, is_default?: bool}>|null
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: isset($data['name']) ? (string) $data['name'] : null,
            brand: isset($data['brand']) ? (string) $data['brand'] : null,
            barcode: isset($data['barcode']) ? (string) $data['barcode'] : null,
            servingSize: isset($data['serving_size']) ? (float) $data['serving_size'] : null,
            servingUnit: isset($data['serving_unit']) ? (string) $data['serving_unit'] : null,
            calories: isset($data['calories']) ? (float) $data['calories'] : null,
            protein: isset($data['protein']) ? (float) $data['protein'] : null,
            carbs: isset($data['carbs']) ? (float) $data['carbs'] : null,
            fat: isset($data['fat']) ? (float) $data['fat'] : null,
            fiber: isset($data['fiber']) ? (float) $data['fiber'] : null,
            sugar: isset($data['sugar']) ? (float) $data['sugar'] : null,
            saturatedFat: isset($data['saturated_fat']) ? (float) $data['saturated_fat'] : null,
            sodium: isset($data['sodium']) ? (float) $data['sodium'] : null,
            servings: $data['servings'] ?? null,
        );
    }

    public static function fromRequest(UpdateCustomFoodRequest|Request $request): self
    {
        /** @var array{
         *     name?: ?string,
         *     brand?: ?string,
         *     barcode?: ?string,
         *     serving_size?: float|int|string|null,
         *     serving_unit?: ?string,
         *     calories?: float|int|string|null,
         *     protein?: float|int|string|null,
         *     carbs?: float|int|string|null,
         *     fat?: float|int|string|null,
         *     fiber?: float|int|string|null,
         *     sugar?: float|int|string|null,
         *     saturated_fat?: float|int|string|null,
         *     sodium?: float|int|string|null,
         *     servings?: list<array{serving_name: string, gram_equivalent: float, is_default?: bool}>|null
         * } $validated */
        $validated = $request instanceof UpdateCustomFoodRequest
            ? $request->validated()
            : $request->validate([
                'name' => ['sometimes', 'required', 'string', 'max:255'],
                'brand' => ['nullable', 'string', 'max:255'],
                'barcode' => ['nullable', 'string', 'max:64'],
                'serving_size' => ['sometimes', 'required', 'numeric', 'min:0.01', 'max:10000'],
                'serving_unit' => ['sometimes', 'required', 'string', 'max:32'],
                'calories' => ['sometimes', 'required', 'numeric', 'min:0', 'max:5000'],
                'protein' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000'],
                'carbs' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000'],
                'fat' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000'],
                'fiber' => ['nullable', 'numeric', 'min:0', 'max:500'],
                'sugar' => ['nullable', 'numeric', 'min:0', 'max:500'],
                'saturated_fat' => ['nullable', 'numeric', 'min:0', 'max:500'],
                'sodium' => ['nullable', 'numeric', 'min:0', 'max:50000'],
                'servings' => ['nullable', 'array'],
                'servings.*.serving_name' => ['required_with:servings', 'string', 'max:100'],
                'servings.*.gram_equivalent' => ['required_with:servings', 'numeric', 'min:0.01', 'max:10000'],
                'servings.*.is_default' => ['nullable', 'boolean'],
            ]);

        return self::fromArray($validated);
    }

    /**
     * @return array<string, mixed>
     */
    public function toModelAttributes(): array
    {
        $attributes = [];
        if ($this->name !== null) {
            $attributes['name'] = $this->name;
        }
        if ($this->brand !== null) {
            $attributes['brand'] = $this->brand;
        }
        if ($this->barcode !== null) {
            $attributes['barcode'] = $this->barcode;
        }
        if ($this->servingSize !== null) {
            $attributes['serving_size'] = $this->servingSize;
        }
        if ($this->servingUnit !== null) {
            $attributes['serving_unit'] = $this->servingUnit;
        }
        if ($this->calories !== null) {
            $attributes['calories'] = $this->calories;
        }
        if ($this->protein !== null) {
            $attributes['protein'] = $this->protein;
        }
        if ($this->carbs !== null) {
            $attributes['carbs'] = $this->carbs;
        }
        if ($this->fat !== null) {
            $attributes['fat'] = $this->fat;
        }
        if ($this->fiber !== null) {
            $attributes['fiber'] = $this->fiber;
        }
        if ($this->sugar !== null) {
            $attributes['sugar'] = $this->sugar;
        }
        if ($this->saturatedFat !== null) {
            $attributes['saturated_fat'] = $this->saturatedFat;
        }
        if ($this->sodium !== null) {
            $attributes['sodium'] = $this->sodium;
        }

        return $attributes;
    }
}
