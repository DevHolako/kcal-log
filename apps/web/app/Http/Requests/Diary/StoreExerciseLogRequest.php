<?php

namespace App\Http\Requests\Diary;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExerciseLogRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'exercise_type' => ['required', 'string', 'in:cardio,strength,other'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'calories_burned' => ['required', 'numeric', 'min:0', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
