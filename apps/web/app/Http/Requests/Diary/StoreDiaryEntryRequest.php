<?php

namespace App\Http\Requests\Diary;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiaryEntryRequest extends FormRequest
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
            'food_id' => ['required', 'integer', 'exists:foods,id'],
            'food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'quantity' => ['nullable', 'numeric', 'min:0.01', 'max:100'],
            'custom_grams' => ['nullable', 'numeric', 'min:0.1', 'max:10000'],
        ];
    }
}
