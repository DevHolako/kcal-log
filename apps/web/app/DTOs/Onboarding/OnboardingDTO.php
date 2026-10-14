<?php

namespace App\DTOs\Onboarding;

use App\Http\Requests\CompleteOnboardingRequest;
use Illuminate\Http\Request;

readonly class OnboardingDTO
{
    /**
     * @param  array{protein?: float, carbs?: float, fat?: float}  $customPercentages
     */
    public function __construct(
        public string $dateOfBirth,
        public string $sex,
        public float $heightCm,
        public float $currentWeightKg,
        public string $activityLevel,
        public string $goalType,
        public float $weeklyRateKg = 0.0,
        public string $dietType = 'balanced',
        public array $customPercentages = [],
        public ?string $timezone = null,
        public ?string $locale = null,
        public ?string $unitPreference = null,
        public ?string $themePreference = null,
    ) {}

    public static function fromRequest(CompleteOnboardingRequest|Request $request): self
    {
        $data = $request instanceof CompleteOnboardingRequest
            ? $request->validated()
            : $request->all();

        return self::fromArray($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $weeklyRate = isset($data['weekly_rate_kg']) ? (float) $data['weekly_rate_kg'] : 0.0;
        if (($data['goal_type'] ?? '') === 'maintain') {
            $weeklyRate = 0.0;
        }

        return new self(
            dateOfBirth: (string) $data['date_of_birth'],
            sex: (string) $data['sex'],
            heightCm: (float) $data['height_cm'],
            currentWeightKg: (float) $data['current_weight_kg'],
            activityLevel: (string) $data['activity_level'],
            goalType: (string) $data['goal_type'],
            weeklyRateKg: $weeklyRate,
            dietType: (string) ($data['diet_type'] ?? 'balanced'),
            customPercentages: is_array($data['custom_percentages'] ?? null) ? $data['custom_percentages'] : [],
            timezone: isset($data['timezone']) ? (string) $data['timezone'] : null,
            locale: isset($data['locale']) ? (string) $data['locale'] : null,
            unitPreference: isset($data['unit_preference']) ? (string) $data['unit_preference'] : null,
            themePreference: isset($data['theme_preference']) ? (string) $data['theme_preference'] : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'date_of_birth' => $this->dateOfBirth,
            'sex' => $this->sex,
            'height_cm' => $this->heightCm,
            'current_weight_kg' => $this->currentWeightKg,
            'activity_level' => $this->activityLevel,
            'goal_type' => $this->goalType,
            'weekly_rate_kg' => $this->weeklyRateKg,
            'diet_type' => $this->dietType,
            'custom_percentages' => $this->customPercentages,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'unit_preference' => $this->unitPreference,
            'theme_preference' => $this->themePreference,
        ];
    }
}
