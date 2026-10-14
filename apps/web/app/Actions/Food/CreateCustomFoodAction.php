<?php

namespace App\Actions\Food;

use App\DTOs\Food\CreateCustomFoodDTO;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateCustomFoodAction
{
    /**
     * Create a user custom food item with custom servings.
     */
    public function execute(User $user, CreateCustomFoodDTO $dto): Food
    {
        return DB::transaction(function () use ($user, $dto) {
            $attributes = $dto->toModelAttributes();
            $attributes['user_id'] = $user->id;
            $attributes['is_custom'] = true;
            $attributes['off_id'] = null;

            /** @var Food $food */
            $food = Food::create($attributes);

            if (! empty($dto->servings)) {
                foreach ($dto->servings as $serving) {
                    FoodServing::create([
                        'food_id' => $food->id,
                        'serving_name' => (string) $serving['serving_name'],
                        'gram_equivalent' => (float) $serving['gram_equivalent'],
                        'is_default' => ! empty($serving['is_default']),
                    ]);
                }
            } else {
                // Ensure default portion serving
                FoodServing::create([
                    'food_id' => $food->id,
                    'serving_name' => sprintf('1 %s (%s%s)', $food->serving_unit, (float) $food->serving_size, $food->serving_unit),
                    'gram_equivalent' => (float) $food->serving_size,
                    'is_default' => true,
                ]);
            }

            $food->load('servings');

            return $food;
        });
    }
}
