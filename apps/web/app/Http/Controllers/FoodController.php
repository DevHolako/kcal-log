<?php

namespace App\Http\Controllers;

use App\Actions\Food\CreateCustomFoodAction;
use App\Actions\Food\DeleteCustomFoodAction;
use App\DTOs\Food\CreateCustomFoodDTO;
use App\Http\Requests\Food\StoreCustomFoodRequest;
use App\Models\Food;
use App\Models\User;
use App\Services\FoodService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FoodController extends Controller
{
    public function __construct(
        protected FoodService $foodService,
        protected CreateCustomFoodAction $createCustomFoodAction,
        protected DeleteCustomFoodAction $deleteCustomFoodAction,
    ) {}

    /**
     * Show food catalog, search, and custom foods manager.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = $request->query('q');
        $barcode = $request->query('barcode');

        $searchResult = null;
        if (! empty($barcode)) {
            $lookup = $this->foodService->findByBarcode((string) $barcode, $user);
            if ($lookup) {
                $searchResult = [
                    'items' => [$lookup->food],
                    'source' => $lookup->source,
                    'is_degraded' => $lookup->isDegraded,
                    'total' => 1,
                ];
            }
        } elseif (! empty($query)) {
            $result = $this->foodService->search((string) $query, $user, 1, 25);
            $searchResult = [
                'items' => $result->items,
                'source' => $result->source,
                'is_degraded' => $result->isDegraded,
                'total' => $result->total,
            ];
        }

        // Fetch recent/popular database items for initial view
        $initialFoods = Food::availableTo($user->id)
            ->with('servings')
            ->latest()
            ->take(20)
            ->get();

        // User's custom foods
        $customFoods = Food::custom()
            ->where('user_id', $user->id)
            ->with('servings')
            ->latest()
            ->get();

        return Inertia::render('foods/index', [
            'initialFoods' => $initialFoods,
            'customFoods' => $customFoods,
            'searchResult' => $searchResult,
            'searchQuery' => $query,
            'searchBarcode' => $barcode,
        ]);
    }

    /**
     * Store a custom food item via web.
     */
    public function storeCustom(StoreCustomFoodRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = CreateCustomFoodDTO::fromRequest($request);
        $this->createCustomFoodAction->execute($user, $dto);

        return back()->with('status', 'Custom food created successfully.');
    }

    /**
     * Delete a custom food item via web.
     */
    public function destroyCustom(Food $food, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->deleteCustomFoodAction->execute($user, $food);

        return back()->with('status', 'Custom food removed successfully.');
    }
}
