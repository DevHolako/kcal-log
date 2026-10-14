<?php

namespace App\DTOs\Food;

use App\Http\Requests\Food\StoreCustomFoodRequest;
use Illuminate\Http\Request;

readonly class CreateCustomFoodDTO
{
    /**
     * @param  list<array{serving_name: string, gram_equivalent: float, is_default?: bool}>  $servings
     */
    public function __construct(
        public string $name,
        public ?string $brand,
        public ?string $barcode,
        public float $servingSize,
        public string $servingUnit,
        public float $calories,
        public float $protein,
        public float $carbs,
        public float $fat,
        public ?float $fiber = null,
        public ?float $sugar = null,
        public ?float $saturatedFat = null,
        public ?float $sodium = null,
        public array $servings = [],
    ) {}

    /**
     * @param  array{
     *     name: string,
     *     brand?: ?string,
     *     barcode?: ?string,
     *     serving_size: float|int|string,
     *     serving_unit: string,
     *     calories: float|int|string,
     *     protein: float|int|string,
     *     carbs: float|int|string,
     *     fat: float|int|string,
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
            name: (string) $data['name'],
            brand: isset($data['brand']) ? (string) $data['brand'] : null,
            barcode: isset($data['barcode']) ? (string) $data['barcode'] : null,
            servingSize: (float) $data['serving_size'],
            servingUnit: (string) $data['serving_unit'],
            calories: (float) $data['calories'],
            protein: (float) $data['protein'],
            carbs: (float) $data['carbs'],
            fat: (float) $data['fat'],
            fiber: isset($data['fiber']) ? (float) $data['fiber'] : null,
            sugar: isset($data['sugar']) ? (float) $data['sugar'] : null,
            saturatedFat: isset($data['saturated_fat']) ? (float) $data['saturated_fat'] : null,
            sodium: isset($data['sodium']) ? (float) $data['sodium'] : null,
            servings: $data['servings'] ?? [],
        );
    }

    public static function fromRequest(StoreCustomFoodRequest|Request $request): self
    {
        /** @var array{
         *     name: string,
         *     brand?: ?string,
         *     barcode?: ?string,
         *     serving_size: float|int|string,
         *     serving_unit: string,
         *     calories: float|int|string,
         *     protein: float|int|string,
         *     carbs: float|int|string,
         *     fat: float|int|string,
         *     fiber?: float|int|string|null,
         *     sugar?: float|int|string|null,
         *     saturated_fat?: float|int|string|null,
         *     sodium?: float|int|string|null,
         *     servings?: list<array{serving_name: string, gram_equivalent: float, is_default?: bool}>|null
         * } $validated */
        $validated = $request instanceof StoreCustomFoodRequest
            ? $request->validated()
            : $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'brand' => ['nullable', 'string', 'max:255'],
                'barcode' => ['nullable', 'string', 'max:64'],
                'serving_size' => ['required', 'numeric', 'min:0.01', 'max:10000'],
                'serving_unit' => ['required', 'string', 'max:32'],
                'calories' => ['required', 'numeric', 'min:0', 'max:5000'],
                'protein' => ['required', 'numeric', 'min:0', 'max:1000'],
                'carbs' => ['required', 'numeric', 'min:0', 'max:1000'],
                'fat' => ['required', 'numeric', 'min:0', 'max:1000'],
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
        return [
            'name' => $this->name,
            'brand' => $this->brand,
            'barcode' => $this->barcode,
            'serving_size' => $this->servingSize,
            'serving_unit' => $this->servingUnit,
            'calories' => $this->calories,
            'protein' => $this->protein,
            'carbs' => $this->carbs,
            'fat' => $this->fat,
            'fiber' => $this->fiber,
            'sugar' => $this->sugar,
            'saturated_fat' => $this->saturatedFat,
            'sodium' => $this->sodium,
        ];
    }
}
