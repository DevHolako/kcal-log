<?php

namespace App\Ai\Agents;

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
        $target = TargetProfile::where('user_id', $this->user->id)->first();

        $targetContext = 'No baseline TargetProfile configured yet.';
        if ($target) {
            $targetContext = sprintf(
                'Active Daily Target: %s kcal (Protein: %sg, Carbs: %sg, Fat: %sg, BMR: %s kcal).',
                $target->calorie_target,
                $target->protein_target,
                $target->carb_target,
                $target->fat_target,
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
        return [];
    }
}
