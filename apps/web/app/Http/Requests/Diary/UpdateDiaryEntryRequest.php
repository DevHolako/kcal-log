<?php

namespace App\Http\Requests\Diary;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDiaryEntryRequest extends FormRequest
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
            'meal_slot' => ['sometimes', 'required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'food_serving_id' => ['nullable', 'integer', 'exists:food_servings,id'],
            'quantity' => ['nullable', 'numeric', 'min:0.01', 'max:100'],
            'custom_grams' => ['nullable', 'numeric', 'min:0.1', 'max:10000'],
        ];
    }
}
