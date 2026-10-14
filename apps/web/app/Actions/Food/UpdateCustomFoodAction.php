<?php

namespace App\Actions\Food;

use App\DTOs\Food\UpdateCustomFoodDTO;
use App\Models\Food;
use App\Models\FoodServing;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateCustomFoodAction
{
    /**
     * Update an existing custom food owned by the user.
     */
    public function execute(User $user, Food $food, UpdateCustomFoodDTO $dto): Food
    {
        if ($food->user_id !== $user->id || ! $food->is_custom) {
            abort(403, 'Unauthorized action on custom food.');
        }

        return DB::transaction(function () use ($food, $dto) {
            $attributes = $dto->toModelAttributes();
            if (! empty($attributes)) {
                $food->update($attributes);
            }

            if ($dto->servings !== null) {
                $food->servings()->delete();
                foreach ($dto->servings as $serving) {
                    FoodServing::create([
                        'food_id' => $food->id,
                        'serving_name' => (string) $serving['serving_name'],
                        'gram_equivalent' => (float) $serving['gram_equivalent'],
                        'is_default' => ! empty($serving['is_default']),
                    ]);
                }
            }

            $food->load('servings');

            return $food;
        });
    }
}
