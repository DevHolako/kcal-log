<?php

namespace App\Http\Requests\Food;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomFoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
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
        ];
    }
}
