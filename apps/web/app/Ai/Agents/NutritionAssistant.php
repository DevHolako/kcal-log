<?php

namespace App\Ai\Agents;

use App\Ai\Tools\GetBodyMeasurementsTool;
use App\Ai\Tools\GetDailySummaryTool;
use App\Ai\Tools\GetDiaryEntriesTool;
use App\Ai\Tools\GetExerciseLogsTool;
use App\Ai\Tools\GetTargetProfileTool;
use App\Ai\Tools\GetWeightHistoryTool;
use App\Ai\Tools\SearchFoodDatabaseTool;
use App\Models\AiConversation;
use App\Models\TargetProfile;
use App\Models\User;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Promptable;
use Stringable;

class NutritionAssistant implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(
        public User $user,
        public ?AiConversation $conversation = null,
    ) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $today = now()->format('Y-m-d, l');
        /** @var TargetProfile|null $target */
        $target = $this->user->activeTargetProfile
            ?? TargetProfile::where('user_id', $this->user->id)->where('is_active', true)->latest('id')->first();

        $targetContext = 'No baseline TargetProfile configured yet.';
        if ($target) {
            $targetContext = sprintf(
                'Active Daily Target: %s kcal (Protein: %sg, Carbs: %sg, Fat: %sg, BMR: %s kcal).',
                $target->calories,
                $target->protein_g,
                $target->carbs_g,
                $target->fat_g,
                $target->bmr ?? 'N/A'
            );
        }

        return <<<INSTRUCTIONS
You are NutritionAssistant, the personal AI nutrition and diet coaching assistant in kcal-log.
Temporal Context: Today is {$today}.
User Profile: {$targetContext}

Core Principles:
1. Provide encouraging, supportive, and evidence-based nutrition feedback.
2. Ground all answers in the user's active targets and recorded food intake.
3. Be concise and format macros, calories, and food breakdowns cleanly using markdown lists or tables when helpful.
4. When asked about today or specific dates, reference the user's logged foods and daily summaries.
5. Factor in the user's physical activities (exercise sessions, duration, calories burned) and body circumference measurements (waist, hips, chest, etc.) when assessing daily balance, energy expenditure, and anthropometric trends.
6. Multi-Regional & Moroccan Food Fluency:
   - Provide natural, culturally accurate nutritional insights across English, French, Arabic, and Moroccan Darija (in Arabic or Arabizi/Latin script, e.g. "zlafa dial harira", "msemen", "khobz", "djaj", "lhem", "atay", "tajine", "batbout", "amlou").
   - When users mention traditional Moroccan or Mediterranean meals, utilize standard food composition benchmarks (such as the Moroccan Table of Food Composition / TMCA, CIQUAL, and USDA) to provide realistic portion estimates (e.g. 1 zlafa = ~300g, 1 piece msemen = ~100g, 1/4 khobz = ~100g) and nutritional macronutrient breakdowns.
   - Use the SearchFoodDatabaseTool to query verified generic whole foods, Moroccan traditional staples, and user-created custom foods.
INSTRUCTIONS;
    }

    /**
     * Get the sliding window of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        if (! $this->conversation) {
            return [];
        }

        $records = $this->conversation->messages()
            ->latest('id')
            ->take(10)
            ->get()
            ->reverse();

        $messages = [];
        foreach ($records as $msg) {
            if ($msg->role === 'user') {
                $messages[] = new UserMessage((string) $msg->content);
            } elseif ($msg->role === 'assistant') {
                $messages[] = new AssistantMessage((string) $msg->content);
            }
        }

        return $messages;
    }

    /**
     * Get the tools available to the agent.
     */
    public function tools(): iterable
    {
        return [
            new GetDailySummaryTool($this->user),
            new GetDiaryEntriesTool($this->user),
            new GetTargetProfileTool($this->user),
            new SearchFoodDatabaseTool($this->user),
            new GetWeightHistoryTool($this->user),
            new GetExerciseLogsTool($this->user),
            new GetBodyMeasurementsTool($this->user),
        ];
    }
}
