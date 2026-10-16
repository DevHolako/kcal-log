import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Barcode,
    CalendarPlus,
    Check,
    Droplets,
    Globe,
    Minus,
    Plus,
    Scale,
    Utensils,
    Apple,
    Database,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import type { FoodItem, FoodServingData } from './index';

interface Props {
    food: FoodItem;
}

export default function FoodShow({ food }: Props) {
    const { t } = useTranslation();

    const defaultServing = food.servings?.find((s) => s.is_default) ||
        food.servings?.[0] || {
            serving_name: `${food.serving_size}${food.serving_unit || 'g'}`,
            gram_equivalent: Number(food.serving_size) || 100,
            is_default: true,
        };

    const initialWeight =
        Number(defaultServing.gram_equivalent) > 0
            ? Number(defaultServing.gram_equivalent)
            : Number(food.serving_size) > 0
              ? Number(food.serving_size)
              : 100;

    // Portion Calculator State
    const [portionMode, setPortionMode] = useState<'weight' | 'serving'>(
        'weight',
    );
    const [customGrams, setCustomGrams] = useState<number>(initialWeight);
    const [selectedServing, setSelectedServing] =
        useState<FoodServingData>(defaultServing);
    const [quantity, setQuantity] = useState<number>(1);

    // Quick Diary Log State
    const [logMealSlot, setLogMealSlot] = useState<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
    >('breakfast');
    const [logDate, setLogDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [isLoggingToDiary, setIsLoggingToDiary] = useState(false);

    // Scaled Calculations
    const baseSize =
        Number(food.serving_size) > 0 ? Number(food.serving_size) : 100;
    const totalGrams =
        portionMode === 'weight'
            ? customGrams
            : Number(selectedServing?.gram_equivalent || baseSize) * quantity;
    const factor = totalGrams / baseSize;

    const scaledNutrition = {
        totalGrams: Math.round(totalGrams * 10) / 10,
        calories: Math.round(Number(food.calories) * factor * 10) / 10,
        protein: Math.round(Number(food.protein) * factor * 10) / 10,
        carbs: Math.round(Number(food.carbs) * factor * 10) / 10,
        fat: Math.round(Number(food.fat) * factor * 10) / 10,
        fiber: food.fiber
            ? Math.round(Number(food.fiber) * factor * 10) / 10
            : null,
        sugar: food.sugar
            ? Math.round(Number(food.sugar) * factor * 10) / 10
            : null,
        saturated_fat: food.saturated_fat
            ? Math.round(Number(food.saturated_fat) * factor * 10) / 10
            : null,
        sodium: food.sodium
            ? Math.round(Number(food.sodium) * factor * 10) / 10
            : null,
    };

    const isZeroCalorie =
        Number(food.calories) === 0 &&
        Number(food.protein) === 0 &&
        Number(food.carbs) === 0 &&
        Number(food.fat) === 0;

    const handleLogToDiary = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingToDiary(true);

        router.post(
            '/diary',
            {
                food_id: food.id,
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
                onFinish: () => setIsLoggingToDiary(false),
            },
        );
    };

    return (
        <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`${food.name} - ${t('foods.title')}`} />

            {/* Navigation & Back Button */}
            <div className="flex items-center justify-between">
                <Link
                    href="/foods"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('foods.back_to_catalog')}
                </Link>

                <div className="flex items-center gap-2">
                    {food.is_custom || food.search_origin === 'custom' ? (
                        <Badge
                            variant="outline"
                            className="gap-1 border-purple-500/30 bg-purple-500/10 text-xs font-medium text-purple-600 dark:text-purple-400"
                        >
                            <Apple className="h-3.5 w-3.5" />
                            {t('foods.badge_custom')}
                        </Badge>
                    ) : food.search_origin === 'openfoodfacts' ? (
                        <Badge
                            variant="outline"
                            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            {t('foods.badge_openfoodfacts')}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="gap-1 border-blue-500/30 bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400"
                        >
                            <Database className="h-3.5 w-3.5" />
                            {t('foods.badge_in_database')}
                        </Badge>
                    )}

                    {food.nutri_score && (
                        <Badge
                            className={`text-xs font-bold uppercase ${
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
                            Nutri-Score {food.nutri_score}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Main Product Hero & Interactive Calculator */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column: Product Showcase & Image */}
                <div className="space-y-4 lg:col-span-5">
                    <Card className="overflow-hidden border-border/70">
                        <div className="relative flex aspect-4/3 w-full items-center justify-center border-b border-border/50 bg-muted/40 p-6">
                            {food.image_url ? (
                                <img
                                    src={food.image_url}
                                    alt={food.name}
                                    className="max-h-64 w-auto rounded-lg object-contain drop-shadow-md"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
                                    <Utensils className="h-16 w-16 stroke-1" />
                                    <span className="mt-2 text-xs">
                                        No photo available
                                    </span>
                                </div>
                            )}

                            {food.nova_group && (
                                <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2 py-1 text-[11px] font-bold shadow-xs backdrop-blur-xs">
                                    NOVA Group {food.nova_group}
                                </div>
                            )}
                        </div>

                        <CardHeader className="space-y-1.5 p-5">
                            <CardTitle className="text-xl leading-tight font-bold text-foreground">
                                {food.name}
                            </CardTitle>
                            <CardDescription className="flex items-center justify-between text-sm">
                                <span>
                                    {food.brand || 'Generic / Homemade'}
                                </span>
                                {food.barcode && (
                                    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                        <Barcode className="h-3.5 w-3.5" />
                                        {food.barcode}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 px-5 pb-5">
                            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                                <span>Reference Serving Size:</span>
                                <span className="font-semibold text-foreground">
                                    {Number(food.serving_size)}{' '}
                                    {food.serving_unit || 'g'}
                                </span>
                            </div>

                            {/* Servings Available */}
                            {food.servings && food.servings.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Configured Portions:
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {food.servings.map((serving, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground shadow-2xs"
                                            >
                                                {serving.serving_name} (
                                                {Number(
                                                    serving.gram_equivalent,
                                                )}
                                                g)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Interactive Portion Nutrition Calculator & Diary Logging */}
                <div className="space-y-4 lg:col-span-7">
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="p-5 pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Scale className="h-5 w-5 text-primary" />
                                {t('foods.portion_calculator')}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Adjust portion by exact weight (g / ml) or
                                serving size to calculate exact macro intake.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 p-5 pt-0">
                            {/* Mode Segmented Controls */}
                            <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/40 p-1">
                                <button
                                    type="button"
                                    onClick={() => setPortionMode('weight')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
                                        portionMode === 'weight'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Scale className="h-3.5 w-3.5" />
                                    {t('foods.unit_mode_weight')} (g / ml)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPortionMode('serving')}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
                                        portionMode === 'serving'
                                            ? 'bg-background text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Utensils className="h-3.5 w-3.5" />
                                    {t('foods.unit_mode_serving')}
                                </button>
                            </div>

                            {/* Weight Mode Controls */}
                            {portionMode === 'weight' ? (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="custom-grams"
                                            className="text-xs font-medium"
                                        >
                                            {t('foods.enter_grams_ml')}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            Base: {Number(food.serving_size)}
                                            {food.serving_unit || 'g'}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="custom-grams"
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
                                            className="pr-12 text-lg font-bold"
                                        />
                                        <span className="absolute inset-y-0 right-3.5 flex items-center text-xs font-semibold text-muted-foreground">
                                            {food.serving_unit || 'g'}
                                        </span>
                                    </div>

                                    {/* Quick Preset Buttons */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {[50, 100, 150, 200, 250, 300].map(
                                            (amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() =>
                                                        setCustomGrams(amt)
                                                    }
                                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                        customGrams === amt
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border/80 bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground'
                                                    }`}
                                                >
                                                    {amt}
                                                    {food.serving_unit || 'g'}
                                                </button>
                                            ),
                                        )}
                                        <div className="ml-auto flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCustomGrams((prev) =>
                                                        Math.max(1, prev - 25),
                                                    )
                                                }
                                                className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
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
                                                className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
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
                                            value={selectedServing.serving_name}
                                            onChange={(e) => {
                                                const match =
                                                    food.servings?.find(
                                                        (s) =>
                                                            s.serving_name ===
                                                            e.target.value,
                                                    );
                                                if (match)
                                                    setSelectedServing(match);
                                            }}
                                        >
                                            {food.servings?.map(
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
                                                <Minus className="h-3.5 w-3.5" />
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
                                                className="text-center font-bold"
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
                                                <Plus className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scaled Nutritional Intake Display */}
                            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        Calculated Intake for{' '}
                                        {scaledNutrition.totalGrams}
                                        {food.serving_unit || 'g'}
                                    </span>
                                    <span className="text-sm font-extrabold text-foreground">
                                        {scaledNutrition.totalGrams}
                                        {food.serving_unit || 'g'}
                                    </span>
                                </div>

                                <div className="py-1 text-center">
                                    <div className="text-4xl font-black text-primary">
                                        {scaledNutrition.calories}
                                    </div>
                                    <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Calories (kcal)
                                    </div>
                                </div>

                                {isZeroCalorie && (
                                    <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
                                        <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                        <div>
                                            <div className="font-semibold">
                                                {t('foods.zero_calorie_badge')}
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {t(
                                                    'foods.zero_calorie_explanation',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3 border-t border-primary/10 pt-3 text-center">
                                    <div className="rounded-lg border border-border/50 bg-background/60 p-2">
                                        <div className="text-[11px] font-medium text-muted-foreground">
                                            Protein
                                        </div>
                                        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                                            {scaledNutrition.protein}g
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-background/60 p-2">
                                        <div className="text-[11px] font-medium text-muted-foreground">
                                            Carbs
                                        </div>
                                        <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                                            {scaledNutrition.carbs}g
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-background/60 p-2">
                                        <div className="text-[11px] font-medium text-muted-foreground">
                                            Fat
                                        </div>
                                        <div className="text-base font-bold text-rose-600 dark:text-rose-400">
                                            {scaledNutrition.fat}g
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Log to Daily Diary */}
                            <form
                                onSubmit={handleLogToDiary}
                                className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4"
                            >
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                    <CalendarPlus className="h-4 w-4 text-emerald-600" />
                                    Log this portion directly to Diary
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Meal Slot
                                        </Label>
                                        <select
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs capitalize shadow-xs focus-visible:outline-hidden"
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
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">
                                                Dinner
                                            </option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={logDate}
                                            onChange={(e) =>
                                                setLogDate(e.target.value)
                                            }
                                            className="mt-1 h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoggingToDiary}
                                    className="w-full gap-2 bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                                >
                                    <Check className="h-4 w-4" />
                                    {isLoggingToDiary
                                        ? 'Logging to Diary...'
                                        : `Log ${scaledNutrition.totalGrams}${food.serving_unit || 'g'} to ${
                                              logMealSlot
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              logMealSlot.slice(1)
                                          }`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Nutrition Facts Table */}
            <Card className="border-border/80">
                <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base font-bold">
                        {t('foods.nutrition_facts')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Reference comparison per 100{food.serving_unit || 'g'}{' '}
                        vs your selected portion ({scaledNutrition.totalGrams}
                        {food.serving_unit || 'g'}).
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs text-muted-foreground">
                                    <th className="py-2.5 font-medium">
                                        Nutrient
                                    </th>
                                    <th className="py-2.5 font-medium">
                                        Per 100{food.serving_unit || 'g'}
                                    </th>
                                    <th className="py-2.5 font-semibold text-foreground">
                                        Per Portion (
                                        {scaledNutrition.totalGrams}
                                        {food.serving_unit || 'g'})
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-xs">
                                <tr>
                                    <td className="py-2 font-medium">
                                        Energy (Calories)
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {Number(food.calories)} kcal
                                    </td>
                                    <td className="py-2 font-bold text-primary">
                                        {scaledNutrition.calories} kcal
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium">
                                        Protein
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {Number(food.protein)}g
                                    </td>
                                    <td className="py-2 font-semibold text-blue-600 dark:text-blue-400">
                                        {scaledNutrition.protein}g
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium">
                                        Carbohydrates
                                    </td>
                                    <td className="py-2 text-muted-foreground">
                                        {Number(food.carbs)}g
                                    </td>
                                    <td className="py-2 font-semibold text-amber-600 dark:text-amber-400">
                                        {scaledNutrition.carbs}g
                                    </td>
                                </tr>
                                {food.sugar !== null &&
                                    food.sugar !== undefined && (
                                        <tr>
                                            <td className="py-2 pl-4 text-muted-foreground">
                                                ↳ of which Sugars
                                            </td>
                                            <td className="py-2 text-muted-foreground">
                                                {Number(food.sugar)}g
                                            </td>
                                            <td className="py-2">
                                                {scaledNutrition.sugar ?? '-'}g
                                            </td>
                                        </tr>
                                    )}
                                <tr>
                                    <td className="py-2 font-medium">Fat</td>
                                    <td className="py-2 text-muted-foreground">
                                        {Number(food.fat)}g
                                    </td>
                                    <td className="py-2 font-semibold text-rose-600 dark:text-rose-400">
                                        {scaledNutrition.fat}g
                                    </td>
                                </tr>
                                {food.saturated_fat !== null &&
                                    food.saturated_fat !== undefined && (
                                        <tr>
                                            <td className="py-2 pl-4 text-muted-foreground">
                                                ↳ of which Saturated Fat
                                            </td>
                                            <td className="py-2 text-muted-foreground">
                                                {Number(food.saturated_fat)}g
                                            </td>
                                            <td className="py-2">
                                                {scaledNutrition.saturated_fat ??
                                                    '-'}
                                                g
                                            </td>
                                        </tr>
                                    )}
                                {food.fiber !== null &&
                                    food.fiber !== undefined && (
                                        <tr>
                                            <td className="py-2 font-medium">
                                                Dietary Fiber
                                            </td>
                                            <td className="py-2 text-muted-foreground">
                                                {Number(food.fiber)}g
                                            </td>
                                            <td className="py-2">
                                                {scaledNutrition.fiber ?? '-'}g
                                            </td>
                                        </tr>
                                    )}
                                {food.sodium !== null &&
                                    food.sodium !== undefined && (
                                        <tr>
                                            <td className="py-2 font-medium">
                                                Sodium
                                            </td>
                                            <td className="py-2 text-muted-foreground">
                                                {Number(food.sodium)}mg
                                            </td>
                                            <td className="py-2">
                                                {scaledNutrition.sodium ?? '-'}
                                                mg
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

FoodShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Food Database',
            href: '/foods',
        },
        {
            title: 'Food Details',
            href: '',
        },
    ],
};
