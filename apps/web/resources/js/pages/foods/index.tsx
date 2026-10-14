import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Apple,
    Barcode,
    Calculator,
    Check,
    Database,
    Globe,
    Layers,
    Plus,
    Search,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import { useId, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
    const [query, setQuery] = useState(searchQuery || '');
    const [barcodeInput, setBarcodeInput] = useState(searchBarcode || '');
    const [searchMode, setSearchMode] = useState<'text' | 'barcode'>(searchBarcode ? 'barcode' : 'text');
    const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');

    // Portion Calculator Dialog State
    const [calculatingFood, setCalculatingFood] = useState<FoodItem | null>(null);
    const [selectedServing, setSelectedServing] = useState<FoodServingData | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    // Create Custom Food Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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
            router.get('/foods', { barcode: barcodeInput.trim() }, { preserveState: true });
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
        const defaultServing = food.servings.find((s) => s.is_default) || food.servings[0] || {
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

    // Scaled portion calculations
    const calculateNutrition = () => {
        if (!calculatingFood || !selectedServing) return null;
        const baseSize = Number(calculatingFood.serving_size) > 0 ? Number(calculatingFood.serving_size) : 100;
        const totalGrams = Number(selectedServing.gram_equivalent) * quantity;
        const factor = totalGrams / baseSize;

        return {
            totalGrams: Math.round(totalGrams * 10) / 10,
            calories: Math.round(Number(calculatingFood.calories) * factor * 10) / 10,
            protein: Math.round(Number(calculatingFood.protein) * factor * 10) / 10,
            carbs: Math.round(Number(calculatingFood.carbs) * factor * 10) / 10,
            fat: Math.round(Number(calculatingFood.fat) * factor * 10) / 10,
            fiber: calculatingFood.fiber ? Math.round(Number(calculatingFood.fiber) * factor * 10) / 10 : null,
            sugar: calculatingFood.sugar ? Math.round(Number(calculatingFood.sugar) * factor * 10) / 10 : null,
            sodium: calculatingFood.sodium ? Math.round(Number(calculatingFood.sodium) * factor * 10) / 10 : null,
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
            <Head title="Food Database & Search" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Food Database</h1>
                    <p className="text-sm text-muted-foreground">
                        Search foods from Open Food Facts or manage your custom recipe library.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2 bg-primary text-primary-foreground"
                    >
                        <Plus className="h-4 w-4" />
                        Create Custom Food
                    </Button>
                </div>
            </div>

            {status && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Search Bar & Mode Toggle */}
            <Card className="border-border/60 shadow-xs">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={searchMode === 'text' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSearchMode('text')}
                            className="gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Text Search
                        </Button>
                        <Button
                            type="button"
                            variant={searchMode === 'barcode' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSearchMode('barcode')}
                            className="gap-2"
                        >
                            <Barcode className="h-4 w-4" />
                            Barcode Scanner / Lookup
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            {searchMode === 'text' ? (
                                <>
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by product name, brand, or ingredients (e.g. Oats, Greek Yogurt, Nutella)..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="pl-9 pr-9"
                                    />
                                </>
                            ) : (
                                <>
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter barcode number (e.g. 3017620422003, 3229820129488)..."
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        className="pl-9 pr-9 font-mono"
                                    />
                                </>
                            )}
                            {(query || barcodeInput) && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Degraded mode / Source alert banner */}
            {searchResult && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 p-3 rounded-lg border border-border/80 bg-muted/30">
                    <div className="flex items-center gap-2">
                        {searchResult.is_degraded ? (
                            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 py-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Degraded Mode: Offline Cache
                            </Badge>
                        ) : searchResult.source === 'off_authenticated' ? (
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1">
                                <Globe className="h-3.5 w-3.5" />
                                Open Food Facts (Authenticated)
                            </Badge>
                        ) : searchResult.source === 'off_anonymous' ? (
                            <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1.5 py-1">
                                <Globe className="h-3.5 w-3.5" />
                                Open Food Facts (Public API)
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 gap-1.5 py-1">
                                <Database className="h-3.5 w-3.5" />
                                Local Database
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            Found {searchResult.total} product{searchResult.total === 1 ? '' : 's'}
                        </span>
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleClearSearch} className="text-xs">
                        Clear results
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
                        Common & Cached Foods ({initialFoods.length})
                    </Button>
                    <Button
                        variant={activeTab === 'custom' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('custom')}
                        className="gap-2"
                    >
                        <Apple className="h-4 w-4" />
                        My Custom Foods ({customFoods.length})
                    </Button>
                </div>
            )}

            {/* Foods Grid */}
            {displayFoods.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <Utensils className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                    <h3 className="text-base font-semibold">No foods found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
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
                        <Card key={food.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                                            {food.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs line-clamp-1">
                                            {food.brand || 'Generic / Homemade'}
                                        </CardDescription>
                                    </div>

                                    {food.is_custom ? (
                                        <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
                                            Custom
                                        </Badge>
                                    ) : food.nutri_score ? (
                                        <Badge
                                            className={`text-[11px] font-bold uppercase ${
                                                food.nutri_score.toLowerCase() === 'a'
                                                    ? 'bg-emerald-600 text-white'
                                                    : food.nutri_score.toLowerCase() === 'b'
                                                      ? 'bg-green-500 text-white'
                                                      : food.nutri_score.toLowerCase() === 'c'
                                                        ? 'bg-yellow-500 text-black'
                                                        : food.nutri_score.toLowerCase() === 'd'
                                                          ? 'bg-orange-500 text-white'
                                                          : 'bg-red-600 text-white'
                                            }`}
                                        >
                                            Nutri {food.nutri_score}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px]">
                                            OFF
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3 pt-2">
                                {/* Nutrition Pill Indicators */}
                                <div className="grid grid-cols-4 gap-2 text-center rounded-lg bg-muted/40 p-2">
                                    <div>
                                        <div className="text-[11px] text-muted-foreground uppercase font-medium">kcal</div>
                                        <div className="text-sm font-bold text-foreground">
                                            {Math.round(Number(food.calories))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-muted-foreground uppercase font-medium">Protein</div>
                                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            {Number(food.protein)}g
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-muted-foreground uppercase font-medium">Carbs</div>
                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {Number(food.carbs)}g
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-muted-foreground uppercase font-medium">Fat</div>
                                        <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                            {Number(food.fat)}g
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Base: {Number(food.serving_size)}{food.serving_unit}</span>
                                    {food.servings && food.servings.length > 0 && (
                                        <span>{food.servings.length} portion option{food.servings.length === 1 ? '' : 's'}</span>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCalculator(food)}
                                    className="gap-1.5 flex-1 text-xs"
                                >
                                    <Calculator className="h-3.5 w-3.5 text-primary" />
                                    Portion Calculator
                                </Button>

                                {food.is_custom && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCustomFood(food.id)}
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
            <Dialog open={calculatingFood !== null} onOpenChange={(open) => !open && setCalculatingFood(null)}>
                <DialogContent className="sm:max-w-md">
                    {calculatingFood && selectedServing && scaledNutrition && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    Portion Nutrition Calculator
                                </DialogTitle>
                                <DialogDescription>
                                    {calculatingFood.name} {calculatingFood.brand ? `(${calculatingFood.brand})` : ''}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="serving-select" className="text-xs">Serving Unit</Label>
                                        <select
                                            id="serving-select"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                            value={selectedServing.serving_name}
                                            onChange={(e) => {
                                                const match = calculatingFood.servings.find((s) => s.serving_name === e.target.value);
                                                if (match) setSelectedServing(match);
                                            }}
                                        >
                                            {calculatingFood.servings.map((serving, idx) => (
                                                <option key={idx} value={serving.serving_name}>
                                                    {serving.serving_name} ({Number(serving.gram_equivalent)}g)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="serving-quantity" className="text-xs">Quantity</Label>
                                        <Input
                                            id="serving-quantity"
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            max="50"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(0.1, Number(e.target.value) || 1))}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Scaled Nutritional Summary */}
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                            <span className="text-sm font-medium">Total Consumed:</span>
                                            <span className="text-base font-bold text-foreground">
                                                {scaledNutrition.totalGrams}g
                                            </span>
                                        </div>

                                        <div className="text-center py-1">
                                            <div className="text-3xl font-extrabold text-primary">
                                                {scaledNutrition.calories}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                                Calories (kcal)
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-primary/10">
                                            <div>
                                                <div className="text-[11px] text-muted-foreground font-medium">Protein</div>
                                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {scaledNutrition.protein}g
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-muted-foreground font-medium">Carbs</div>
                                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {scaledNutrition.carbs}g
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-muted-foreground font-medium">Fat</div>
                                                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                    {scaledNutrition.fat}g
                                                </div>
                                            </div>
                                        </div>

                                        {(scaledNutrition.fiber !== null || scaledNutrition.sugar !== null || scaledNutrition.sodium !== null) && (
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground pt-2 border-t border-primary/10">
                                                {scaledNutrition.fiber !== null && (
                                                    <div>Fiber: {scaledNutrition.fiber}g</div>
                                                )}
                                                {scaledNutrition.sugar !== null && (
                                                    <div>Sugar: {scaledNutrition.sugar}g</div>
                                                )}
                                                {scaledNutrition.sodium !== null && (
                                                    <div>Sodium: {scaledNutrition.sodium}mg</div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCalculatingFood(null)}>
                                    Done
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Custom Food Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Create Custom Food
                        </DialogTitle>
                        <DialogDescription>
                            Add a homemade recipe, restaurant dish, or private food item to your catalog.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateCustomFood} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="custom-name">Food Name *</Label>
                                <Input
                                    id="custom-name"
                                    placeholder="e.g. Oatmeal with Protein"
                                    value={customFoodForm.data.name}
                                    onChange={(e) => customFoodForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={customFoodForm.errors.name} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="custom-brand">Brand / Creator</Label>
                                <Input
                                    id="custom-brand"
                                    placeholder="e.g. Homemade, Kitchen"
                                    value={customFoodForm.data.brand}
                                    onChange={(e) => customFoodForm.setData('brand', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="custom-serving-size">Serving Size *</Label>
                                <Input
                                    id="custom-serving-size"
                                    type="number"
                                    step="0.1"
                                    value={customFoodForm.data.serving_size}
                                    onChange={(e) => customFoodForm.setData('serving_size', Number(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="custom-serving-unit">Serving Unit *</Label>
                                <select
                                    id="custom-serving-unit"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    value={customFoodForm.data.serving_unit}
                                    onChange={(e) => customFoodForm.setData('serving_unit', e.target.value)}
                                >
                                    <option value="g">Grams (g)</option>
                                    <option value="ml">Milliliters (ml)</option>
                                    <option value="oz">Ounces (oz)</option>
                                </select>
                            </div>
                        </div>

                        {/* Nutrition per Serving */}
                        <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/20">
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Nutritional Values (per serving)
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="custom-cal" className="text-xs">Calories *</Label>
                                    <Input
                                        id="custom-cal"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.calories}
                                        onChange={(e) => customFoodForm.setData('calories', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-pro" className="text-xs">Protein (g) *</Label>
                                    <Input
                                        id="custom-pro"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.protein}
                                        onChange={(e) => customFoodForm.setData('protein', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-carb" className="text-xs">Carbs (g) *</Label>
                                    <Input
                                        id="custom-carb"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.carbs}
                                        onChange={(e) => customFoodForm.setData('carbs', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-fat" className="text-xs">Fat (g) *</Label>
                                    <Input
                                        id="custom-fat"
                                        type="number"
                                        step="0.1"
                                        value={customFoodForm.data.fat}
                                        onChange={(e) => customFoodForm.setData('fat', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="custom-fiber" className="text-xs">Fiber (g)</Label>
                                    <Input
                                        id="custom-fiber"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.fiber}
                                        onChange={(e) => customFoodForm.setData('fiber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-sugar" className="text-xs">Sugar (g)</Label>
                                    <Input
                                        id="custom-sugar"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.sugar}
                                        onChange={(e) => customFoodForm.setData('sugar', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-sodium" className="text-xs">Sodium (mg)</Label>
                                    <Input
                                        id="custom-sodium"
                                        type="number"
                                        step="0.1"
                                        placeholder="Optional"
                                        value={customFoodForm.data.sodium}
                                        onChange={(e) => customFoodForm.setData('sodium', e.target.value)}
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
                                {customFoodForm.processing ? 'Saving...' : 'Save Custom Food'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
