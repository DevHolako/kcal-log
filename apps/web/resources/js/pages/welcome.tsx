import { Head, Link, usePage } from '@inertiajs/react';
import {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacroGrams,
    calculateWeightEWMA,
    DIET_PRESETS,
    type DietPreference,
} from '@kcal-log/nutrition';
import type { ActivityLevel, GoalType, Sex } from '@kcal-log/types';
import {
    Activity,
    ArrowRight,
    Barcode,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Dna,
    Flame,
    Menu,
    RefreshCw,
    ShieldCheck,
    Sliders,
    Sparkles,
    Target,
    TrendingUp,
    Utensils,
    X,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}

function NavLink({ href, children, onClick }: NavLinkProps) {
    return (
        <a
            href={href}
            onClick={onClick}
            className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
            {children}
        </a>
    );
}

export default function Welcome() {
    const { auth, name } = usePage().props as {
        auth: { user: unknown };
        name?: string;
    };
    const appName = name || 'kcal-log';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Interactive Cockpit State
    const [cockpitTab, setCockpitTab] = useState<
        'diary' | 'adaptive' | 'trend' | 'scanner'
    >('diary');
    const [loggedMealIds, setLoggedMealIds] = useState<number[]>([1, 2]);
    const [adaptiveAccepted, setAdaptiveAccepted] = useState(false);
    const [waterSpikeActive, setWaterSpikeActive] = useState(false);

    // Interactive Scientific Calculator State (User's Favorite Hook)
    const [calcSex, setCalcSex] = useState<Sex>('male');
    const [calcWeight, setCalcWeight] = useState(78);
    const [calcHeight, setCalcHeight] = useState(178);
    const [calcAge, setCalcAge] = useState(28);
    const [calcActivity, setCalcActivity] =
        useState<ActivityLevel>('moderately_active');
    const [calcGoal, setCalcGoal] = useState<GoalType>('cut');
    const [calcDiet, setCalcDiet] = useState<DietPreference>('balanced');
    const [copiedTarget, setCopiedTarget] = useState(false);

    // FAQ Accordion State
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    // Real-time calculation using @kcal-log/nutrition deterministic engine
    const calculatorResults = useMemo(() => {
        const bmr = calculateBMR({
            sex: calcSex,
            weightKg: calcWeight,
            heightCm: calcHeight,
            ageYears: calcAge,
        });
        const tdee = calculateTDEE(bmr, calcActivity);
        const weeklyRateKg =
            calcGoal === 'cut' ? -0.5 : calcGoal === 'bulk' ? 0.25 : 0;
        const targetCalories = calculateTargetCalories({
            tdee,
            goalType: calcGoal,
            weeklyRateKg,
            floorCalories: calcSex === 'male' ? 1500 : 1200,
        });
        const split = DIET_PRESETS[calcDiet] ?? DIET_PRESETS.balanced;
        const macros = calculateMacroGrams(targetCalories, split);

        return { bmr, tdee, targetCalories, macros, split };
    }, [
        calcSex,
        calcWeight,
        calcHeight,
        calcAge,
        calcActivity,
        calcGoal,
        calcDiet,
    ]);

    // Copy to clipboard helper
    const handleCopyProtocol = () => {
        const text = `kcal-log Nutrition Protocol\nDaily Target: ${calculatorResults.targetCalories} kcal\nProtein: ${calculatorResults.macros.protein}g (${calculatorResults.split.proteinPercent}%)\nCarbs: ${calculatorResults.macros.carbs}g (${calculatorResults.split.carbsPercent}%)\nFats: ${calculatorResults.macros.fat}g (${calculatorResults.split.fatPercent}%)\nBMR: ${calculatorResults.bmr} kcal | TDEE: ${calculatorResults.tdee} kcal`;
        void navigator.clipboard.writeText(text);
        setCopiedTarget(true);
        setTimeout(() => setCopiedTarget(false), 2000);
    };

    // Simulated meals for Interactive Cockpit Diary
    const sampleMeals = [
        {
            id: 1,
            time: '08:30 AM',
            name: 'High-Protein Oats & Blueberries',
            desc: '60g Rolled Oats, 30g Whey Isolate, 50g Fresh Blueberries',
            calories: 460,
            protein: 38,
            carbs: 58,
            fat: 8,
        },
        {
            id: 2,
            time: '01:15 PM',
            name: 'Grilled Salmon Bowl & Jasmine Rice',
            desc: '160g Atlantic Salmon, 180g Steamed Rice, 100g Steamed Broccoli',
            calories: 620,
            protein: 48,
            carbs: 62,
            fat: 20,
        },
        {
            id: 3,
            time: '04:45 PM',
            name: 'Greek Yogurt 0% & Raw Honey',
            desc: '200g Greek Yogurt, 15g Raw Acacia Honey, 10g Chia Seeds',
            calories: 230,
            protein: 24,
            carbs: 22,
            fat: 4,
        },
        {
            id: 4,
            time: '08:00 PM',
            name: 'Sirloin Steak & Roasted Sweet Potato',
            desc: '180g Grass-fed Sirloin, 200g Sweet Potato, Grilled Asparagus',
            calories: 680,
            protein: 52,
            carbs: 50,
            fat: 26,
        },
    ];

    const currentDiaryTotals = useMemo(() => {
        return sampleMeals
            .filter((m) => loggedMealIds.includes(m.id))
            .reduce(
                (acc, m) => ({
                    calories: acc.calories + m.calories,
                    protein: acc.protein + m.protein,
                    carbs: acc.carbs + m.carbs,
                    fat: acc.fat + m.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
            );
    }, [loggedMealIds]);

    const targetDiaryCalories = 2400;
    const remainingCalories = targetDiaryCalories - currentDiaryTotals.calories;

    // Simulated EWMA Weight Trend Data
    const rawWeightsSample = useMemo(() => {
        const base = [
            { date: 'Oct 01', weightKg: 80.4 },
            { date: 'Oct 03', weightKg: 80.1 },
            { date: 'Oct 05', weightKg: 79.8 },
            { date: 'Oct 07', weightKg: 80.2 },
            { date: 'Oct 09', weightKg: 79.5 },
            { date: 'Oct 11', weightKg: 79.3 },
            {
                date: 'Oct 13',
                weightKg: waterSpikeActive ? 81.6 : 79.1,
            },
            {
                date: 'Oct 15',
                weightKg: waterSpikeActive ? 80.8 : 78.8,
            },
        ];
        return calculateWeightEWMA(base, 0.12);
    }, [waterSpikeActive]);

    const faqs = [
        {
            q: 'How does the adaptive metabolic calculation actually work?',
            a: 'Unlike apps that guess your energy expenditure once and never change it, kcal-log couples your logged calorie intake with your scale weight using an Exponentially Weighted Moving Average (EWMA). By comparing real calorie surplus/deficit against tissue changes over rolling multi-week windows, it computes your true metabolic expenditure (TDEE) and adjusts your caloric targets weekly.',
        },
        {
            q: 'Is the barcode scanner really free?',
            a: 'Yes, 100% free with no limits or premium paywalls. kcal-log integrates directly with OpenFoodFacts and our optimized local cache, giving you access to millions of verified international food barcodes with complete macronutrient profiles.',
        },
        {
            q: 'Can I cycle calories between training days and rest days?',
            a: 'Absolutely. kcal-log supports dynamic zig-zag calorie banking. You can assign higher carbs and calories to demanding leg or back training sessions and lower calories to rest days while preserving the exact weekly deficit required for your fat-loss or hypertrophy goals.',
        },
        {
            q: 'Where is my health data stored? Do you sell it to advertisers?',
            a: 'Your health data belongs strictly to you. kcal-log is built offline-first with local-first storage and encrypted cloud synchronization. We run zero third-party advertising trackers, sell no telemetry, and never broker medical or biometric data to insurance companies.',
        },
        {
            q: 'Can I export my nutrition logs and weight history?',
            a: 'Yes. You have complete data sovereignty. Export your entire logging diary, raw scale entries, EWMA weight trends, and custom foods to JSON or CSV at any time with a single click.',
        },
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-500">
            <Head title="kcal-log • Precision Adaptive Nutrition & Metabolism Tracker" />

            {/* Ambient Background Glow Effects */}
            <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[700px] w-full max-w-7xl -translate-x-1/2 overflow-hidden">
                <div className="absolute -top-32 left-1/4 h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[140px]" />
                <div className="absolute -top-24 right-1/4 h-[480px] w-[480px] rounded-full bg-teal-500/10 blur-[130px]" />
                <div className="absolute top-72 left-1/3 h-[380px] w-[620px] rounded-full bg-indigo-500/5 blur-[160px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            {/* Sticky Modern Glass Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-transform active:scale-95"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md ring-1 shadow-emerald-500/20 ring-white/20 transition-all group-hover:shadow-emerald-500/30">
                            <Flame className="h-5 w-5 fill-white text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                {appName}
                            </span>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                v2.0
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <NavLink href="#calculator">Macro Calculator</NavLink>
                        <NavLink href="#cockpit">Live Cockpit</NavLink>
                        <NavLink href="#science">Metabolic Science</NavLink>
                        <NavLink href="#comparison">Compare</NavLink>
                        <NavLink href="#faq">FAQ</NavLink>
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden items-center gap-3 md:flex">
                        <ThemeToggle />

                        {auth.user ? (
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-emerald-600 px-5 font-medium text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-500"
                            >
                                <Link href={dashboard()}>
                                    Enter Dashboard
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <Link href={login()}>Log In</Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full bg-emerald-600 px-5 font-medium text-white shadow-sm shadow-emerald-600/30 transition-all hover:bg-emerald-500"
                                >
                                    <Link href={register()}>
                                        Register
                                        <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {mobileMenuOpen && (
                    <div className="border-b border-border bg-background/95 px-6 py-6 backdrop-blur-xl md:hidden">
                        <div className="flex flex-col space-y-4">
                            <NavLink
                                href="#calculator"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Macro Calculator
                            </NavLink>
                            <NavLink
                                href="#cockpit"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Live Cockpit
                            </NavLink>
                            <NavLink
                                href="#science"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Metabolic Science
                            </NavLink>
                            <NavLink
                                href="#comparison"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Compare
                            </NavLink>
                            <NavLink
                                href="#faq"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </NavLink>
                            <div className="flex flex-col gap-2.5 border-t border-border pt-4">
                                {auth.user ? (
                                    <Button
                                        asChild
                                        className="w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                                    >
                                        <Link href={dashboard()}>
                                            Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full rounded-lg"
                                        >
                                            <Link href={login()}>Sign In</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            className="w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                                        >
                                            <Link href={register()}>
                                                Sign Up
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
                <div className="container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    {/* Live Announcement Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 shadow-sm backdrop-blur-md transition hover:border-emerald-500/50 dark:text-emerald-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <span>
                            Open-Source Adaptive Nutrition • Zero Subscription
                            Paywalls
                        </span>
                    </div>

                    {/* Punchy Hero Title */}
                    <h1 className="mx-auto max-w-4xl text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        Nutrition Without Guesswork.{' '}
                        <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
                            Adaptive Metabolic Intelligence.
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-normal text-muted-foreground sm:text-xl">
                        No static calorie formulas.{' '}
                        <span className="font-semibold text-foreground">
                            kcal-log
                        </span>{' '}
                        calculates your true expenditure from your logged weight
                        and intake, automatically refining your targets as your
                        body adapts.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="h-12 rounded-full bg-emerald-600 px-8 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95"
                        >
                            <Link href={register()}>
                                Start Tracking Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-12 rounded-full border-border/80 px-8 font-medium transition-all hover:bg-muted"
                        >
                            <a href="#calculator">
                                <Sliders className="mr-2 h-4 w-4 text-emerald-500" />
                                Instant Macro Calculator
                            </a>
                        </Button>
                    </div>

                    {/* Trust Value Badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground sm:text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>100% Free & Open-Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>No Ads or Trackers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>EWMA Weight Smoothing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Barcode Scanner Included</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: THE HOOK - INSTANT SCIENTIFIC MACRO CALCULATOR */}
            <section
                id="calculator"
                className="relative border-y border-border/60 bg-card/40 py-16 md:py-24"
            >
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            Deterministic Biometric Engine
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Instant Scientific Macro Calculator
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            Live Mifflin-St Jeor biometric formula & Physical
                            Activity Level (PAL) computation. Adjust your
                            profile and watch your target intake recalculate
                            instantly.
                        </p>
                    </div>

                    {/* Calculator Card Grid */}
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        {/* Left Column: Interactive Inputs */}
                        <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8 lg:col-span-7">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                                    <Sliders className="h-5 w-5 text-emerald-500" />
                                    Biometric Parameters
                                </h3>
                                <Badge
                                    variant="outline"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Mifflin-St Jeor
                                </Badge>
                            </div>

                            {/* Sex Selector */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Biological Sex
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCalcSex('male')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                                            calcSex === 'male'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400'
                                                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCalcSex('female')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                                            calcSex === 'female'
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400'
                                                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>

                            {/* Sliders: Weight, Height, Age */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-border bg-background p-3.5">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Body Weight
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {calcWeight} kg
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={45}
                                        max={140}
                                        value={calcWeight}
                                        onChange={(e) =>
                                            setCalcWeight(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full cursor-pointer accent-emerald-500"
                                    />
                                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                        <span>45 kg</span>
                                        <span>140 kg</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-3.5">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Height
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {calcHeight} cm
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={140}
                                        max={215}
                                        value={calcHeight}
                                        onChange={(e) =>
                                            setCalcHeight(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full cursor-pointer accent-emerald-500"
                                    />
                                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                        <span>140 cm</span>
                                        <span>215 cm</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border bg-background p-3.5">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Age
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {calcAge} yrs
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={16}
                                        max={80}
                                        value={calcAge}
                                        onChange={(e) =>
                                            setCalcAge(Number(e.target.value))
                                        }
                                        className="w-full cursor-pointer accent-emerald-500"
                                    />
                                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                        <span>16</span>
                                        <span>80</span>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Multiplier */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Activity & Energy Multiplier (PAL)
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {[
                                        {
                                            key: 'sedentary',
                                            label: 'Sedentary',
                                            pal: '1.20',
                                            desc: 'Desk job, minimal movement',
                                        },
                                        {
                                            key: 'lightly_active',
                                            label: 'Light',
                                            pal: '1.375',
                                            desc: '1-3 workouts / week',
                                        },
                                        {
                                            key: 'moderately_active',
                                            label: 'Moderate',
                                            pal: '1.55',
                                            desc: '3-5 gym sessions / week',
                                        },
                                        {
                                            key: 'very_active',
                                            label: 'Very Active',
                                            pal: '1.725',
                                            desc: '6-7 heavy workouts',
                                        },
                                        {
                                            key: 'extra_active',
                                            label: 'Athlete',
                                            pal: '1.90',
                                            desc: 'Double daily sessions',
                                        },
                                    ].map((lvl) => (
                                        <button
                                            key={lvl.key}
                                            type="button"
                                            onClick={() =>
                                                setCalcActivity(
                                                    lvl.key as ActivityLevel,
                                                )
                                            }
                                            className={`rounded-xl border p-3 text-left transition-all ${
                                                calcActivity === lvl.key
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                                    : 'border-border bg-background hover:bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`text-xs font-bold ${calcActivity === lvl.key ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}
                                                >
                                                    {lvl.label}
                                                </span>
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    ×{lvl.pal}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                                                {lvl.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Goal & Diet Preset */}
                            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Primary Objective
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            {
                                                key: 'cut',
                                                label: 'Fat Loss Cut',
                                                delta: '-500 kcal/day',
                                            },
                                            {
                                                key: 'maintain',
                                                label: 'Maintain Weight',
                                                delta: '0 kcal',
                                            },
                                            {
                                                key: 'bulk',
                                                label: 'Lean Bulk',
                                                delta: '+250 kcal/day',
                                            },
                                        ].map((g) => (
                                            <button
                                                key={g.key}
                                                type="button"
                                                onClick={() =>
                                                    setCalcGoal(
                                                        g.key as GoalType,
                                                    )
                                                }
                                                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all ${
                                                    calcGoal === g.key
                                                        ? 'border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400'
                                                        : 'border-border bg-background text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <span>{g.label}</span>
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    {g.delta}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Dietary Macronutrient Split
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            {
                                                key: 'balanced',
                                                label: 'Balanced',
                                                split: '30% P / 40% C / 30% F',
                                            },
                                            {
                                                key: 'high_protein',
                                                label: 'High Protein',
                                                split: '35% P / 40% C / 25% F',
                                            },
                                            {
                                                key: 'low_carb',
                                                label: 'Low Carb',
                                                split: '35% P / 20% C / 45% F',
                                            },
                                            {
                                                key: 'keto',
                                                label: 'Ketogenic',
                                                split: '25% P / 5% C / 70% F',
                                            },
                                        ].map((d) => (
                                            <button
                                                key={d.key}
                                                type="button"
                                                onClick={() =>
                                                    setCalcDiet(
                                                        d.key as DietPreference,
                                                    )
                                                }
                                                className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                                                    calcDiet === d.key
                                                        ? 'border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400'
                                                        : 'border-border bg-background text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <span>{d.label}</span>
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    {d.split}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Scientific Readout & Target Cockpit */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* Target Calories Focal Card */}
                            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-card to-card p-6 shadow-lg shadow-emerald-500/5 sm:p-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                        <Target className="h-4 w-4" />
                                        Calculated Daily Fuel Target
                                    </span>
                                    <Badge className="bg-emerald-600 font-mono text-xs text-white">
                                        {calcGoal === 'cut'
                                            ? 'Deficit'
                                            : calcGoal === 'bulk'
                                              ? 'Surplus'
                                              : 'Equilibrium'}
                                    </Badge>
                                </div>

                                <div className="mb-2 flex items-baseline gap-2">
                                    <span className="font-mono text-5xl font-black tracking-tight text-foreground sm:text-6xl">
                                        {calculatorResults.targetCalories.toLocaleString()}
                                    </span>
                                    <span className="text-lg font-semibold text-muted-foreground">
                                        kcal / day
                                    </span>
                                </div>

                                <p className="mb-6 text-xs text-muted-foreground">
                                    Calibrated for a baseline maintenance of{' '}
                                    {calculatorResults.tdee.toLocaleString()}{' '}
                                    kcal with a weekly target rate of{' '}
                                    {calcGoal === 'cut'
                                        ? '-0.50 kg'
                                        : calcGoal === 'bulk'
                                          ? '+0.25 kg'
                                          : '0.00 kg'}
                                    .
                                </p>

                                {/* Stacked Visual Macro Bar */}
                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                        <span>Macro Ratio</span>
                                        <span>100% Calibrated</span>
                                    </div>
                                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted p-0.5">
                                        <div
                                            style={{
                                                width: `${calculatorResults.split.proteinPercent}%`,
                                            }}
                                            className="h-full rounded-l-full bg-blue-500 transition-all duration-300"
                                            title={`Protein ${calculatorResults.split.proteinPercent}%`}
                                        />
                                        <div
                                            style={{
                                                width: `${calculatorResults.split.carbsPercent}%`,
                                            }}
                                            className="h-full bg-amber-500 transition-all duration-300"
                                            title={`Carbohydrates ${calculatorResults.split.carbsPercent}%`}
                                        />
                                        <div
                                            style={{
                                                width: `${calculatorResults.split.fatPercent}%`,
                                            }}
                                            className="h-full rounded-r-full bg-rose-500 transition-all duration-300"
                                            title={`Dietary Fat ${calculatorResults.split.fatPercent}%`}
                                        />
                                    </div>
                                    <div className="flex justify-between pt-1 font-mono text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />{' '}
                                            P:{' '}
                                            {
                                                calculatorResults.split
                                                    .proteinPercent
                                            }
                                            %
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />{' '}
                                            C:{' '}
                                            {
                                                calculatorResults.split
                                                    .carbsPercent
                                            }
                                            %
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />{' '}
                                            F:{' '}
                                            {calculatorResults.split.fatPercent}
                                            %
                                        </span>
                                    </div>
                                </div>

                                {/* 3 Macro Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 text-center">
                                        <span className="mb-1 block text-[10px] font-bold tracking-wider text-blue-500 uppercase">
                                            Protein
                                        </span>
                                        <span className="block font-mono text-xl font-black text-foreground sm:text-2xl">
                                            {calculatorResults.macros.protein}g
                                        </span>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {calculatorResults.macros.protein *
                                                4}{' '}
                                            kcal
                                        </span>
                                    </div>
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-center">
                                        <span className="mb-1 block text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                                            Carbs
                                        </span>
                                        <span className="block font-mono text-xl font-black text-foreground sm:text-2xl">
                                            {calculatorResults.macros.carbs}g
                                        </span>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {calculatorResults.macros.carbs * 4}{' '}
                                            kcal
                                        </span>
                                    </div>
                                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-center">
                                        <span className="mb-1 block text-[10px] font-bold tracking-wider text-rose-500 uppercase">
                                            Fats
                                        </span>
                                        <span className="block font-mono text-xl font-black text-foreground sm:text-2xl">
                                            {calculatorResults.macros.fat}g
                                        </span>
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {calculatorResults.macros.fat * 9}{' '}
                                            kcal
                                        </span>
                                    </div>
                                </div>

                                {/* Metabolic Engine Telemetry */}
                                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-xs">
                                    <div>
                                        <span className="block text-muted-foreground">
                                            Basal Metabolic Rate
                                        </span>
                                        <span className="font-mono font-bold text-foreground">
                                            {calculatorResults.bmr.toLocaleString()}{' '}
                                            kcal
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground">
                                            Estimated TDEE
                                        </span>
                                        <span className="font-mono font-bold text-foreground">
                                            {calculatorResults.tdee.toLocaleString()}{' '}
                                            kcal
                                        </span>
                                    </div>
                                </div>

                                {/* Copy / Save CTA */}
                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        onClick={handleCopyProtocol}
                                        variant="outline"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border-border text-xs font-medium hover:bg-muted"
                                    >
                                        {copiedTarget ? (
                                            <>
                                                <Check className="h-4 w-4 text-emerald-500" />
                                                <span>
                                                    Protocol Copied to
                                                    Clipboard!
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    Copy Targets to Clipboard
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Direct Registration Callout with prefilled targets */}
                            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                                <p className="mb-3 text-xs text-muted-foreground">
                                    Ready to let our algorithm auto-adjust these
                                    numbers as your body composition evolves?
                                </p>
                                <Button
                                    asChild
                                    className="w-full rounded-xl bg-emerald-600 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
                                >
                                    <Link href={register()}>
                                        Lock In This Target & Create Account
                                        <ArrowRight className="ml-1.5 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: LIVE INTERACTIVE COCKPIT DEMO */}
            <section id="cockpit" className="relative py-20 md:py-28">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Activity className="h-3.5 w-3.5 text-emerald-500" />
                            Interactive Product Sandbox
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Experience The Adaptive Cockpit
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            Click around. Test how meals adjust remaining fuel,
                            examine weekly adaptive expenditure checkpoints, and
                            see how EWMA trend filters raw water weight spikes.
                        </p>
                    </div>

                    {/* Cockpit Card Wrapper */}
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl">
                        {/* Tab Bar */}
                        <div className="flex scrollbar-none gap-2 overflow-x-auto border-b border-border bg-muted/30 px-4 pt-3">
                            {[
                                {
                                    id: 'diary',
                                    label: '1. Daily Fuel Diary',
                                    icon: Utensils,
                                },
                                {
                                    id: 'adaptive',
                                    label: '2. Adaptive Checkpoint',
                                    icon: RefreshCw,
                                },
                                {
                                    id: 'trend',
                                    label: '3. EWMA Trend vs Water Spikes',
                                    icon: TrendingUp,
                                },
                                {
                                    id: 'scanner',
                                    label: '4. Barcode Quick-Lookup',
                                    icon: Barcode,
                                },
                            ].map((t) => {
                                const Icon = t.icon;
                                const isActive = cockpitTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() =>
                                            setCockpitTab(
                                                t.id as
                                                    | 'diary'
                                                    | 'adaptive'
                                                    | 'trend'
                                                    | 'scanner',
                                            )
                                        }
                                        className={`flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all sm:text-sm ${
                                            isActive
                                                ? 'border-emerald-500 bg-card text-emerald-600 shadow-sm dark:text-emerald-400'
                                                : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* TAB 1: DAILY FUEL DIARY */}
                        {cockpitTab === 'diary' && (
                            <div className="space-y-8 p-6 sm:p-8">
                                {/* Top KPI Summary */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                                        <span className="mb-1 block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            Remaining Fuel
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-3xl font-extrabold text-foreground">
                                                {remainingCalories > 0
                                                    ? remainingCalories
                                                    : 0}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                / {targetDiaryCalories} kcal
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, (currentDiaryTotals.calories / targetDiaryCalories) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
                                        <span className="mb-1 block text-xs font-semibold text-blue-500">
                                            Protein
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-2xl font-bold text-foreground">
                                                {currentDiaryTotals.protein}g
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                / 180g
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, (currentDiaryTotals.protein / 180) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                                        <span className="mb-1 block text-xs font-semibold text-amber-500">
                                            Carbs
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-2xl font-bold text-foreground">
                                                {currentDiaryTotals.carbs}g
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                / 240g
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, (currentDiaryTotals.carbs / 240) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                                        <span className="mb-1 block text-xs font-semibold text-rose-500">
                                            Fats
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-2xl font-bold text-foreground">
                                                {currentDiaryTotals.fat}g
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                / 65g
                                            </span>
                                        </div>
                                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-rose-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, (currentDiaryTotals.fat / 65) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Meals List */}
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            Today's Meals (Click to Log / Unlog)
                                        </h4>
                                        <span className="text-xs text-muted-foreground">
                                            {loggedMealIds.length} of{' '}
                                            {sampleMeals.length} logged
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {sampleMeals.map((meal) => {
                                            const isLogged =
                                                loggedMealIds.includes(meal.id);
                                            return (
                                                <button
                                                    key={meal.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isLogged) {
                                                            setLoggedMealIds(
                                                                loggedMealIds.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        meal.id,
                                                                ),
                                                            );
                                                        } else {
                                                            setLoggedMealIds([
                                                                ...loggedMealIds,
                                                                meal.id,
                                                            ]);
                                                        }
                                                    }}
                                                    className={`flex w-full flex-col justify-between gap-3 rounded-xl border p-4 text-left transition-all sm:flex-row sm:items-center ${
                                                        isLogged
                                                            ? 'border-emerald-500/40 bg-emerald-500/5 shadow-sm'
                                                            : 'border-border/60 bg-background/50 opacity-60 hover:bg-muted/40 hover:opacity-100'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                                                isLogged
                                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                                    : 'border-muted-foreground/40 bg-background'
                                                            }`}
                                                        >
                                                            {isLogged && (
                                                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-foreground">
                                                                    {meal.name}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                                    {meal.time}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {meal.desc}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 self-end font-mono text-xs sm:self-center">
                                                        <span className="font-bold text-foreground">
                                                            {meal.calories} kcal
                                                        </span>
                                                        <span className="font-semibold text-blue-500">
                                                            {meal.protein}g P
                                                        </span>
                                                        <span className="font-semibold text-amber-500">
                                                            {meal.carbs}g C
                                                        </span>
                                                        <span className="font-semibold text-rose-500">
                                                            {meal.fat}g F
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ADAPTIVE CHECKPOINT */}
                        {cockpitTab === 'adaptive' && (
                            <div className="space-y-6 p-6 sm:p-8">
                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                                        <div>
                                            <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                                Weekly Checkpoint • Week 4
                                            </span>
                                            <h4 className="mt-1 text-xl font-extrabold text-foreground">
                                                Metabolism Acceleration Detected
                                            </h4>
                                        </div>
                                        <Badge className="bg-emerald-600 text-white">
                                            Algorithm Recommendation
                                        </Badge>
                                    </div>

                                    <div className="my-6 grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
                                        <div>
                                            <span className="block text-xs text-muted-foreground">
                                                Observed Weight Loss
                                            </span>
                                            <span className="font-mono text-2xl font-bold text-foreground">
                                                -0.68 kg / wk
                                            </span>
                                            <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                                Faster than -0.50 kg goal
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">
                                                Calculated Expenditure (TDEE)
                                            </span>
                                            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                2,810 kcal / day
                                            </span>
                                            <span className="mt-0.5 block text-[10px] text-emerald-500">
                                                +85 kcal vs last week
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-muted-foreground">
                                                New Recommended Target
                                            </span>
                                            <span className="font-mono text-2xl font-bold text-foreground">
                                                2,310 kcal / day
                                            </span>
                                            <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                                +85 kcal to protect muscle
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 border-t border-emerald-500/20 pt-4 sm:flex-row">
                                        {adaptiveAccepted ? (
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span>
                                                    Targets successfully updated
                                                    to 2,310 kcal/day for the
                                                    upcoming week!
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        setAdaptiveAccepted(
                                                            true,
                                                        )
                                                    }
                                                    className="w-full rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 sm:w-auto"
                                                >
                                                    Accept Target Adjustment
                                                    (+85 kcal)
                                                </Button>
                                                <span className="text-xs text-muted-foreground">
                                                    You maintain full control.
                                                    Rejections leave your
                                                    current targets unchanged.
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: EWMA TREND VS WATER SPIKES */}
                        {cockpitTab === 'trend' && (
                            <div className="space-y-6 p-6 sm:p-8">
                                <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h4 className="text-base font-bold text-foreground">
                                            The Anti-Panic Smoothing Algorithm
                                        </h4>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Sodium, carbohydrate replenishment,
                                            and hydration cause scale
                                            fluctuations of ±2 kg overnight.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setWaterSpikeActive(
                                                !waterSpikeActive,
                                            )
                                        }
                                        className={`rounded-xl border text-xs font-semibold transition-all ${
                                            waterSpikeActive
                                                ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                                                : 'border-border text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        {waterSpikeActive
                                            ? 'Remove Simulated Water Spike'
                                            : 'Simulate +2.5 kg Sodium/Sushi Water Spike'}
                                    </Button>
                                </div>

                                {/* Mini Chart Visualization Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-border text-muted-foreground">
                                                <th className="py-2.5 font-semibold">
                                                    Date
                                                </th>
                                                <th className="py-2.5 font-semibold">
                                                    Raw Scale Reading
                                                </th>
                                                <th className="py-2.5 font-semibold">
                                                    True EWMA Trend
                                                </th>
                                                <th className="py-2.5 font-semibold">
                                                    Algorithm Diagnosis
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {rawWeightsSample.map(
                                                (entry, idx) => {
                                                    const isSpike =
                                                        waterSpikeActive &&
                                                        (entry.date ===
                                                            'Oct 13' ||
                                                            entry.date ===
                                                                'Oct 15');
                                                    return (
                                                        <tr
                                                            key={idx}
                                                            className={
                                                                isSpike
                                                                    ? 'bg-rose-500/5'
                                                                    : ''
                                                            }
                                                        >
                                                            <td className="py-3 font-mono font-medium text-foreground">
                                                                {entry.date}
                                                            </td>
                                                            <td className="py-3 font-mono">
                                                                <span
                                                                    className={
                                                                        isSpike
                                                                            ? 'font-bold text-rose-500'
                                                                            : 'text-foreground'
                                                                    }
                                                                >
                                                                    {
                                                                        entry.rawWeightKg
                                                                    }{' '}
                                                                    kg
                                                                </span>
                                                                {isSpike && (
                                                                    <span className="ml-2 text-[10px] font-semibold text-rose-500">
                                                                        (Temporary
                                                                        Water
                                                                        Noise)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 font-mono font-bold text-emerald-500">
                                                                {
                                                                    entry.trendWeightKg
                                                                }{' '}
                                                                kg
                                                            </td>
                                                            <td className="py-3 text-muted-foreground">
                                                                {isSpike
                                                                    ? 'Trend remains on track. Zero panic deficit cuts.'
                                                                    : 'Healthy progressive tissue loss.'}
                                                            </td>
                                                        </tr>
                                                    );
                                                },
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: BARCODE & SEARCH */}
                        {cockpitTab === 'scanner' && (
                            <div className="space-y-6 p-6 sm:p-8">
                                <div className="mx-auto max-w-md space-y-4 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                                        <Barcode className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-base font-bold text-foreground">
                                        Instant Universal Barcode Decoupling
                                    </h4>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Scan barcodes in milliseconds using your
                                        device camera or lookup via
                                        OpenFoodFacts. Zero paywalls.
                                    </p>
                                    <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-left">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-mono text-muted-foreground">
                                                Barcode: 5000169121453
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 text-[10px] text-emerald-500"
                                            >
                                                Verified
                                            </Badge>
                                        </div>
                                        <div className="text-sm font-bold text-foreground">
                                            Optimum Nutrition Gold Standard Whey
                                            100%
                                        </div>
                                        <div className="flex gap-4 pt-1 font-mono text-xs text-muted-foreground">
                                            <span>Serving: 30.4g</span>
                                            <span className="font-bold text-foreground">
                                                120 kcal
                                            </span>
                                            <span className="font-bold text-blue-500">
                                                24g P
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION: BENTO GRID - ARCHITECTURE & CAPABILITIES */}
            <section
                id="science"
                className="border-t border-border/60 bg-card/40 py-20 md:py-28"
            >
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Dna className="h-3.5 w-3.5 text-emerald-500" />
                            Engineered For Precision
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Why Traditional Calorie Trackers Fail You
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            Static formulas assume your metabolism never
                            changes. But as you lose weight, metabolic
                            adaptation reduces your energy expenditure by up to
                            15%. kcal-log solves this algorithmically.
                        </p>
                    </div>

                    {/* Bento Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Card 1: Adaptive Expenditure (Wide) */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm md:col-span-2">
                            <div>
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    Continuous Metabolic Rate Solving
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Instead of trusting gym machines or
                                    smartwatches that over-report active
                                    calories by up to 40%, kcal-log calculates
                                    energy balance mathematically from your
                                    logged intake and EWMA smoothed scale
                                    readings.
                                </p>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 font-mono text-xs">
                                <div>
                                    <span className="block text-muted-foreground">
                                        Algorithm
                                    </span>
                                    <span className="font-bold text-foreground">
                                        Rolling Multi-Week EWMA
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground">
                                        Adjustment Frequency
                                    </span>
                                    <span className="font-bold text-emerald-500">
                                        Weekly Checkpoints
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Zero Paywalls */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm">
                            <div>
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                                    <Barcode className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    Barcode Scanner Free Forever
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    We never charge \$79/year for scanning
                                    barcodes. Powered by open food databases
                                    with instant camera autofocus.
                                </p>
                            </div>
                            <div className="mt-8 border-t border-border/60 pt-6 font-mono text-xs">
                                <span className="block text-muted-foreground">
                                    Database Coverage
                                </span>
                                <span className="font-bold text-foreground">
                                    3.2M+ Global Products
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Calorie Banking & Zig-Zag */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm">
                            <div>
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    Dynamic Zig-Zag Calorie Banking
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Fuel hard training days with more carbs
                                    while keeping rest days lower, preserving
                                    the exact weekly deficit.
                                </p>
                            </div>
                            <div className="mt-8 border-t border-border/60 pt-6 font-mono text-xs">
                                <span className="block text-muted-foreground">
                                    Weekly Compliance
                                </span>
                                <span className="font-bold text-foreground">
                                    100% Calorie Parity
                                </span>
                            </div>
                        </div>

                        {/* Card 4: Local-First & 100% Privacy (Wide) */}
                        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm md:col-span-2">
                            <div>
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    Local-First Architecture & Privacy
                                    Sovereignty
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Works offline with local-first storage. No
                                    third-party ad networks tracking your
                                    weight, no data brokers, and 1-click export
                                    to standard CSV or JSON anytime you want.
                                </p>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 font-mono text-xs">
                                <div>
                                    <span className="block text-muted-foreground">
                                        Data Tracking
                                    </span>
                                    <span className="font-bold text-emerald-500">
                                        Zero Analytics Trackers
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground">
                                        Export Format
                                    </span>
                                    <span className="font-bold text-foreground">
                                        Full JSON & CSV Dumps
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: TRANSPARENT COMPARISON MATRIX */}
            <section id="comparison" className="py-20 md:py-28">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Compare kcal-log Against The Industry
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            See how we stack up against proprietary incumbents
                            and static spreadsheets.
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        <th className="px-6 py-4">
                                            Capability
                                        </th>
                                        <th className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                            kcal-log
                                        </th>
                                        <th className="px-6 py-4">
                                            MyFitnessPal
                                        </th>
                                        <th className="px-6 py-4">
                                            MacroFactor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            Pricing
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            100% Free / Open
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            \$19.99/mo (\$79/yr)
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            \$11.99/mo (\$71/yr)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            Barcode Scanner
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            Included Free
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Paywalled (Premium)
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Included in Subscription
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            Adaptive Expenditure (TDEE)
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            Continuous Algorithm
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Static / Manual
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            Continuous Algorithm
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            EWMA Weight Smoothing
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            Built-in (Anti-Panic)
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Raw Weights Only
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            Smoothed Trend
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            Third-Party Ads & Trackers
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            Zero Ads / Trackers
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-rose-500">
                                            Heavy Ad Network
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Zero Ads
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            Data Sovereignty
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-500">
                                            Open JSON/CSV Export
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Restricted Export
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            Export Available
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: ACCORDION FAQ */}
            <section
                id="faq"
                className="border-t border-border/60 bg-card/40 py-20 md:py-28"
            >
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                            Clear answers to your technical and nutrition
                            questions.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-border bg-card transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenFaqIndex(
                                                isOpen ? null : index,
                                            )
                                        }
                                        className="flex w-full items-center justify-between gap-4 p-6 text-left text-base font-bold text-foreground transition-colors hover:bg-muted/30"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown
                                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                                isOpen
                                                    ? 'rotate-180 text-emerald-500'
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="border-t border-border/40 px-6 pt-4 pb-6 text-sm leading-relaxed text-muted-foreground">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SECTION: FINAL CALL TO ACTION */}
            <section className="relative py-20 md:py-28">
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-card to-card p-8 text-center shadow-2xl sm:p-14">
                        <div className="mx-auto max-w-2xl space-y-6">
                            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl">
                                Take Full Command Of Your Metabolism Today.
                            </h2>
                            <p className="text-base text-muted-foreground sm:text-lg">
                                Free forever. No paywalled barcodes. No credit
                                card required. Start tracking your true daily
                                energy expenditure in under two minutes.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-full bg-emerald-600 px-8 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 active:scale-95"
                                >
                                    <Link href={register()}>
                                        Create Free Account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="h-12 rounded-full border-border px-8 font-medium hover:bg-muted"
                                >
                                    <Link href={login()}>
                                        Sign In to Existing Account
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MINIMAL SLEEK FOOTER */}
            <footer className="border-t border-border bg-background py-12">
                <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold text-foreground">
                            {appName}
                        </span>
                        <span>• Precision Open-Source Nutrition System</span>
                    </div>

                    <div className="flex items-center gap-6 font-medium">
                        <a
                            href="#calculator"
                            className="transition-colors hover:text-foreground"
                        >
                            Macro Calculator
                        </a>
                        <a
                            href="#cockpit"
                            className="transition-colors hover:text-foreground"
                        >
                            Live Cockpit
                        </a>
                        <a
                            href="#science"
                            className="transition-colors hover:text-foreground"
                        >
                            Metabolic Science
                        </a>
                        <a
                            href="#comparison"
                            className="transition-colors hover:text-foreground"
                        >
                            Compare
                        </a>
                        <a
                            href="https://github.com/DevHolako/kcal-log"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-foreground"
                        >
                            GitHub
                        </a>
                    </div>

                    <div>
                        <span>Released under MIT License.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
