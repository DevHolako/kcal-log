<?php

namespace App\Ai\Tools;

use App\Models\Food;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class SearchFoodDatabaseTool implements Tool
{
    public function __construct(
        protected User $user,
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Search the local food catalog and user custom foods for calorie and macronutrient values per 100g.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $queryStr = trim((string) ($request['query'] ?? ''));

        if (empty($queryStr)) {
            return (string) json_encode([
                'query' => '',
                'count' => 0,
                'foods' => [],
            ]);
        }

        $foods = Food::query()
            ->where(function ($q) {
                $q->where('is_custom', false)
                    ->orWhere(function ($sub) {
                        $sub->where('is_custom', true)
                            ->where('user_id', $this->user->id);
                    });
            })
            ->where(function ($q) use ($queryStr) {
                $q->where('name', 'like', "%{$queryStr}%")
                    ->orWhere('brand', 'like', "%{$queryStr}%");
            })
            ->with('servings')
            ->take(10)
            ->get()
            ->map(function (Food $f) {
                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'brand' => $f->brand,
                    'calories_per_100g' => (float) $f->calories,
                    'protein_per_100g' => (float) $f->protein,
                    'carbs_per_100g' => (float) $f->carbs,
                    'fat_per_100g' => (float) $f->fat,
                    'is_custom' => (bool) $f->is_custom,
                    'servings' => $f->servings->map(fn ($s) => [
                        'name' => $s->serving_name,
                        'grams' => (float) $s->gram_equivalent,
                    ])->values()->all(),
                ];
            });

        return (string) json_encode([
            'query' => $queryStr,
            'count' => $foods->count(),
            'foods' => $foods->values()->all(),
        ]);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->required()->description('The food search term (e.g. "chicken breast", "oats", "milk").'),
        ];
    }
}
