<?php

namespace App\Ai\Tools;

use App\Models\DiaryEntry;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetDiaryEntriesTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Retrieve specific food entries, portions, and meal slots logged by the user for a date or date range (max 30 days).';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $startDateStr = (string) ($request['start_date'] ?? now()->format('Y-m-d'));
        $endDateStr = (string) ($request['end_date'] ?? $startDateStr);
        $mealSlot = $request['meal_slot'] ?? null;

        $startDate = Carbon::parse($startDateStr);
        $endDate = Carbon::parse($endDateStr);

        $rangeClamped = false;
        if ($startDate->diffInDays($endDate) > 30) {
            $endDate = $startDate->copy()->addDays(30);
            $rangeClamped = true;
        }

        $query = DiaryEntry::where('user_id', $this->user->id)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with(['food', 'serving'])
            ->orderBy('date', 'desc');

        if ($mealSlot) {
            $query->where('meal_slot', $mealSlot);
        }

        $entries = $query->get()->map(function (DiaryEntry $entry) {
            return [
                'id' => $entry->id,
                'date' => $entry->date ? $entry->date->format('Y-m-d') : null,
                'meal_slot' => $entry->meal_slot,
                'food_name' => $entry->food ? $entry->food->name : 'Unknown Food',
                'quantity' => (float) $entry->quantity,
                'unit' => $entry->unit,
                'grams' => (float) $entry->grams,
                'calories' => (float) $entry->calories,
                'protein' => (float) $entry->protein,
                'carbs' => (float) $entry->carbs,
                'fat' => (float) $entry->fat,
            ];
        });

        return (string) json_encode([
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'range_clamped' => $rangeClamped,
            'total_entries' => $entries->count(),
            'entries' => $entries->values()->all(),
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'start_date' => $schema->string()->description('Start date in YYYY-MM-DD format (defaults to current date).'),
            'end_date' => $schema->string()->description('End date in YYYY-MM-DD format (defaults to start_date).'),
            'meal_slot' => $schema->string()->description('Optional meal slot filter (breakfast, lunch, dinner, snack).'),
        ];
    }
}
