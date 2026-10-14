<?php

namespace App\Http\Requests\Diary;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class QuickAddRequest extends FormRequest
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
            'date' => ['required', 'date_format:Y-m-d'],
            'meal_slot' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'calories' => ['required', 'numeric', 'min:1', 'max:10000'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
