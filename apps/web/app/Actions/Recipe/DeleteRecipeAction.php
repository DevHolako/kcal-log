<?php

namespace App\Actions\Recipe;

use App\Models\MealRecipe;
use App\Models\User;

class DeleteRecipeAction
{
    /**
     * Delete a recipe owned by the user.
     */
    public function execute(User $user, MealRecipe $recipe): bool
    {
        if ($recipe->user_id !== $user->id) {
            abort(403, 'Unauthorized action on recipe.');
        }

        return (bool) $recipe->delete();
    }
}
