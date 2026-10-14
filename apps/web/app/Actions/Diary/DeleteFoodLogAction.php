<?php

namespace App\Actions\Diary;

use App\Events\DiaryUpdated;
use App\Models\DiaryEntry;
use App\Models\User;

class DeleteFoodLogAction
{
    /**
     * Delete a diary entry.
     */
    public function execute(User $user, DiaryEntry $entry): bool
    {
        if ($entry->user_id !== $user->id) {
            abort(403, 'Unauthorized action on diary entry.');
        }

        $date = $entry->date->format('Y-m-d');
        $mealSlot = $entry->meal_slot;
        $entryId = $entry->id;

        $deleted = (bool) $entry->delete();

        if ($deleted) {
            DiaryUpdated::dispatch($user->id, $date, 'deleted', [
                'entry_id' => $entryId,
                'meal_slot' => $mealSlot,
            ]);
        }

        return $deleted;
    }
}
