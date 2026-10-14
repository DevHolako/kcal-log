<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CompleteOnboardingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date_of_birth' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'sex' => ['required', 'in:male,female'],
            'height_cm' => ['required', 'numeric', 'min:50', 'max:280'],
            'current_weight_kg' => ['required', 'numeric', 'min:20', 'max:500'],
            'activity_level' => [
                'required',
                'in:sedentary,lightly_active,moderately_active,very_active,extremely_active',
            ],
            'goal_type' => ['required', 'in:lose,maintain,gain'],
            'weekly_rate_kg' => ['nullable', 'numeric', 'min:-1.5', 'max:1.0'],
            'diet_type' => ['nullable', 'in:balanced,low_carb,high_protein,keto,custom'],
            'custom_percentages' => ['nullable', 'array'],
            'custom_percentages.protein' => ['nullable', 'numeric', 'min:0.05', 'max:0.80'],
            'custom_percentages.carbs' => ['nullable', 'numeric', 'min:0.00', 'max:0.80'],
            'custom_percentages.fat' => ['nullable', 'numeric', 'min:0.05', 'max:0.80'],
            'timezone' => ['nullable', 'string'],
            'locale' => ['nullable', 'in:en,fr'],
            'unit_preference' => ['nullable', 'in:metric,imperial'],
            'theme_preference' => ['nullable', 'in:system,light,dark'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('diet_type') === 'custom') {
                $custom = $this->input('custom_percentages', []);
                $protein = (float) ($custom['protein'] ?? 0);
                $carbs = (float) ($custom['carbs'] ?? 0);
                $fat = (float) ($custom['fat'] ?? 0);
                $sum = round($protein + $carbs + $fat, 2);

                if ($sum < 0.99 || $sum > 1.01) {
                    $validator->errors()->add(
                        'custom_percentages',
                        'The custom macronutrient percentages must sum to 100% (currently '.round($sum * 100).'%).'
                    );
                }
            }
        });
    }

    /**
     * @return array{
     *     date_of_birth: string,
     *     sex: string,
     *     height_cm: float,
     *     current_weight_kg: float,
     *     activity_level: string,
     *     goal_type: string,
     *     weekly_rate_kg?: float,
     *     diet_type?: string,
     *     custom_percentages?: array{protein?: float, carbs?: float, fat?: float},
     *     timezone?: string,
     *     locale?: string,
     *     unit_preference?: string,
     *     theme_preference?: string
     * }
     */
    public function toPayload(): array
    {
        /** @var array{
         *     date_of_birth: string,
         *     sex: string,
         *     height_cm: float,
         *     current_weight_kg: float,
         *     activity_level: string,
         *     goal_type: string,
         *     weekly_rate_kg?: float,
         *     diet_type?: string,
         *     custom_percentages?: array{protein?: float, carbs?: float, fat?: float},
         *     timezone?: string,
         *     locale?: string,
         *     unit_preference?: string,
         *     theme_preference?: string
         * } $validated */
        $validated = $this->validated();

        return $validated;
    }
}
