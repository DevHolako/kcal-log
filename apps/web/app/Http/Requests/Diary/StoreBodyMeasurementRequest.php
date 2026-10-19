<?php

namespace App\Http\Requests\Diary;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBodyMeasurementRequest extends FormRequest
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
            'neck_cm' => ['nullable', 'numeric', 'min:10', 'max:150'],
            'waist_cm' => ['nullable', 'numeric', 'min:20', 'max:300'],
            'hips_cm' => ['nullable', 'numeric', 'min:20', 'max:300'],
            'chest_cm' => ['nullable', 'numeric', 'min:20', 'max:300'],
            'biceps_cm' => ['nullable', 'numeric', 'min:10', 'max:150'],
            'thighs_cm' => ['nullable', 'numeric', 'min:10', 'max:200'],
            'calves_cm' => ['nullable', 'numeric', 'min:10', 'max:150'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
