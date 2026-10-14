<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Diary\QuickAddRequest;
use App\Http\Requests\Diary\StoreDiaryEntryRequest;
use App\Http\Requests\Diary\StoreWaterLogRequest;
use App\Http\Requests\Diary\UpdateDiaryEntryRequest;
use App\Models\DiaryEntry;
use App\Models\User;
use App\Models\WaterLog;
use App\Services\DiaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiaryController extends Controller
{
    public function __construct(
        protected DiaryService $diaryService,
    ) {}

    /**
     * Get user's daily diary for specified date.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $date = (string) $request->query('date', now()->format('Y-m-d'));

        $diary = $this->diaryService->getDayDiary($user, $date);

        return response()->json($diary);
    }

    /**
     * Log a food entry to the daily diary.
     */
    public function store(StoreDiaryEntryRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $entry = $this->diaryService->addEntry($user, $request->validated());

        return response()->json([
            'message' => 'Diary entry logged successfully.',
            'data' => $entry,
        ], 201);
    }

    /**
     * Update an existing diary entry.
     */
    public function update(UpdateDiaryEntryRequest $request, DiaryEntry $entry): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $updated = $this->diaryService->updateEntry($user, $entry, $request->validated());

        return response()->json([
            'message' => 'Diary entry updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * Delete a diary entry.
     */
    public function destroy(DiaryEntry $entry, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->deleteEntry($user, $entry);

        return response()->json([
            'message' => 'Diary entry removed successfully.',
        ]);
    }

    /**
     * Quick add calories directly to a meal slot.
     */
    public function quickAdd(QuickAddRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $entry = $this->diaryService->quickAdd(
            $user,
            (string) $request->input('date'),
            (string) $request->input('meal_slot'),
            (float) $request->input('calories'),
            $request->input('description')
        );

        return response()->json([
            'message' => 'Calories quick added successfully.',
            'data' => $entry,
        ], 201);
    }

    /**
     * Log water intake in milliliters.
     */
    public function storeWater(StoreWaterLogRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $log = $this->diaryService->logWater(
            $user,
            (string) $request->input('date'),
            (int) $request->input('amount_ml')
        );

        return response()->json([
            'message' => 'Water logged successfully.',
            'data' => $log,
        ], 201);
    }

    /**
     * Delete a water log entry.
     */
    public function destroyWater(WaterLog $waterLog, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->deleteWaterLog($user, $waterLog);

        return response()->json([
            'message' => 'Water log removed successfully.',
        ]);
    }
}
