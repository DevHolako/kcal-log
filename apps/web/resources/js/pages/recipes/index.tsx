import { Head, router } from '@inertiajs/react';
import {
    CalendarPlus,
    Check,
    ChefHat,
    Clock,
    Copy,
    Database,
    Flame,
    Globe,
    Loader2,
    Plus,
    Search,
    ShoppingBag,
    Sparkles,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { useTranslation } from '@/lib/i18n';
import type { FoodItem, FoodServingData } from '@/pages/foods';

export interface RecipeItemData {
    id?: number;
    food_id: number;
    food_serving_id: number | null;
    quantity: number;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    sugar?: number | null;
    saturated_fat?: number | null;
    sodium?: number | null;
    food?: FoodItem;
    serving?: FoodServingData | null;
}

export interface MealRecipeData {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    servings: number | string;
    is_recipe: boolean;
    total_calories: number | string;
    total_protein: number | string;
    total_carbs: number | string;
    total_fat: number | string;
    total_fiber: number | string | null;
    total_sugar?: number | string | null;
    total_saturated_fat?: number | string | null;
    total_sodium?: number | string | null;
    items?: RecipeItemData[];
    created_at?: string;
}

export interface StarterKit {
    id: string;
    name: string;
    description: string;
    servings: number;
    tag: string;
    caloriesPerServing: number;
    proteinPerServing: number;
    carbsPerServing: number;
    fatPerServing: number;
    fiberPerServing: number;
    prepTime: string;
    ingredients: string[];
}

export const STARTER_MEAL_PREP_KITS: StarterKit[] = [
    {
        id: 'kit-1',
        name: 'Honey Sriracha Chicken & Jasmine Rice',
        description:
            'High-protein grilled chicken breast tossed in sweet & spicy honey sriracha glaze over fluffy jasmine rice with steamed broccoli florets.',
        servings: 4,
        tag: 'High Protein • 4 Prep Boxes',
        caloriesPerServing: 560,
        proteinPerServing: 48,
        carbsPerServing: 62,
        fatPerServing: 12,
        fiberPerServing: 5,
        prepTime: '25 mins',
        ingredients: [
            '600g Chicken Breast',
            '320g Jasmine Rice',
            '300g Steamed Broccoli',
            '40g Honey',
            '25g Sriracha',
            '15ml Olive Oil',
        ],
    },
    {
        id: 'kit-2',
        name: 'Overnight Protein Oats with Berries & Chia',
        description:
            'Rolled oats soaked in vanilla whey protein and almond milk, topped with antioxidant-rich blueberries, chia seeds, and cinnamon.',
        servings: 3,
        tag: 'Breakfast Prep • 3 Jars',
        caloriesPerServing: 410,
        proteinPerServing: 32,
        carbsPerServing: 54,
        fatPerServing: 8,
        fiberPerServing: 9,
        prepTime: '10 mins (No Cook)',
        ingredients: [
            '180g Rolled Oats',
            '90g Vanilla Whey Protein',
            '450ml Unsweetened Almond Milk',
            '150g Blueberries',
            '20g Chia Seeds',
        ],
    },
    {
        id: 'kit-3',
        name: 'Lean Grass-Fed Beef & Sweet Potato Bowl',
        description:
            '93/7 lean ground beef skillet seasoned with cumin, garlic, and smoked paprika, paired with roasted cubed sweet potatoes and bell peppers.',
        servings: 4,
        tag: 'Strength & Muscle • 4 Boxes',
        caloriesPerServing: 540,
        proteinPerServing: 44,
        carbsPerServing: 48,
        fatPerServing: 16,
        fiberPerServing: 6,
        prepTime: '30 mins',
        ingredients: [
            '500g 93/7 Lean Beef',
            '600g Sweet Potatoes',
            '2 Bell Peppers',
            '1 Yellow Onion',
            '10ml Avocado Oil',
        ],
    },
    {
        id: 'kit-4',
        name: 'Mediterranean Salmon & Quinoa Harvest Bowl',
        description:
            'Oven-roasted wild salmon fillet over tri-color fluffy quinoa, cherry tomatoes, cucumbers, kalamata olives, and a light lemon herb dressing.',
        servings: 2,
        tag: 'Heart Healthy • Omega-3',
        caloriesPerServing: 610,
        proteinPerServing: 46,
        carbsPerServing: 44,
        fatPerServing: 24,
        fiberPerServing: 7,
        prepTime: '20 mins',
        ingredients: [
            '350g Wild Salmon Fillets',
            '160g Dry Quinoa',
            '150g Cherry Tomatoes',
            '1 Cucumber',
            '40g Kalamata Olives',
        ],
    },
    {
        id: 'kit-5',
        name: 'High-Protein Turkey Sausage Breakfast Burritos',
        description:
            'Fluffy scrambled eggs, liquid egg whites, lean turkey sausage, black beans, and shredded low-fat cheddar rolled in whole wheat tortillas. Freezer friendly!',
        servings: 5,
        tag: 'Grab & Go • Freezer Friendly',
        caloriesPerServing: 370,
        proteinPerServing: 34,
        carbsPerServing: 30,
        fatPerServing: 11,
        fiberPerServing: 6,
        prepTime: '35 mins',
        ingredients: [
            '5 Whole Wheat Tortillas',
            '300g Lean Turkey Sausage',
            '6 Large Eggs',
            '200g Liquid Egg Whites',
            '100g Black Beans',
            '60g Low-fat Cheddar',
        ],
    },
    {
        id: 'kit-6',
        name: 'Crispy Tofu & Edamame Brown Rice Bowl',
        description:
            'Plant-powered baked sesame garlic tofu cubes, shelled edamame, and steamed brown rice served with snap peas and low-sodium tamari.',
        servings: 4,
        tag: '100% Plant-Based • 4 Bowls',
        caloriesPerServing: 480,
        proteinPerServing: 30,
        carbsPerServing: 64,
        fatPerServing: 13,
        fiberPerServing: 11,
        prepTime: '30 mins',
        ingredients: [
            '450g Extra Firm Tofu',
            '250g Shelled Edamame',
            '300g Brown Rice',
            '200g Snap Peas',
            '30ml Sesame-Tamari Glaze',
        ],
    },
];

interface Props {
    recipes: MealRecipeData[];
    availableFoods: FoodItem[];
    status?: string;
}

export default function RecipesIndex({
    recipes,
    availableFoods,
    status,
}: Props) {
    const { t } = useTranslation();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedRecipeToLog, setSelectedRecipeToLog] =
        useState<MealRecipeData | null>(null);
    const [activeTab, setActiveTab] = useState<'my-recipes' | 'starter-kits'>(
        'my-recipes',
    );
    const [quickLogKit, setQuickLogKit] = useState<StarterKit | null>(null);
    const [quickLogMealSlot, setQuickLogMealSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('lunch');
    const [quickLogDate, setQuickLogDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [isQuickLogging, setIsQuickLogging] = useState(false);

    // Form for creating a recipe
    const [recipeName, setRecipeName] = useState('');
    const [recipeDescription, setRecipeDescription] = useState('');
    const [recipeServings, setRecipeServings] = useState(1);
    const [selectedItems, setSelectedItems] = useState<
        Array<{
            food: FoodItem;
            servingId: number | null;
            quantity: number;
            grams: number;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            fiber: number;
            sugar: number;
            saturated_fat: number;
            sodium: number;
        }>
    >([]);

    // Ingredient picker state inside create modal
    const [foodSearchQuery, setFoodSearchQuery] = useState('');
    const [remoteFoods, setRemoteFoods] = useState<FoodItem[]>([]);
    const [isSearchingFood, setIsSearchingFood] = useState(false);
    const [activeFoodToAdd, setActiveFoodToAdd] = useState<FoodItem | null>(
        null,
    );
    const [selectedServingId, setSelectedServingId] = useState<number | null>(
        null,
    );
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemCustomGrams, setItemCustomGrams] = useState<string>('');

    // Logging recipe form state
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [logDate, setLogDate] = useState(todayStr);
    const [logMealSlot, setLogMealSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('lunch');
    const [logServings, setLogServings] = useState(1);
    const [logAsIndividual, setLogAsIndividual] = useState(true);
    const [isLogging, setIsLogging] = useState(false);
    const [isSavingRecipe, setIsSavingRecipe] = useState(false);

    // Grocery List Generator state
    const [groceryModalOpen, setGroceryModalOpen] = useState(false);
    const [selectedKitsForGrocery, setSelectedKitsForGrocery] = useState<
        Record<string, number>
    >({ 'kit-1': 1, 'kit-2': 1 });
    const [checkedGroceryItems, setCheckedGroceryItems] = useState<
        Record<string, boolean>
    >({});
    const [copiedGrocery, setCopiedGrocery] = useState(false);

    // Compute consolidated grocery items
    const consolidatedGroceryList = useMemo(() => {
        const ingredientsMap: Record<
            string,
            {
                category: 'protein' | 'produce' | 'dairy' | 'pantry';
                name: string;
                amount: string;
            }
        > = {};

        const categorize = (
            text: string,
        ): 'protein' | 'produce' | 'dairy' | 'pantry' => {
            const lower = text.toLowerCase();
            if (
                lower.includes('chicken') ||
                lower.includes('beef') ||
                lower.includes('salmon') ||
                lower.includes('turkey') ||
                lower.includes('sausage') ||
                lower.includes('egg') ||
                lower.includes('whey') ||
                lower.includes('protein') ||
                lower.includes('tuna') ||
                lower.includes('shrimp')
            ) {
                return 'protein';
            }
            if (
                lower.includes('broccoli') ||
                lower.includes('berries') ||
                lower.includes('sweet potato') ||
                lower.includes('potato') ||
                lower.includes('pepper') ||
                lower.includes('onion') ||
                lower.includes('tomato') ||
                lower.includes('cucumber') ||
                lower.includes('avocado') ||
                lower.includes('spinach') ||
                lower.includes('lettuce') ||
                lower.includes('lemon') ||
                lower.includes('garlic')
            ) {
                return 'produce';
            }
            if (
                lower.includes('milk') ||
                lower.includes('cheddar') ||
                lower.includes('cheese') ||
                lower.includes('yogurt') ||
                lower.includes('butter')
            ) {
                return 'dairy';
            }
            return 'pantry';
        };

        // 1. Process Starter Kits
        Object.entries(selectedKitsForGrocery).forEach(
            ([kitId, multiplier]) => {
                if (multiplier <= 0) return;
                const kit = STARTER_MEAL_PREP_KITS.find((k) => k.id === kitId);
                if (!kit) return;

                kit.ingredients.forEach((ing) => {
                    const cat = categorize(ing);
                    const key = `${cat}_${ing.toLowerCase().replace(/[^a-z]/g, '')}`;
                    if (!ingredientsMap[key]) {
                        ingredientsMap[key] = {
                            category: cat,
                            name: ing,
                            amount: multiplier > 1 ? `(${multiplier}x)` : '',
                        };
                    }
                });
            },
        );

        // 2. Group into categories
        const grouped: Record<
            'protein' | 'produce' | 'dairy' | 'pantry',
            Array<{ id: string; name: string; amount: string }>
        > = {
            protein: [],
            produce: [],
            dairy: [],
            pantry: [],
        };

        Object.entries(ingredientsMap).forEach(([id, item]) => {
            grouped[item.category].push({
                id,
                name: item.name,
                amount: item.amount,
            });
        });

        return grouped;
    }, [selectedKitsForGrocery]);

    const handleToggleKitForGrocery = (kitId: string) => {
        setSelectedKitsForGrocery((prev) => {
            const next = { ...prev };
            if (next[kitId]) {
                delete next[kitId];
            } else {
                next[kitId] = 1;
            }
            return next;
        });
    };

    const handleCopyGroceryList = () => {
        const lines: string[] = ['🛒 Meal Prep Grocery List\n'];
        const cats: Array<{
            key: 'protein' | 'produce' | 'dairy' | 'pantry';
            label: string;
        }> = [
            { key: 'protein', label: '🥩 Meats & Protein' },
            { key: 'produce', label: '🥦 Fresh Produce' },
            { key: 'dairy', label: '🥛 Dairy & Eggs' },
            { key: 'pantry', label: '🍚 Grains & Pantry' },
        ];

        cats.forEach(({ key, label }) => {
            const items = consolidatedGroceryList[key];
            if (items.length > 0) {
                lines.push(`\n${label}:`);
                items.forEach((item) => {
                    const checked = checkedGroceryItems[item.id]
                        ? '[x]'
                        : '[ ]';
                    lines.push(`${checked} ${item.name} ${item.amount}`);
                });
            }
        });

        void navigator.clipboard.writeText(lines.join('\n')).then(() => {
            setCopiedGrocery(true);
            setTimeout(() => setCopiedGrocery(false), 2000);
        });
    };

    // Remote search across Open Food Facts & database when searching for recipe ingredients
    useEffect(() => {
        const query = foodSearchQuery.trim();
        if (query.length < 2) {
            setRemoteFoods([]);
            setIsSearchingFood(false);
            return;
        }

        setIsSearchingFood(true);
        const timer = setTimeout(() => {
            fetch(`/foods/search?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json' },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data.items)) {
                        setRemoteFoods(data.items);
                    } else {
                        setRemoteFoods([]);
                    }
                })
                .catch(() => {
                    setRemoteFoods([]);
                })
                .finally(() => {
                    setIsSearchingFood(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [foodSearchQuery]);

    // Combine available foods (initial DB cache) and remote search results (Open Food Facts + DB)
    const displayFoods = useMemo(() => {
        const trimmed = foodSearchQuery.trim().toLowerCase();
        if (!trimmed) {
            return availableFoods.slice(0, 8);
        }

        // 1. In-memory matches from availableFoods
        const localMatches = availableFoods.filter(
            (f) =>
                f.name.toLowerCase().includes(trimmed) ||
                (f.brand && f.brand.toLowerCase().includes(trimmed)),
        );

        // 2. Merge with remoteFoods returned from /foods/search (which queries OFF and DB)
        const combined = [...localMatches];
        const existingIds = new Set(localMatches.map((f) => f.id));
        const existingBarcodes = new Set(
            localMatches.map((f) => f.barcode).filter(Boolean),
        );

        for (const rf of remoteFoods) {
            if (existingIds.has(rf.id)) continue;
            if (rf.barcode && existingBarcodes.has(rf.barcode)) continue;
            combined.push(rf);
            existingIds.add(rf.id);
            if (rf.barcode) existingBarcodes.add(rf.barcode);
        }

        return combined;
    }, [availableFoods, remoteFoods, foodSearchQuery]);

    // Handle adding selected food to ingredients list
    const handleAddIngredient = () => {
        if (!activeFoodToAdd) return;

        const baseSize =
            Number(activeFoodToAdd.serving_size) > 0
                ? Number(activeFoodToAdd.serving_size)
                : 100;
        let grams = 100;

        if (itemCustomGrams && Number(itemCustomGrams) > 0) {
            grams = Number(itemCustomGrams);
        } else if (selectedServingId && activeFoodToAdd.servings) {
            const s = activeFoodToAdd.servings.find(
                (serv) => serv.id === selectedServingId,
            );
            if (s) {
                grams = Number(s.gram_equivalent) * itemQuantity;
            } else {
                grams = baseSize * itemQuantity;
            }
        } else {
            grams = baseSize * itemQuantity;
        }

        const factor = grams / baseSize;
        const calories =
            Math.round(Number(activeFoodToAdd.calories) * factor * 10) / 10;
        const protein =
            Math.round(Number(activeFoodToAdd.protein) * factor * 10) / 10;
        const carbs =
            Math.round(Number(activeFoodToAdd.carbs) * factor * 10) / 10;
        const fat = Math.round(Number(activeFoodToAdd.fat) * factor * 10) / 10;
        const fiber = activeFoodToAdd.fiber
            ? Math.round(Number(activeFoodToAdd.fiber) * factor * 10) / 10
            : 0;
        const sugar = activeFoodToAdd.sugar
            ? Math.round(Number(activeFoodToAdd.sugar) * factor * 10) / 10
            : 0;
        const saturated_fat = activeFoodToAdd.saturated_fat
            ? Math.round(Number(activeFoodToAdd.saturated_fat) * factor * 10) /
              10
            : 0;
        const sodium = activeFoodToAdd.sodium
            ? Math.round(Number(activeFoodToAdd.sodium) * factor * 1000) / 1000
            : 0;

        setSelectedItems((prev) => [
            ...prev,
            {
                food: activeFoodToAdd,
                servingId: selectedServingId,
                quantity: itemQuantity,
                grams,
                calories,
                protein,
                carbs,
                fat,
                fiber,
                sugar,
                saturated_fat,
                sodium,
            },
        ]);

        // Reset ingredient selection
        setActiveFoodToAdd(null);
        setSelectedServingId(null);
        setItemQuantity(1);
        setItemCustomGrams('');
    };

    const handleRemoveIngredient = (index: number) => {
        setSelectedItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Calculate recipe live totals
    const recipeTotals = useMemo(() => {
        const cals = selectedItems.reduce((acc, i) => acc + i.calories, 0);
        const pro = selectedItems.reduce((acc, i) => acc + i.protein, 0);
        const carb = selectedItems.reduce((acc, i) => acc + i.carbs, 0);
        const fat = selectedItems.reduce((acc, i) => acc + i.fat, 0);
        const fib = selectedItems.reduce((acc, i) => acc + i.fiber, 0);
        const sug = selectedItems.reduce((acc, i) => acc + i.sugar, 0);
        const sat = selectedItems.reduce((acc, i) => acc + i.saturated_fat, 0);
        const sod = selectedItems.reduce((acc, i) => acc + i.sodium, 0);

        const s = recipeServings > 0 ? recipeServings : 1;
        return {
            totalCalories: Math.round(cals),
            totalProtein: Math.round(pro * 10) / 10,
            totalCarbs: Math.round(carb * 10) / 10,
            totalFat: Math.round(fat * 10) / 10,
            totalFiber: Math.round(fib * 10) / 10,
            totalSugar: Math.round(sug * 10) / 10,
            totalSatFat: Math.round(sat * 10) / 10,
            totalSodium: Math.round(sod * 1000) / 1000,
            perServingCalories: Math.round(cals / s),
            perServingProtein: Math.round((pro / s) * 10) / 10,
            perServingCarbs: Math.round((carb / s) * 10) / 10,
            perServingFat: Math.round((fat / s) * 10) / 10,
            perServingFiber: Math.round((fib / s) * 10) / 10,
        };
    }, [selectedItems, recipeServings]);

    // Handle submit new recipe
    const handleSaveRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipeName.trim() || selectedItems.length === 0) return;

        setIsSavingRecipe(true);
        router.post(
            '/recipes',
            {
                name: recipeName,
                description: recipeDescription,
                servings: recipeServings,
                items: selectedItems.map((item) => ({
                    food_id: item.food.id,
                    food_serving_id: item.servingId,
                    quantity: item.quantity,
                    grams: item.grams,
                })),
            },
            {
                onSuccess: () => {
                    setCreateModalOpen(false);
                    setRecipeName('');
                    setRecipeDescription('');
                    setRecipeServings(1);
                    setSelectedItems([]);
                },
                onFinish: () => setIsSavingRecipe(false),
            },
        );
    };

    // Open logging dialog
    const handleOpenLogModal = (recipe: MealRecipeData) => {
        setSelectedRecipeToLog(recipe);
        setLogServings(1);
        setLogModalOpen(true);
    };

    // Submit recipe log to diary
    const handleLogRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipeToLog) return;

        setIsLogging(true);
        router.post(
            `/recipes/${selectedRecipeToLog.id}/log`,
            {
                date: logDate,
                meal_slot: logMealSlot,
                servings: logServings,
                log_as_individual: logAsIndividual,
            },
            {
                onSuccess: () => {
                    setLogModalOpen(false);
                    setSelectedRecipeToLog(null);
                },
                onFinish: () => setIsLogging(false),
            },
        );
    };

    const [recipeToDelete, setRecipeToDelete] = useState<MealRecipeData | null>(
        null,
    );

    // Delete recipe
    const handleDeleteRecipe = (recipe: MealRecipeData) => {
        setRecipeToDelete(recipe);
    };

    const handleQuickLogKit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickLogKit) return;
        setIsQuickLogging(true);
        router.post(
            '/diary/quick-add',
            {
                date: quickLogDate,
                meal_slot: quickLogMealSlot,
                calories: quickLogKit.caloriesPerServing,
                description: `${quickLogKit.name} (1 serving • ${quickLogKit.proteinPerServing}g P / ${quickLogKit.carbsPerServing}g C / ${quickLogKit.fatPerServing}g F)`,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setQuickLogKit(null);
                },
                onFinish: () => setIsQuickLogging(false),
            },
        );
    };

    const handleImportKitAsCustom = (kit: StarterKit) => {
        setRecipeName(kit.name);
        setRecipeDescription(kit.description);
        setRecipeServings(kit.servings);
        setSelectedItems([]);
        setActiveTab('my-recipes');
        setCreateModalOpen(true);
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`${t('recipes.title')} - kcal-log`} />

            {/* Page Header */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <ChefHat className="h-6 w-6 text-emerald-600" />
                        {t('recipes.title')}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {t('recipes.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setGroceryModalOpen(true)}
                        className="gap-2 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {t('recipes.grocery_list')}
                    </Button>
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-2 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        {t('recipes.create_recipe')}
                    </Button>
                </div>
            </div>

            {status && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* View Switcher Tabs */}
            <div className="flex border-b border-border">
                <button
                    type="button"
                    onClick={() => setActiveTab('my-recipes')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        activeTab === 'my-recipes'
                            ? 'border-emerald-600 text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <ChefHat className="h-4 w-4 text-emerald-600" />
                    {t('recipes.tab_my_recipes')} ({recipes.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('starter-kits')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        activeTab === 'starter-kits'
                            ? 'border-emerald-600 text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    {t('recipes.tab_starter_kits')} (
                    {STARTER_MEAL_PREP_KITS.length})
                </button>
            </div>

            {/* Custom Recipes Tab */}
            {activeTab === 'my-recipes' && (
                <>
                    {recipes.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                <ChefHat className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">
                                {t('recipes.no_recipes')}
                            </h3>
                            <p className="mx-auto mt-1 mb-6 max-w-sm text-sm text-muted-foreground">
                                {t('recipes.no_recipes_desc')}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Button
                                    onClick={() => setCreateModalOpen(true)}
                                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    <Plus className="h-4 w-4" />{' '}
                                    {t('recipes.create_recipe')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('starter-kits')}
                                    className="gap-2"
                                >
                                    <Sparkles className="h-4 w-4 text-amber-500" />{' '}
                                    {t('recipes.browse_kits')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {recipes.map((recipe) => {
                                const servingsCount =
                                    Number(recipe.servings) > 0
                                        ? Number(recipe.servings)
                                        : 1;
                                const calsPerServing = Math.round(
                                    Number(recipe.total_calories) /
                                        servingsCount,
                                );
                                const proPerServing =
                                    Math.round(
                                        (Number(recipe.total_protein) /
                                            servingsCount) *
                                            10,
                                    ) / 10;
                                const carbPerServing =
                                    Math.round(
                                        (Number(recipe.total_carbs) /
                                            servingsCount) *
                                            10,
                                    ) / 10;
                                const fatPerServing =
                                    Math.round(
                                        (Number(recipe.total_fat) /
                                            servingsCount) *
                                            10,
                                    ) / 10;

                                return (
                                    <Card
                                        key={recipe.id}
                                        className="flex flex-col justify-between border-border/60 shadow-xs transition-colors hover:border-border"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <CardTitle className="text-lg font-bold text-foreground">
                                                        {recipe.name}
                                                    </CardTitle>
                                                    {recipe.description && (
                                                        <CardDescription className="mt-1 line-clamp-2 text-xs">
                                                            {recipe.description}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 text-xs font-medium"
                                                >
                                                    {recipe.servings}{' '}
                                                    {Number(recipe.servings) ===
                                                    1
                                                        ? 'serving'
                                                        : 'servings'}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4 pb-4">
                                            {/* Per Serving Nutrition Badges */}
                                            <div className="rounded-lg bg-muted/40 p-3">
                                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Per Serving
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sm font-extrabold text-foreground">
                                                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                                                        {calsPerServing} kcal
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            Protein
                                                        </span>
                                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                            {proPerServing}g
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            Carbs
                                                        </span>
                                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                            {carbPerServing}g
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                            Fat
                                                        </span>
                                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                            {fatPerServing}g
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ingredients List */}
                                            {recipe.items &&
                                                recipe.items.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                            Ingredients (
                                                            {
                                                                recipe.items
                                                                    .length
                                                            }
                                                            )
                                                        </span>
                                                        <ul className="space-y-1 divide-y divide-border/30 text-xs text-muted-foreground">
                                                            {recipe.items
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        it,
                                                                        idx,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="flex justify-between py-1"
                                                                        >
                                                                            <span className="truncate pr-2 font-medium text-foreground">
                                                                                {it
                                                                                    .food
                                                                                    ?.name ||
                                                                                    'Food item'}
                                                                            </span>
                                                                            <span className="shrink-0">
                                                                                {
                                                                                    it.grams
                                                                                }
                                                                                g
                                                                                &bull;{' '}
                                                                                {Math.round(
                                                                                    Number(
                                                                                        it.calories,
                                                                                    ),
                                                                                )}{' '}
                                                                                kcal
                                                                            </span>
                                                                        </li>
                                                                    ),
                                                                )}
                                                            {recipe.items
                                                                .length > 4 && (
                                                                <li className="pt-1 text-[11px] text-muted-foreground italic">
                                                                    +
                                                                    {recipe
                                                                        .items
                                                                        .length -
                                                                        4}{' '}
                                                                    more
                                                                    ingredient(s)
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </CardContent>

                                        <CardFooter className="flex items-center justify-between gap-2 border-t border-border pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteRecipe(recipe)
                                                }
                                                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    handleOpenLogModal(recipe)
                                                }
                                                className="h-8 gap-1.5 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                                            >
                                                <CalendarPlus className="h-3.5 w-3.5" />
                                                Log to Diary
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Starter Meal-Prep Kits Tab */}
            {activeTab === 'starter-kits' && (
                <div className="space-y-6">
                    {/* Free APIs Architecture Callout */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                                        Free Recipe APIs
                                    </Badge>
                                    <h4 className="text-sm font-bold text-foreground">
                                        Ready Meal-Prep Kits & Free Recipe API
                                        Integrations
                                    </h4>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    kcal-log provides 6 built-in macro-balanced
                                    meal prep kits ready to log directly or
                                    import as customizable templates. The
                                    platform is architected to seamlessly hook
                                    into external recipe databases:
                                </p>
                                <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs sm:grid-cols-3">
                                    <div className="rounded-lg border border-border bg-card/60 p-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-foreground">
                                                Edamam Recipe API
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                Free Tier
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            10,000 queries/month free. Complete
                                            macro splits, allergen tags, and
                                            micronutrient calculations per
                                            serving.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card/60 p-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-foreground">
                                                Spoonacular API
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                150 pts/day
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Dynamic recipe scaling, ingredient
                                            price estimation, and step-by-step
                                            culinary preparation instructions.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-card/60 p-2.5">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-foreground">
                                                TheMealDB
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                100% Free
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Open-source global culinary database
                                            with high-resolution imagery and
                                            YouTube video cooking tutorials.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Starter Kits Grid */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {STARTER_MEAL_PREP_KITS.map((kit) => (
                            <Card
                                key={kit.id}
                                className="flex flex-col justify-between border-border/60 shadow-xs transition-colors hover:border-border"
                            >
                                <CardHeader className="pb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="secondary"
                                                className="bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                                            >
                                                {kit.tag}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                {kit.prepTime}
                                            </span>
                                        </div>
                                        <CardTitle className="mt-1 text-base font-bold text-foreground">
                                            {kit.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1 line-clamp-2 text-xs">
                                            {kit.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pb-4">
                                    {/* Per Serving Nutrition */}
                                    <div className="rounded-lg bg-muted/40 p-3">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Per Serving ({kit.servings}{' '}
                                                servings yield)
                                            </span>
                                            <span className="flex items-center gap-1 text-sm font-extrabold text-foreground">
                                                <Flame className="h-3.5 w-3.5 text-amber-500" />
                                                {kit.caloriesPerServing} kcal
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 pt-2 text-center">
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Protein
                                                </span>
                                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    {kit.proteinPerServing}g
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Carbs
                                                </span>
                                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                    {kit.carbsPerServing}g
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Fat
                                                </span>
                                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                    {kit.fatPerServing}g
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Fiber
                                                </span>
                                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    {kit.fiberPerServing}g
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Ingredients (
                                            {kit.ingredients.length})
                                        </span>
                                        <ul className="space-y-1 divide-y divide-border/30 text-xs text-muted-foreground">
                                            {kit.ingredients.map((ing, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-center gap-1.5 py-1"
                                                >
                                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                    <span className="font-medium text-foreground">
                                                        {ing}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between gap-2 border-t border-border pt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleImportKitAsCustom(kit)
                                        }
                                        className="h-8 gap-1.5 text-xs font-semibold"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        {t('action.customize')}
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() => setQuickLogKit(kit)}
                                        className="h-8 gap-1.5 bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        <CalendarPlus className="h-3.5 w-3.5" />
                                        {t('action.log_serving')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Recipe Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5 text-emerald-600" />
                            {t('recipes.create_title')}
                        </DialogTitle>
                        <DialogDescription>
                            Combine multiple food items into a composite recipe
                            with aggregate macro and calorie tracking.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveRecipe} className="space-y-5">
                        {/* Recipe Metadata */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label
                                    htmlFor="recipe-name"
                                    className="text-xs font-semibold"
                                >
                                    Recipe Name *
                                </Label>
                                <Input
                                    id="recipe-name"
                                    required
                                    placeholder="e.g. High-Protein Berry Oatmeal"
                                    value={recipeName}
                                    onChange={(e) =>
                                        setRecipeName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="recipe-servings"
                                    className="text-xs font-semibold"
                                >
                                    Servings *
                                </Label>
                                <Input
                                    id="recipe-servings"
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="50"
                                    required
                                    value={recipeServings}
                                    onChange={(e) =>
                                        setRecipeServings(
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="recipe-description"
                                className="text-xs font-semibold"
                            >
                                Description (optional)
                            </Label>
                            <Input
                                id="recipe-description"
                                placeholder="e.g. Quick breakfast bowl prepared with whey and chia seeds"
                                value={recipeDescription}
                                onChange={(e) =>
                                    setRecipeDescription(e.target.value)
                                }
                            />
                        </div>

                        {/* Ingredients Box */}
                        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                <Utensils className="h-4 w-4 text-emerald-600" />
                                Recipe Ingredients
                            </h4>

                            {/* Added Ingredients Table */}
                            {selectedItems.length === 0 ? (
                                <p className="py-2 text-center text-xs text-muted-foreground italic">
                                    No ingredients added yet. Search and select
                                    foods below to add them to this recipe.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2.5 text-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-foreground">
                                                    {item.food.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {item.grams}g &bull;{' '}
                                                    {item.calories} kcal &bull;
                                                    P: {item.protein}g | C:{' '}
                                                    {item.carbs}g | F:{' '}
                                                    {item.fat}g
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveIngredient(idx)
                                                }
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Food Picker */}
                            <div className="space-y-3 border-t border-border pt-3">
                                <Label className="text-xs font-semibold text-foreground">
                                    Add An Ingredient
                                </Label>

                                {!activeFoodToAdd ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder={t(
                                                    'recipes.search_ingredient',
                                                )}
                                                value={foodSearchQuery}
                                                onChange={(e) =>
                                                    setFoodSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="pl-8 text-xs"
                                            />
                                            {isSearchingFood && (
                                                <Loader2 className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-primary" />
                                            )}
                                        </div>

                                        {isSearchingFood && (
                                            <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
                                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                <span>
                                                    {t(
                                                        'recipes.searching_foods',
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                                            {displayFoods.map((f) => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveFoodToAdd(f);
                                                        setSelectedServingId(
                                                            f.servings?.[0]
                                                                ?.id ?? null,
                                                        );
                                                        setItemQuantity(1);
                                                        setItemCustomGrams('');
                                                    }}
                                                    className="group flex items-center justify-between gap-2 rounded-lg border border-border/70 p-2 text-left text-xs transition-all hover:border-emerald-500 hover:bg-emerald-500/5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        {f.image_url ? (
                                                            <img
                                                                src={
                                                                    f.image_url
                                                                }
                                                                alt={f.name}
                                                                className="h-8 w-8 shrink-0 rounded border border-border/50 object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                                                <Utensils className="h-3.5 w-3.5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                                                {f.name}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                {f.brand && (
                                                                    <span className="max-w-[70px] truncate">
                                                                        {
                                                                            f.brand
                                                                        }
                                                                    </span>
                                                                )}
                                                                {f.search_origin ===
                                                                    'openfoodfacts' ||
                                                                (!f.is_custom &&
                                                                    f.off_id) ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="h-4 border-blue-500/30 bg-blue-500/10 px-1 text-[9px] text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <Globe className="mr-0.5 h-2 w-2" />
                                                                        OFF
                                                                    </Badge>
                                                                ) : f.is_custom ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="h-4 border-purple-500/30 bg-purple-500/10 px-1 text-[9px] text-purple-600 dark:text-purple-400"
                                                                    >
                                                                        Custom
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="h-4 border-emerald-500/30 bg-emerald-500/10 px-1 text-[9px] text-emerald-600 dark:text-emerald-400"
                                                                    >
                                                                        <Database className="mr-0.5 h-2 w-2" />
                                                                        DB
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className="font-semibold text-foreground">
                                                            {Math.round(
                                                                Number(
                                                                    f.calories,
                                                                ),
                                                            )}
                                                        </span>
                                                        <span className="block text-[10px] text-muted-foreground">
                                                            kcal
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}

                                            {displayFoods.length === 0 &&
                                                !isSearchingFood && (
                                                    <div className="col-span-1 py-4 text-center text-xs text-muted-foreground sm:col-span-2">
                                                        {t(
                                                            'recipes.no_foods_found',
                                                            {
                                                                query: foodSearchQuery,
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {activeFoodToAdd.image_url ? (
                                                    <img
                                                        src={
                                                            activeFoodToAdd.image_url
                                                        }
                                                        alt={
                                                            activeFoodToAdd.name
                                                        }
                                                        className="h-8 w-8 shrink-0 rounded border border-emerald-500/30 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <Utensils className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <span className="block truncate text-xs font-bold text-foreground">
                                                        {activeFoodToAdd.name}
                                                    </span>
                                                    {activeFoodToAdd.brand && (
                                                        <span className="block truncate text-[10px] text-muted-foreground">
                                                            {
                                                                activeFoodToAdd.brand
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setActiveFoodToAdd(null)
                                                }
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {/* Serving Portion Dropdown */}
                                            {activeFoodToAdd.servings &&
                                                activeFoodToAdd.servings
                                                    .length > 0 && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px]">
                                                            Portion
                                                        </Label>
                                                        <select
                                                            value={
                                                                selectedServingId ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                setSelectedServingId(
                                                                    e.target
                                                                        .value
                                                                        ? Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            className="w-full rounded-md border border-input bg-card p-1.5 text-xs"
                                                        >
                                                            {activeFoodToAdd.servings.map(
                                                                (s) => (
                                                                    <option
                                                                        key={
                                                                            s.id
                                                                        }
                                                                        value={
                                                                            s.id
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
                                                            )}
                                                        </select>
                                                    </div>
                                                )}

                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Multiplier
                                                </Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    value={itemQuantity}
                                                    onChange={(e) =>
                                                        setItemQuantity(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Or exact grams
                                                </Label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 150"
                                                    value={itemCustomGrams}
                                                    onChange={(e) =>
                                                        setItemCustomGrams(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleAddIngredient}
                                            className="h-8 w-full bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                                        >
                                            {t('recipes.add_this_ingredient')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nutrition Summary Bar */}
                        {selectedItems.length > 0 && (
                            <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">
                                        Recipe Caloric Summary
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Total:{' '}
                                        <strong>
                                            {recipeTotals.totalCalories} kcal
                                        </strong>{' '}
                                        &bull; Per Serving:{' '}
                                        <strong>
                                            {recipeTotals.perServingCalories}{' '}
                                            kcal
                                        </strong>
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="rounded-lg border border-border/50 bg-card p-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Protein
                                        </span>
                                        <p className="font-bold text-emerald-600">
                                            {recipeTotals.perServingProtein}g
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-card p-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Carbs
                                        </span>
                                        <p className="font-bold text-amber-600">
                                            {recipeTotals.perServingCarbs}g
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-card p-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Fat
                                        </span>
                                        <p className="font-bold text-sky-600">
                                            {recipeTotals.perServingFat}g
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-card p-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Fiber
                                        </span>
                                        <p className="font-bold text-foreground">
                                            {recipeTotals.perServingFiber}g
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                            >
                                {t('action.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSavingRecipe ||
                                    !recipeName.trim() ||
                                    selectedItems.length === 0
                                }
                                className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                            >
                                {isSavingRecipe ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t('recipes.save_recipe')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Log Recipe to Diary Dialog */}
            <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarPlus className="h-5 w-5 text-emerald-600" />
                            Log Recipe to Diary
                        </DialogTitle>
                        <DialogDescription>
                            Add {selectedRecipeToLog?.name} to your food log.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRecipeToLog && (
                        <form onSubmit={handleLogRecipe} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="log-date"
                                    className="text-xs font-semibold"
                                >
                                    Date
                                </Label>
                                <Input
                                    id="log-date"
                                    type="date"
                                    required
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="log-meal-slot"
                                    className="text-xs font-semibold"
                                >
                                    Meal Slot
                                </Label>
                                <select
                                    id="log-meal-slot"
                                    value={logMealSlot}
                                    onChange={(e) =>
                                        setLogMealSlot(e.target.value as any)
                                    }
                                    className="w-full rounded-md border border-input bg-card p-2 text-sm"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="log-servings"
                                    className="text-xs font-semibold"
                                >
                                    Servings to Log
                                </Label>
                                <Input
                                    id="log-servings"
                                    type="number"
                                    step="0.5"
                                    min="0.1"
                                    max="10"
                                    required
                                    value={logServings}
                                    onChange={(e) =>
                                        setLogServings(Number(e.target.value))
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="log-as-individual"
                                    type="checkbox"
                                    checked={logAsIndividual}
                                    onChange={(e) =>
                                        setLogAsIndividual(e.target.checked)
                                    }
                                    className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label
                                    htmlFor="log-as-individual"
                                    className="text-xs font-normal text-foreground"
                                >
                                    Log as individual ingredients (enables
                                    tweaking items in diary)
                                </Label>
                            </div>

                            <DialogFooter className="gap-2 pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setLogModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLogging}
                                    className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                                >
                                    {isLogging ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Confirm Log'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Quick Log Starter Kit Dialog */}
            <Dialog
                open={!!quickLogKit}
                onOpenChange={(open) => !open && setQuickLogKit(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarPlus className="h-5 w-5 text-emerald-600" />
                            Log Starter Kit Portion
                        </DialogTitle>
                        <DialogDescription>
                            Log 1 prepared portion of &ldquo;{quickLogKit?.name}
                            &rdquo; directly to your daily diary.
                        </DialogDescription>
                    </DialogHeader>

                    {quickLogKit && (
                        <form
                            onSubmit={handleQuickLogKit}
                            className="space-y-4"
                        >
                            <div className="rounded-lg bg-muted/40 p-3 text-xs">
                                <div className="flex justify-between font-semibold text-foreground">
                                    <span>Portion Size:</span>
                                    <span>
                                        1 serving (
                                        {quickLogKit.caloriesPerServing} kcal)
                                    </span>
                                </div>
                                <div className="mt-2 grid grid-cols-4 gap-1 text-center font-bold">
                                    <div className="rounded bg-background p-1 text-blue-600 dark:text-blue-400">
                                        {quickLogKit.proteinPerServing}g P
                                    </div>
                                    <div className="rounded bg-background p-1 text-amber-600 dark:text-amber-400">
                                        {quickLogKit.carbsPerServing}g C
                                    </div>
                                    <div className="rounded bg-background p-1 text-rose-600 dark:text-rose-400">
                                        {quickLogKit.fatPerServing}g F
                                    </div>
                                    <div className="rounded bg-background p-1 text-emerald-600 dark:text-emerald-400">
                                        {quickLogKit.fiberPerServing}g Fib
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="kit-log-date"
                                        className="text-xs font-semibold"
                                    >
                                        Date
                                    </Label>
                                    <Input
                                        id="kit-log-date"
                                        type="date"
                                        value={quickLogDate}
                                        onChange={(e) =>
                                            setQuickLogDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="kit-meal-slot"
                                        className="text-xs font-semibold"
                                    >
                                        Meal Slot
                                    </Label>
                                    <select
                                        id="kit-meal-slot"
                                        value={quickLogMealSlot}
                                        onChange={(e) =>
                                            setQuickLogMealSlot(
                                                e.target.value as
                                                    | 'breakfast'
                                                    | 'lunch'
                                                    | 'dinner'
                                                    | 'snack',
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                    >
                                        <option value="breakfast">
                                            Breakfast
                                        </option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setQuickLogKit(null)}
                                    disabled={isQuickLogging}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isQuickLogging}
                                    className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                                >
                                    {isQuickLogging ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Log to Diary'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            {/* Meal Prep Grocery List Modal */}
            <Dialog open={groceryModalOpen} onOpenChange={setGroceryModalOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-emerald-600" />
                            {t('recipes.grocery_list')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('recipes.grocery_list_desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Meal Selection Cards */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {t('recipes.select_meals')}
                            </Label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {STARTER_MEAL_PREP_KITS.map((kit) => {
                                    const isSelected =
                                        !!selectedKitsForGrocery[kit.id];
                                    const count =
                                        selectedKitsForGrocery[kit.id] || 0;
                                    return (
                                        <div
                                            key={kit.id}
                                            onClick={() =>
                                                handleToggleKitForGrocery(
                                                    kit.id,
                                                )
                                            }
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                                                isSelected
                                                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-2xs'
                                                    : 'border-border bg-card/60 hover:border-border/80'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="truncate text-xs font-semibold text-foreground">
                                                    {kit.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {kit.servings}{' '}
                                                    {t('recipes.servings')}
                                                </p>
                                            </div>
                                            <div
                                                className="flex items-center gap-1.5"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {isSelected ? (
                                                    <div className="flex items-center rounded-lg border border-emerald-500/30 bg-background px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                                        <span>{count}x</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        + Add
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Consolidated Categorized Grocery Items */}
                        <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-3.5">
                            {[
                                {
                                    key: 'protein' as const,
                                    label: t('recipes.cat_protein'),
                                },
                                {
                                    key: 'produce' as const,
                                    label: t('recipes.cat_produce'),
                                },
                                {
                                    key: 'dairy' as const,
                                    label: t('recipes.cat_dairy'),
                                },
                                {
                                    key: 'pantry' as const,
                                    label: t('recipes.cat_pantry'),
                                },
                            ].map(({ key, label }) => {
                                const items = consolidatedGroceryList[key];
                                if (items.length === 0) return null;
                                return (
                                    <div key={key} className="space-y-1.5">
                                        <p className="text-xs font-bold text-foreground">
                                            {label}
                                        </p>
                                        <div className="space-y-1">
                                            {items.map((item) => {
                                                const isChecked =
                                                    !!checkedGroceryItems[
                                                        item.id
                                                    ];
                                                return (
                                                    <label
                                                        key={item.id}
                                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-muted/40"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                setCheckedGroceryItems(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [item.id]:
                                                                            !prev[
                                                                                item
                                                                                    .id
                                                                            ],
                                                                    }),
                                                                );
                                                            }}
                                                            className="h-4 w-4 rounded-sm border-border text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <span
                                                            className={`text-xs ${
                                                                isChecked
                                                                    ? 'text-muted-foreground line-through'
                                                                    : 'font-medium text-foreground'
                                                            }`}
                                                        >
                                                            {item.name}{' '}
                                                            {item.amount}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {Object.values(consolidatedGroceryList).every(
                                (arr) => arr.length === 0,
                            ) && (
                                <p className="py-4 text-center text-xs text-muted-foreground">
                                    {t('recipes.empty_grocery')}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedKitsForGrocery({});
                                setCheckedGroceryItems({});
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            {t('recipes.clear_list')}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setGroceryModalOpen(false)}
                            >
                                {t('action.close')}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleCopyGroceryList}
                                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {copiedGrocery ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        {t('recipes.copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        {t('recipes.copy_list')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Recipe Confirmation Dialog */}
            <ConfirmDialog
                open={recipeToDelete !== null}
                onOpenChange={(open) => !open && setRecipeToDelete(null)}
                title="Delete Recipe"
                description={
                    recipeToDelete
                        ? `Are you sure you want to delete "${recipeToDelete.name}"? This cannot be undone.`
                        : 'Are you sure you want to delete this recipe?'
                }
                confirmText={t('action.delete')}
                cancelText={t('common.cancel')}
                variant="destructive"
                onConfirm={() => {
                    if (recipeToDelete) {
                        router.delete(`/recipes/${recipeToDelete.id}`);
                        setRecipeToDelete(null);
                    }
                }}
            />
        </div>
    );
}

RecipesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Recipes & Meals',
            href: '/recipes',
        },
    ],
};
