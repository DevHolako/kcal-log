<?php

namespace App\Actions\Food;

use App\Models\Food;
use App\Models\User;

class DeleteCustomFoodAction
{
    /**
     * Delete a custom food owned by the user.
     */
    public function execute(User $user, Food $food): bool
    {
        if ($food->user_id !== $user->id || ! $food->is_custom) {
            abort(403, 'Unauthorized action on custom food.');
        }

        return (bool) $food->delete();
    }
}
