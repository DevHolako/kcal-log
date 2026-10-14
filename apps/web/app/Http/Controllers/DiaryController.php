<?php

namespace App\Http\Controllers;

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

        $recentFoods = Food::availableTo($user->id)
            ->with('servings')
            ->latest('id')
            ->take(30)
            ->get();

        return Inertia::render('diary/index', [
            'diary' => $diary,
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

        $this->diaryService->addEntry($user, $request->validated());

        return back()->with('status', 'Food logged to diary.');
    }

    /**
     * Update an existing diary entry.
     */
    public function update(UpdateDiaryEntryRequest $request, DiaryEntry $entry): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->updateEntry($user, $entry, $request->validated());

        return back()->with('status', 'Diary entry updated.');
    }

    /**
     * Delete a diary entry.
     */
    public function destroy(DiaryEntry $entry, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->deleteEntry($user, $entry);

        return back()->with('status', 'Entry removed from diary.');
    }

    /**
     * Quick add calories directly to a meal slot.
     */
    public function quickAdd(QuickAddRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->quickAdd(
            $user,
            (string) $request->input('date'),
            (string) $request->input('meal_slot'),
            (float) $request->input('calories'),
            $request->input('description')
        );

        return back()->with('status', 'Calories added to meal slot.');
    }

    /**
     * Log water intake in milliliters.
     */
    public function storeWater(StoreWaterLogRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->logWater(
            $user,
            (string) $request->input('date'),
            (int) $request->input('amount_ml')
        );

        return back()->with('status', 'Water intake logged.');
    }

    /**
     * Delete water log.
     */
    public function destroyWater(WaterLog $waterLog, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->diaryService->deleteWaterLog($user, $waterLog);

        return back()->with('status', 'Water log removed.');
    }
}
