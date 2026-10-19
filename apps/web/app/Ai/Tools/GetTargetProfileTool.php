<?php

namespace App\Ai\Tools;

use App\Models\TargetProfile;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetTargetProfileTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return "Retrieve the user's active baseline nutrition targets, including daily calories, protein, carbs, fat goals, and BMR/TDEE calculations.";
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        /** @var TargetProfile|null $target */
        $target = $this->user->activeTargetProfile
            ?? TargetProfile::where('user_id', $this->user->id)
                ->where('is_active', true)
                ->latest('id')
                ->first();

        if (! $target) {
            return (string) json_encode([
                'has_active_target' => false,
                'message' => 'User does not have an active target profile configured.',
            ]);
        }

        return (string) json_encode([
            'has_active_target' => true,
            'calorie_target' => (float) $target->calories,
            'protein_target' => (float) $target->protein_g,
            'carb_target' => (float) $target->carbs_g,
            'fat_target' => (float) $target->fat_g,
            'fiber_target' => $target->fiber_g ? (float) $target->fiber_g : null,
            'water_ml_target' => $target->water_ml ? (int) $target->water_ml : null,
            'bmr' => $target->bmr ? (float) $target->bmr : null,
            'tdee' => $target->tdee ? (float) $target->tdee : null,
            'goal_type' => $target->goal_type,
            'diet_type' => $target->diet_type,
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
