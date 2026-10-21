import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Apple,
    ArrowRight,
    Barcode,
    Calculator,
    CalendarPlus,
    Camera,
    Check,
    CheckCircle2,
    Database,
    Droplets,
    ExternalLink,
    Globe,
    Loader2,
    Minus,
    Pencil,
    Plus,
    RefreshCw,
    Scale,
    Search,
    Sparkles,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BarcodeScannerModal from '@/components/barcode-scanner-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getEcho } from '@/echo';
import { openFoodChecker } from '@/hooks/use-food-checker';
import { useTranslation } from '@/lib/i18n';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

export interface FoodServingData {
    id?: number;
    food_id?: number;
    serving_name: string;
    gram_equivalent: number | string;
    is_default: boolean;
}

export interface FoodItem {
    id: number;
    off_id?: string | null;
    user_id?: number | null;
    is_custom: boolean;
    name: string;
    brand?: string | null;
    barcode?: string | null;
    image_url?: string | null;
    serving_size: number | string;
    serving_unit: string;
    calories: number | string;
    protein: number | string;
    carbs: number | string;
    fat: number | string;
    fiber?: number | string | null;
    sugar?: number | string | null;
    saturated_fat?: number | string | null;
    sodium?: number | string | null;
    nutri_score?: string | null;
    nova_group?: number | null;
    eco_score?: string | null;
    servings: FoodServingData[];
    search_origin?: string | null;
}

interface Props {
    initialFoods: FoodItem[];
    customFoods: FoodItem[];
    totalCachedFoods?: number;
    totalCustomFoods?: number;
    searchResult?: {
        items: FoodItem[];
        source: 'off_authenticated' | 'off_anonymous' | 'cache';
        is_degraded: boolean;
        total: number;
    } | null;
    searchQuery?: string | null;
    searchBarcode?: string | null;
    status?: string;
    isOffConnected?: boolean;
}

