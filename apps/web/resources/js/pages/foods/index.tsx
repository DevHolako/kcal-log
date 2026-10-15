import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Apple,
    Barcode,
    Calculator,
    CalendarPlus,
    Camera,
    Check,
    Database,
    Globe,
    Plus,
    Search,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import { useState } from 'react';
import BarcodeScannerModal from '@/components/barcode-scanner-modal';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}

interface Props {
    initialFoods: FoodItem[];
    customFoods: FoodItem[];
    searchResult?: {
        items: FoodItem[];
        source: 'off_authenticated' | 'off_anonymous' | 'cache';
        is_degraded: boolean;
        total: number;
    } | null;
    searchQuery?: string | null;
    searchBarcode?: string | null;
    status?: string;
}

export default function FoodsIndex({
    initialFoods,
    customFoods,
    searchResult,
    searchQuery,
    searchBarcode,
    status,
}: Props) {
    const { t } = useTranslation();
    const [query, setQuery] = useState(searchQuery || '');
    const [barcodeInput, setBarcodeInput] = useState(searchBarcode || '');
    const [searchMode, setSearchMode] = useState<'text' | 'barcode'>(
        searchBarcode ? 'barcode' : 'text',
    );
    const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');

    // Portion Calculator Dialog State
    const [calculatingFood, setCalculatingFood] = useState<FoodItem | null>(
        null,
    );
    const [selectedServing, setSelectedServing] =
        useState<FoodServingData | null>(null);
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
        if (searchMode === 'barcode' && barcodeInput.trim()) {
            router.get(
                '/foods',
                { barcode: barcodeInput.trim() },
                { preserveState: true },
            );
        } else if (searchMode === 'text' && query.trim()) {
            router.get('/foods', { q: query.trim() }, { preserveState: true });
        }
    };

    const handleClearSearch = () => {
        setQuery('');
        setBarcodeInput('');
        router.get('/foods', {}, { preserveState: true });
    };

    const openCalculator = (food: FoodItem) => {
        setCalculatingFood(food);
        const defaultServing = food.servings.find((s) => s.is_default) ||
            food.servings[0] || {
                serving_name: `${food.serving_size}${food.serving_unit}`,
                gram_equivalent: Number(food.serving_size),
                is_default: true,
            };
        setSelectedServing(defaultServing);
        setQuantity(1);
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

    const handleDeleteCustomFood = (foodId: number) => {
        if (confirm('Are you sure you want to delete this custom food item?')) {
            router.delete(`/foods/custom/${foodId}`, { preserveScroll: true });
        }
    };

    const handleLogToDiary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!calculatingFood) return;

        setIsLoggingToDiary(true);
        router.post(
            '/diary',
            {
                food_id: calculatingFood.id,
                food_serving_id: selectedServing?.id ?? null,
                date: logDate,
                meal_slot: logMealSlot,
                quantity: quantity,
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
        if (!calculatingFood || !selectedServing) return null;
        const baseSize =
            Number(calculatingFood.serving_size) > 0
                ? Number(calculatingFood.serving_size)
                : 100;
        const totalGrams = Number(selectedServing.gram_equivalent) * quantity;
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

                <div className="flex items-center gap-2">
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

            {/* Search Bar & Mode Toggle */}
            <Card className="border-border/60 shadow-xs">
                <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={
                                    searchMode === 'text'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSearchMode('text')}
                                className="gap-2"
                            >
                                <Search className="h-4 w-4" />
                                {t('foods.text_search')}
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    searchMode === 'barcode'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                onClick={() => setSearchMode('barcode')}
                                className="gap-2"
                            >
                                <Barcode className="h-4 w-4" />
                                {t('foods.barcode_lookup')}
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setScannerOpen(true)}
                            className="gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                        >
                            <Camera className="h-4 w-4 text-emerald-600" />
                            {t('foods.scan_camera')}
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            {searchMode === 'text' ? (
                                <>
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder={t(
                                            'foods.search_placeholder',
                                        )}
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        className="pr-9 pl-9"
                                    />
                                </>
                            ) : (
                                <>
                                    <Barcode className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder={t(
                                            'foods.barcode_placeholder',
                                        )}
                                        value={barcodeInput}
                                        onChange={(e) =>
                                            setBarcodeInput(e.target.value)
                                        }
                                        className="pr-9 pl-9 font-mono"
                                    />
                                </>
                            )}
                            {(query || barcodeInput) && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            {t('action.lookup')}
                        </Button>
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
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Button
                        variant={activeTab === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('all')}
                        className="gap-2"
                    >
                        <Utensils className="h-4 w-4" />
                        {t('foods.common_cached')} ({initialFoods.length})
                    </Button>
                    <Button
                        variant={activeTab === 'custom' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('custom')}
                        className="gap-2"
                    >
                        <Apple className="h-4 w-4" />
                        {t('foods.my_custom')} ({customFoods.length})
                    </Button>
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
                                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
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
                                                className="line-clamp-1 text-base leading-tight font-semibold"
                                                title={food.name}
                                            >
                                                {food.name}
                                            </CardTitle>

                                            {food.is_custom ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="shrink-0 border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-600 dark:text-purple-400"
                                                >
                                                    Custom
                                                </Badge>
                                            ) : food.nutri_score ? (
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
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 text-[10px]"
                                                >
                                                    OFF
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="line-clamp-1 text-xs">
                                            {food.brand || 'Generic / Homemade'}
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

                            <CardFooter className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCalculator(food)}
                                    className="flex-1 gap-1.5 text-xs"
                                >
                                    <Calculator className="h-3.5 w-3.5 text-primary" />
                                    {t('foods.portion_and_log')}
                                </Button>

                                {food.is_custom && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleDeleteCustomFood(food.id)
                                        }
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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
                                <DialogDescription>
                                    {calculatingFood.name}{' '}
                                    {calculatingFood.brand
                                        ? `(${calculatingFood.brand})`
                                        : ''}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
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
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                            value={selectedServing.serving_name}
                                            onChange={(e) => {
                                                const match =
                                                    calculatingFood.servings.find(
                                                        (s) =>
                                                            s.serving_name ===
                                                            e.target.value,
                                                    );
                                                if (match)
                                                    setSelectedServing(match);
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
                                        <Label
                                            htmlFor="serving-quantity"
                                            className="text-xs"
                                        >
                                            Quantity
                                        </Label>
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
                                                            e.target.value,
                                                        ) || 1,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Scaled Nutritional Summary */}
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                            <span className="text-sm font-medium">
                                                Total Consumed:
                                            </span>
                                            <span className="text-base font-bold text-foreground">
                                                {scaledNutrition.totalGrams}g
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

            {/* Live Camera Barcode Scanner Modal */}
            <BarcodeScannerModal
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onFoodFound={(food) => openCalculator(food)}
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
