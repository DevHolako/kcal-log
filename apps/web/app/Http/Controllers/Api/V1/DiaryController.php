<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Diary\DeleteFoodLogAction;
use App\Actions\Diary\DeleteWaterLogAction;
use App\Actions\Diary\LogFoodAction;
use App\Actions\Diary\LogWaterAction;
use App\Actions\Diary\QuickAddCaloriesAction;
use App\Actions\Diary\UpdateFoodLogAction;
use App\DTOs\Diary\LogFoodDTO;
use App\DTOs\Diary\LogWaterDTO;
use App\DTOs\Diary\QuickAddDTO;
use App\DTOs\Diary\UpdateFoodLogDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Diary\QuickAddRequest;
use App\Http\Requests\Diary\StoreDiaryEntryRequest;
use App\Http\Requests\Diary\StoreWaterLogRequest;
use App\Http\Requests\Diary\StoreWeightLogRequest;
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
        protected LogFoodAction $logFoodAction,
        protected UpdateFoodLogAction $updateFoodLogAction,
        protected DeleteFoodLogAction $deleteFoodLogAction,
        protected QuickAddCaloriesAction $quickAddAction,
        protected LogWaterAction $logWaterAction,
        protected DeleteWaterLogAction $deleteWaterLogAction,
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

        $dto = LogFoodDTO::fromRequest($request);
        $entry = $this->logFoodAction->execute($user, $dto);

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

        $dto = UpdateFoodLogDTO::fromRequest($request);
        $updatedEntry = $this->updateFoodLogAction->execute($user, $entry, $dto);

        return response()->json([
            'message' => 'Diary entry updated successfully.',
            'data' => $updatedEntry,
        ]);
    }

    /**
     * Delete a diary entry.
     */
    public function destroy(DiaryEntry $entry, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteFoodLogAction->execute($user, $entry);

        return response()->json([
            'message' => 'Diary entry deleted successfully.',
        ]);
    }

    /**
     * Quick add raw calories directly to a meal slot.
     */
    public function quickAdd(QuickAddRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = QuickAddDTO::fromRequest($request);
        $entry = $this->quickAddAction->execute($user, $dto);

        return response()->json([
            'message' => 'Calories logged successfully.',
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

        $dto = LogWaterDTO::fromRequest($request);
        $log = $this->logWaterAction->execute($user, $dto);

        return response()->json([
            'message' => 'Water intake logged successfully.',
            'data' => $log,
        ], 201);
    }

    /**
     * Delete water log.
     */
    public function destroyWater(WaterLog $waterLog, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteWaterLogAction->execute($user, $waterLog);

        return response()->json([
            'message' => 'Water log deleted successfully.',
        ]);
    }

    /**
     * Log daily bodyweight in kg.
     */
    public function storeWeight(StoreWeightLogRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $log = $this->diaryService->logWeight(
            $user,
            (string) $request->validated('date'),
            (float) $request->validated('weight_kg'),
            $request->validated('note')
        );

        return response()->json([
            'message' => 'Weight logged successfully.',
            'data' => $log,
        ], 201);
    }

    /**
     * Remove daily bodyweight log for a specific date.
     */
    public function destroyWeight(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $date = (string) $request->input('date', now()->format('Y-m-d'));
        $this->diaryService->deleteWeight($user, $date);

        return response()->json([
            'message' => 'Weight log deleted successfully.',
        ]);
    }
}