export default function FoodsIndex({
    initialFoods,
    customFoods,
    totalCachedFoods,
    totalCustomFoods,
    searchResult,
    searchQuery,
    searchBarcode,
    status,
    isOffConnected = false,
}: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const [searchTerm, setSearchTerm] = useState(
        searchQuery || searchBarcode || '',
    );
    const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');

    // Reverb Sync Progress State
    const [syncProgress, setSyncProgress] = useState<{
        active: boolean;
        percent: number;
        status: string;
        savedCount: number;
        completed: boolean;
    } | null>(null);

    // Dismissible Open Food Facts Information Banner
    const [showOffBanner, setShowOffBanner] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('kcal_hide_off_banner') !== 'true';
        }
        return false;
    });

    const handleDismissBanner = () => {
        setShowOffBanner(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kcal_hide_off_banner', 'true');
        }
    };

    // Open Food Facts Sync Modal State
    const [isSyncOpen, setIsSyncOpen] = useState(false);
    const [syncCount, setSyncCount] = useState<number>(50);
    const [syncCategory, setSyncCategory] = useState<string>('staples');
    const [syncTerms, setSyncTerms] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);

    // Listen for background sync progress & completion events via WebSockets (Reverb)
    useEffect(() => {
        const echo = getEcho();
        if (!echo) return;

        const userId = auth?.user?.id;
        const channel = echo.channel('foods');
        const userChannel = userId ? echo.private(`user.${userId}`) : null;

        const handleProgress = (event: {
            current: number;
            total: number;
            percent: number;
            status: string;
            saved_count: number;
            is_completed?: boolean;
        }) => {
            const isDone = Boolean(event.is_completed || event.percent >= 100);
            setSyncProgress({
                active: !isDone,
                percent: Math.min(100, Math.max(0, event.percent)),
                status: event.status,
                savedCount: event.saved_count,
                completed: isDone,
            });

            if (isDone) {
                router.reload({
                    only: [
                        'initialFoods',
                        'totalCachedFoods',
                        'totalCustomFoods',
                    ],
                });
                setTimeout(() => {
                    setSyncProgress((prev) => (prev?.completed ? null : prev));
                }, 6000);
            }
        };

        const handleSynced = (event: {
            saved_count: number;
            total_foods: number;
        }) => {
            setSyncProgress({
                active: false,
                percent: 100,
                status: `Sync complete! ${event.saved_count} items added to catalog.`,
                savedCount: event.saved_count,
                completed: true,
            });
            router.reload({
                only: ['initialFoods', 'totalCachedFoods', 'totalCustomFoods'],
            });
            setTimeout(() => {
                setSyncProgress((prev) => (prev?.completed ? null : prev));
            }, 6000);
        };

        channel.listen('.FoodCatalogSyncProgress', handleProgress);
        channel.listen('.FoodCatalogSynced', handleSynced);

        if (userChannel) {
            userChannel.listen('.FoodCatalogSyncProgress', handleProgress);
            userChannel.listen('.FoodCatalogSynced', handleSynced);
        }

        return () => {
            channel.stopListening('.FoodCatalogSyncProgress');
            channel.stopListening('.FoodCatalogSynced');
            if (userChannel) {
                userChannel.stopListening('.FoodCatalogSyncProgress');
                userChannel.stopListening('.FoodCatalogSynced');
            }
        };
    }, [auth?.user?.id]);

    // Polling fallback to check sync status on mount and while sync is in progress
    useEffect(() => {
        let isMounted = true;
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const checkStatus = async () => {
            try {
                const res = await fetch('/foods/sync/status', {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!isMounted || !data?.progress) return;

                const p = data.progress;
                const isDone = Boolean(p.completed || p.percent >= 100);

                if (p.active || p.completed) {
                    setSyncProgress((prev) => {
                        const percent = Math.max(
                            prev?.percent || 0,
                            Math.min(100, Number(p.percent) || 0),
                        );
                        return {
                            active: Boolean(p.active),
                            percent,
                            status: p.status || '',
                            savedCount: Number(p.saved_count) || 0,
                            completed: isDone,
                        };
                    });

                    if (isDone) {
                        router.reload({
                            only: [
                                'initialFoods',
                                'totalCachedFoods',
                                'totalCustomFoods',
                            ],
                        });
                        setTimeout(() => {
                            if (isMounted) {
                                setSyncProgress((prev) =>
                                    prev?.completed ? null : prev,
                                );
                            }
                        }, 6000);
                    }
                }
            } catch {
                // Ignore network errors in status poll
            }
        };

        void checkStatus();

        if (syncProgress?.active) {
            pollTimer = setInterval(() => {
                void checkStatus();
            }, 2000);
        }

        return () => {
            isMounted = false;
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [syncProgress?.active]);

    const handleTriggerSync = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSyncing(true);
        setSyncProgress({
            active: true,
            percent: 5,
            status: `Starting sync for ${syncCount} items...`,
            savedCount: 0,
            completed: false,
        });
        setIsSyncOpen(false);

        router.post(
            '/foods/sync',
            {
                count: syncCount,
                category: syncCategory,
                terms: syncTerms,
            },
            {
                onFinish: () => {
                    setIsSyncing(false);
                },
            },
        );
    };

    // Portion Calculator Dialog State
    const [calculatingFood, setCalculatingFood] = useState<FoodItem | null>(
        null,
    );
    const [selectedServing, setSelectedServing] =
        useState<FoodServingData | null>(null);
    const [portionMode, setPortionMode] = useState<'weight' | 'serving'>(
        'weight',
    );
    const [customGrams, setCustomGrams] = useState<number>(100);
    const [quantity, setQuantity] = useState<number>(1);
    const [logMealSlot, setLogMealSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');
    const [logDate, setLogDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [isLoggingToDiary, setIsLoggingToDiary] = useState(false);

    // Create Custom Food Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    const customFoodForm = useForm({
        name: '',
        brand: '',
        barcode: '',
        serving_size: 100,
        serving_unit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: '',
        sugar: '',
        saturated_fat: '',
        sodium: '',
        servings: [
            {
                serving_name: '1 portion (100g)',
                gram_equivalent: 100,
                is_default: true,
            },
        ],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            router.get('/foods', { q: trimmed }, { preserveState: true });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get('/foods', {}, { preserveState: true });
    };

    const openCalculator = (food: FoodItem) => {
        setCalculatingFood(food);
        const defaultServing = food.servings.find((s) => s.is_default) ||
            food.servings[0] || {
                serving_name: `${food.serving_size}${food.serving_unit || 'g'}`,
                gram_equivalent: Number(food.serving_size) || 100,
                is_default: true,
            };
        setSelectedServing(defaultServing);
        const initialWeight =
            Number(defaultServing.gram_equivalent) > 0
                ? Number(defaultServing.gram_equivalent)
                : Number(food.serving_size) > 0
                  ? Number(food.serving_size)
                  : 100;
        setCustomGrams(initialWeight);
        setQuantity(1);
        setPortionMode('weight');
    };

    const handleCreateCustomFood = (e: React.FormEvent) => {
        e.preventDefault();
        customFoodForm.post('/foods/custom', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                customFoodForm.reset();
            },
        });
    };

    // Edit Custom Food Dialog State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

    const editFoodForm = useForm({
        name: '',
        brand: '',
        barcode: '',
        serving_size: 100,
        serving_unit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: '',
        sugar: '',
        saturated_fat: '',
        sodium: '',
    });

    const handleOpenEditCustomFood = (food: FoodItem) => {
        setEditingFood(food);
        editFoodForm.setData({
            name: food.name,
            brand: food.brand || '',
            barcode: food.barcode || '',
            serving_size: Number(food.serving_size) || 100,
            serving_unit: food.serving_unit || 'g',
            calories: Number(food.calories) || 0,
            protein: Number(food.protein) || 0,
            carbs: Number(food.carbs) || 0,
            fat: Number(food.fat) || 0,
            fiber:
                food.fiber !== null && food.fiber !== undefined
                    ? String(food.fiber)
                    : '',
            sugar:
                food.sugar !== null && food.sugar !== undefined
                    ? String(food.sugar)
                    : '',
            saturated_fat:
                food.saturated_fat !== null && food.saturated_fat !== undefined
                    ? String(food.saturated_fat)
                    : '',
            sodium:
                food.sodium !== null && food.sodium !== undefined
                    ? String(food.sodium)
                    : '',
        });
        setIsEditOpen(true);
    };

    const handleUpdateCustomFood = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFood) return;

        editFoodForm.put(`/foods/custom/${editingFood.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingFood(null);
            },
        });
    };

    const [deleteFoodId, setDeleteFoodId] = useState<number | null>(null);

    const handleDeleteCustomFood = (foodId: number) => {
        setDeleteFoodId(foodId);
    };

    const handleLogToDiary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!calculatingFood) return;

        setIsLoggingToDiary(true);
        const baseSize =
            Number(calculatingFood.serving_size) > 0
                ? Number(calculatingFood.serving_size)
                : 100;

        router.post(
            '/diary',
            {
                food_id: calculatingFood.id,
                food_serving_id:
                    portionMode === 'serving'
                        ? (selectedServing?.id ?? null)
                        : null,
                custom_grams: portionMode === 'weight' ? customGrams : null,
                quantity:
                    portionMode === 'weight'
                        ? Math.round((customGrams / baseSize) * 100) / 100
                        : quantity,
                date: logDate,
                meal_slot: logMealSlot,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCalculatingFood(null);
                },
                onFinish: () => setIsLoggingToDiary(false),
            },
        );
    };

    // Scaled portion calculations
    const calculateNutrition = () => {
        if (!calculatingFood) return null;
        const baseSize =
            Number(calculatingFood.serving_size) > 0
                ? Number(calculatingFood.serving_size)
                : 100;
        const totalGrams =
            portionMode === 'weight'
                ? customGrams
                : Number(selectedServing?.gram_equivalent || baseSize) *
                  quantity;
        const factor = totalGrams / baseSize;

        return {
            totalGrams: Math.round(totalGrams * 10) / 10,
            calories:
                Math.round(Number(calculatingFood.calories) * factor * 10) / 10,
            protein:
                Math.round(Number(calculatingFood.protein) * factor * 10) / 10,
            carbs: Math.round(Number(calculatingFood.carbs) * factor * 10) / 10,
            fat: Math.round(Number(calculatingFood.fat) * factor * 10) / 10,
            fiber: calculatingFood.fiber
                ? Math.round(Number(calculatingFood.fiber) * factor * 10) / 10
                : null,
            sugar: calculatingFood.sugar
                ? Math.round(Number(calculatingFood.sugar) * factor * 10) / 10
                : null,
            sodium: calculatingFood.sodium
                ? Math.round(Number(calculatingFood.sodium) * factor * 10) / 10
                : null,
        };
    };

    const scaledNutrition = calculateNutrition();

    const displayFoods = searchResult
        ? searchResult.items
        : activeTab === 'custom'
          ? customFoods
          : initialFoods;

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={t('foods.title')} />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('foods.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('foods.subtitle')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => openFoodChecker()}
                        className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                    >
                        <Search className="h-4 w-4" />
                        <span>{t('food_checker.trigger_button')}</span>
                        <kbd className="py-0.2 hidden rounded border border-border/80 bg-background px-1 text-[10px] font-semibold text-muted-foreground shadow-2xs sm:inline-block">
                            ⌘K
                        </kbd>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSyncOpen(true)}
                        className="gap-2 border-primary/20 hover:bg-primary/5"
                    >
                        <RefreshCw className="h-4 w-4 text-primary" />
                        {t('foods.sync_button')}
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2 bg-primary text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" />
                        {t('foods.create_custom_food')}
                    </Button>
                </div>
            </div>

            {status && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Open Food Facts Information & Connection Banner */}
            {!isOffConnected && showOffBanner && (
                <div
                    data-testid="off-catalog-banner"
                    className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:flex-row sm:items-center dark:border-primary/30"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {t('foods.off_banner_title')}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-normal text-emerald-600 dark:text-emerald-400"
                                >
                                    Active
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('foods.off_banner_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                        <Link
                            href="/settings/open-food-facts"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90"
                        >
                            {t('foods.off_banner_action')}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                            type="button"
                            onClick={handleDismissBanner}
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
                            aria-label={t('foods.off_banner_dismiss')}
                            title={t('foods.off_banner_dismiss')}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Live Reverb WebSockets Sync Progress Bar */}
            {syncProgress && (
                <div
                    data-testid="sync-progress-banner"
                    className="relative overflow-hidden rounded-xl border border-primary/30 bg-card p-4 shadow-xs transition-all duration-300"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                {syncProgress.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        {syncProgress.completed
                                            ? t('foods.sync_completed')
                                            : t('foods.sync_progress_title')}
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className={
                                            syncProgress.completed
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400'
                                                : 'border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-600 dark:text-blue-400'
                                        }
                                    >
                                        {syncProgress.completed
                                            ? 'Done'
                                            : `${syncProgress.percent}%`}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {syncProgress.status}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {syncProgress.savedCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    +
                                    {t('foods.sync_progress_items', {
                                        count: syncProgress.savedCount,
                                    })}
                                </Badge>
                            )}
                            <button
                                type="button"
                                onClick={() => setSyncProgress(null)}
                                className="rounded p-1 text-muted-foreground hover:text-foreground"
                                aria-label="Dismiss progress"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${
                                syncProgress.completed
                                    ? 'bg-emerald-500'
                                    : 'bg-primary'
                            }`}
                            style={{
                                width: `${Math.max(5, syncProgress.percent)}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Unified Search Bar */}
            <Card className="border-border/60 shadow-xs">
                <CardContent className="p-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t('foods.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pr-9 pl-9 text-sm"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setScannerOpen(true)}
                                className="h-10 gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                            >
                                <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="hidden sm:inline">
                                    {t('foods.scan_camera')}
                                </span>
                            </Button>
                            <Button type="submit" className="h-10 gap-2">
                                <Search className="h-4 w-4" />
                                <span>{t('action.lookup')}</span>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Degraded mode / Source alert banner */}
            {searchResult && (
                <div className="flex flex-col items-start justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 p-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        {searchResult.is_degraded ? (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-amber-500/40 bg-amber-500/10 py-1 text-amber-600 dark:text-amber-400"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {t('foods.degraded_mode')}
                            </Badge>
                        ) : searchResult.source === 'off_authenticated' ? (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 py-1 text-emerald-600 dark:text-emerald-400"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                Open Food Facts (Authenticated)
                            </Badge>
                        ) : searchResult.source === 'off_anonymous' ? (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-blue-500/40 bg-blue-500/10 py-1 text-blue-600 dark:text-blue-400"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                Open Food Facts (Public API)
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-purple-500/40 bg-purple-500/10 py-1 text-purple-600 dark:text-purple-400"
                            >
                                <Database className="h-3.5 w-3.5" />
                                Local Database
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Found {searchResult.total} product
                            {searchResult.total === 1 ? '' : 's'}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="text-xs"
                    >
                        {t('foods.clear_search')}
                    </Button>
                </div>
            )}

            {/* Navigation Tabs (when not actively viewing search results) */}
            {!searchResult && (
                <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeTab === 'all' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('all')}
                            className="gap-2"
                        >
                            <Utensils className="h-4 w-4" />
                            {t('foods.common_cached')} (
                            {totalCachedFoods ?? initialFoods.length})
                        </Button>
                        <Button
                            variant={
                                activeTab === 'custom' ? 'default' : 'ghost'
                            }
                            size="sm"
                            onClick={() => setActiveTab('custom')}
                            className="gap-2"
                        >
                            <Apple className="h-4 w-4" />
                            {t('foods.my_custom')} (
                            {totalCustomFoods ?? customFoods.length})
                        </Button>
                    </div>

                    {activeTab === 'all' &&
                        (totalCachedFoods ?? initialFoods.length) > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {t('foods.showing_count', {
                                    showing: initialFoods.length,
                                    total:
                                        totalCachedFoods ?? initialFoods.length,
                                })}
                            </div>
                        )}
                </div>
            )}

            {/* Foods Grid */}
            {displayFoods.length === 0 ? (
                <Card className="border-dashed p-12 text-center">
                    <Utensils className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                    <h3 className="text-base font-semibold">No foods found</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                        {searchResult
                            ? 'No matches in Open Food Facts or local cache. Try another keyword or create a custom food.'
                            : 'You have not added any custom foods yet.'}
                    </p>
                    <div className="mt-4">
                        <Button onClick={() => setIsCreateOpen(true)} size="sm">
                            Create Custom Food
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayFoods.map((food) => (
                        <Card
                            key={food.id}
                            className="flex flex-col justify-between transition-colors hover:border-primary/50"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-3">
                                    <div
                                        onClick={() => openFoodChecker(food)}
                                        className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30 transition hover:border-primary/50"
                                        title={t('food_checker.quick_check')}
                                    >
                                        {food.image_url ? (
                                            <img
                                                src={food.image_url}
                                                alt={food.name}
                                                className="h-full w-full object-contain p-1"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (
                                                        e.currentTarget as HTMLElement
                                                    ).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <Utensils className="h-6 w-6 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-1">
                                            <CardTitle
                                                onClick={() =>
                                                    openFoodChecker(food)
                                                }
                                                className="line-clamp-1 cursor-pointer text-base leading-tight font-semibold transition hover:text-primary"
                                                title={`${food.name} - ${t('food_checker.quick_check')}`}
                                            >
                                                {food.name}
                                            </CardTitle>

                                            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                                {food.is_custom ||
                                                food.search_origin ===
                                                    'custom' ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 gap-1 border-purple-500/30 bg-purple-500/10 text-[10px] font-medium text-purple-600 dark:text-purple-400"
                                                    >
                                                        <Apple className="h-3 w-3" />
                                                        {t(
                                                            'foods.badge_custom',
                                                        )}
                                                    </Badge>
                                                ) : food.search_origin ===
                                                  'openfoodfacts' ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                                    >
                                                        <Globe className="h-3 w-3" />
                                                        {t(
                                                            'foods.badge_openfoodfacts',
                                                        )}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 gap-1 border-blue-500/30 bg-blue-500/10 text-[10px] font-medium text-blue-600 dark:text-blue-400"
                                                    >
                                                        <Database className="h-3 w-3" />
                                                        {t(
                                                            'foods.badge_in_database',
                                                        )}
                                                    </Badge>
                                                )}

                                                {food.nutri_score && (
                                                    <Badge
                                                        className={`shrink-0 text-[10px] font-bold uppercase ${
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
                                                        Nutri {food.nutri_score}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <CardDescription className="flex items-center justify-between text-xs">
                                            <span className="line-clamp-1">
                                                {food.brand ||
                                                    'Generic / Homemade'}
                                            </span>
                                            {food.barcode && (
                                                <span className="ml-2 flex shrink-0 items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                                    <Barcode className="h-3 w-3" />
                                                    {food.barcode}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-2">
                                {/* Nutrition Pill Indicators */}
                                <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-2 text-center">
                                    <div>
                                        <div className="text-[11px] font-medium text-muted-foreground uppercase">
                                            kcal
                                        </div>
                                        <div className="text-sm font-bold text-foreground">
                                            {Math.round(Number(food.calories))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-muted-foreground uppercase">
                                            Protein
                                        </div>
                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {Number(food.protein)}g
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-muted-foreground uppercase">
                                            Carbs
                                        </div>
                                        <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                            {Number(food.carbs)}g
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-medium text-muted-foreground uppercase">
                                            Fat
                                        </div>
                                        <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                                            {Number(food.fat)}g
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        Base: {Number(food.serving_size)}
                                        {food.serving_unit}
                                    </span>
                                    {food.servings &&
                                        food.servings.length > 0 && (
                                            <span>
                                                {food.servings.length} portion
                                                option
                                                {food.servings.length === 1
                                                    ? ''
                                                    : 's'}
                                            </span>
                                        )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex items-center justify-between gap-1.5 border-t border-border/40 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openFoodChecker(food)}
                                    className="gap-1 px-2.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
                                    title={t('food_checker.quick_check')}
                                >
                                    <Search className="h-3.5 w-3.5 text-primary" />
                                    <span>{t('food_checker.quick_check')}</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCalculator(food)}
                                    className="flex-1 gap-1 text-xs font-medium hover:border-primary/40 hover:text-primary"
                                >
                                    <Calculator className="h-3.5 w-3.5 text-primary" />
                                    <span className="truncate">
                                        {t('foods.portion_and_log')}
                                    </span>
                                </Button>

                                <Link
                                    href={`/foods/${food.id}`}
                                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2 text-xs font-medium text-muted-foreground shadow-xs hover:bg-accent hover:text-foreground"
                                    title={t('foods.view_details')}
                                >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>

                                {food.is_custom && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleOpenEditCustomFood(food)
                                            }
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            title={t('action.edit')}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteCustomFood(food.id)
                                            }
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            title={t('action.delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Interactive Portion Nutrition Calculator Dialog */}
            <Dialog
                open={calculatingFood !== null}
                onOpenChange={(open) => !open && setCalculatingFood(null)}
            >
                <DialogContent className="sm:max-w-md">
                    {calculatingFood && selectedServing && scaledNutrition && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    {t('foods.portion_calculator')}
                                </DialogTitle>
                            </DialogHeader>

                            {/* Food Product Header with Image and Details */}
                            <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
                                {calculatingFood.image_url ? (
                                    <img
                                        src={calculatingFood.image_url}
                                        alt={calculatingFood.name}
                                        className="h-16 w-16 shrink-0 rounded-lg border border-border/80 object-cover shadow-xs"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
                                        <Utensils className="h-7 w-7 opacity-40" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                                            {calculatingFood.name}
                                        </h3>
                                        {calculatingFood.is_custom ||
                                        calculatingFood.search_origin ===
                                            'custom' ? (
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 border-purple-500/30 bg-purple-500/10 text-[9px] text-purple-600 dark:text-purple-400"
                                            >
                                                {t('foods.badge_custom')}
                                            </Badge>
                                        ) : calculatingFood.search_origin ===
                                          'openfoodfacts' ? (
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-600 dark:text-emerald-400"
                                            >
                                                {t('foods.badge_openfoodfacts')}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 border-blue-500/30 bg-blue-500/10 text-[9px] text-blue-600 dark:text-blue-400"
                                            >
                                                {t('foods.badge_in_database')}
                                            </Badge>
                                        )}
                                        {calculatingFood.nutri_score && (
                                            <Badge className="shrink-0 bg-emerald-600 text-[9px] font-bold text-white uppercase">
                                                Nutri{' '}
                                                {calculatingFood.nutri_score}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {calculatingFood.brand ||
                                            'Generic / Homemade'}
                                    </p>
                                    <div className="mt-1 flex items-center justify-between">
                                        {calculatingFood.barcode ? (
                                            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                                <Barcode className="h-3 w-3" />
                                                {calculatingFood.barcode}
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        <Link
                                            href={`/foods/${calculatingFood.id}`}
                                            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                        >
                                            {t('foods.view_details')}
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 py-1">
                                {/* Flexible Serving Mode Selector */}
                                <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/40 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setPortionMode('weight')}
                                        className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
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
                                        onClick={() =>
                                            setPortionMode('serving')
                                        }
                                        className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
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
                                            <Label
                                                htmlFor="custom-grams-input"
                                                className="text-xs font-medium text-foreground"
                                            >
                                                {t('foods.enter_grams_ml')}
                                            </Label>
                                            <span className="text-[11px] text-muted-foreground">
                                                Base reference:{' '}
                                                {Number(
                                                    calculatingFood.serving_size,
                                                )}
                                                {calculatingFood.serving_unit ||
                                                    'g'}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="custom-grams-input"
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
                                                {calculatingFood.serving_unit ||
                                                    'g'}
                                            </span>
                                        </div>

                                        {/* Quick Amount Pills */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                            {[50, 100, 150, 200, 250].map(
                                                (amt) => (
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
                                                        {calculatingFood.serving_unit ||
                                                            'g'}
                                                    </button>
                                                ),
                                            )}
                                            <div className="ml-auto flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCustomGrams((prev) =>
                                                            Math.max(
                                                                1,
                                                                prev - 25,
                                                            ),
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
                                            <Label
                                                htmlFor="serving-select"
                                                className="text-xs"
                                            >
                                                Serving Unit
                                            </Label>
                                            <select
                                                id="serving-select"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden"
                                                value={
                                                    selectedServing.serving_name
                                                }
                                                onChange={(e) => {
                                                    const match =
                                                        calculatingFood.servings.find(
                                                            (s) =>
                                                                s.serving_name ===
                                                                e.target.value,
                                                        );
                                                    if (match)
                                                        setSelectedServing(
                                                            match,
                                                        );
                                                }}
                                            >
                                                {calculatingFood.servings.map(
                                                    (serving, idx) => (
                                                        <option
                                                            key={idx}
                                                            value={
                                                                serving.serving_name
                                                            }
                                                        >
                                                            {
                                                                serving.serving_name
                                                            }{' '}
                                                            (
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
                                            <Label
                                                htmlFor="serving-quantity"
                                                className="text-xs"
                                            >
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
                                                                    (q - 0.5) *
                                                                        10,
                                                                ) / 10,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <Input
                                                    id="serving-quantity"
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
                                                                    e.target
                                                                        .value,
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
                                                                    (q + 0.5) *
                                                                        10,
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

                                {/* Dynamic Scaled Nutritional Summary */}
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Total Consumed:
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {scaledNutrition.totalGrams}
                                                {calculatingFood.serving_unit ||
                                                    'g'}
                                            </span>
                                        </div>

                                        <div className="py-1 text-center">
                                            <div className="text-3xl font-extrabold text-primary">
                                                {scaledNutrition.calories}
                                            </div>
                                            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                Calories (kcal)
                                            </div>
                                        </div>

                                        {/* Informative Zero Calorie Explanation if water or 0-cal item */}
                                        {Number(calculatingFood.calories) ===
                                            0 &&
                                            Number(calculatingFood.protein) ===
                                                0 &&
                                            Number(calculatingFood.carbs) ===
                                                0 &&
                                            Number(calculatingFood.fat) ===
                                                0 && (
                                                <div className="flex items-start gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-2.5 text-left text-xs text-blue-700 dark:text-blue-300">
                                                    <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                                    <div>
                                                        <div className="font-semibold">
                                                            {t(
                                                                'foods.zero_calorie_badge',
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                            {t(
                                                                'foods.zero_calorie_explanation',
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        <div className="grid grid-cols-3 gap-2 border-t border-primary/10 pt-2 text-center">
                                            <div>
                                                <div className="text-[11px] font-medium text-muted-foreground">
                                                    Protein
                                                </div>
                                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {scaledNutrition.protein}g
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-medium text-muted-foreground">
                                                    Carbs
                                                </div>
                                                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                    {scaledNutrition.carbs}g
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-medium text-muted-foreground">
                                                    Fat
                                                </div>
                                                <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                                    {scaledNutrition.fat}g
                                                </div>
                                            </div>
                                        </div>

                                        {(scaledNutrition.fiber !== null ||
                                            scaledNutrition.sugar !== null ||
                                            scaledNutrition.sodium !==
                                                null) && (
                                            <div className="grid grid-cols-3 gap-2 border-t border-primary/10 pt-2 text-center text-xs text-muted-foreground">
                                                {scaledNutrition.fiber !==
                                                    null && (
                                                    <div>
                                                        Fiber:{' '}
                                                        {scaledNutrition.fiber}g
                                                    </div>
                                                )}
                                                {scaledNutrition.sugar !==
                                                    null && (
                                                    <div>
                                                        Sugar:{' '}
                                                        {scaledNutrition.sugar}g
                                                    </div>
                                                )}
                                                {scaledNutrition.sodium !==
                                                    null && (
                                                    <div>
                                                        Sodium:{' '}
                                                        {scaledNutrition.sodium}
                                                        mg
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Log to Daily Diary */}
                                <div className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                        <CalendarPlus className="h-4 w-4 text-emerald-600" />
                                        Log this portion directly to Diary
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-[11px] text-muted-foreground">
                                                Meal Slot
                                            </Label>
                                            <select
                                                className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs capitalize shadow-xs focus-visible:outline-hidden"
                                                value={logMealSlot}
                                                onChange={(e) =>
                                                    setLogMealSlot(
                                                        e.target.value as any,
                                                    )
                                                }
                                            >
                                                <option value="breakfast">
                                                    Breakfast
                                                </option>
                                                <option value="lunch">
                                                    Lunch
                                                </option>
                                                <option value="dinner">
                                                    Dinner
                                                </option>
                                                <option value="snack">
                                                    Snack
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-[11px] text-muted-foreground">
                                                Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={logDate}
                                                onChange={(e) =>
                                                    setLogDate(e.target.value)
                                                }
                                                className="mt-1 h-8 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCalculatingFood(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={isLoggingToDiary}
                                    onClick={handleLogToDiary}
                                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <Check className="h-4 w-4" />
                                    {isLoggingToDiary
                                        ? 'Logging...'
                                        : `Log to ${
                                              logMealSlot
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              logMealSlot.slice(1)
                                          }`}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Custom Food Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Create Custom Food
                        </DialogTitle>
                        <DialogDescription>
                            Add a homemade recipe, restaurant dish, or private
                            food item to your catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleCreateCustomFood}
                        className="space-y-4 py-2"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="custom-name">Food Name *</Label>
                                <Input
                                    id="custom-name"
                                    placeholder="e.g. Oatmeal with Protein"
                                    value={customFoodForm.data.name}
                                    onChange={(e) =>
                                        customFoodForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={customFoodForm.errors.name}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="custom-brand">
                                    Brand / Creator
                                </Label>
                                <Input
                                    id="custom-brand"
                                    placeholder="e.g. Homemade, Kitchen"
                                    value={customFoodForm.data.brand}
                                    onChange={(e) =>
                                        customFoodForm.setData(
                                            'brand',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="custom-serving-size">
                                    Serving Size *
                                </Label>
                                <Input
                                    id="custom-serving-size"
                                    type="number"
                                    step="0.1"
                                    value={customFoodForm.data.serving_size}
                                    onChange={(e) =>
                                        customFoodForm.setData(
                                            'serving_size',
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="custom-serving-unit">
                                    Serving Unit *
                                </Label>
                                <select
                                    id="custom-serving-unit"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                    value={customFoodForm.data.serving_unit}
                                    onChange={(e) =>
                                        customFoodForm.setData(
                                            'serving_unit',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="g">Grams (g)</option>
                                    <option value="ml">Milliliters (ml)</option>
                                    <option value="oz">Ounces (oz)</option>
                                </select>
                            </div>
                        </div>

                        {/* Nutrition per Serving */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                            <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nutritional Values (per serving)
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-cal"
                                        className="text-xs"
                                    >
                                        Calories *
                                    </Label>
                                    <Input
                                        id="custom-cal"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.calories}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'calories',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-pro"
                                        className="text-xs"
                                    >
                                        Protein (g) *
                                    </Label>
                                    <Input
                                        id="custom-pro"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.protein}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'protein',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-carb"
                                        className="text-xs"
                                    >
                                        Carbs (g) *
                                    </Label>
                                    <Input
                                        id="custom-carb"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.carbs}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'carbs',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-fat"
                                        className="text-xs"
                                    >
                                        Fat (g) *
                                    </Label>
                                    <Input
                                        id="custom-fat"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.fat}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'fat',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-fiber"
                                        className="text-xs"
                                    >
                                        Fiber (g)
                                    </Label>
                                    <Input
                                        id="custom-fiber"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.fiber}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'fiber',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-sugar"
                                        className="text-xs"
                                    >
                                        Sugar (g)
                                    </Label>
                                    <Input
                                        id="custom-sugar"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.sugar}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'sugar',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="custom-sodium"
                                        className="text-xs"
                                    >
                                        Sodium (mg)
                                    </Label>
                                    <Input
                                        id="custom-sodium"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.sodium}
                                        onChange={(e) =>
                                            customFoodForm.setData(
                                                'sodium',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={customFoodForm.processing}
                            >
                                {customFoodForm.processing
                                    ? t('action.save') + '...'
                                    : t('foods.save_custom')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Custom Food Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            {t('foods.edit_custom_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('foods.edit_custom_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleUpdateCustomFood}
                        className="space-y-4 py-2"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="edit-custom-name">
                                    Food Name *
                                </Label>
                                <Input
                                    id="edit-custom-name"
                                    placeholder="e.g. Oatmeal with Protein"
                                    value={editFoodForm.data.name}
                                    onChange={(e) =>
                                        editFoodForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={editFoodForm.errors.name}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="edit-custom-brand">
                                    Brand / Creator
                                </Label>
                                <Input
                                    id="edit-custom-brand"
                                    placeholder="e.g. Homemade, Kitchen"
                                    value={editFoodForm.data.brand}
                                    onChange={(e) =>
                                        editFoodForm.setData(
                                            'brand',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={editFoodForm.errors.brand}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="edit-custom-serving-size">
                                    Serving Size *
                                </Label>
                                <Input
                                    id="edit-custom-serving-size"
                                    type="number"
                                    step="0.1"
                                    value={editFoodForm.data.serving_size}
                                    onChange={(e) =>
                                        editFoodForm.setData(
                                            'serving_size',
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={editFoodForm.errors.serving_size}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="edit-custom-serving-unit">
                                    Serving Unit *
                                </Label>
                                <select
                                    id="edit-custom-serving-unit"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                    value={editFoodForm.data.serving_unit}
                                    onChange={(e) =>
                                        editFoodForm.setData(
                                            'serving_unit',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="g">Grams (g)</option>
                                    <option value="ml">Milliliters (ml)</option>
                                    <option value="oz">Ounces (oz)</option>
                                </select>
                                <InputError
                                    message={editFoodForm.errors.serving_unit}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-custom-barcode">
                                Barcode (Optional)
                            </Label>
                            <Input
                                id="edit-custom-barcode"
                                placeholder="Scan or enter barcode"
                                value={editFoodForm.data.barcode}
                                onChange={(e) =>
                                    editFoodForm.setData(
                                        'barcode',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={editFoodForm.errors.barcode} />
                        </div>

                        {/* Nutrition per Serving */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                            <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Nutritional Values (per serving)
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-cal"
                                        className="text-xs"
                                    >
                                        Calories *
                                    </Label>
                                    <Input
                                        id="edit-custom-cal"
                                        type="number"
                                        step="0.1"
                                        value={editFoodForm.data.calories}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'calories',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={editFoodForm.errors.calories}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-pro"
                                        className="text-xs"
                                    >
                                        Protein (g) *
                                    </Label>
                                    <Input
                                        id="edit-custom-pro"
                                        type="number"
                                        step="0.1"
                                        value={editFoodForm.data.protein}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'protein',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={editFoodForm.errors.protein}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-carb"
                                        className="text-xs"
                                    >
                                        Carbs (g) *
                                    </Label>
                                    <Input
                                        id="edit-custom-carb"
                                        type="number"
                                        step="0.1"
                                        value={editFoodForm.data.carbs}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'carbs',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={editFoodForm.errors.carbs}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-fat"
                                        className="text-xs"
                                    >
                                        Fat (g) *
                                    </Label>
                                    <Input
                                        id="edit-custom-fat"
                                        type="number"
                                        step="0.1"
                                        value={editFoodForm.data.fat}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'fat',
                                                Number(e.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={editFoodForm.errors.fat}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-fiber"
                                        className="text-xs"
                                    >
                                        Fiber (g)
                                    </Label>
                                    <Input
                                        id="edit-custom-fiber"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={editFoodForm.data.fiber}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'fiber',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={editFoodForm.errors.fiber}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-sugar"
                                        className="text-xs"
                                    >
                                        Sugar (g)
                                    </Label>
                                    <Input
                                        id="edit-custom-sugar"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={editFoodForm.data.sugar}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'sugar',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={editFoodForm.errors.sugar}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="edit-custom-sodium"
                                        className="text-xs"
                                    >
                                        Sodium (mg)
                                    </Label>
                                    <Input
                                        id="edit-custom-sodium"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={editFoodForm.data.sodium}
                                        onChange={(e) =>
                                            editFoodForm.setData(
                                                'sodium',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={editFoodForm.errors.sodium}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingFood(null);
                                }}
                            >
                                {t('action.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={editFoodForm.processing}
                            >
                                {editFoodForm.processing ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : null}
                                {t('action.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Open Food Facts On-Demand Sync Dialog */}
            <Dialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw
                                className={`h-5 w-5 text-primary ${isSyncing ? 'animate-spin' : ''}`}
                            />
                            {t('foods.sync_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('foods.sync_description')}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleTriggerSync}
                        className="space-y-4 pt-2"
                    >
                        {/* Number of Items Selector */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">
                                {t('foods.sync_count_label')}
                            </Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[20, 50, 100, 200].map((countOption) => (
                                    <Button
                                        key={countOption}
                                        type="button"
                                        variant={
                                            syncCount === countOption
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setSyncCount(countOption)
                                        }
                                        className="h-9 font-medium"
                                    >
                                        {countOption}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Category Focus */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">
                                {t('foods.sync_category_label')}
                            </Label>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    {
                                        id: 'staples',
                                        label: t('foods.sync_category_staples'),
                                    },
                                    {
                                        id: 'protein',
                                        label: t('foods.sync_category_protein'),
                                    },
                                    {
                                        id: 'produce',
                                        label: t('foods.sync_category_produce'),
                                    },
                                    {
                                        id: 'dairy',
                                        label: t('foods.sync_category_dairy'),
                                    },
                                    {
                                        id: 'grains',
                                        label: t('foods.sync_category_grains'),
                                    },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSyncCategory(cat.id)}
                                        className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-colors ${
                                            syncCategory === cat.id
                                                ? 'border-primary bg-primary/5 font-medium text-primary'
                                                : 'border-border/70 text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        {syncCategory === cat.id && (
                                            <Check className="h-4 w-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Search Terms (Optional) */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="sync-custom-terms"
                                className="text-xs"
                            >
                                {t('foods.sync_custom_terms_label')}
                            </Label>
                            <Input
                                id="sync-custom-terms"
                                placeholder={t(
                                    'foods.sync_custom_terms_placeholder',
                                )}
                                value={syncTerms}
                                onChange={(e) => setSyncTerms(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSyncOpen(false)}
                                disabled={isSyncing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSyncing}
                                className="gap-2"
                            >
                                {isSyncing && (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                )}
                                {isSyncing
                                    ? t('foods.syncing')
                                    : t('foods.sync_start')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Live Camera Barcode Scanner Modal */}
            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onFoodFound={(food) => openCalculator(food)}
            />

            {/* Delete Custom Food Confirmation Dialog */}
            <ConfirmDialog
                open={deleteFoodId !== null}
                onOpenChange={(open) => !open && setDeleteFoodId(null)}
                title="Delete Custom Food"
                description="Are you sure you want to delete this custom food item? This cannot be undone."
                confirmText={t('action.delete')}
                cancelText={t('common.cancel')}
                variant="destructive"
                onConfirm={() => {
                    if (deleteFoodId !== null) {
                        router.delete(`/foods/custom/${deleteFoodId}`, {
                            preserveScroll: true,
                        });
                        setDeleteFoodId(null);
                    }
                }}
            />
        </div>
    );
}

FoodsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Food Database',
            href: '/foods',
        },
    ],
};
