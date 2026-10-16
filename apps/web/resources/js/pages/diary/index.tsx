import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Barcode,
    Camera,
    ChevronLeft,
    ChevronRight,
    Clock,
    Cookie,
    Droplet,
    Globe,
    Loader2,
    Minus,
    Moon,
    Plus,
    Search,
    Scale,
    Sparkles,
    Sun,
    Trash2,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BarcodeScannerModal from '@/components/barcode-scanner-modal';
import ConcentricMacroRings from '@/components/concentric-macro-rings';
import MacroDonutChart from '@/components/macro-donut-chart';
import WeeklyIntakeBarChart, {
    type DailyIntakeItem,
} from '@/components/weekly-intake-bar-chart';
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
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
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
    weeklyHistory?: DailyIntakeItem[];
    selectedDate: string;
    recentFoods: FoodItem[];
    status?: string;
}

export default function DiaryIndex({
    diary,
    weeklyHistory,
    selectedDate,
    recentFoods,
    status,
}: Props) {
    const { t } = useTranslation();
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
    const [portionMode, setPortionMode] = useState<'weight' | 'serving'>(
        'weight',
    );
    const [customGrams, setCustomGrams] = useState<number>(100);
    const [quantity, setQuantity] = useState<number>(1);
    const [foodFilter, setFoodFilter] = useState('');
    const [remoteResults, setRemoteResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [barcodeQuery, setBarcodeQuery] = useState('');
    const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
    const [barcodeError, setBarcodeError] = useState<string | null>(null);

    // Quick Add Dialog state
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddSlot, setQuickAddSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');

    // Barcode scanner & Micronutrient Dialog state
    const [scannerOpen, setScannerOpen] = useState(false);
    const [microModalOpen, setMicroModalOpen] = useState(false);
    const [visualizerMode, setVisualizerMode] = useState<'donut' | 'rings'>(
        'donut',
    );

    // Weight Logging state
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const [weightInput, setWeightInput] = useState<string>(
        summary.weight_kg !== null ? summary.weight_kg.toString() : '',
    );
    const [weightNote, setWeightNote] = useState<string>('');
    const [isWeightSubmitting, setIsWeightSubmitting] = useState(false);
    const [confirmDeleteWeight, setConfirmDeleteWeight] = useState(false);

    useEffect(() => {
        setWeightInput(
            summary.weight_kg !== null ? summary.weight_kg.toString() : '',
        );
        setConfirmDeleteWeight(false);
    }, [summary.weight_kg, selectedDate]);

    const handleQuickWeightAdjust = (delta: number) => {
        const current =
            summary.weight_kg !== null
                ? summary.weight_kg
                : weightInput
                  ? parseFloat(weightInput)
                  : 75.0;
        const next = Math.max(
            20,
            Math.min(400, Math.round((current + delta) * 10) / 10),
        );
        setIsWeightSubmitting(true);
        router.post(
            '/diary/weight',
            {
                date: selectedDate,
                weight_kg: next,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsWeightSubmitting(false),
            },
        );
    };

    const handleSaveWeight = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(weightInput);
        if (isNaN(parsed) || parsed < 20 || parsed > 400) return;

        setIsWeightSubmitting(true);
        router.post(
            '/diary/weight',
            {
                date: selectedDate,
                weight_kg: parsed,
                note: weightNote.trim() ? weightNote.trim() : undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsWeightModalOpen(false),
                onFinish: () => setIsWeightSubmitting(false),
            },
        );
    };

    const handleDeleteWeight = () => {
        setIsWeightSubmitting(true);
        router.delete('/diary/weight', {
            data: { date: selectedDate },
            preserveScroll: true,
            onSuccess: () => {
                setIsWeightModalOpen(false);
                setWeightInput('');
                setWeightNote('');
                setConfirmDeleteWeight(false);
            },
            onFinish: () => setIsWeightSubmitting(false),
        });
    };

    // Debounced remote search across Open Food Facts & cached catalog
    useEffect(() => {
        const query = foodFilter.trim();
        if (query.length < 2) {
            setRemoteResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            fetch(`/foods/search?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data.items)) {
                        setRemoteResults(data.items);
                    } else {
                        setRemoteResults([]);
                    }
                })
                .catch(() => {
                    setRemoteResults([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [foodFilter]);

    const handleBarcodeLookup = (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;
        setIsBarcodeLoading(true);
        setBarcodeError(null);

        fetch(`/foods/barcode/${encodeURIComponent(trimmed)}`, {
            headers: { Accept: 'application/json' },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Product not found for this barcode.');
                }
                return res.json();
            })
            .then((data) => {
                if (data.food) {
                    handleSelectFood(data.food);
                } else {
                    setBarcodeError('No product found for this barcode.');
                }
            })
            .catch((err) => {
                setBarcodeError(err.message || 'Lookup failed.');
            })
            .finally(() => {
                setIsBarcodeLoading(false);
            });
    };

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
        setRemoteResults([]);
        setBarcodeQuery('');
        setBarcodeError(null);
        setIsAddFoodOpen(true);
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        const defServing =
            food.servings.find((s) => s.is_default) || food.servings[0] || null;
        setSelectedServing(defServing);
        const initialWeight =
            Number(defServing?.gram_equivalent) > 0
                ? Number(defServing.gram_equivalent)
                : Number(food.serving_size) > 0
                  ? Number(food.serving_size)
                  : 100;
        setCustomGrams(initialWeight);
        setQuantity(1);
        setPortionMode('weight');
    };

    const submitAddFood = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFood) return;

        const baseSize =
            Number(selectedFood.serving_size) > 0
                ? Number(selectedFood.serving_size)
                : 100;

        router.post(
            '/diary',
            {
                food_id: selectedFood.id,
                food_serving_id:
                    portionMode === 'serving'
                        ? selectedServing?.id || null
                        : null,
                custom_grams: portionMode === 'weight' ? customGrams : null,
                date: selectedDate,
                meal_slot: targetSlot,
                quantity:
                    portionMode === 'weight'
                        ? Math.round((customGrams / baseSize) * 100) / 100
                        : quantity,
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
        breakfast: t('slot.breakfast'),
        lunch: t('slot.lunch'),
        dinner: t('slot.dinner'),
        snack: t('slot.snack'),
    };

    const slotThemes = {
        breakfast: {
            headerBg:
                'bg-gradient-to-r from-amber-500/15 via-amber-500/[0.04] to-transparent',
            cardBg: 'bg-amber-500/[0.035] dark:bg-amber-500/[0.06]',
            border: 'border-amber-500/25 hover:border-amber-500/40',
            badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
            addBtn: 'border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/15',
            iconContainer: 'bg-amber-500/20',
        },
        lunch: {
            headerBg:
                'bg-gradient-to-r from-teal-500/15 via-teal-500/[0.04] to-transparent',
            cardBg: 'bg-teal-500/[0.035] dark:bg-teal-500/[0.06]',
            border: 'border-teal-500/25 hover:border-teal-500/40',
            badge: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30',
            addBtn: 'border-teal-500/30 text-teal-800 dark:text-teal-200 hover:bg-teal-500/15',
            iconContainer: 'bg-teal-500/20',
        },
        dinner: {
            headerBg:
                'bg-gradient-to-r from-indigo-500/15 via-indigo-500/[0.04] to-transparent',
            cardBg: 'bg-indigo-500/[0.035] dark:bg-indigo-500/[0.06]',
            border: 'border-indigo-500/25 hover:border-indigo-500/40',
            badge: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
            addBtn: 'border-indigo-500/30 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-500/15',
            iconContainer: 'bg-indigo-500/20',
        },
        snack: {
            headerBg:
                'bg-gradient-to-r from-orange-500/15 via-orange-500/[0.04] to-transparent',
            cardBg: 'bg-orange-500/[0.035] dark:bg-orange-500/[0.06]',
            border: 'border-orange-500/25 hover:border-orange-500/40',
            badge: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
            addBtn: 'border-orange-500/30 text-orange-800 dark:text-orange-200 hover:bg-orange-500/15',
            iconContainer: 'bg-orange-500/20',
        },
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Diary - ${selectedDate}`} />

            {/* Date Navigator Header */}
            <div className="flex flex-col items-center justify-between gap-4 border-b border-border/80 pb-4 sm:flex-row">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate(-1)}
                        className="shadow-2xs"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleSelectDate(e.target.value)}
                            className="w-auto text-sm font-semibold shadow-2xs"
                        />
                        {isToday && (
                            <Badge
                                variant="secondary"
                                className="border-primary/20 bg-primary/15 font-semibold text-primary"
                            >
                                {t('status.today')}
                            </Badge>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateDate(1)}
                        className="shadow-2xs"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {summary.weight_kg !== null && (
                    <div className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1.5 text-xs text-muted-foreground shadow-2xs">
                        <span>{t('status.logged_weight')}:</span>
                        <strong className="text-foreground">
                            {summary.weight_kg} kg
                        </strong>
                    </div>
                )}
            </div>

            {status && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm font-semibold text-primary shadow-2xs">
                    {status}
                </div>
            )}

            {/* Daily Nutrition Summary Card with Donut & Concentric Rings Views */}
            <Card className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.12]" />
                <CardContent className="relative space-y-5 p-5">
                    {/* Header View Switcher */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Macronutrient Breakdown
                        </span>
                        <div className="flex items-center rounded-lg border border-border/60 bg-muted/50 p-0.5 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setVisualizerMode('donut')}
                                className={cn(
                                    'rounded-md px-3 py-1 transition-all',
                                    visualizerMode === 'donut'
                                        ? 'bg-card font-bold text-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Donut Chart
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisualizerMode('rings')}
                                className={cn(
                                    'rounded-md px-3 py-1 transition-all',
                                    visualizerMode === 'rings'
                                        ? 'bg-card font-bold text-foreground shadow-2xs'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Concentric Rings
                            </button>
                        </div>
                    </div>

                    {visualizerMode === 'donut' ? (
                        <MacroDonutChart
                            calories={{
                                consumed: summary.total_calories,
                                target: summary.target_calories,
                                remaining: summary.remaining_calories,
                                unit: 'kcal',
                            }}
                            protein={{
                                consumed: summary.total_protein,
                                target: summary.target_protein,
                                unit: 'g',
                            }}
                            carbs={{
                                consumed: summary.total_carbs,
                                target: summary.target_carbs,
                                unit: 'g',
                            }}
                            fat={{
                                consumed: summary.total_fat,
                                target: summary.target_fat,
                                unit: 'g',
                            }}
                        />
                    ) : (
                        <ConcentricMacroRings
                            calories={{
                                consumed: summary.total_calories,
                                target: summary.target_calories,
                                remaining: summary.remaining_calories,
                                unit: 'kcal',
                            }}
                            protein={{
                                consumed: summary.total_protein,
                                target: summary.target_protein,
                                unit: 'g',
                            }}
                            carbs={{
                                consumed: summary.total_carbs,
                                target: summary.target_carbs,
                                unit: 'g',
                            }}
                            fat={{
                                consumed: summary.total_fat,
                                target: summary.target_fat,
                                unit: 'g',
                            }}
                        />
                    )}

                    {/* Micronutrient Summary Quick-Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                                Fiber:{' '}
                                <strong className="font-mono text-foreground">
                                    {Math.round(summary.total_fiber || 0)}g
                                </strong>{' '}
                                <span className="text-muted-foreground">
                                    / {Math.round(summary.target_fiber || 30)}g
                                </span>
                            </span>
                            <span className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                                Net Carbs:{' '}
                                <strong className="font-mono text-foreground">
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
                            <span className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1">
                                Sodium:{' '}
                                <strong className="font-mono text-foreground">
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
                            className="h-7 gap-1.5 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary dark:text-primary"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Detailed Micronutrients
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 7-Day Energy Intake Bar Chart */}
            {weeklyHistory && weeklyHistory.length > 0 && (
                <WeeklyIntakeBarChart
                    data={weeklyHistory}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                />
            )}

            {/* Meal Slots Section */}
            <div className="space-y-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(
                    (slotKey) => {
                        const slot = slots[slotKey];
                        const theme = slotThemes[slotKey];
                        return (
                            <Card
                                key={slotKey}
                                className={cn(
                                    'overflow-hidden rounded-2xl border shadow-2xs transition-all hover:shadow-xs',
                                    theme.border,
                                    theme.cardBg,
                                )}
                            >
                                <CardHeader
                                    className={cn(
                                        'flex flex-row items-center justify-between border-b border-border/40 px-4 py-3',
                                        theme.headerBg,
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={cn(
                                                'rounded-lg p-1.5 shadow-2xs',
                                                theme.iconContainer,
                                            )}
                                        >
                                            {slotIcons[slotKey]}
                                        </div>
                                        <CardTitle className="text-base font-semibold">
                                            {slotNames[slotKey]}
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'ml-1 font-mono text-xs font-bold',
                                                theme.badge,
                                            )}
                                        >
                                            {Math.round(slot.calories)} kcal
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openAddFood(slotKey)}
                                            className={cn(
                                                'h-8 gap-1.5 text-xs font-semibold shadow-2xs',
                                                theme.addBtn,
                                            )}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            {t('action.add_food')}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openQuickAdd(slotKey)
                                            }
                                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300"
                                        >
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                            {t('action.quick_add')}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    {slot.entries.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-xs text-muted-foreground">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground/60">
                                                {slotIcons[slotKey]}
                                            </div>
                                            <span>
                                                No items logged for{' '}
                                                {slotNames[
                                                    slotKey
                                                ].toLowerCase()}{' '}
                                                yet.
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openAddFood(slotKey)
                                                }
                                                className="h-7 text-xs font-semibold text-primary hover:text-primary/80"
                                            >
                                                + Add Food to{' '}
                                                {slotNames[slotKey]}
                                            </Button>
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
                                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                P:{' '}
                                                                {Number(
                                                                    entry.protein,
                                                                )}
                                                                g
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                C:{' '}
                                                                {Number(
                                                                    entry.carbs,
                                                                )}
                                                                g
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span className="font-semibold text-amber-600 dark:text-amber-400">
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

            {/* Daily Habits & Biomarkers: Water & Morning Weigh-In */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Water Tracker Widget */}
                <Card className="overflow-hidden rounded-2xl border border-sky-500/25 bg-card shadow-2xs transition-all hover:border-sky-500/40 hover:shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-gradient-to-r from-sky-500/10 via-sky-500/[0.03] to-transparent px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-sky-500/15 p-1.5 text-sky-500 shadow-2xs">
                                <Droplet className="h-4 w-4 fill-sky-500 text-sky-500" />
                            </div>
                            <CardTitle className="text-base font-semibold">
                                {t('diary.water_intake')}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className="ml-1 border-sky-500/25 bg-sky-500/10 font-mono text-xs font-bold text-sky-800 dark:text-sky-300"
                            >
                                {summary.water_ml} / {summary.target_water_ml}{' '}
                                ml
                            </Badge>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLogWater(250)}
                                className="h-7 border-sky-500/30 px-2 text-xs font-semibold text-sky-800 shadow-2xs hover:bg-sky-500/10 dark:text-sky-200"
                            >
                                +250 ml
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLogWater(500)}
                                className="h-7 border-sky-500/30 px-2 text-xs font-semibold text-sky-800 shadow-2xs hover:bg-sky-500/10 dark:text-sky-200"
                            >
                                +500 ml
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLogWater(750)}
                                className="h-7 border-sky-500/30 px-2 text-xs font-semibold text-sky-800 shadow-2xs hover:bg-sky-500/10 dark:text-sky-200"
                            >
                                +750 ml
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Morning Weigh-In Widget */}
                <Card className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-card shadow-2xs transition-all hover:border-emerald-500/40 hover:shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.03] to-transparent px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-500 shadow-2xs">
                                <Scale className="h-4 w-4 text-emerald-500" />
                            </div>
                            <CardTitle className="text-base font-semibold">
                                {t('diary.weigh_in')}
                            </CardTitle>
                            {summary.weight_kg !== null ? (
                                <Badge
                                    variant="outline"
                                    className="ml-1 border-emerald-500/25 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300"
                                >
                                    {summary.weight_kg} kg
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="ml-1 border-muted bg-muted/40 text-xs font-medium text-muted-foreground"
                                >
                                    {t('diary.not_logged')}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            {summary.weight_kg !== null ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isWeightSubmitting}
                                        onClick={() =>
                                            handleQuickWeightAdjust(-0.1)
                                        }
                                        className="h-7 border-emerald-500/30 px-2 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-500/10 dark:text-emerald-200"
                                    >
                                        -0.1 kg
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isWeightSubmitting}
                                        onClick={() =>
                                            handleQuickWeightAdjust(0.1)
                                        }
                                        className="h-7 border-emerald-500/30 px-2 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-500/10 dark:text-emerald-200"
                                    >
                                        +0.1 kg
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setIsWeightModalOpen(true)
                                        }
                                        className="h-7 border-emerald-500/30 px-2.5 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-500/10 dark:text-emerald-200"
                                    >
                                        {t('diary.update_weight')}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsWeightModalOpen(true)}
                                    className="h-7 border-emerald-500/30 px-3 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-500/10 dark:text-emerald-200"
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    {t('diary.log_weight')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </div>

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
                            {/* Text Search & Camera Trigger */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search recent foods or Open Food Facts catalog..."
                                        value={foodFilter}
                                        onChange={(e) =>
                                            setFoodFilter(e.target.value)
                                        }
                                        className="pr-8 pl-9"
                                        autoFocus
                                    />
                                    {isSearching && (
                                        <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setScannerOpen(true)}
                                    className="shrink-0 gap-1.5 border-emerald-500/30 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                >
                                    <Camera className="h-3.5 w-3.5 text-emerald-600" />
                                    {t('action.scan')}
                                </Button>
                            </div>

                            {/* Direct Numerical Barcode Input */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleBarcodeLookup(barcodeQuery);
                                }}
                                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2"
                            >
                                <Barcode className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <Input
                                    placeholder="Or enter barcode number (e.g. 7622210449283)..."
                                    value={barcodeQuery}
                                    onChange={(e) =>
                                        setBarcodeQuery(e.target.value)
                                    }
                                    className="h-8 flex-1 font-mono text-xs"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="secondary"
                                    disabled={
                                        isBarcodeLoading || !barcodeQuery.trim()
                                    }
                                    className="h-8 shrink-0 text-xs"
                                >
                                    {isBarcodeLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        t('action.lookup')
                                    )}
                                </Button>
                            </form>
                            {barcodeError && (
                                <p className="text-xs text-destructive">
                                    {barcodeError}
                                </p>
                            )}

                            {/* Search Results Container */}
                            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                                {/* Filtered Recent Foods */}
                                {recentFoods.filter(
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
                                ).length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            <Clock className="h-3 w-3" />
                                            Recent & Logged Foods
                                        </div>
                                        <div className="space-y-1">
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
                                                        key={`recent-${food.id}`}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectFood(
                                                                food,
                                                            )
                                                        }
                                                        className="group flex w-full items-center justify-between rounded-lg border border-border/40 p-2 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                                                {food.image_url ? (
                                                                    <img
                                                                        src={
                                                                            food.image_url
                                                                        }
                                                                        alt={
                                                                            food.name
                                                                        }
                                                                        className="h-full w-full object-contain p-0.5"
                                                                        loading="lazy"
                                                                        onError={(
                                                                            e,
                                                                        ) => {
                                                                            (
                                                                                e.currentTarget as HTMLElement
                                                                            ).style.display =
                                                                                'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Utensils className="h-4 w-4 text-muted-foreground/50" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
                                                                        {
                                                                            food.name
                                                                        }
                                                                    </span>
                                                                    {food.nutri_score && (
                                                                        <span
                                                                            className={`shrink-0 rounded px-1 text-[9px] font-bold uppercase ${
                                                                                food.nutri_score.toLowerCase() ===
                                                                                'a'
                                                                                    ? 'bg-emerald-600 text-white'
                                                                                    : food.nutri_score.toLowerCase() ===
                                                                                        'b'
                                                                                      ? 'bg-green-500 text-white'
                                                                                      : food.nutri_score.toLowerCase() ===
                                                                                          'c'
                                                                                        ? 'bg-yellow-500 text-black'
                                                                                        : food.nutri_score.toLowerCase() ===
                                                                                            'd'
                                                                                          ? 'bg-orange-500 text-white'
                                                                                          : 'bg-red-600 text-white'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                food.nutri_score
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="line-clamp-1 text-xs text-muted-foreground">
                                                                    {food.brand ||
                                                                        'Generic'}{' '}
                                                                    &bull;{' '}
                                                                    {Math.round(
                                                                        Number(
                                                                            food.calories,
                                                                        ),
                                                                    )}{' '}
                                                                    kcal /{' '}
                                                                    {Number(
                                                                        food.serving_size,
                                                                    )}
                                                                    {
                                                                        food.serving_unit
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2 shrink-0 text-xs"
                                                        >
                                                            Select
                                                        </Badge>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Open Food Facts Remote Search Results */}
                                {remoteResults.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                            <Globe className="h-3 w-3" />
                                            Open Food Facts Catalog (
                                            {remoteResults.length})
                                        </div>
                                        <div className="space-y-1">
                                            {remoteResults.map((food) => (
                                                <button
                                                    key={`off-${food.id}`}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectFood(food)
                                                    }
                                                    className="group flex w-full items-center justify-between rounded-lg border border-border/40 p-2 text-left transition-colors hover:border-emerald-500/50 hover:bg-muted/50"
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
                                                            {food.image_url ? (
                                                                <img
                                                                    src={
                                                                        food.image_url
                                                                    }
                                                                    alt={
                                                                        food.name
                                                                    }
                                                                    className="h-full w-full object-contain p-0.5"
                                                                    loading="lazy"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.currentTarget as HTMLElement
                                                                        ).style.display =
                                                                            'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Utensils className="h-4 w-4 text-muted-foreground/50" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
                                                                    {food.name}
                                                                </span>
                                                                {food.nutri_score && (
                                                                    <span
                                                                        className={`shrink-0 rounded px-1 text-[9px] font-bold uppercase ${
                                                                            food.nutri_score.toLowerCase() ===
                                                                            'a'
                                                                                ? 'bg-emerald-600 text-white'
                                                                                : food.nutri_score.toLowerCase() ===
                                                                                    'b'
                                                                                  ? 'bg-green-500 text-white'
                                                                                  : food.nutri_score.toLowerCase() ===
                                                                                      'c'
                                                                                    ? 'bg-yellow-500 text-black'
                                                                                    : food.nutri_score.toLowerCase() ===
                                                                                        'd'
                                                                                      ? 'bg-orange-500 text-white'
                                                                                      : 'bg-red-600 text-white'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            food.nutri_score
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="line-clamp-1 text-xs text-muted-foreground">
                                                                {food.brand ||
                                                                    'Generic'}{' '}
                                                                &bull;{' '}
                                                                {Math.round(
                                                                    Number(
                                                                        food.calories,
                                                                    ),
                                                                )}{' '}
                                                                kcal /{' '}
                                                                {Number(
                                                                    food.serving_size,
                                                                )}
                                                                {
                                                                    food.serving_unit
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 shrink-0 border-emerald-500/30 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                                    >
                                                        Select
                                                    </Badge>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recentFoods.filter(
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
                                ).length === 0 &&
                                    remoteResults.length === 0 &&
                                    !isSearching && (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            {foodFilter.trim().length >= 2
                                                ? 'No foods found in recent items or Open Food Facts. Try another keyword or scan the barcode.'
                                                : 'No recent foods logged yet. Type product name to search Open Food Facts catalog.'}
                                        </div>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={submitAddFood}
                            className="space-y-4 py-1"
                        >
                            {/* Food Product Header with Image and Details */}
                            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    {selectedFood.image_url ? (
                                        <img
                                            src={selectedFood.image_url}
                                            alt={selectedFood.name}
                                            className="h-12 w-12 shrink-0 rounded-lg border border-border/80 object-cover shadow-xs"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
                                            <Utensils className="h-6 w-6 opacity-40" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="line-clamp-1 text-sm font-bold text-foreground">
                                            {selectedFood.name}
                                        </div>
                                        <div className="line-clamp-1 text-xs text-muted-foreground">
                                            {selectedFood.brand ||
                                                'Generic / Homemade'}
                                        </div>
                                        {selectedFood.barcode && (
                                            <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                                <Barcode className="h-3 w-3" />
                                                {selectedFood.barcode}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFood(null)}
                                    className="ml-2 shrink-0 text-xs text-primary"
                                >
                                    Change Food
                                </Button>
                            </div>

                            {/* Flexible Serving Mode Selector */}
                            <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/40 p-1">
                                <button
                                    type="button"
                                    onClick={() => setPortionMode('weight')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                                        portionMode === 'weight'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Scale className="h-3.5 w-3.5" />
                                    {t('foods.unit_mode_weight')} (g/ml)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPortionMode('serving')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all ${
                                        portionMode === 'serving'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Utensils className="h-3.5 w-3.5" />
                                    {t('foods.unit_mode_serving')}
                                </button>
                            </div>

                            {portionMode === 'weight' ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-foreground">
                                            {t('foods.enter_grams_ml')}
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">
                                            Base:{' '}
                                            {Number(selectedFood.serving_size)}
                                            {selectedFood.serving_unit || 'g'}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="5000"
                                            step="1"
                                            value={customGrams}
                                            onChange={(e) =>
                                                setCustomGrams(
                                                    Math.max(
                                                        1,
                                                        Number(
                                                            e.target.value,
                                                        ) || 0,
                                                    ),
                                                )
                                            }
                                            className="pr-12 text-base font-semibold"
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                                            {selectedFood.serving_unit || 'g'}
                                        </span>
                                    </div>

                                    {/* Quick Amount Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {[50, 100, 150, 200, 250].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() =>
                                                    setCustomGrams(amt)
                                                }
                                                className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                                                    customGrams === amt
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border/80 bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground'
                                                }`}
                                            >
                                                {amt}
                                                {selectedFood.serving_unit ||
                                                    'g'}
                                            </button>
                                        ))}
                                        <div className="ml-auto flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCustomGrams((prev) =>
                                                        Math.max(1, prev - 25),
                                                    )
                                                }
                                                className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                                            >
                                                -25g
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCustomGrams(
                                                        (prev) => prev + 25,
                                                    )
                                                }
                                                className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                                            >
                                                +25g
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">
                                            Serving Unit
                                        </Label>
                                        <select
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden"
                                            value={
                                                selectedServing?.serving_name ||
                                                ''
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
                                                        value={
                                                            serving.serving_name
                                                        }
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
                                            {t('foods.portion_multiplier')}
                                        </Label>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 shrink-0"
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.max(
                                                            0.1,
                                                            Math.round(
                                                                (q - 0.5) * 10,
                                                            ) / 10,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
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
                                                            Number(
                                                                e.target.value,
                                                            ) || 1,
                                                        ),
                                                    )
                                                }
                                                className="text-center font-semibold"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 shrink-0"
                                                onClick={() =>
                                                    setQuantity(
                                                        (q) =>
                                                            Math.round(
                                                                (q + 0.5) * 10,
                                                            ) / 10,
                                                    )
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Scaled Nutrition Summary */}
                            {(() => {
                                const baseSize =
                                    Number(selectedFood.serving_size) > 0
                                        ? Number(selectedFood.serving_size)
                                        : 100;
                                const curGrams =
                                    portionMode === 'weight'
                                        ? customGrams
                                        : Number(
                                              selectedServing?.gram_equivalent ||
                                                  baseSize,
                                          ) * quantity;
                                const curFactor = curGrams / baseSize;
                                const curCalories = Math.round(
                                    Number(selectedFood.calories) * curFactor,
                                );
                                const curProtein =
                                    Math.round(
                                        Number(selectedFood.protein) *
                                            curFactor *
                                            10,
                                    ) / 10;
                                const curCarbs =
                                    Math.round(
                                        Number(selectedFood.carbs) *
                                            curFactor *
                                            10,
                                    ) / 10;
                                const curFat =
                                    Math.round(
                                        Number(selectedFood.fat) *
                                            curFactor *
                                            10,
                                    ) / 10;
                                const isZeroCal =
                                    Number(selectedFood.calories) === 0 &&
                                    Number(selectedFood.protein) === 0 &&
                                    Number(selectedFood.carbs) === 0 &&
                                    Number(selectedFood.fat) === 0;

                                return (
                                    <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                                        <div className="flex items-center justify-between border-b border-primary/10 pb-1.5 text-xs text-muted-foreground">
                                            <span>Calculated Portion:</span>
                                            <span className="font-bold text-foreground">
                                                {Math.round(curGrams * 10) / 10}
                                                {selectedFood.serving_unit ||
                                                    'g'}
                                            </span>
                                        </div>

                                        <div className="my-1 text-2xl font-black text-primary">
                                            {curCalories} kcal
                                        </div>

                                        {isZeroCal && (
                                            <div className="flex items-start gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 p-2 text-left text-xs text-blue-700 dark:text-blue-300">
                                                <Droplet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                                                <span className="text-[11px] leading-tight">
                                                    {t(
                                                        'foods.zero_calorie_explanation',
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-3 gap-2 border-t border-primary/10 pt-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Protein:{' '}
                                                </span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {curProtein}g
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Carbs:{' '}
                                                </span>
                                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                                    {curCarbs}g
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Fat:{' '}
                                                </span>
                                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                                    {curFat}g
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

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
                                {t('action.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={quickAddForm.processing}
                            >
                                {t('diary.add_calories')}
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

            {/* Morning Weigh-In Dialog */}
            <Dialog
                open={isWeightModalOpen}
                onOpenChange={setIsWeightModalOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scale className="h-5 w-5 text-emerald-500" />
                            {t('diary.weigh_in')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('diary.record_weight')}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSaveWeight}
                        className="space-y-4 py-2"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="weight_kg">
                                    {t('diary.weight_kg')}
                                </Label>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {selectedDate}
                                </span>
                            </div>
                            <div className="relative">
                                <Input
                                    id="weight_kg"
                                    type="number"
                                    step="0.1"
                                    min="20"
                                    max="400"
                                    required
                                    placeholder={t('diary.weight_placeholder')}
                                    value={weightInput}
                                    onChange={(e) =>
                                        setWeightInput(e.target.value)
                                    }
                                    className="pr-12 text-lg font-bold"
                                />
                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                    kg
                                </span>
                            </div>

                            {/* Quick Increment Steppers */}
                            <div className="flex items-center justify-between gap-1.5 pt-1">
                                {[-0.5, -0.1, 0.1, 0.5].map((delta) => (
                                    <Button
                                        key={delta}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const current = weightInput
                                                ? parseFloat(weightInput)
                                                : 75.0;
                                            const next = Math.max(
                                                20,
                                                Math.min(
                                                    400,
                                                    Math.round(
                                                        (current + delta) * 10,
                                                    ) / 10,
                                                ),
                                            );
                                            setWeightInput(next.toString());
                                        }}
                                        className="h-7 flex-1 text-xs font-semibold"
                                    >
                                        {delta > 0 ? `+${delta}` : delta}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="weight_note">
                                {t('diary.weight_note')}
                            </Label>
                            <Input
                                id="weight_note"
                                type="text"
                                placeholder={t('diary.description_placeholder')}
                                value={weightNote}
                                onChange={(e) => setWeightNote(e.target.value)}
                            />
                        </div>

                        {confirmDeleteWeight && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                <p className="font-semibold">
                                    {t('diary.confirm_delete_weight')}
                                </p>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteWeight}
                                        disabled={isWeightSubmitting}
                                        className="h-7 text-xs"
                                    >
                                        {t('action.delete')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setConfirmDeleteWeight(false)
                                        }
                                        className="h-7 text-xs"
                                    >
                                        {t('action.cancel')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
                            <div>
                                {summary.weight_kg !== null &&
                                    !confirmDeleteWeight && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setConfirmDeleteWeight(true)
                                            }
                                            disabled={isWeightSubmitting}
                                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            {t('action.delete')}
                                        </Button>
                                    )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsWeightModalOpen(false);
                                        setConfirmDeleteWeight(false);
                                    }}
                                >
                                    {t('action.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={
                                        isWeightSubmitting || !weightInput
                                    }
                                >
                                    {isWeightSubmitting ? (
                                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                    ) : null}
                                    {t('action.save')}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
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
