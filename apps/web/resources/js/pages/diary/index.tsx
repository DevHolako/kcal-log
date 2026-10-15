import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    ChevronLeft,
    ChevronRight,
    Cookie,
    Droplet,
    Moon,
    Plus,
    Sparkles,
    Sun,
    Trash2,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BarcodeScannerModal from '@/components/barcode-scanner-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEcho } from '@/echo';
import type { FoodItem, FoodServingData } from '@/pages/foods';

interface DiaryEntryData {
    id: number;
    user_id: number;
    food_id: number;
    food_serving_id: number | null;
    date: string;
    meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    quantity: number | string;
    unit: string;
    grams: number | string;
    calories: number | string;
    protein: number | string;
    carbs: number | string;
    fat: number | string;
    fiber: number | string | null;
    sugar?: number | string | null;
    saturated_fat?: number | string | null;
    sodium?: number | string | null;
    food?: FoodItem;
    serving?: FoodServingData;
}

interface DiarySummary {
    total_calories: number;
    target_calories: number;
    remaining_calories: number;
    total_protein: number;
    target_protein: number;
    total_carbs: number;
    target_carbs: number;
    total_fat: number;
    target_fat: number;
    total_fiber: number;
    target_fiber: number;
    total_sugar?: number;
    total_saturated_fat?: number;
    total_sodium?: number;
    total_sodium_mg?: number;
    water_ml: number;
    target_water_ml: number;
    weight_kg: number | null;
}

interface Props {
    diary: {
        date: string;
        summary: DiarySummary;
        slots: {
            breakfast: { entries: DiaryEntryData[]; calories: number };
            lunch: { entries: DiaryEntryData[]; calories: number };
            dinner: { entries: DiaryEntryData[]; calories: number };
            snack: { entries: DiaryEntryData[]; calories: number };
        };
    };
    selectedDate: string;
    recentFoods: FoodItem[];
    status?: string;
}

