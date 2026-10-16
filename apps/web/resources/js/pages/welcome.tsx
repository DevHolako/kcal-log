import { Head, Link, usePage } from '@inertiajs/react';
import {
    calculateBMR,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacroGrams,
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
    Flame,
    Layers,
    Menu,
    ShieldCheck,
    Sparkles,
    Utensils,
    X,
    Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

    // Interactive Hero Preview state
    const [activeTab, setActiveTab] = useState<
        'diary' | 'barcode' | 'adaptive' | 'trend'
    >('diary');
    const [adaptiveAccepted, setAdaptiveAccepted] = useState(false);

    // Interactive Calculator state
    const [calcSex, setCalcSex] = useState<Sex>('male');
    const [calcWeight, setCalcWeight] = useState(78);
    const [calcHeight, setCalcHeight] = useState(178);
    const [calcAge, setCalcAge] = useState(28);
    const [calcActivity, setCalcActivity] =
        useState<ActivityLevel>('moderately_active');
    const [calcGoal, setCalcGoal] = useState<GoalType>('cut');
    const [calcDiet, setCalcDiet] = useState<DietPreference>('balanced');

    // Real-time calculation using @kcal-log/nutrition engine
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

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: 'How does the weekly adaptive adjustment algorithm work?',
            a: 'kcal-log pairs an exponentially smoothed moving average (EMA) of your scale weight against your logged daily calorie intake. If your real-world progress stalls or drops faster than your chosen rate, the algorithm recalculates your true Total Daily Energy Expenditure (TDEE) and proposes a calibrated ±50–150 kcal adjustment for the following week, which you confirm with one click.',
        },
        {
            q: 'Is barcode scanning included for free?',
            a: 'Yes, 100% free with unlimited scans. Unlike legacy calorie counting apps that lock barcode scanning behind expensive annual paywalls, kcal-log connects directly to Open Food Facts (over 3 million verified products worldwide) as a first-class feature.',
        },
        {
            q: 'Can I create custom foods and multi-ingredient recipes?',
            a: 'Absolutely. You can create private custom foods with custom portion sizes (grams, scoops, pieces) and build complex multi-ingredient recipes with automatic per-serving macro division. Custom foods remain strictly yours and are never overwritten by catalog updates.',
        },
        {
            q: 'How is my data protected and can I export it?',
            a: 'You own your data completely. You can export your full diary history, meal entries, weigh-ins, and weekly progress as clean CSV or structured PDF reports at any time. There is zero telemetry tracking or advertising.',
        },
        {
            q: 'Can kcal-log be self-hosted?',
            a: 'Yes! kcal-log is built with a production-grade containerized architecture (FrankenPHP, MariaDB, Redis, Laravel Horizon, Reverb) and can be easily deployed via Docker or Coolify in minutes.',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <Head title="Precision Nutrition & Adaptive Calorie Tracking" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="group flex items-center gap-2.5"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                                <Flame className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                {appName}
                            </span>
                        </Link>
                        <Badge
                            variant="secondary"
                            className="hidden border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary sm:inline-flex"
                        >
                            v1.0 Adaptive
                        </Badge>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-7 md:flex">
                        <NavLink href="#features">Features</NavLink>
                        <NavLink href="#preview">Live Demo</NavLink>
                        <NavLink href="#calculator">Calculator</NavLink>
                        <NavLink href="#comparison">Compare</NavLink>
                        <NavLink href="#faq">FAQ</NavLink>
                        <a
                            href="/docs/api"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            API Docs
                        </a>
                    </nav>

                    {/* Action Buttons & Theme */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {auth?.user ? (
                            <Link href={dashboard()}>
                                <Button className="bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                                    Dashboard
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href={login()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-medium"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link href={register()}>
                                    <Button
                                        size="sm"
                                        className="bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu trigger */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="border-b border-border bg-background px-4 py-4 md:hidden">
                        <nav className="flex flex-col space-y-3 pb-2">
                            <NavLink
                                href="#features"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </NavLink>
                            <NavLink
                                href="#preview"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Live Demo
                            </NavLink>
                            <NavLink
                                href="#calculator"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Calculator
                            </NavLink>
                            <NavLink
                                href="#comparison"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Comparison
                            </NavLink>
                            <NavLink
                                href="#faq"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </NavLink>
                            <a
                                href="/docs/api"
                                className="text-sm font-medium text-muted-foreground"
                            >
                                API Docs
                            </a>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                {/* Subtle emerald background glow */}
                <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />

                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    {/* Announcement Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10">
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span>
                            Mifflin-St Jeor + Exponential Moving Average
                            Calibration
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                        Precision Nutrition That{' '}
                        <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">
                            Adapts to Your Metabolism
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg sm:leading-relaxed">
                        Say goodbye to weight loss plateaus. Log meals in
                        seconds, scan barcodes with Open Food Facts integration,
                        and let our intelligent weekly algorithm auto-calibrate
                        your targets based on real-world weigh-ins.
                    </p>

                    {/* CTA Group */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                        {auth?.user ? (
                            <Link href={dashboard()}>
                                <Button
                                    size="lg"
                                    className="w-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90 sm:w-auto"
                                >
                                    Return to Diary Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={register()}>
                                    <Button
                                        size="lg"
                                        className="w-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90 sm:w-auto"
                                    >
                                        Start Tracking Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <a href="#preview">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full px-6 py-6 text-base font-medium sm:w-auto"
                                    >
                                        Explore Interactive Demo
                                    </Button>
                                </a>
                            </>
                        )}
                    </div>

                    {/* Micro Value Points */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground sm:text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>Sub-second meal entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>Free barcode scanner (3M+ items)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>Weekly adaptive recalibration</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>100% data exportable (CSV & PDF)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Hero App Demo */}
            <section
                id="preview"
                className="border-y border-border/70 bg-muted/30 py-12 lg:py-16"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Badge
                            variant="outline"
                            className="mb-2 border-primary/30 bg-primary/5 text-primary"
                        >
                            Product Experience
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Experience the kcal-log Workflow
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                            Switch between the views below to see how our diary,
                            barcode lookup, adaptive strategy, and trends work
                            together.
                        </p>
                    </div>

                    {/* App Frame */}
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                        {/* Mock App Window Header */}
                        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                <span className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline">
                                    kcal.holako.dev/diary
                                </span>
                            </div>

                            {/* View Switcher Tabs */}
                            <div className="flex items-center rounded-lg border border-border bg-background p-1 text-xs font-medium">
                                <button
                                    onClick={() => setActiveTab('diary')}
                                    className={`rounded-md px-3 py-1 transition-all ${
                                        activeTab === 'diary'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Diary & Macros
                                </button>
                                <button
                                    onClick={() => setActiveTab('barcode')}
                                    className={`rounded-md px-3 py-1 transition-all ${
                                        activeTab === 'barcode'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Barcode Scanner
                                </button>
                                <button
                                    onClick={() => setActiveTab('adaptive')}
                                    className={`rounded-md px-3 py-1 transition-all ${
                                        activeTab === 'adaptive'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Adaptive Engine
                                </button>
                                <button
                                    onClick={() => setActiveTab('trend')}
                                    className={`rounded-md px-3 py-1 transition-all ${
                                        activeTab === 'trend'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Trends
                                </button>
                            </div>
                        </div>

                        {/* Mock App Body */}
                        <div className="bg-background p-4 sm:p-6 lg:p-8">
                            {/* TAB 1: DIARY VIEW */}
                            {activeTab === 'diary' && (
                                <div className="space-y-6">
                                    {/* Summary Banner */}
                                    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-5">
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Calories Remaining
                                            </div>
                                            <div className="text-2xl font-extrabold text-primary">
                                                530{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    kcal
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                1,620 of 2,150 goal
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Protein (80%)
                                            </div>
                                            <div className="text-xl font-bold text-blue-500">
                                                145g{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    / 180g
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                                                <div
                                                    className="h-1.5 rounded-full bg-blue-500"
                                                    style={{ width: '80%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Carbs (76%)
                                            </div>
                                            <div className="text-xl font-bold text-amber-500">
                                                165g{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    / 215g
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                                                <div
                                                    className="h-1.5 rounded-full bg-amber-500"
                                                    style={{ width: '76%' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                Fat (64%)
                                            </div>
                                            <div className="text-xl font-bold text-rose-500">
                                                42g{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    / 65g
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                                                <div
                                                    className="h-1.5 rounded-full bg-rose-500"
                                                    style={{ width: '64%' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <div className="text-xs text-muted-foreground">
                                                Water (75%)
                                            </div>
                                            <div className="text-xl font-bold text-cyan-500">
                                                2,250{' '}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    / 3,000ml
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                                                <div
                                                    className="h-1.5 rounded-full bg-cyan-500"
                                                    style={{ width: '75%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meal Slots Grid */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Breakfast */}
                                        <div className="rounded-xl border border-border bg-card p-4">
                                            <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <span className="rounded-md bg-amber-500/10 p-1 text-amber-600">
                                                        🍳
                                                    </span>
                                                    Breakfast
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    480 kcal
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        Rolled Oats with Whey &
                                                        Berries (80g)
                                                    </span>
                                                    <span className="font-mono text-foreground">
                                                        38P • 62C • 9F
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>Black Coffee</span>
                                                    <span className="font-mono text-foreground">
                                                        2 kcal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lunch */}
                                        <div className="rounded-xl border border-border bg-card p-4">
                                            <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <span className="rounded-md bg-emerald-500/10 p-1 text-emerald-600">
                                                        🥗
                                                    </span>
                                                    Lunch
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    650 kcal
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        Grilled Chicken Salad
                                                        with Quinoa (320g)
                                                    </span>
                                                    <span className="font-mono text-foreground">
                                                        54P • 48C • 22F
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dinner */}
                                        <div className="rounded-xl border border-border bg-card p-4">
                                            <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <span className="rounded-md bg-blue-500/10 p-1 text-blue-600">
                                                        🍽️
                                                    </span>
                                                    Dinner
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    270 kcal
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        Baked Salmon with
                                                        Steamed Asparagus
                                                    </span>
                                                    <span className="font-mono text-foreground">
                                                        32P • 6C • 12F
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Snack */}
                                        <div className="rounded-xl border border-border bg-card p-4">
                                            <div className="mb-2 flex items-center justify-between border-b border-border/60 pb-2">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <span className="rounded-md bg-purple-500/10 p-1 text-purple-600">
                                                        🍎
                                                    </span>
                                                    Snack
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    220 kcal
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        Greek Yogurt 0% with Raw
                                                        Almonds
                                                    </span>
                                                    <span className="font-mono text-foreground">
                                                        21P • 7C • 11F
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: BARCODE SCANNER PREVIEW */}
                            {activeTab === 'barcode' && (
                                <div className="grid items-center gap-6 p-4 md:grid-cols-2">
                                    <div className="space-y-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Barcode className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">
                                                Live Camera Scanner Simulated
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                EAN-13: 3017620422003 (Open Food
                                                Facts Database)
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                                            <Check className="h-3.5 w-3.5" />{' '}
                                            Instant Match Verified
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="secondary"
                                                className="bg-emerald-500/15 font-bold text-emerald-600"
                                            >
                                                Nutri-Score A
                                            </Badge>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                100g portion
                                            </span>
                                        </div>
                                        <div className="text-base font-bold">
                                            Fage Total 0% Plain Greek Yogurt
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Brand: FAGE International • High
                                            Protein Cultured Dairy
                                        </p>
                                        <div className="grid grid-cols-4 gap-2 border-t border-border pt-2 text-center">
                                            <div className="rounded-lg bg-muted/60 p-2">
                                                <div className="text-[10px] text-muted-foreground">
                                                    Calories
                                                </div>
                                                <div className="text-sm font-bold text-foreground">
                                                    54
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-muted/60 p-2">
                                                <div className="text-[10px] text-blue-500">
                                                    Protein
                                                </div>
                                                <div className="text-sm font-bold text-blue-600">
                                                    10.3g
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-muted/60 p-2">
                                                <div className="text-[10px] text-amber-500">
                                                    Carbs
                                                </div>
                                                <div className="text-sm font-bold text-amber-600">
                                                    3.0g
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-muted/60 p-2">
                                                <div className="text-[10px] text-rose-500">
                                                    Fat
                                                </div>
                                                <div className="text-sm font-bold text-rose-600">
                                                    0.0g
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="mt-2 w-full bg-primary font-medium text-primary-foreground"
                                        >
                                            Log to Breakfast
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ADAPTIVE CALIBRATION ENGINE */}
                            {activeTab === 'adaptive' && (
                                <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
                                    <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-bold sm:text-base">
                                                    Weekly Adaptive Checkpoint
                                                </span>
                                                <Badge className="border-primary/20 bg-primary/10 text-[11px] text-primary">
                                                    Proposed
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Based on 7 daily weigh-ins and
                                                an average logged intake of
                                                2,120 kcal.
                                            </p>
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground">
                                            Recalibration Cycle #4
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                                            <div className="text-xs text-muted-foreground">
                                                Target Weight Change
                                            </div>
                                            <div className="text-lg font-bold text-foreground">
                                                -0.40 kg/wk
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                Moderate fat loss rate
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                                            <div className="text-xs text-muted-foreground">
                                                Actual Smoothed Trend
                                            </div>
                                            <div className="text-lg font-bold text-emerald-600">
                                                -0.65 kg/wk
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                Losing faster than planned
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                                            <div className="text-xs font-medium text-primary">
                                                Proposed Target Adjustment
                                            </div>
                                            <div className="text-lg font-extrabold text-primary">
                                                +120 kcal/day
                                            </div>
                                            <div className="text-[11px] text-primary/80">
                                                Protects lean mass & energy
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                                        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>
                                            Your measured energy expenditure is
                                            higher than initially estimated.
                                            Increasing your daily ceiling from{' '}
                                            <strong>2,150 kcal</strong> to{' '}
                                            <strong>2,270 kcal</strong> keeps
                                            your fat loss sustainable while
                                            sparing muscle tissue.
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        {adaptiveAccepted ? (
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                                <CheckCircle2 className="h-4 w-4" />{' '}
                                                Adjustment Applied (+120 kcal
                                                updated)
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        alert(
                                                            'Proposal rejected. Target remains 2,150 kcal.',
                                                        )
                                                    }
                                                >
                                                    Keep 2,150 kcal
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-primary font-semibold text-primary-foreground"
                                                    onClick={() =>
                                                        setAdaptiveAccepted(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    Accept New Target (2,270
                                                    kcal)
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: TRENDS PREVIEW */}
                            {activeTab === 'trend' && (
                                <div className="space-y-4 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold">
                                            Weight Trend vs Raw Weigh-Ins (Last
                                            30 Days)
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-slate-400" />{' '}
                                                Daily Scale
                                            </span>
                                            <span className="flex items-center gap-1.5 font-bold text-primary">
                                                <span className="h-2 w-2 rounded-full bg-primary" />{' '}
                                                Exponential Trend (EMA)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simulated Trend SVG Chart */}
                                    <div className="relative flex h-44 w-full items-end justify-between overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
                                        <svg
                                            className="absolute inset-0 h-full w-full"
                                            preserveAspectRatio="none"
                                            viewBox="0 0 100 50"
                                        >
                                            {/* Grid lines */}
                                            <line
                                                x1="0"
                                                y1="12"
                                                x2="100"
                                                y2="12"
                                                stroke="currentColor"
                                                strokeOpacity="0.08"
                                            />
                                            <line
                                                x1="0"
                                                y1="25"
                                                x2="100"
                                                y2="25"
                                                stroke="currentColor"
                                                strokeOpacity="0.08"
                                            />
                                            <line
                                                x1="0"
                                                y1="37"
                                                x2="100"
                                                y2="37"
                                                stroke="currentColor"
                                                strokeOpacity="0.08"
                                            />

                                            {/* Raw weigh-in dots & line */}
                                            <path
                                                d="M 5,10 L 15,14 L 25,12 L 35,19 L 45,17 L 55,24 L 65,22 L 75,29 L 85,31 L 95,37"
                                                fill="none"
                                                stroke="#94a3b8"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                            />
                                            {/* Smoothed trend line */}
                                            <path
                                                d="M 5,11 Q 25,14 45,18 T 95,36"
                                                fill="none"
                                                stroke="#10b981"
                                                strokeWidth="2.5"
                                            />
                                        </svg>
                                        <div className="relative z-10 flex w-full justify-between pt-36 text-[10px] text-muted-foreground">
                                            <span>Week 1 (80.2 kg)</span>
                                            <span>Week 2 (79.5 kg)</span>
                                            <span>Week 3 (78.9 kg)</span>
                                            <span>Week 4 (78.1 kg)</span>
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-muted-foreground">
                                        Daily water weight fluctuates up to ±1.5
                                        kg. The trend line filters out noise to
                                        measure true tissue loss.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Bento Grid */}
            <section id="features" className="py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <Badge
                            variant="outline"
                            className="mb-3 border-primary/30 bg-primary/5 text-primary"
                        >
                            Engineered for Clarity
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            Everything You Need to Master Your Nutrition
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                            No gimmicks, no social media bloat. Just deep
                            nutrition intelligence, fast logging, and
                            mathematically sound coaching.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Adaptive Target Engine
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Weekly automatic check-ins calculate your
                                    real-world metabolic expenditure. Stop
                                    hitting confusing plateaus with automated,
                                    actionable calorie adjustments.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Barcode className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    3M+ Open Food Facts Catalog
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Scan packaged food barcodes directly from
                                    your phone camera or browser. Unlimited
                                    scans, verified Nutri-Scores, and full macro
                                    breakdowns included.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <Utensils className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    4 Standardized Meal Slots
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Structured Breakfast, Lunch, Dinner, and
                                    Snack logging with gram-weight serving
                                    conversions and quick-add calorie support
                                    when eating on the go.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Custom Foods & Recipe Builder
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Create private foods that are never
                                    overridden by external catalog syncs. Build
                                    multi-ingredient meal preps and calculate
                                    precise portions effortlessly.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 5 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Sub-Second Realtime Sync
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Powered by Laravel Reverb websockets and
                                    Redis Horizon queues. Log on your laptop and
                                    see the rings update immediately on your
                                    phone without refreshing.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Feature 6 */}
                        <Card className="border border-border/80 bg-card transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    Privacy First & Instant Exports
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Your personal health data stays yours.
                                    Generate structured PDF nutrition audits and
                                    CSV exports with a single click. Zero 3rd
                                    party trackers.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Interactive Nutrition & TDEE Calculator Widget */}
            <section
                id="calculator"
                className="border-t border-border bg-muted/20 py-20"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <Badge
                            variant="outline"
                            className="mb-2 border-primary/30 bg-primary/5 text-primary"
                        >
                            Interactive Tool
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Instant Scientific Macro Calculator
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                            Test the Mifflin-St Jeor formula and see your
                            personalized baseline numbers right now.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-12">
                        {/* Calculator Controls */}
                        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-7">
                            <h3 className="border-b border-border pb-3 text-base font-bold">
                                Your Baseline Parameters
                            </h3>

                            {/* Sex Selector */}
                            <div>
                                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Biological Sex
                                </label>
                                <div className="mt-1.5 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCalcSex('male')}
                                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                                            calcSex === 'male'
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCalcSex('female')}
                                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                                            calcSex === 'female'
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>

                            {/* Weight, Height, Age */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={calcWeight}
                                        onChange={(e) =>
                                            setCalcWeight(
                                                Number(e.target.value) || 60,
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={calcHeight}
                                        onChange={(e) =>
                                            setCalcHeight(
                                                Number(e.target.value) || 170,
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Age (years)
                                    </label>
                                    <input
                                        type="number"
                                        value={calcAge}
                                        onChange={(e) =>
                                            setCalcAge(
                                                Number(e.target.value) || 25,
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Activity Level */}
                            <div>
                                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Weekly Activity
                                </label>
                                <select
                                    value={calcActivity}
                                    onChange={(e) =>
                                        setCalcActivity(
                                            e.target.value as ActivityLevel,
                                        )
                                    }
                                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="sedentary">
                                        Sedentary (Desk job, little exercise)
                                    </option>
                                    <option value="lightly_active">
                                        Lightly Active (1-3 workouts / week)
                                    </option>
                                    <option value="moderately_active">
                                        Moderately Active (3-5 workouts / week)
                                    </option>
                                    <option value="very_active">
                                        Very Active (6-7 hard workouts / week)
                                    </option>
                                </select>
                            </div>

                            {/* Primary Goal & Diet */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Primary Goal
                                    </label>
                                    <select
                                        value={calcGoal}
                                        onChange={(e) =>
                                            setCalcGoal(
                                                e.target.value as GoalType,
                                            )
                                        }
                                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="cut">
                                            Fat Loss (-0.5 kg/week)
                                        </option>
                                        <option value="maintain">
                                            Maintain Current Weight
                                        </option>
                                        <option value="bulk">
                                            Muscle Gain (+0.25 kg/week)
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Diet Split
                                    </label>
                                    <select
                                        value={calcDiet}
                                        onChange={(e) =>
                                            setCalcDiet(
                                                e.target
                                                    .value as DietPreference,
                                            )
                                        }
                                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="balanced">
                                            Balanced (30P / 40C / 30F)
                                        </option>
                                        <option value="high_protein">
                                            High Protein (35P / 45C / 20F)
                                        </option>
                                        <option value="low_carb">
                                            Low Carb (40P / 20C / 40F)
                                        </option>
                                        <option value="keto">
                                            Keto (25P / 5C / 70F)
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Calculated Target Results Card */}
                        <div className="space-y-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm lg:col-span-5">
                            <div className="border-b border-primary/20 pb-4">
                                <div className="text-xs font-bold tracking-wider text-primary uppercase">
                                    Recommended Starting Target
                                </div>
                                <div className="mt-2 text-4xl font-extrabold text-foreground">
                                    {calculatorResults.targetCalories.toLocaleString()}{' '}
                                    <span className="text-base font-normal text-muted-foreground">
                                        kcal / day
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                        BMR:{' '}
                                        <strong>
                                            {calculatorResults.bmr} kcal
                                        </strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Maintenance (TDEE):{' '}
                                        <strong>
                                            {calculatorResults.tdee} kcal
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            {/* Macro Gram Breakdown */}
                            <div className="space-y-3">
                                <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Target Daily Macros
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 p-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-blue-500" />
                                            <span className="font-semibold">
                                                Protein (
                                                {
                                                    calculatorResults.split
                                                        .proteinPercent
                                                }
                                                %)
                                            </span>
                                        </div>
                                        <span className="font-mono font-extrabold text-blue-600">
                                            {calculatorResults.macros.proteinG}g
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 p-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-amber-500" />
                                            <span className="font-semibold">
                                                Carbohydrates (
                                                {
                                                    calculatorResults.split
                                                        .carbsPercent
                                                }
                                                %)
                                            </span>
                                        </div>
                                        <span className="font-mono font-extrabold text-amber-600">
                                            {calculatorResults.macros.carbsG}g
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/80 p-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-rose-500" />
                                            <span className="font-semibold">
                                                Fat (
                                                {
                                                    calculatorResults.split
                                                        .fatPercent
                                                }
                                                %)
                                            </span>
                                        </div>
                                        <span className="font-mono font-extrabold text-rose-600">
                                            {calculatorResults.macros.fatG}g
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link href={register()} className="block">
                                <Button className="w-full bg-primary py-5 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                                    Lock in this plan & start tracking
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section
                id="comparison"
                className="border-t border-border py-20 lg:py-24"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <Badge
                            variant="outline"
                            className="mb-2 border-primary/30 bg-primary/5 text-primary"
                        >
                            Honest Comparison
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Why Athletes & Trackers Switch to kcal-log
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="mx-auto w-full max-w-4xl border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-4 font-bold text-muted-foreground">
                                        Feature
                                    </th>
                                    <th className="rounded-t-xl bg-primary/5 px-4 py-4 text-center font-extrabold text-primary">
                                        kcal-log
                                    </th>
                                    <th className="px-4 py-4 text-center font-semibold text-muted-foreground">
                                        Legacy Apps (MFP / LoseIt)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                        Weekly Adaptive Target Adjustments
                                    </td>
                                    <td className="bg-primary/5 px-4 py-3.5 text-center font-bold text-primary">
                                        ✅ Automated & Mathematical
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                                        ❌ Static / None
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                        Barcode Scanner
                                    </td>
                                    <td className="bg-primary/5 px-4 py-3.5 text-center font-bold text-primary">
                                        ✅ 100% Free & Unlimited
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                                        ❌ Paywalled ($80/year)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                        Open Food Facts Integration
                                    </td>
                                    <td className="bg-primary/5 px-4 py-3.5 text-center font-bold text-primary">
                                        ✅ 3M+ Global Foods
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                                        ❌ Proprietary Lock-in
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                        Data Export (CSV & PDF)
                                    </td>
                                    <td className="bg-primary/5 px-4 py-3.5 text-center font-bold text-primary">
                                        ✅ Complete Sovereignty
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                                        ❌ Restricted
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3.5 font-medium text-foreground">
                                        Speed & Ad-Free Experience
                                    </td>
                                    <td className="bg-primary/5 px-4 py-3.5 text-center font-bold text-primary">
                                        ✅ Sub-second & Zero Ads
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-muted-foreground">
                                        ❌ Cluttered with Ads
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section
                id="faq"
                className="border-t border-border bg-muted/20 py-20"
            >
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <Badge
                            variant="outline"
                            className="mb-2 border-primary/30 bg-primary/5 text-primary"
                        >
                            Got Questions?
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="overflow-hidden rounded-xl border border-border bg-card"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenFaq(isOpen ? null : idx)
                                        }
                                        className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground transition-colors hover:bg-muted/30 sm:p-5"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="border-t border-border/40 px-4 pt-3 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-5">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className="border-t border-border py-20 lg:py-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-8 text-center text-white shadow-2xl sm:p-14">
                        {/* Decorative background circle */}
                        <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

                        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                            <Badge className="border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
                                Stop Guessing. Start Adapting.
                            </Badge>
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                                Take Control of Your Nutrition Today
                            </h2>
                            <p className="mx-auto max-w-xl text-sm text-emerald-100/80 sm:text-base">
                                Experience fast, science-backed nutrition
                                tracking with weekly metabolic recalibration and
                                zero paywalls.
                            </p>
                            <div className="pt-2">
                                <Link href={register()}>
                                    <Button
                                        size="lg"
                                        className="bg-emerald-500 px-8 py-6 text-base font-bold text-slate-950 shadow-lg transition-all hover:scale-105 hover:bg-emerald-400"
                                    >
                                        Create Your Free Account
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-background py-12 text-sm text-muted-foreground">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Flame className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-foreground">
                            {appName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Precision Nutrition.
                        </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                        <Link href={login()} className="hover:text-foreground">
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="hover:text-foreground"
                        >
                            Register
                        </Link>
                        <a
                            href="/docs/api"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground"
                        >
                            API Documentation
                        </a>
                        <a
                            href="https://github.com/DevHolako/kcal-log"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-foreground"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
