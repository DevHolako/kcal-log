import { Head, Link, useForm } from '@inertiajs/react';
import {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacroGrams,
    kgToLbs,
    lbsToKg,
} from '@kcal-log/nutrition';
import { ActivityLevel, GoalType, Sex } from '@kcal-log/types';
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Flame,
    Loader2,
    Scale,
    ShieldAlert,
    Sparkles,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
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

interface ActivityOption {
    id: ActivityLevel;
    label: string;
    multiplier: number;
    description: string;
}

interface OnboardingProps {
    activityLevels: ActivityOption[];
    dietPresets: Record<
        string,
        { protein: number; carbs: number; fat: number }
    >;
    calorieFloors: Record<string, number>;
    initialData?: {
        date_of_birth: string;
        sex: Sex;
        height_cm: number;
        current_weight_kg: number;
        activity_level: ActivityLevel;
        goal_type: GoalType;
        weekly_rate_kg: number;
        diet_type: string;
        custom_percentages: {
            protein: number;
            carbs: number;
            fat: number;
        };
        unit_preference: string;
    } | null;
    isRecalibrating?: boolean;
}

export default function Onboarding({
    activityLevels,
    dietPresets,
    calorieFloors,
    initialData,
    isRecalibrating = false,
}: OnboardingProps) {
    const initialUnit = (initialData?.unit_preference as 'metric' | 'imperial') || 'metric';
    const [step, setStep] = useState<number>(1);
    const [weightUnit, setWeightUnit] = useState<'metric' | 'imperial'>(initialUnit);

    const initialWeight = initialData?.current_weight_kg ?? 75;
    const initialHeight = initialData?.height_cm ?? 175;

    const [displayWeight, setDisplayWeight] = useState<string>(
        initialUnit === 'imperial'
            ? kgToLbs(initialWeight).toString()
            : initialWeight.toString()
    );
    const [displayHeight, setDisplayHeight] = useState<string>(
        initialHeight.toString()
    );

    const { data, setData, post, processing, errors } = useForm({
        date_of_birth: initialData?.date_of_birth || '1998-05-15',
        sex: (initialData?.sex || 'male') as Sex,
        height_cm: initialHeight,
        current_weight_kg: initialWeight,
        activity_level: (initialData?.activity_level || 'moderately_active') as ActivityLevel,
        goal_type: (initialData?.goal_type || 'lose') as GoalType,
        weekly_rate_kg: initialData?.weekly_rate_kg ?? -0.5,
        diet_type: initialData?.diet_type || 'balanced',
        custom_percentages: initialData?.custom_percentages || {
            protein: 0.3,
            carbs: 0.4,
            fat: 0.3,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        locale: navigator.language?.startsWith('fr') ? 'fr' : 'en',
        unit_preference: initialUnit,
        theme_preference: 'system',
    });

    // Handle Weight Change with unit conversion
    const handleWeightChange = (valStr: string) => {
        setDisplayWeight(valStr);
        const val = parseFloat(valStr);
        if (!isNaN(val)) {
            const kg = weightUnit === 'imperial' ? lbsToKg(val) : val;
            setData('current_weight_kg', kg);
        }
    };

    // Handle Unit Switch
    const toggleUnit = (unit: 'metric' | 'imperial') => {
        setWeightUnit(unit);
        setData('unit_preference', unit);
        if (unit === 'imperial') {
            setDisplayWeight(kgToLbs(data.current_weight_kg).toString());
        } else {
            setDisplayWeight(data.current_weight_kg.toString());
        }
    };

    // Calculate age from birthdate
    const age = useMemo(() => {
        const birth = new Date(data.date_of_birth);
        const today = new Date();
        let calculated = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            calculated--;
        }
        return Math.max(16, calculated || 25);
    }, [data.date_of_birth]);

    // Live Nutrition Math
    const liveStats = useMemo(() => {
        const bmr = calculateBMR({
            sex: data.sex,
            weightKg: data.current_weight_kg,
            heightCm: data.height_cm,
            ageYears: age,
        });

        const tdee = calculateTDEE(bmr, data.activity_level);
        const floor =
            calorieFloors[data.sex] ?? (data.sex === 'female' ? 1200 : 1500);

        const targetCalories = calculateTargetCalories({
            tdee,
            goalType: data.goal_type,
            weeklyRateKg:
                data.goal_type === 'maintain' ? 0 : data.weekly_rate_kg,
            floorCalories: floor,
        });

        const isFloorApplied =
            targetCalories <= floor &&
            tdee + Math.round((data.weekly_rate_kg * 7700) / 7) < floor;

        const rawPreset =
            data.diet_type === 'custom'
                ? data.custom_percentages
                : (dietPresets[data.diet_type] ?? dietPresets['balanced']);

        const toPercent = (val: number | undefined, defaultVal: number) => {
            if (val === undefined || isNaN(val)) return defaultVal;
            return val <= 1.0 ? Math.round(val * 100) : val;
        };

        const split: MacroSplit = {
            proteinPercent: toPercent((rawPreset as any)?.protein ?? (rawPreset as any)?.proteinPercent, 30),
            carbsPercent: toPercent((rawPreset as any)?.carbs ?? (rawPreset as any)?.carbsPercent, 40),
            fatPercent: toPercent((rawPreset as any)?.fat ?? (rawPreset as any)?.fatPercent, 30),
        };

        const macros = calculateMacroGrams(targetCalories, split);
        const percentages = {
            protein: split.proteinPercent / 100,
            carbs: split.carbsPercent / 100,
            fat: split.fatPercent / 100,
        };
        const waterMl = Math.max(
            2000,
            Math.min(4000, Math.round(data.current_weight_kg * 35)),
        );

        return {
            bmr,
            tdee,
            targetCalories,
            isFloorApplied,
            floor,
            macros,
            percentages,
            waterMl,
        };
    }, [data, age, calorieFloors, dietPresets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 5) {
            setStep((s) => Math.min(5, s + 1));
            return;
        }
        post('/onboarding');
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8 dark:bg-slate-950">
            <Head title="Personalize Your Nutrition Plan - kcal-log" />

            <div className="mx-auto max-w-3xl space-y-8">
                {/* Brand Header */}
                <div className="space-y-2 text-center">
                    <div className="mb-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                        <Flame className="h-8 w-8" />
                    </div>
                    {isRecalibrating && (
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Recalibrating Nutrition Plan
                            </span>
                        </div>
                    )}
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {isRecalibrating
                            ? 'Update your personalized nutrition targets'
                            : "Let's build your personalized nutrition blueprint"}
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-slate-600 dark:text-slate-400">
                        Precision targets tailored to your metabolism, body
                        composition, and goals.
                    </p>
                    {isRecalibrating && (
                        <p className="pt-1 text-xs">
                            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground underline">
                                Cancel and return to dashboard
                            </Link>
                        </p>
                    )}
                </div>

                {/* Step Progress Tracker */}
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { num: 1, title: 'Basics' },
                        { num: 2, title: 'Activity' },
                        { num: 3, title: 'Goal' },
                        { num: 4, title: 'Macros' },
                        { num: 5, title: 'Summary' },
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center">
                            <div
                                className={`mb-2 h-1.5 w-full rounded-full transition-all duration-300 ${
                                    step >= s.num
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                            />
                            <span
                                className={`text-xs font-medium ${
                                    step === s.num
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <Card className="border-slate-200 bg-white shadow-xl shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
                        <CardTitle className="flex items-center justify-between text-xl font-bold">
                            <span>
                                {step === 1 &&
                                    'Step 1: Body Metrics & Demographics'}
                                {step === 2 && 'Step 2: Daily Activity Level'}
                                {step === 3 &&
                                    'Step 3: Primary Goal & Desired Rate'}
                                {step === 4 && 'Step 4: Macronutrient Strategy'}
                                {step === 5 &&
                                    'Step 5: Review Your Calibrated Targets'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {step} / 5
                            </span>
                        </CardTitle>
                        <CardDescription>
                            {step === 1 &&
                                'Used for Mifflin-St Jeor Basal Metabolic Rate (BMR) calculation.'}
                            {step === 2 &&
                                'Helps estimate your total daily energy expenditure (TDEE).'}
                            {step === 3 &&
                                'Choose whether you want to lose fat, maintain, or build muscle.'}
                            {step === 4 &&
                                'Select your preferred nutritional balance or configure custom macros.'}
                            {step === 5 &&
                                'Verify your targets before launching your daily food diary.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* STEP 1: Body Metrics */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex justify-end gap-2 pb-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                weightUnit === 'metric'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() => toggleUnit('metric')}
                                            className="h-7 text-xs"
                                        >
                                            Metric (kg / cm)
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                weightUnit === 'imperial'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                toggleUnit('imperial')
                                            }
                                            className="h-7 text-xs"
                                        >
                                            Imperial (lbs / ft)
                                        </Button>
                                    </div>

                                    {/* Biological Sex */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Biological Sex
                                        </Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['male', 'female'] as Sex[]).map(
                                                (s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() =>
                                                            setData('sex', s)
                                                        }
                                                        className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                                                            data.sex === s
                                                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-100'
                                                                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                                                        }`}
                                                    >
                                                        <span className="font-medium capitalize">
                                                            {s}
                                                        </span>
                                                        {data.sex === s && (
                                                            <Check className="h-5 w-5 text-emerald-600" />
                                                        )}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="date_of_birth"
                                                className="text-sm font-semibold"
                                            >
                                                Date of Birth
                                            </Label>
                                            <span className="text-xs text-slate-500">
                                                {age} years old
                                            </span>
                                        </div>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) =>
                                                setData(
                                                    'date_of_birth',
                                                    e.target.value,
                                                )
                                            }
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split('T')[0]
                                            }
                                            className="dark:bg-slate-900"
                                            required
                                        />
                                        {errors.date_of_birth && (
                                            <p className="text-xs text-red-500">
                                                {errors.date_of_birth}
                                            </p>
                                        )}
                                    </div>

                                    {/* Height & Weight */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="height"
                                                className="text-sm font-semibold"
                                            >
                                                Height (
                                                {weightUnit === 'metric'
                                                    ? 'cm'
                                                    : 'cm equivalent'}
                                                )
                                            </Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                step="0.5"
                                                value={displayHeight}
                                                onChange={(e) => {
                                                    setDisplayHeight(
                                                        e.target.value,
                                                    );
                                                    setData(
                                                        'height_cm',
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 170,
                                                    );
                                                }}
                                                className="dark:bg-slate-900"
                                                required
                                            />
                                            {errors.height_cm && (
                                                <p className="text-xs text-red-500">
                                                    {errors.height_cm}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="weight"
                                                className="text-sm font-semibold"
                                            >
                                                Current Weight (
                                                {weightUnit === 'metric'
                                                    ? 'kg'
                                                    : 'lbs'}
                                                )
                                            </Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.1"
                                                value={displayWeight}
                                                onChange={(e) =>
                                                    handleWeightChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="dark:bg-slate-900"
                                                required
                                            />
                                            {errors.current_weight_kg && (
                                                <p className="text-xs text-red-500">
                                                    {errors.current_weight_kg}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Activity Level */}
                            {step === 2 && (
                                <div className="space-y-3">
                                    {activityLevels.map((act) => (
                                        <button
                                            key={act.id}
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    'activity_level',
                                                    act.id,
                                                )
                                            }
                                            className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                                                data.activity_level === act.id
                                                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                                                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                                            }`}
                                        >
                                            <div
                                                className={`mt-0.5 rounded-lg p-2.5 ${
                                                    data.activity_level ===
                                                    act.id
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                }`}
                                            >
                                                <Activity className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="font-semibold text-slate-900 dark:text-white">
                                                        {act.label}
                                                    </span>
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        ×{act.multiplier} PAL
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {act.description}
                                                </p>
                                            </div>
                                            {data.activity_level === act.id && (
                                                <CheckCircle2 className="h-5 w-5 shrink-0 self-center text-emerald-600" />
                                            )}
                                        </button>
                                    ))}
                                    {errors.activity_level && (
                                        <p className="text-xs text-red-500">
                                            {errors.activity_level}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: Goal & Pace */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    {/* Primary Goal Selector */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            {
                                                id: 'lose',
                                                label: 'Lose Weight',
                                                icon: Flame,
                                            },
                                            {
                                                id: 'maintain',
                                                label: 'Maintain',
                                                icon: Scale,
                                            },
                                            {
                                                id: 'gain',
                                                label: 'Gain Muscle',
                                                icon: Zap,
                                            },
                                        ].map((g) => {
                                            const Icon = g.icon;
                                            return (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'goal_type',
                                                            g.id as GoalType,
                                                        )
                                                    }
                                                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
                                                        data.goal_type === g.id
                                                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-100'
                                                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                                                    }`}
                                                >
                                                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-sm font-semibold">
                                                        {g.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Weekly Rate Selection for Loss */}
                                    {data.goal_type === 'lose' && (
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-sm font-semibold">
                                                Weekly Target Pace
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                {[
                                                    {
                                                        rate: -0.25,
                                                        label: '-0.25 kg/wk',
                                                        desc: 'Mild (~275 kcal deficit)',
                                                    },
                                                    {
                                                        rate: -0.5,
                                                        label: '-0.50 kg/wk',
                                                        desc: 'Standard (~550 kcal deficit)',
                                                    },
                                                    {
                                                        rate: -0.75,
                                                        label: '-0.75 kg/wk',
                                                        desc: 'Aggressive (~825 kcal deficit)',
                                                    },
                                                    {
                                                        rate: -1.0,
                                                        label: '-1.00 kg/wk',
                                                        desc: 'Intense (~1100 kcal deficit)',
                                                    },
                                                ].map((r) => (
                                                    <button
                                                        key={r.rate}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'weekly_rate_kg',
                                                                r.rate,
                                                            )
                                                        }
                                                        className={`rounded-lg border p-3 text-center transition-all ${
                                                            data.weekly_rate_kg ===
                                                            r.rate
                                                                ? 'border-emerald-500 bg-emerald-500 font-bold text-white'
                                                                : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        <div className="text-sm">
                                                            {r.label}
                                                        </div>
                                                        <div className="mt-0.5 text-[10px] opacity-80">
                                                            {r.desc}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Weekly Rate Selection for Gain */}
                                    {data.goal_type === 'gain' && (
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-sm font-semibold">
                                                Weekly Target Pace
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    {
                                                        rate: 0.25,
                                                        label: '+0.25 kg/wk',
                                                        desc: 'Lean Bulk (~275 kcal surplus)',
                                                    },
                                                    {
                                                        rate: 0.5,
                                                        label: '+0.50 kg/wk',
                                                        desc: 'Standard (~550 kcal surplus)',
                                                    },
                                                ].map((r) => (
                                                    <button
                                                        key={r.rate}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'weekly_rate_kg',
                                                                r.rate,
                                                            )
                                                        }
                                                        className={`rounded-lg border p-3 text-center transition-all ${
                                                            data.weekly_rate_kg ===
                                                            r.rate
                                                                ? 'border-emerald-500 bg-emerald-500 font-bold text-white'
                                                                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                                                        }`}
                                                    >
                                                        <div className="text-sm">
                                                            {r.label}
                                                        </div>
                                                        <div className="mt-0.5 text-xs opacity-80">
                                                            {r.desc}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Metabolic Preview Card */}
                                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>
                                                Basal Metabolic Rate (BMR):{' '}
                                                {liveStats.bmr} kcal
                                            </span>
                                            <span>
                                                Maintenance (TDEE):{' '}
                                                {liveStats.tdee} kcal
                                            </span>
                                        </div>

                                        <div className="flex items-baseline justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Daily Calorie Goal:
                                            </span>
                                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                                {liveStats.targetCalories} kcal
                                                / day
                                            </span>
                                        </div>

                                        {liveStats.isFloorApplied && (
                                            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                                <span>
                                                    <strong>
                                                        Safety Floor Applied:
                                                    </strong>{' '}
                                                    Your selected deficit would
                                                    have reduced calories below
                                                    the recommended healthy
                                                    minimum of {liveStats.floor}{' '}
                                                    kcal for {data.sex}s. Target
                                                    has been locked to{' '}
                                                    {liveStats.floor} kcal.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Macro Nutrition Strategy */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
                                            {
                                                id: 'balanced',
                                                label: 'Balanced',
                                                p: '30/40/30',
                                            },
                                            {
                                                id: 'high_protein',
                                                label: 'High Protein',
                                                p: '40/35/25',
                                            },
                                            {
                                                id: 'low_carb',
                                                label: 'Low Carb',
                                                p: '35/25/40',
                                            },
                                            {
                                                id: 'keto',
                                                label: 'Keto',
                                                p: '25/5/70',
                                            },
                                        ].map((d) => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() =>
                                                    setData('diet_type', d.id)
                                                }
                                                className={`rounded-xl border p-3 text-center transition-all ${
                                                    data.diet_type === d.id
                                                        ? 'border-emerald-500 bg-emerald-50/50 font-semibold ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                                                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {d.label}
                                                </div>
                                                <div className="mt-0.5 text-[10px] text-slate-500">
                                                    {d.p}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Macro Breakdown Preview */}
                                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between text-sm font-semibold">
                                            <span>Calculated Macro Grams:</span>
                                            <span className="text-xs text-slate-500">
                                                {liveStats.targetCalories} kcal
                                                total
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
                                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                    Protein (4 kcal/g)
                                                </div>
                                                <div className="mt-1 text-xl font-bold text-blue-950 dark:text-blue-100">
                                                    {liveStats.macros.proteinG}
                                                    g
                                                </div>
                                                <div className="text-[10px] text-blue-500">
                                                    {Math.round(
                                                        liveStats.percentages
                                                            .protein * 100,
                                                    )}
                                                    %
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
                                                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                                    Carbs (4 kcal/g)
                                                </div>
                                                <div className="mt-1 text-xl font-bold text-amber-950 dark:text-amber-100">
                                                    {liveStats.macros.carbsG}g
                                                </div>
                                                <div className="text-[10px] text-amber-500">
                                                    {Math.round(
                                                        liveStats.percentages
                                                            .carbs * 100,
                                                    )}
                                                    %
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
                                                <div className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                                    Fat (9 kcal/g)
                                                </div>
                                                <div className="mt-1 text-xl font-bold text-rose-950 dark:text-rose-100">
                                                    {liveStats.macros.fatG}g
                                                </div>
                                                <div className="text-[10px] text-rose-500">
                                                    {Math.round(
                                                        liveStats.percentages
                                                            .fat * 100,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                                            <span>
                                                Daily Dietary Fiber: ~
                                                {liveStats.macros.fiberG}g
                                            </span>
                                            <span>
                                                Daily Hydration: ~
                                                {liveStats.waterMl} ml
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: Summary & Confirm */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="space-y-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider uppercase">
                                                Your Calibrated Target
                                            </span>
                                            <Sparkles className="h-5 w-5 text-emerald-200" />
                                        </div>

                                        <div>
                                            <div className="text-4xl font-extrabold tracking-tight">
                                                {liveStats.targetCalories}{' '}
                                                <span className="text-xl font-medium">
                                                    kcal / day
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-emerald-100">
                                                TDEE {liveStats.tdee} kcal &bull; Goal: {data.goal_type} ({data.weekly_rate_kg > 0 ? '+' : ''}{data.weekly_rate_kg} kg/wk)
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 border-t border-white/20 pt-3">
                                            <div>
                                                <div className="text-[10px] text-emerald-100">Protein</div>
                                                <div className="text-lg font-bold">{liveStats.macros.proteinG}g</div>
                                                <div className="text-[10px] text-emerald-200">{Math.round(liveStats.percentages.protein * 100)}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-emerald-100">Carbs</div>
                                                <div className="text-lg font-bold">{liveStats.macros.carbsG}g</div>
                                                <div className="text-[10px] text-emerald-200">{Math.round(liveStats.percentages.carbs * 100)}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-emerald-100">Fat</div>
                                                <div className="text-lg font-bold">{liveStats.macros.fatG}g</div>
                                                <div className="text-[10px] text-emerald-200">{Math.round(liveStats.percentages.fat * 100)}%</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-emerald-100">Water</div>
                                                <div className="text-lg font-bold">{liveStats.waterMl}ml</div>
                                                <div className="text-[10px] text-emerald-200">Daily</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metabolic & Goal Analysis Breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                            <div className="text-xs text-slate-500 font-medium">Basal Metabolic Rate (BMR)</div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                                {Math.round(liveStats.bmr)} <span className="text-xs font-normal text-slate-500">kcal/day</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">Energy burned at complete rest</div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                            <div className="text-xs text-slate-500 font-medium">Total Daily Expenditure (TDEE)</div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                                {Math.round(liveStats.tdee)} <span className="text-xs font-normal text-slate-500">kcal/day</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">Energy expenditure with activity</div>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                            <div className="text-xs text-slate-500 font-medium">Net Caloric Shift</div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                                {liveStats.targetCalories - Math.round(liveStats.tdee) > 0 ? '+' : ''}
                                                {liveStats.targetCalories - Math.round(liveStats.tdee)}{' '}
                                                <span className="text-xs font-normal text-slate-500">kcal/day</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                {data.goal_type === 'lose' ? 'Calorie deficit for fat loss' : data.goal_type === 'gain' ? 'Calorie surplus for muscle gain' : 'Maintenance caloric balance'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 rounded-xl bg-slate-100/70 p-4 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Initial weigh-in ({data.current_weight_kg} kg) recorded to your progress timeline.</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Breakfast, lunch, dinner, and snack slots in your food diary will use these targets.</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>You can recalibrate these targets or reset your tracking data anytime in <strong>Profile Settings</strong>.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                                {step > 1 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setStep((s) => Math.max(1, s - 1))
                                        }
                                        className="gap-1.5"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {step < 5 ? (
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setStep((s) => Math.min(5, s + 1))
                                        }
                                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        {step === 4 ? 'Calculate & Review Plan' : 'Continue'}{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="gap-2 bg-emerald-600 px-6 font-bold text-white shadow-md hover:bg-emerald-700"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Setting up...
                                            </>
                                        ) : (
                                            <>
                                                Start Logging Food
                                                <Check className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
