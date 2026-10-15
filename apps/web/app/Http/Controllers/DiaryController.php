<?php

namespace App\Http\Controllers;

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
use App\Http\Requests\Diary\QuickAddRequest;
use App\Http\Requests\Diary\StoreDiaryEntryRequest;
use App\Http\Requests\Diary\StoreWaterLogRequest;
use App\Http\Requests\Diary\UpdateDiaryEntryRequest;
use App\Models\DiaryEntry;
use App\Models\Food;
use App\Models\User;
use App\Models\WaterLog;
use App\Services\DiaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
     * Show interactive daily diary page.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $date = (string) $request->query('date', now()->format('Y-m-d'));

        $diary = $this->diaryService->getDayDiary($user, $date);
        $weeklyHistory = $this->diaryService->getWeeklyCalorieHistory($user, $date);

        $recentFoods = Food::availableTo($user->id)
            ->with('servings')
            ->latest('id')
            ->take(30)
            ->get();

        return Inertia::render('diary/index', [
            'diary' => $diary,
            'weeklyHistory' => $weeklyHistory,
            'selectedDate' => $date,
            'recentFoods' => $recentFoods,
        ]);
    }

    /**
     * Log a food entry to the daily diary.
     */
    public function store(StoreDiaryEntryRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = LogFoodDTO::fromRequest($request);
        $this->logFoodAction->execute($user, $dto);

        return back()->with('status', 'Food logged to diary.');
    }

    /**
     * Update an existing diary entry.
     */
    public function update(UpdateDiaryEntryRequest $request, DiaryEntry $entry): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = UpdateFoodLogDTO::fromRequest($request);
        $this->updateFoodLogAction->execute($user, $entry, $dto);

        return back()->with('status', 'Diary entry updated.');
    }

    /**
     * Remove a food entry from diary.
     */
    public function destroy(DiaryEntry $entry, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteFoodLogAction->execute($user, $entry);

        return back()->with('status', 'Diary entry removed.');
    }

    /**
     * Quick add raw calories directly to a meal slot.
     */
    public function quickAdd(QuickAddRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = QuickAddDTO::fromRequest($request);
        $this->quickAddAction->execute($user, $dto);

        return back()->with('status', 'Calories quick added.');
    }

    /**
     * Log water intake in milliliters.
     */
    public function storeWater(StoreWaterLogRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = LogWaterDTO::fromRequest($request);
        $this->logWaterAction->execute($user, $dto);

        return back()->with('status', 'Water intake logged.');
    }

    /**
     * Delete water log.
     */
    public function destroyWater(WaterLog $waterLog, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteWaterLogAction->execute($user, $waterLog);

        return back()->with('status', 'Water log removed.');
    }
}