export default function DiaryIndex({
    diary,
    selectedDate,
    recentFoods,
    status,
}: Props) {
    const { auth } = usePage().props as any;
    const { summary, slots } = diary;

    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`user.${userId}`);
        channel.listen('.DiaryUpdated', () => {
            router.reload({ only: ['diary'] });
        });

        return () => {
            channel.stopListening('.DiaryUpdated');
        };
    }, [auth?.user?.id]);

    // Add Food Dialog state
    const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
    const [targetSlot, setTargetSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [selectedServing, setSelectedServing] =
        useState<FoodServingData | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [foodFilter, setFoodFilter] = useState('');

    // Quick Add Dialog state
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddSlot, setQuickAddSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');

    // Barcode scanner & Micronutrient Dialog state
    const [scannerOpen, setScannerOpen] = useState(false);
    const [microModalOpen, setMicroModalOpen] = useState(false);

    const addFoodForm = useForm({
        food_id: 0,
        food_serving_id: null as number | null,
        date: selectedDate,
        meal_slot: 'breakfast',
        quantity: 1,
    });

    const quickAddForm = useForm({
        date: selectedDate,
        meal_slot: 'breakfast',
        calories: 200,
        description: '',
    });

    // Date navigation
    const navigateDate = (offsetDays: number) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + offsetDays);
        const nextDateStr = current.toISOString().split('T')[0];
        router.get('/diary', { date: nextDateStr }, { preserveState: true });
    };

    const handleSelectDate = (dateVal: string) => {
        router.get('/diary', { date: dateVal }, { preserveState: true });
    };

    // Open Add Food Dialog
    const openAddFood = (slot: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
        setTargetSlot(slot);
        setSelectedFood(null);
        setSelectedServing(null);
        setQuantity(1);
        setFoodFilter('');
        setIsAddFoodOpen(true);
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        const defServing =
            food.servings.find((s) => s.is_default) || food.servings[0] || null;
        setSelectedServing(defServing);
        setQuantity(1);
    };

    const submitAddFood = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFood) return;

        addFoodForm.setData({
            food_id: selectedFood.id,
            food_serving_id: selectedServing?.id || null,
            date: selectedDate,
            meal_slot: targetSlot,
            quantity: quantity,
        });

        router.post(
            '/diary',
            {
                food_id: selectedFood.id,
                food_serving_id: selectedServing?.id || null,
                date: selectedDate,
                meal_slot: targetSlot,
                quantity: quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAddFoodOpen(false);
                },
            },
        );
    };

    // Open Quick Add
    const openQuickAdd = (slot: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
        setQuickAddSlot(slot);
        quickAddForm.setData({
            date: selectedDate,
            meal_slot: slot,
            calories: 200,
            description: '',
        });
        setIsQuickAddOpen(true);
    };

    const submitQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        quickAddForm.post('/diary/quick-add', {
            preserveScroll: true,
            onSuccess: () => setIsQuickAddOpen(false),
        });
    };

    const handleDeleteEntry = (id: number) => {
        if (confirm('Remove this food item from your diary?')) {
            router.delete(`/diary/${id}`, { preserveScroll: true });
        }
    };

    const handleLogWater = (ml: number) => {
        router.post(
            '/diary/water',
            {
                date: selectedDate,
                amount_ml: ml,
            },
            { preserveScroll: true },
        );
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    const slotIcons = {
        breakfast: <Sun className="h-4 w-4 text-amber-500" />,
        lunch: <Utensils className="h-4 w-4 text-emerald-500" />,
        dinner: <Moon className="h-4 w-4 text-indigo-500" />,
        snack: <Cookie className="h-4 w-4 text-orange-500" />,
    };

    const slotNames = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snack: 'Snacks',
    };

    const caloriePercent = Math.min(
        100,
        Math.round(
            (summary.total_calories / (summary.target_calories || 2000)) * 100,
        ),
    );

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Diary - ${selectedDate}`} />

            {/* Date Navigator Header */}
            <div className="flex flex-col items-center justify-between gap-4 border-b border-border pb-4 sm:flex-row">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleSelectDate(e.target.value)}
                            className="w-auto text-sm font-medium"
                        />
                        {isToday && (
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                            >
                                Today
                            </Badge>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate(1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {summary.weight_kg !== null && (
                    <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                        <span>Logged Weight:</span>
                        <strong className="text-foreground">
                            {summary.weight_kg} kg
                        </strong>
                    </div>
                )}
            </div>

            {status && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Daily Nutrition Summary Card */}
            <Card className="border-border/60 bg-muted/20 shadow-xs">
                <CardContent className="space-y-4 p-5">
                    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
                        {/* Calories Overview */}
                        <div className="space-y-2 border-r-0 border-border pr-0 md:col-span-2 md:border-r md:pr-4">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl font-extrabold text-foreground">
                                        {Math.round(summary.total_calories)}
                                    </span>
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        / {Math.round(summary.target_calories)}{' '}
                                        kcal
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-semibold text-primary">
                                        {Math.round(summary.remaining_calories)}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        remaining
                                    </span>
                                </div>
                            </div>

                            {/* Calorie Progress Bar */}
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${caloriePercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Macronutrient Bars */}
                        <div className="grid grid-cols-3 gap-3 text-center md:col-span-2">
                            {/* Protein */}
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                    Protein
                                </div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {Math.round(summary.total_protein)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_protein)}g
                                </div>
                            </div>

                            {/* Carbs */}
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                    Carbs
                                </div>
                                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(summary.total_carbs)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_carbs)}g
                                </div>
                            </div>

                            {/* Fat */}
                            <div className="space-y-1">
                                <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                                    Fat
                                </div>
                                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                                    {Math.round(summary.total_fat)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_fat)}g
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Micronutrient Summary Quick-Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-4">
                            <span>
                                Fiber:{' '}
                                <strong className="text-foreground">
                                    {Math.round(summary.total_fiber || 0)}g
                                </strong>{' '}
                                / {Math.round(summary.target_fiber || 30)}g
                            </span>
                            <span>
                                Net Carbs:{' '}
                                <strong className="text-foreground">
                                    {Math.max(
                                        0,
                                        Math.round(
                                            (summary.total_carbs || 0) -
                                                (summary.total_fiber || 0),
                                        ),
                                    )}
                                    g
                                </strong>
                            </span>
                            <span>
                                Sodium:{' '}
                                <strong className="text-foreground">
                                    {summary.total_sodium_mg ??
                                        Math.round(
                                            (summary.total_sodium || 0) * 1000,
                                        )}{' '}
                                    mg
                                </strong>
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMicroModalOpen(true)}
                            className="h-7 gap-1.5 px-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Detailed Micronutrients
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Meal Slots Section */}
            <div className="space-y-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(
                    (slotKey) => {
                        const slot = slots[slotKey];
                        return (
                            <Card key={slotKey} className="border-border/70">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        {slotIcons[slotKey]}
                                        <CardTitle className="text-base font-semibold">
                                            {slotNames[slotKey]}
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            className="ml-1 font-mono text-xs font-medium"
                                        >
                                            {Math.round(slot.calories)} kcal
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openAddFood(slotKey)}
                                            className="h-8 gap-1.5 text-xs"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Food
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openQuickAdd(slotKey)
                                            }
                                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                            Quick Add
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    {slot.entries.length === 0 ? (
                                        <div className="py-4 text-center text-xs text-muted-foreground">
                                            No items logged for{' '}
                                            {slotNames[slotKey].toLowerCase()}.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/30">
                                            {slot.entries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/30"
                                                >
                                                    <div className="space-y-0.5">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {entry.food?.name ||
                                                                'Custom Item'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>
                                                                {Number(
                                                                    entry.quantity,
                                                                )}{' '}
                                                                {entry.unit} (
                                                                {Number(
                                                                    entry.grams,
                                                                )}
                                                                g)
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                P:{' '}
                                                                {Number(
                                                                    entry.protein,
                                                                )}
                                                                g
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span className="text-blue-600 dark:text-blue-400">
                                                                C:{' '}
                                                                {Number(
                                                                    entry.carbs,
                                                                )}
                                                                g
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span className="text-amber-600 dark:text-amber-400">
                                                                F:{' '}
                                                                {Number(
                                                                    entry.fat,
                                                                )}
                                                                g
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-foreground">
                                                            {Math.round(
                                                                Number(
                                                                    entry.calories,
                                                                ),
                                                            )}{' '}
                                                            kcal
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDeleteEntry(
                                                                    entry.id,
                                                                )
                                                            }
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    },
                )}
            </div>

            {/* Water Tracker Widget */}
            <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 fill-sky-500 text-sky-500" />
                        <CardTitle className="text-base font-semibold">
                            Water Tracking
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="ml-1 font-mono text-xs font-medium"
                        >
                            {summary.water_ml} / {summary.target_water_ml} ml
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLogWater(250)}
                            className="h-7 text-xs"
                        >
                            +250 ml
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLogWater(500)}
                            className="h-7 text-xs"
                        >
                            +500 ml
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLogWater(750)}
                            className="h-7 text-xs"
                        >
                            +750 ml
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Add Food Dialog */}
            <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Log Food to {slotNames[targetSlot]}
                        </DialogTitle>
                        <DialogDescription>
                            Select from your recent food catalog or search Open
                            Food Facts.
                        </DialogDescription>
                    </DialogHeader>

                    {!selectedFood ? (
                        <div className="space-y-3 py-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Filter recent items or search..."
                                    value={foodFilter}
                                    onChange={(e) =>
                                        setFoodFilter(e.target.value)
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setScannerOpen(true)}
                                    className="shrink-0 gap-1.5 border-emerald-500/30 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                >
                                    <Camera className="h-3.5 w-3.5 text-emerald-600" />
                                    Scan
                                </Button>
                            </div>

                            <div className="max-h-60 space-y-1.5 divide-y divide-border/40 overflow-y-auto">
                                {recentFoods
                                    .filter(
                                        (f) =>
                                            f.name
                                                .toLowerCase()
                                                .includes(
                                                    foodFilter.toLowerCase(),
                                                ) ||
                                            (f.brand &&
                                                f.brand
                                                    .toLowerCase()
                                                    .includes(
                                                        foodFilter.toLowerCase(),
                                                    )),
                                    )
                                    .map((food) => (
                                        <button
                                            key={food.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectFood(food)
                                            }
                                            className="group flex w-full items-center justify-between rounded-md p-2.5 text-left transition-colors hover:bg-muted/50"
                                        >
                                            <div>
                                                <div className="text-sm font-medium transition-colors group-hover:text-primary">
                                                    {food.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {food.brand || 'Generic'}{' '}
                                                    &bull;{' '}
                                                    {Number(food.calories)} kcal
                                                    per{' '}
                                                    {Number(food.serving_size)}
                                                    {food.serving_unit}
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                Select
                                            </Badge>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={submitAddFood}
                            className="space-y-4 py-2"
                        >
                            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                                <div>
                                    <div className="text-sm font-bold text-foreground">
                                        {selectedFood.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {selectedFood.brand || 'Generic'}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFood(null)}
                                    className="text-xs text-primary"
                                >
                                    Change Food
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Serving Unit
                                    </Label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden"
                                        value={
                                            selectedServing?.serving_name || ''
                                        }
                                        onChange={(e) => {
                                            const match =
                                                selectedFood.servings.find(
                                                    (s) =>
                                                        s.serving_name ===
                                                        e.target.value,
                                                );
                                            if (match)
                                                setSelectedServing(match);
                                        }}
                                    >
                                        {selectedFood.servings.map(
                                            (serving, idx) => (
                                                <option
                                                    key={idx}
                                                    value={serving.serving_name}
                                                >
                                                    {serving.serving_name} (
                                                    {Number(
                                                        serving.gram_equivalent,
                                                    )}
                                                    g)
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Portion Multiplier
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="50"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.max(
                                                    0.1,
                                                    Number(e.target.value) || 1,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {selectedServing && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                                        Calculated Intake
                                    </div>
                                    <div className="my-1 text-2xl font-black text-primary">
                                        {Math.round(
                                            (Number(selectedFood.calories) *
                                                (Number(
                                                    selectedServing.gram_equivalent,
                                                ) *
                                                    quantity)) /
                                                (Number(
                                                    selectedFood.serving_size,
                                                ) || 100),
                                        )}{' '}
                                        kcal
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total portion:{' '}
                                        {Math.round(
                                            Number(
                                                selectedServing.gram_equivalent,
                                            ) * quantity,
                                        )}
                                        g
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddFoodOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addFoodForm.processing}
                                >
                                    Log to {slotNames[targetSlot]}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Quick Add Dialog */}
            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-amber-500" />
                            Quick Add Calories to {slotNames[quickAddSlot]}
                        </DialogTitle>
                        <DialogDescription>
                            Quickly log calories without searching for a
                            specific food item.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitQuickAdd} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="quick-cal">Calories (kcal) *</Label>
                            <Input
                                id="quick-cal"
                                type="number"
                                step="1"
                                min="1"
                                max="10000"
                                value={quickAddForm.data.calories}
                                onChange={(e) =>
                                    quickAddForm.setData(
                                        'calories',
                                        Number(e.target.value),
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="quick-desc">
                                Description (Optional)
                            </Label>
                            <Input
                                id="quick-desc"
                                placeholder="e.g. Snack, Espresso & croissant, etc."
                                value={quickAddForm.data.description}
                                onChange={(e) =>
                                    quickAddForm.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsQuickAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={quickAddForm.processing}
                            >
                                Add Calories
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detailed Micronutrient Breakdown Dialog */}
            <Dialog open={microModalOpen} onOpenChange={setMicroModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Daily Micronutrient Breakdown
                        </DialogTitle>
                        <DialogDescription>
                            Detailed micronutrients and health indicators logged
                            for {selectedDate}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Fiber & Net Carbs */}
                        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">
                                    Dietary Fiber
                                </span>
                                <span className="font-bold text-foreground">
                                    {Math.round(summary.total_fiber || 0)}g /{' '}
                                    {Math.round(summary.target_fiber || 30)}g
                                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{
                                        width: `${Math.min(100, Math.round(((summary.total_fiber || 0) / (summary.target_fiber || 30)) * 100))}%`,
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                                <span>Net Carbohydrates</span>
                                <strong className="text-foreground">
                                    {Math.max(
                                        0,
                                        Math.round(
                                            (summary.total_carbs || 0) -
                                                (summary.total_fiber || 0),
                                        ),
                                    )}
                                    g
                                </strong>
                            </div>
                        </div>

                        {/* Sugar & Saturated Fat */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1 rounded-xl border border-border bg-muted/20 p-3">
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    Total Sugars
                                </span>
                                <p className="text-lg font-bold text-foreground">
                                    {Math.round(summary.total_sugar || 0)}g
                                </p>
                                <span className="text-[10px] text-muted-foreground">
                                    From natural & added sources
                                </span>
                            </div>

                            <div className="space-y-1 rounded-xl border border-border bg-muted/20 p-3">
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    Saturated Fat
                                </span>
                                <p className="text-lg font-bold text-foreground">
                                    {Math.round(
                                        summary.total_saturated_fat || 0,
                                    )}
                                    g
                                </p>
                                <span className="text-[10px] text-muted-foreground">
                                    Recommended limit &lt; 20g/day
                                </span>
                            </div>
                        </div>

                        {/* Sodium Benchmark */}
                        {(() => {
                            const sodiumMg =
                                summary.total_sodium_mg ??
                                Math.round((summary.total_sodium || 0) * 1000);
                            const isOptimal = sodiumMg <= 1500;
                            const isModerate = sodiumMg <= 2300;
                            return (
                                <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">
                                            Sodium Intake
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={
                                                isOptimal
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : isModerate
                                                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                      : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }
                                        >
                                            {isOptimal
                                                ? 'Optimal'
                                                : isModerate
                                                  ? 'Moderate'
                                                  : 'Elevated'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline justify-between text-xs">
                                        <span className="text-xl font-black text-foreground">
                                            {sodiumMg} mg
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Daily Guideline: 2,300 mg
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                sodiumMg > 2300
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                            }`}
                                            style={{
                                                width: `${Math.min(100, Math.round((sodiumMg / 2300) * 100))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Hydration */}
                        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
                            <div className="flex items-center gap-2.5">
                                <Droplet className="h-4 w-4 text-sky-500" />
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Daily Hydration
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {summary.water_ml} /{' '}
                                        {summary.target_water_ml} ml logged
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                                {Math.min(
                                    100,
                                    Math.round(
                                        (summary.water_ml /
                                            (summary.target_water_ml || 2000)) *
                                            100,
                                    ),
                                )}
                                %
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMicroModalOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Live Camera Barcode Scanner Modal */}
            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onFoodFound={(food) => {
                    handleSelectFood(food);
                    setIsAddFoodOpen(true);
                }}
            />
        </div>
    );
}

DiaryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Food Diary',
            href: '/diary',
        },
    ],
};
