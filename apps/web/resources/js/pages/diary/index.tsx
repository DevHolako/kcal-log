import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Coffee,
    Cookie,
    Droplet,
    Moon,
    Plus,
    Sun,
    Trash2,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEcho } from '@/echo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DiaryIndex({ diary, selectedDate, recentFoods, status }: Props) {
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
    const [targetSlot, setTargetSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [selectedServing, setSelectedServing] = useState<FoodServingData | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [foodFilter, setFoodFilter] = useState('');

    // Quick Add Dialog state
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddSlot, setQuickAddSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

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

    const waterForm = useForm({
        date: selectedDate,
        amount_ml: 250,
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
        const defServing = food.servings.find((s) => s.is_default) || food.servings[0] || null;
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
            }
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
            { preserveScroll: true }
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

    const caloriePercent = Math.min(100, Math.round((summary.total_calories / (summary.target_calories || 2000)) * 100));

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Diary - ${selectedDate}`} />

            {/* Date Navigator Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleSelectDate(e.target.value)}
                            className="w-auto font-medium text-sm"
                        />
                        {isToday && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Today
                            </Badge>
                        )}
                    </div>

                    <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {summary.weight_kg !== null && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                        <span>Logged Weight:</span>
                        <strong className="text-foreground">{summary.weight_kg} kg</strong>
                    </div>
                )}
            </div>

            {status && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Daily Nutrition Summary Card */}
            <Card className="border-border/60 bg-muted/20 shadow-xs">
                <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        {/* Calories Overview */}
                        <div className="md:col-span-2 space-y-2 border-r-0 md:border-r border-border pr-0 md:pr-4">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl font-extrabold text-foreground">
                                        {Math.round(summary.total_calories)}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        / {Math.round(summary.target_calories)} kcal
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-semibold text-primary">
                                        {Math.round(summary.remaining_calories)}
                                    </span>
                                    <span className="text-xs text-muted-foreground block">remaining</span>
                                </div>
                            </div>

                            {/* Calorie Progress Bar */}
                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${caloriePercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Macronutrient Bars */}
                        <div className="md:col-span-2 grid grid-cols-3 gap-3 text-center">
                            {/* Protein */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground font-semibold uppercase">Protein</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {Math.round(summary.total_protein)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_protein)}g
                                </div>
                            </div>

                            {/* Carbs */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground font-semibold uppercase">Carbs</div>
                                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(summary.total_carbs)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_carbs)}g
                                </div>
                            </div>

                            {/* Fat */}
                            <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground font-semibold uppercase">Fat</div>
                                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                                    {Math.round(summary.total_fat)}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    goal: {Math.round(summary.target_fat)}g
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meal Slots Section */}
            <div className="space-y-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((slotKey) => {
                    const slot = slots[slotKey];
                    return (
                        <Card key={slotKey} className="border-border/70">
                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/40">
                                <div className="flex items-center gap-2.5">
                                    {slotIcons[slotKey]}
                                    <CardTitle className="text-base font-semibold">
                                        {slotNames[slotKey]}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs font-mono font-medium ml-1">
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
                                        onClick={() => openQuickAdd(slotKey)}
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
                                        No items logged for {slotNames[slotKey].toLowerCase()}.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {slot.entries.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between py-2.5 px-4 hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {entry.food?.name || 'Custom Item'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>
                                                            {Number(entry.quantity)} {entry.unit} ({Number(entry.grams)}g)
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span className="text-emerald-600 dark:text-emerald-400">
                                                            P: {Number(entry.protein)}g
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span className="text-blue-600 dark:text-blue-400">
                                                            C: {Number(entry.carbs)}g
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span className="text-amber-600 dark:text-amber-400">
                                                            F: {Number(entry.fat)}g
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {Math.round(Number(entry.calories))} kcal
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteEntry(entry.id)}
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
                })}
            </div>

            {/* Water Tracker Widget */}
            <Card className="border-border/70">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-sky-500 fill-sky-500" />
                        <CardTitle className="text-base font-semibold">Water Tracking</CardTitle>
                        <Badge variant="outline" className="text-xs font-mono font-medium ml-1">
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
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Log Food to {slotNames[targetSlot]}
                        </DialogTitle>
                        <DialogDescription>
                            Select from your recent food catalog or search Open Food Facts.
                        </DialogDescription>
                    </DialogHeader>

                    {!selectedFood ? (
                        <div className="space-y-3 py-2">
                            <Input
                                placeholder="Filter recent items or search..."
                                value={foodFilter}
                                onChange={(e) => setFoodFilter(e.target.value)}
                            />

                            <div className="space-y-1.5 max-h-60 overflow-y-auto divide-y divide-border/40">
                                {recentFoods
                                    .filter((f) => f.name.toLowerCase().includes(foodFilter.toLowerCase()) || (f.brand && f.brand.toLowerCase().includes(foodFilter.toLowerCase())))
                                    .map((food) => (
                                        <button
                                            key={food.id}
                                            type="button"
                                            onClick={() => handleSelectFood(food)}
                                            className="w-full text-left p-2.5 rounded-md hover:bg-muted/50 flex items-center justify-between group transition-colors"
                                        >
                                            <div>
                                                <div className="text-sm font-medium group-hover:text-primary transition-colors">
                                                    {food.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {food.brand || 'Generic'} &bull; {Number(food.calories)} kcal per {Number(food.serving_size)}{food.serving_unit}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                Select
                                            </Badge>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={submitAddFood} className="space-y-4 py-2">
                            <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-foreground">{selectedFood.name}</div>
                                    <div className="text-xs text-muted-foreground">{selectedFood.brand || 'Generic'}</div>
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
                                    <Label className="text-xs">Serving Unit</Label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden"
                                        value={selectedServing?.serving_name || ''}
                                        onChange={(e) => {
                                            const match = selectedFood.servings.find((s) => s.serving_name === e.target.value);
                                            if (match) setSelectedServing(match);
                                        }}
                                    >
                                        {selectedFood.servings.map((serving, idx) => (
                                            <option key={idx} value={serving.serving_name}>
                                                {serving.serving_name} ({Number(serving.gram_equivalent)}g)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Portion Multiplier</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="50"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(0.1, Number(e.target.value) || 1))}
                                    />
                                </div>
                            </div>

                            {selectedServing && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                                    <div className="text-xs text-muted-foreground uppercase font-semibold">
                                        Calculated Intake
                                    </div>
                                    <div className="text-2xl font-black text-primary my-1">
                                        {Math.round(
                                            (Number(selectedFood.calories) * (Number(selectedServing.gram_equivalent) * quantity)) /
                                                (Number(selectedFood.serving_size) || 100)
                                        )}{' '}
                                        kcal
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total portion: {Math.round(Number(selectedServing.gram_equivalent) * quantity)}g
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddFoodOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addFoodForm.processing}>
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
                            Quickly log calories without searching for a specific food item.
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
                                onChange={(e) => quickAddForm.setData('calories', Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="quick-desc">Description (Optional)</Label>
                            <Input
                                id="quick-desc"
                                placeholder="e.g. Snack, Espresso & croissant, etc."
                                value={quickAddForm.data.description}
                                onChange={(e) => quickAddForm.setData('description', e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsQuickAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={quickAddForm.processing}>
                                Add Calories
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
