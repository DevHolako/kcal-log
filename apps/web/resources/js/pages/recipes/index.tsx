import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarPlus,
    ChefHat,
    Flame,
    Layers,
    Loader2,
    Minus,
    Plus,
    Sparkles,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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

interface Props {
    recipes: MealRecipeData[];
    availableFoods: FoodItem[];
    status?: string;
}

export default function RecipesIndex({ recipes, availableFoods, status }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [selectedRecipeToLog, setSelectedRecipeToLog] = useState<MealRecipeData | null>(null);

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
    const [activeFoodToAdd, setActiveFoodToAdd] = useState<FoodItem | null>(null);
    const [selectedServingId, setSelectedServingId] = useState<number | null>(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemCustomGrams, setItemCustomGrams] = useState<string>('');

    // Logging recipe form state
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [logDate, setLogDate] = useState(todayStr);
    const [logMealSlot, setLogMealSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [logServings, setLogServings] = useState(1);
    const [logAsIndividual, setLogAsIndividual] = useState(true);
    const [isLogging, setIsLogging] = useState(false);
    const [isSavingRecipe, setIsSavingRecipe] = useState(false);

    // Filter available foods for ingredient picker
    const filteredFoods = useMemo(() => {
        if (!foodSearchQuery.trim()) return availableFoods.slice(0, 8);
        const q = foodSearchQuery.toLowerCase();
        return availableFoods.filter(
            (f) => f.name.toLowerCase().includes(q) || (f.brand && f.brand.toLowerCase().includes(q))
        );
    }, [availableFoods, foodSearchQuery]);

    // Handle adding selected food to ingredients list
    const handleAddIngredient = () => {
        if (!activeFoodToAdd) return;

        const baseSize = Number(activeFoodToAdd.serving_size) > 0 ? Number(activeFoodToAdd.serving_size) : 100;
        let grams = 100;

        if (itemCustomGrams && Number(itemCustomGrams) > 0) {
            grams = Number(itemCustomGrams);
        } else if (selectedServingId && activeFoodToAdd.servings) {
            const s = activeFoodToAdd.servings.find((serv) => serv.id === selectedServingId);
            if (s) {
                grams = Number(s.gram_equivalent) * itemQuantity;
            } else {
                grams = baseSize * itemQuantity;
            }
        } else {
            grams = baseSize * itemQuantity;
        }

        const factor = grams / baseSize;
        const calories = Math.round(Number(activeFoodToAdd.calories) * factor * 10) / 10;
        const protein = Math.round(Number(activeFoodToAdd.protein) * factor * 10) / 10;
        const carbs = Math.round(Number(activeFoodToAdd.carbs) * factor * 10) / 10;
        const fat = Math.round(Number(activeFoodToAdd.fat) * factor * 10) / 10;
        const fiber = activeFoodToAdd.fiber ? Math.round(Number(activeFoodToAdd.fiber) * factor * 10) / 10 : 0;
        const sugar = activeFoodToAdd.sugar ? Math.round(Number(activeFoodToAdd.sugar) * factor * 10) / 10 : 0;
        const saturated_fat = activeFoodToAdd.saturated_fat ? Math.round(Number(activeFoodToAdd.saturated_fat) * factor * 10) / 10 : 0;
        const sodium = activeFoodToAdd.sodium ? Math.round(Number(activeFoodToAdd.sodium) * factor * 1000) / 1000 : 0;

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
            }
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
            }
        );
    };

    // Delete recipe
    const handleDeleteRecipe = (recipe: MealRecipeData) => {
        if (!confirm(`Are you sure you want to delete "${recipe.name}"?`)) return;
        router.delete(`/recipes/${recipe.id}`);
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Recipes & Multi-Ingredient Meals - kcal-log" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ChefHat className="h-6 w-6 text-emerald-600" />
                        Recipes & Meals
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Build composite recipes from multiple foods, view aggregate macros, and log them to your food diary with 1 click.
                    </p>
                </div>

                <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                    <Plus className="h-4 w-4" />
                    Create Recipe
                </Button>
            </div>

            {status && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Recipes Grid */}
            {recipes.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-card/50">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                        <ChefHat className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No recipes created yet</h3>
                    <p className="mx-auto max-w-sm text-sm text-muted-foreground mt-1 mb-6">
                        Combine oats, milk, protein powder, and fruits into a single reusable recipe to log complete meals in seconds.
                    </p>
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Your First Recipe
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {recipes.map((recipe) => {
                        const servingsCount = Number(recipe.servings) > 0 ? Number(recipe.servings) : 1;
                        const calsPerServing = Math.round(Number(recipe.total_calories) / servingsCount);
                        const proPerServing = Math.round((Number(recipe.total_protein) / servingsCount) * 10) / 10;
                        const carbPerServing = Math.round((Number(recipe.total_carbs) / servingsCount) * 10) / 10;
                        const fatPerServing = Math.round((Number(recipe.total_fat) / servingsCount) * 10) / 10;

                        return (
                            <Card key={recipe.id} className="border-border/60 shadow-xs flex flex-col justify-between hover:border-border transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-lg font-bold text-foreground">{recipe.name}</CardTitle>
                                            {recipe.description && (
                                                <CardDescription className="text-xs line-clamp-2 mt-1">
                                                    {recipe.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-xs font-medium">
                                            {recipe.servings} {Number(recipe.servings) === 1 ? 'serving' : 'servings'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pb-4">
                                    {/* Per Serving Nutrition Badges */}
                                    <div className="rounded-lg bg-muted/40 p-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                            <span className="text-xs font-semibold text-muted-foreground">Per Serving</span>
                                            <span className="text-sm font-extrabold text-foreground flex items-center gap-1">
                                                <Flame className="h-3.5 w-3.5 text-amber-500" />
                                                {calsPerServing} kcal
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                            <div>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Protein</span>
                                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{proPerServing}g</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Carbs</span>
                                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{carbPerServing}g</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Fat</span>
                                                <p className="text-xs font-bold text-sky-600 dark:text-sky-400">{fatPerServing}g</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    {recipe.items && recipe.items.length > 0 && (
                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Ingredients ({recipe.items.length})
                                            </span>
                                            <ul className="text-xs space-y-1 text-muted-foreground divide-y divide-border/30">
                                                {recipe.items.slice(0, 4).map((it, idx) => (
                                                    <li key={idx} className="flex justify-between py-1">
                                                        <span className="truncate pr-2 font-medium text-foreground">
                                                            {it.food?.name || 'Food item'}
                                                        </span>
                                                        <span className="shrink-0">{it.grams}g &bull; {Math.round(Number(it.calories))} kcal</span>
                                                    </li>
                                                ))}
                                                {recipe.items.length > 4 && (
                                                    <li className="text-[11px] text-muted-foreground italic pt-1">
                                                        +{recipe.items.length - 4} more ingredient(s)
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteRecipe(recipe)}
                                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={() => handleOpenLogModal(recipe)}
                                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs font-semibold"
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

            {/* Create Recipe Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5 text-emerald-600" />
                            Create New Recipe
                        </DialogTitle>
                        <DialogDescription>
                            Combine multiple food items into a composite recipe with aggregate macro and calorie tracking.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveRecipe} className="space-y-5">
                        {/* Recipe Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label htmlFor="recipe-name" className="text-xs font-semibold">Recipe Name *</Label>
                                <Input
                                    id="recipe-name"
                                    required
                                    placeholder="e.g. High-Protein Berry Oatmeal"
                                    value={recipeName}
                                    onChange={(e) => setRecipeName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipe-servings" className="text-xs font-semibold">Servings *</Label>
                                <Input
                                    id="recipe-servings"
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="50"
                                    required
                                    value={recipeServings}
                                    onChange={(e) => setRecipeServings(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="recipe-description" className="text-xs font-semibold">Description (optional)</Label>
                            <Input
                                id="recipe-description"
                                placeholder="e.g. Quick breakfast bowl prepared with whey and chia seeds"
                                value={recipeDescription}
                                onChange={(e) => setRecipeDescription(e.target.value)}
                            />
                        </div>

                        {/* Ingredients Box */}
                        <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Utensils className="h-4 w-4 text-emerald-600" />
                                Recipe Ingredients
                            </h4>

                            {/* Added Ingredients Table */}
                            {selectedItems.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic py-2 text-center">
                                    No ingredients added yet. Search and select foods below to add them to this recipe.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card border border-border text-xs"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-foreground truncate">{item.food.name}</p>
                                                <p className="text-muted-foreground text-[11px]">
                                                    {item.grams}g &bull; {item.calories} kcal &bull; P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Food Picker */}
                            <div className="space-y-3 pt-3 border-t border-border">
                                <Label className="text-xs font-semibold text-foreground">Add An Ingredient</Label>

                                {!activeFoodToAdd ? (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Type food name to search catalog..."
                                            value={foodSearchQuery}
                                            onChange={(e) => setFoodSearchQuery(e.target.value)}
                                            className="text-xs"
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                            {filteredFoods.map((f) => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveFoodToAdd(f);
                                                        setSelectedServingId(f.servings?.[0]?.id ?? null);
                                                        setItemQuantity(1);
                                                        setItemCustomGrams('');
                                                    }}
                                                    className="flex items-center justify-between p-2 rounded-lg border border-border/70 text-left hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-xs"
                                                >
                                                    <span className="truncate font-medium">{f.name}</span>
                                                    <span className="text-[11px] text-muted-foreground shrink-0">{Math.round(Number(f.calories))} kcal</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-foreground">{activeFoodToAdd.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveFoodToAdd(null)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {/* Serving Portion Dropdown */}
                                            {activeFoodToAdd.servings && activeFoodToAdd.servings.length > 0 && (
                                                <div className="space-y-1">
                                                    <Label className="text-[11px]">Portion</Label>
                                                    <select
                                                        value={selectedServingId ?? ''}
                                                        onChange={(e) => setSelectedServingId(e.target.value ? Number(e.target.value) : null)}
                                                        className="w-full text-xs rounded-md border border-input bg-card p-1.5"
                                                    >
                                                        {activeFoodToAdd.servings.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.serving_name} ({s.gram_equivalent}g)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <Label className="text-[11px]">Multiplier</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    value={itemQuantity}
                                                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                                                    className="h-8 text-xs"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[11px]">Or exact grams</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 150"
                                                    value={itemCustomGrams}
                                                    onChange={(e) => setItemCustomGrams(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleAddIngredient}
                                            className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                        >
                                            Add This Ingredient
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nutrition Summary Bar */}
                        {selectedItems.length > 0 && (
                            <div className="rounded-xl border border-border p-4 bg-muted/40 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Recipe Caloric Summary</span>
                                    <span className="text-xs text-muted-foreground">
                                        Total: <strong>{recipeTotals.totalCalories} kcal</strong> &bull; Per Serving: <strong>{recipeTotals.perServingCalories} kcal</strong>
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="rounded-lg bg-card p-2 border border-border/50">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Protein</span>
                                        <p className="font-bold text-emerald-600">{recipeTotals.perServingProtein}g</p>
                                    </div>
                                    <div className="rounded-lg bg-card p-2 border border-border/50">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Carbs</span>
                                        <p className="font-bold text-amber-600">{recipeTotals.perServingCarbs}g</p>
                                    </div>
                                    <div className="rounded-lg bg-card p-2 border border-border/50">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Fat</span>
                                        <p className="font-bold text-sky-600">{recipeTotals.perServingFat}g</p>
                                    </div>
                                    <div className="rounded-lg bg-card p-2 border border-border/50">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Fiber</span>
                                        <p className="font-bold text-foreground">{recipeTotals.perServingFiber}g</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSavingRecipe || !recipeName.trim() || selectedItems.length === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                {isSavingRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Recipe'}
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
                                <Label htmlFor="log-date" className="text-xs font-semibold">Date</Label>
                                <Input
                                    id="log-date"
                                    type="date"
                                    required
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="log-meal-slot" className="text-xs font-semibold">Meal Slot</Label>
                                <select
                                    id="log-meal-slot"
                                    value={logMealSlot}
                                    onChange={(e) => setLogMealSlot(e.target.value as any)}
                                    className="w-full text-sm rounded-md border border-input bg-card p-2"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="log-servings" className="text-xs font-semibold">Servings to Log</Label>
                                <Input
                                    id="log-servings"
                                    type="number"
                                    step="0.5"
                                    min="0.1"
                                    max="10"
                                    required
                                    value={logServings}
                                    onChange={(e) => setLogServings(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="log-as-individual"
                                    type="checkbox"
                                    checked={logAsIndividual}
                                    onChange={(e) => setLogAsIndividual(e.target.checked)}
                                    className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="log-as-individual" className="text-xs font-normal text-foreground">
                                    Log as individual ingredients (enables tweaking items in diary)
                                </Label>
                            </div>

                            <DialogFooter className="gap-2 pt-3">
                                <Button type="button" variant="outline" onClick={() => setLogModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLogging}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                >
                                    {isLogging ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Log'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
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
