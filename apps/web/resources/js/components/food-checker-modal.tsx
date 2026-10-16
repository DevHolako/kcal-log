import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Apple,
    ArrowLeft,
    CalendarPlus,
    Camera,
    Check,
    ChevronDown,
    ChevronUp,
    Database,
    Droplets,
    ExternalLink,
    Globe,
    Loader2,
    Minus,
    Plus,
    Search,
    Sparkles,
    Utensils,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import BarcodeScannerModal from '@/components/barcode-scanner-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import type { FoodItem, FoodServingData } from '@/pages/foods';

const POPULAR_QUICK_SEARCHES = [
    'Chia seeds',
    'Rolled oats',
    'Chicken breast',
    'Greek yogurt',
    'Eggs',
    'Banana',
    'Avocado',
    'Salmon fillet',
    'Skyr',
    'Canned tuna',
];

interface FoodCheckerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialFood?: FoodItem | null;
}

export default function FoodCheckerModal({
    open,
    onOpenChange,
    initialFood = null,
}: FoodCheckerModalProps) {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
    const [isDegraded, setIsDegraded] = useState(false);

    // Selected Food to Inspect
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [selectedServing, setSelectedServing] =
        useState<FoodServingData | null>(null);
    const [portionMode, setPortionMode] = useState<'weight' | 'serving'>(
        'weight',
    );
    const [customGrams, setCustomGrams] = useState<number>(100);
    const [quantity, setQuantity] = useState<number>(1);

    // Optional Diary Logging Section
    const [showLogDrawer, setShowLogDrawer] = useState(false);
    const [logMealSlot, setLogMealSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');
    const [logDate, setLogDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [isLogging, setIsLogging] = useState(false);

    // Camera Barcode Scanner
    const [scannerOpen, setScannerOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // When modal opens or initialFood changes
    useEffect(() => {
        if (open) {
            if (initialFood) {
                handleInspectFood(initialFood);
            } else if (!selectedFood) {
                setTimeout(() => inputRef.current?.focus(), 80);
            }

            // Fetch recent foods if not loaded yet
            if (recentFoods.length === 0) {
                fetch('/foods/search?recent=1', {
                    headers: { Accept: 'application/json' },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (Array.isArray(data.items)) {
                            setRecentFoods(data.items);
                        }
                    })
                    .catch(() => {});
            }
        } else {
            // Reset search term when closed
            setSearchQuery('');
            setSearchResults([]);
            setSelectedFood(null);
            setShowLogDrawer(false);
        }
    }, [open, initialFood]);

    // Debounced search query
    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setSearchResults([]);
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
                        setSearchResults(data.items);
                        setIsDegraded(Boolean(data.is_degraded));
                    } else {
                        setSearchResults([]);
                    }
                })
                .catch(() => {
                    setSearchResults([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 280);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleInspectFood = (food: FoodItem) => {
        setSelectedFood(food);
        const defaultServing = food.servings?.find((s) => s.is_default) ||
            food.servings?.[0] || {
                serving_name: `${food.serving_size || 100}${food.serving_unit || 'g'}`,
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
        setShowLogDrawer(false);
    };

    const handleBarcodeDetected = (food: FoodItem) => {
        setScannerOpen(false);
        handleInspectFood(food);
    };

    // Scaled Nutrition Calculations for Current Selected Food & Portion
    const baseSize =
        selectedFood && Number(selectedFood.serving_size) > 0
            ? Number(selectedFood.serving_size)
            : 100;

    const totalGrams =
        portionMode === 'weight'
            ? customGrams
            : Number(selectedServing?.gram_equivalent || baseSize) * quantity;

    const factor = totalGrams / (baseSize > 0 ? baseSize : 100);

    const scaledCalories = selectedFood
        ? Math.round(Number(selectedFood.calories) * factor * 10) / 10
        : 0;
    const scaledProtein = selectedFood
        ? Math.round(Number(selectedFood.protein) * factor * 10) / 10
        : 0;
    const scaledCarbs = selectedFood
        ? Math.round(Number(selectedFood.carbs) * factor * 10) / 10
        : 0;
    const scaledFat = selectedFood
        ? Math.round(Number(selectedFood.fat) * factor * 10) / 10
        : 0;
    const scaledFiber = selectedFood?.fiber
        ? Math.round(Number(selectedFood.fiber) * factor * 10) / 10
        : null;
    const scaledSugar = selectedFood?.sugar
        ? Math.round(Number(selectedFood.sugar) * factor * 10) / 10
        : null;
    const scaledSatFat = selectedFood?.saturated_fat
        ? Math.round(Number(selectedFood.saturated_fat) * factor * 10) / 10
        : null;
    const scaledSodium = selectedFood?.sodium
        ? Math.round(Number(selectedFood.sodium) * factor * 10) / 10
        : null;

    // Macronutrient Caloric Contribution & Distribution
    const proteinKcal = scaledProtein * 4;
    const carbsKcal = scaledCarbs * 4;
    const fatKcal = scaledFat * 9;
    const macroKcalTotal = proteinKcal + carbsKcal + fatKcal;

    const proteinPercent =
        macroKcalTotal > 0
            ? Math.round((proteinKcal / macroKcalTotal) * 100)
            : 0;
    const carbsPercent =
        macroKcalTotal > 0 ? Math.round((carbsKcal / macroKcalTotal) * 100) : 0;
    const fatPercent =
        macroKcalTotal > 0
            ? Math.max(0, 100 - proteinPercent - carbsPercent)
            : 0;

    const isZeroCalorie =
        selectedFood &&
        Number(selectedFood.calories) === 0 &&
        Number(selectedFood.protein) === 0 &&
        Number(selectedFood.carbs) === 0 &&
        Number(selectedFood.fat) === 0;

    const handleLogToDiary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFood) return;

        setIsLogging(true);
        router.post(
            '/diary',
            {
                food_id: selectedFood.id,
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
                    toast.success(t('food_checker.log_success'));
                    setShowLogDrawer(false);
                },
                onFinish: () => {
                    setIsLogging(false);
                },
            },
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl"
                    aria-describedby={undefined}
                >
                    <DialogHeader className="border-b border-border/60 p-4 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {selectedFood ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFood(null)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        title={t('food_checker.back_to_search')}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                        <Search className="h-4 w-4" />
                                    </div>
                                )}
                                <div>
                                    <DialogTitle className="text-base leading-tight font-bold text-foreground">
                                        {selectedFood
                                            ? selectedFood.name
                                            : t('food_checker.title')}
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedFood
                                            ? selectedFood.brand ||
                                              'Generic / Homemade product'
                                            : t('food_checker.subtitle')}
                                    </p>
                                </div>
                            </div>

                            {selectedFood && (
                                <div className="flex items-center gap-1.5">
                                    {selectedFood.is_custom ||
                                    selectedFood.search_origin === 'custom' ? (
                                        <Badge
                                            variant="outline"
                                            className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-600 dark:text-purple-400"
                                        >
                                            <Apple className="mr-1 h-3 w-3" />
                                            {t('foods.badge_custom')}
                                        </Badge>
                                    ) : selectedFood.search_origin ===
                                      'openfoodfacts' ? (
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                                        >
                                            <Globe className="mr-1 h-3 w-3" />
                                            OFF
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-600 dark:text-blue-400"
                                        >
                                            <Database className="mr-1 h-3 w-3" />
                                            DB
                                        </Badge>
                                    )}

                                    {selectedFood.nutri_score && (
                                        <Badge
                                            className={`text-[10px] font-bold uppercase ${
                                                selectedFood.nutri_score.toLowerCase() ===
                                                'a'
                                                    ? 'bg-emerald-600 text-white'
                                                    : selectedFood.nutri_score.toLowerCase() ===
                                                        'b'
                                                      ? 'bg-green-500 text-white'
                                                      : selectedFood.nutri_score.toLowerCase() ===
                                                          'c'
                                                        ? 'bg-yellow-500 text-black'
                                                        : selectedFood.nutri_score.toLowerCase() ===
                                                            'd'
                                                          ? 'bg-orange-500 text-white'
                                                          : 'bg-red-600 text-white'
                                            }`}
                                        >
                                            Nutri {selectedFood.nutri_score}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Mode A: Search / Browse Mode */}
                    {!selectedFood && (
                        <div className="space-y-4 p-4">
                            {/* Search Bar & Barcode Scanner Trigger */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        ref={inputRef}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder={t(
                                            'food_checker.search_placeholder',
                                        )}
                                        className="h-10 pr-9 pl-9 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setScannerOpen(true)}
                                    className="h-10 gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                    title={t('foods.scan_camera')}
                                >
                                    <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="hidden text-xs sm:inline">
                                        Scan
                                    </span>
                                </Button>
                            </div>

                            {/* Live Search Spinner */}
                            {isSearching && (
                                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    {t('food_checker.searching')}
                                </div>
                            )}

                            {/* Degraded mode indicator if applicable */}
                            {isDegraded && searchResults.length > 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    <span>{t('foods.degraded_mode')}</span>
                                </div>
                            )}

                            {/* Search Results List */}
                            {searchQuery.trim().length >= 2 &&
                                !isSearching &&
                                searchResults.length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between px-1 text-xs font-medium text-muted-foreground">
                                            <span>
                                                Results ({searchResults.length})
                                            </span>
                                            <span>
                                                Click to check nutrition
                                            </span>
                                        </div>

                                        <div className="max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
                                            {searchResults.map((food) => (
                                                <button
                                                    key={`${food.id}-${food.barcode || food.name}`}
                                                    type="button"
                                                    onClick={() =>
                                                        handleInspectFood(food)
                                                    }
                                                    className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-2.5 text-left transition hover:border-primary/50 hover:bg-muted/40"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/80 bg-muted/40">
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
                                                                <Utensils className="h-5 w-5 text-muted-foreground/40" />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                                                    {food.name}
                                                                </h4>
                                                                {food.search_origin ===
                                                                'openfoodfacts' ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-emerald-500/30 bg-emerald-500/10 text-[9px] text-emerald-600 dark:text-emerald-400"
                                                                    >
                                                                        OFF
                                                                    </Badge>
                                                                ) : food.is_custom ||
                                                                  food.search_origin ===
                                                                      'custom' ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-purple-500/30 bg-purple-500/10 text-[9px] text-purple-600 dark:text-purple-400"
                                                                    >
                                                                        Custom
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-blue-500/30 bg-blue-500/10 text-[9px] text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        DB
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {food.brand ||
                                                                    'Generic'}{' '}
                                                                • Base:{' '}
                                                                {
                                                                    food.serving_size
                                                                }
                                                                {food.serving_unit ||
                                                                    'g'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <div className="text-sm font-bold text-foreground">
                                                            {Math.round(
                                                                Number(
                                                                    food.calories,
                                                                ),
                                                            )}{' '}
                                                            <span className="text-xs font-normal text-muted-foreground">
                                                                kcal
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            P:{' '}
                                                            {Number(
                                                                food.protein,
                                                            )}
                                                            g • C:{' '}
                                                            {Number(food.carbs)}
                                                            g • F:{' '}
                                                            {Number(food.fat)}g
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* No results message */}
                            {searchQuery.trim().length >= 2 &&
                                !isSearching &&
                                searchResults.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                                        <Utensils className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                                        <p className="text-sm font-medium text-foreground">
                                            {t('food_checker.no_results', {
                                                query: searchQuery,
                                            })}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Try searching by generic name,
                                            brand, or scan the product barcode.
                                        </p>
                                    </div>
                                )}

                            {/* Popular Searches & Recent Foods (When Query is Empty) */}
                            {searchQuery.trim().length < 2 && (
                                <div className="space-y-4 pt-1">
                                    {/* 1-Click Popular Search Chips */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                                            <span>
                                                {t(
                                                    'food_checker.popular_searches',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {POPULAR_QUICK_SEARCHES.map(
                                                (item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() =>
                                                            setSearchQuery(item)
                                                        }
                                                        className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                                    >
                                                        {item}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Recently Cached Foods */}
                                    {recentFoods.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                                <span>
                                                    {t(
                                                        'food_checker.recent_foods',
                                                    )}
                                                </span>
                                                <span className="text-[11px]">
                                                    {recentFoods.length} items
                                                </span>
                                            </div>

                                            <div className="grid max-h-[220px] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                                                {recentFoods.map((food) => (
                                                    <button
                                                        key={`recent-${food.id}`}
                                                        type="button"
                                                        onClick={() =>
                                                            handleInspectFood(
                                                                food,
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 text-left transition hover:border-primary/40 hover:bg-muted/60"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border/80 bg-background">
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
                                                                />
                                                            ) : (
                                                                <Utensils className="h-4 w-4 text-muted-foreground/50" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-medium text-foreground">
                                                                {food.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {Math.round(
                                                                    Number(
                                                                        food.calories,
                                                                    ),
                                                                )}{' '}
                                                                kcal /{' '}
                                                                {
                                                                    food.serving_size
                                                                }
                                                                {food.serving_unit ||
                                                                    'g'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Keyboard shortcut hint */}
                            <div className="border-t border-border/50 pt-2 text-center text-[11px] text-muted-foreground">
                                {t('food_checker.shortcut_hint')}
                            </div>
                        </div>
                    )}

                    {/* Mode B: Detailed Food Inspection View */}
                    {selectedFood && (
                        <div className="space-y-4 p-4">
                            {/* Product Header Card */}
                            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background shadow-xs">
                                    {selectedFood.image_url ? (
                                        <img
                                            src={selectedFood.image_url}
                                            alt={selectedFood.name}
                                            className="h-full w-full object-contain p-1"
                                            onError={(e) => {
                                                (
                                                    e.currentTarget as HTMLElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <Utensils className="h-7 w-7 text-muted-foreground/40" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                        <h3 className="text-base font-bold text-foreground">
                                            {selectedFood.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedFood.brand ||
                                            'Generic / Homemade'}
                                        {selectedFood.barcode && (
                                            <span className="ml-2 font-mono text-[11px]">
                                                • #{selectedFood.barcode}
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="text-[11px] text-muted-foreground">
                                            Base reference:{' '}
                                            {selectedFood.serving_size}
                                            {selectedFood.serving_unit || 'g'}
                                        </span>
                                        {(selectedFood.barcode ||
                                            selectedFood.off_id) && (
                                            <a
                                                href={`https://world.openfoodfacts.org/product/${selectedFood.barcode || selectedFood.off_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                            >
                                                Open Food Facts
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Zero Calorie Special Banner */}
                            {isZeroCalorie && (
                                <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
                                    <Droplets className="h-4 w-4 shrink-0 text-blue-500" />
                                    <div>
                                        <p className="font-semibold">
                                            {t('foods.zero_calorie_badge')}
                                        </p>
                                        <p className="mt-0.5 text-[11px] opacity-90">
                                            {t(
                                                'foods.zero_calorie_explanation',
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Interactive Portion Selector */}
                            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        {t('food_checker.portion_calculator')}
                                    </Label>
                                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPortionMode('weight')
                                            }
                                            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                                                portionMode === 'weight'
                                                    ? 'bg-background text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {t('foods.unit_mode_weight')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPortionMode('serving')
                                            }
                                            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                                                portionMode === 'serving'
                                                    ? 'bg-background text-foreground shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {t('foods.unit_mode_serving')}
                                        </button>
                                    </div>
                                </div>

                                {portionMode === 'weight' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
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
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            ),
                                                        )
                                                    }
                                                    className="h-9 pr-8 text-sm font-semibold"
                                                />
                                                <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                                    g
                                                </span>
                                            </div>

                                            {/* Quick Stepper Buttons */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCustomGrams((prev) =>
                                                        Math.max(10, prev - 25),
                                                    )
                                                }
                                                className="h-9 px-2 text-xs"
                                            >
                                                -25g
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCustomGrams(
                                                        (prev) => prev + 25,
                                                    )
                                                }
                                                className="h-9 px-2 text-xs"
                                            >
                                                +25g
                                            </Button>
                                        </div>

                                        {/* Quick Preset Pills */}
                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                            {[25, 50, 100, 150, 200, 250].map(
                                                (preset) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() =>
                                                            setCustomGrams(
                                                                preset,
                                                            )
                                                        }
                                                        className={`rounded border px-2 py-0.5 text-xs font-medium transition ${
                                                            customGrams ===
                                                            preset
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        {preset}g
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">
                                                    Select Portion Unit
                                                </Label>
                                                <select
                                                    value={
                                                        selectedServing?.id ??
                                                        selectedServing?.serving_name
                                                    }
                                                    onChange={(e) => {
                                                        const serving =
                                                            selectedFood.servings?.find(
                                                                (s) =>
                                                                    String(
                                                                        s.id,
                                                                    ) ===
                                                                        e.target
                                                                            .value ||
                                                                    s.serving_name ===
                                                                        e.target
                                                                            .value,
                                                            );
                                                        if (serving) {
                                                            setSelectedServing(
                                                                serving,
                                                            );
                                                        }
                                                    }}
                                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                                >
                                                    {selectedFood.servings &&
                                                    selectedFood.servings
                                                        .length > 0 ? (
                                                        selectedFood.servings.map(
                                                            (s, idx) => (
                                                                <option
                                                                    key={
                                                                        s.id ??
                                                                        idx
                                                                    }
                                                                    value={
                                                                        s.id ??
                                                                        s.serving_name
                                                                    }
                                                                >
                                                                    {
                                                                        s.serving_name
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        s.gram_equivalent
                                                                    }
                                                                    g)
                                                                </option>
                                                            ),
                                                        )
                                                    ) : (
                                                        <option value="default">
                                                            1 portion (
                                                            {baseSize}g)
                                                        </option>
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">
                                                    Quantity / Multiplier
                                                </Label>
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            setQuantity(
                                                                (prev) =>
                                                                    Math.max(
                                                                        0.25,
                                                                        Math.round(
                                                                            (prev -
                                                                                0.5) *
                                                                                100,
                                                                        ) / 100,
                                                                    ),
                                                            )
                                                        }
                                                        className="h-9 w-9 shrink-0"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        min="0.1"
                                                        step="0.25"
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
                                                        className="h-9 text-center text-sm font-semibold"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            setQuantity(
                                                                (prev) =>
                                                                    Math.round(
                                                                        (prev +
                                                                            0.5) *
                                                                            100,
                                                                    ) / 100,
                                                            )
                                                        }
                                                        className="h-9 w-9 shrink-0"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Live Scaled Nutrition Display */}
                            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-xs">
                                {/* Calories Hero */}
                                <div className="flex items-baseline justify-between border-b border-border/60 pb-3">
                                    <div>
                                        <div className="text-3xl font-extrabold tracking-tight text-foreground">
                                            {scaledCalories}
                                            <span className="ml-1 text-sm font-medium text-muted-foreground">
                                                kcal
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Calculated for{' '}
                                            {Math.round(totalGrams)}g portion
                                        </p>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-semibold"
                                    >
                                        {Math.round(totalGrams)}g total
                                    </Badge>
                                </div>

                                {/* Caloric Macro Distribution Bar */}
                                {macroKcalTotal > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                            <span>
                                                {t(
                                                    'food_checker.macro_distribution',
                                                )}
                                            </span>
                                            <span>100% of calories</span>
                                        </div>
                                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                style={{
                                                    width: `${proteinPercent}%`,
                                                }}
                                                className="bg-blue-500 transition-all duration-300"
                                                title={`Protein: ${proteinPercent}%`}
                                            />
                                            <div
                                                style={{
                                                    width: `${carbsPercent}%`,
                                                }}
                                                className="bg-amber-500 transition-all duration-300"
                                                title={`Carbs: ${carbsPercent}%`}
                                            />
                                            <div
                                                style={{
                                                    width: `${fatPercent}%`,
                                                }}
                                                className="bg-rose-500 transition-all duration-300"
                                                title={`Fat: ${fatPercent}%`}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                                Protein ({proteinPercent}%)
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                                                Carbs ({carbsPercent}%)
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                                                Fat ({fatPercent}%)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Macro Cards Grid */}
                                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                                    <div className="rounded-lg bg-blue-500/10 p-2.5 dark:bg-blue-500/15">
                                        <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                            Protein
                                        </div>
                                        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                                            {scaledProtein}g
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {Math.round(proteinKcal)} kcal
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-amber-500/10 p-2.5 dark:bg-amber-500/15">
                                        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                            Carbs
                                        </div>
                                        <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                                            {scaledCarbs}g
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {Math.round(carbsKcal)} kcal
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-rose-500/10 p-2.5 dark:bg-rose-500/15">
                                        <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                                            Fat
                                        </div>
                                        <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                                            {scaledFat}g
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {Math.round(fatKcal)} kcal
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-emerald-500/10 p-2.5 dark:bg-emerald-500/15">
                                        <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                            Fiber
                                        </div>
                                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                            {scaledFiber !== null
                                                ? `${scaledFiber}g`
                                                : '—'}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            dietary
                                        </div>
                                    </div>
                                </div>

                                {/* Micronutrients Table */}
                                <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-2.5 text-center text-xs">
                                    <div className="rounded border border-border/50 p-1.5">
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            Sugar
                                        </span>
                                        <p className="font-semibold text-foreground">
                                            {scaledSugar !== null
                                                ? `${scaledSugar}g`
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="rounded border border-border/50 p-1.5">
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            Sat. Fat
                                        </span>
                                        <p className="font-semibold text-foreground">
                                            {scaledSatFat !== null
                                                ? `${scaledSatFat}g`
                                                : '—'}
                                        </p>
                                    </div>
                                    <div className="rounded border border-border/50 p-1.5">
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            Sodium
                                        </span>
                                        <p className="font-semibold text-foreground">
                                            {scaledSodium !== null
                                                ? `${scaledSodium}mg`
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Optional "Log to Diary" Drawer */}
                            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowLogDrawer(!showLogDrawer)
                                    }
                                    className="flex w-full items-center justify-between text-xs font-semibold text-foreground transition hover:text-primary"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <CalendarPlus className="h-4 w-4 text-primary" />
                                        {t('food_checker.log_optional')}
                                    </span>
                                    {showLogDrawer ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>

                                {showLogDrawer && (
                                    <form
                                        onSubmit={handleLogToDiary}
                                        className="mt-3 space-y-3 border-t border-border/50 pt-3"
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-[11px] text-muted-foreground">
                                                    Meal Slot
                                                </Label>
                                                <select
                                                    value={logMealSlot}
                                                    onChange={(e) =>
                                                        setLogMealSlot(
                                                            e.target
                                                                .value as any,
                                                        )
                                                    }
                                                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs"
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
                                                        setLogDate(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="mt-1 h-9 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLogging}
                                            className="w-full gap-2 bg-primary text-primary-foreground"
                                        >
                                            {isLogging ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                            {isLogging
                                                ? t('food_checker.logging')
                                                : t(
                                                      'food_checker.log_to_diary',
                                                  )}
                                        </Button>
                                    </form>
                                )}
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedFood(null)}
                                    className="gap-1.5 text-xs"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    {t('food_checker.check_another')}
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/foods/${selectedFood.id}`}
                                        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium text-muted-foreground shadow-xs transition hover:bg-accent hover:text-foreground"
                                    >
                                        {t('food_checker.open_full_page')}
                                    </Link>

                                    <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={() => onOpenChange(false)}
                                        className="text-xs"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Camera Barcode Scanner Modal */}
            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onFoodFound={handleBarcodeDetected}
            />
        </>
    );
}
