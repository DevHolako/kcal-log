import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Brain,
    Calculator,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Flame,
    History,
    Info,
    RefreshCw,
    Scale,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WeightTrendChart from '@/components/weight-trend-chart';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getEcho } from '@/echo';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';

interface TargetProfile {
    id: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number | null;
    water_ml: number | null;
    activity_level: string;
    goal_type: string;
    weekly_rate_kg: number;
    is_active: boolean;
}

interface AdaptiveAdjustment {
    id: number;
    review_date: string;
    period_start: string;
    period_end: string;
    starting_weight_kg: number;
    ending_weight_kg: number;
    ewma_weight_change_kg: number;
    average_daily_calories: number;
    calculated_tdee: number;
    current_target_calories: number;
    proposed_target_calories: number;
    proposed_protein_g: number;
    proposed_carbs_g: number;
    proposed_fat_g: number;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    user_decision_at: string | null;
    applied_target_profile_id: number | null;
    created_at: string;
}

interface WeightTrendPoint {
    date: string;
    weight_kg: number;
    ewma_kg: number;
}

interface Props {
    pendingAdjustment: AdaptiveAdjustment | null;
    latestAdjustment: AdaptiveAdjustment | null;
    activeTarget: TargetProfile | null;
    history: AdaptiveAdjustment[];
    weightTrends: WeightTrendPoint[];
}

export default function StrategyIndex({
    pendingAdjustment,
    latestAdjustment: _latestAdjustment,
    activeTarget,
    history,
    weightTrends,
}: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const [isTriggering, setIsTriggering] = useState(false);
    const [isDeciding, setIsDeciding] = useState(false);
    const [showMathExplainer, setShowMathExplainer] = useState(false);

    // Setup realtime subscription to listen for new adjustment proposals
    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`user.${userId}`);
        channel.listen('.AdaptiveAdjustmentProposed', () => {
            router.reload({
                only: [
                    'pendingAdjustment',
                    'latestAdjustment',
                    'history',
                    'activeTarget',
                ],
            });
        });

        return () => {
            channel.stopListening('.AdaptiveAdjustmentProposed');
        };
    }, [auth?.user?.id]);

    const handleTrigger = () => {
        setIsTriggering(true);
        router.post(
            '/strategy/trigger',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsTriggering(false),
            },
        );
    };

    const handleAccept = (adjustmentId: number) => {
        setIsDeciding(true);
        router.post(
            `/strategy/${adjustmentId}/accept`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsDeciding(false),
            },
        );
    };

    const handleReject = (adjustmentId: number) => {
        setIsDeciding(true);
        router.post(
            `/strategy/${adjustmentId}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsDeciding(false),
            },
        );
    };

    return (
        <>
            <Head title={`${t('strategy.title')} - kcal-log`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Heading
                                title={t('strategy.title')}
                                description={t('strategy.subtitle')}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setShowMathExplainer(!showMathExplainer)
                            }
                            className="gap-2 text-xs"
                        >
                            <Brain className="h-4 w-4 text-emerald-600" />
                            {showMathExplainer
                                ? t('strategy.hide_logic')
                                : t('strategy.how_it_works')}
                            {showMathExplainer ? (
                                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleTrigger}
                            disabled={isTriggering}
                            className="shrink-0 gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`}
                            />
                            {isTriggering
                                ? t('action.calculating')
                                : t('action.recalculate')}
                        </Button>
                    </div>
                </div>

                {/* Initial Calibration Mode Alert */}
                {weightTrends.length < 4 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-800 dark:text-amber-200">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div>
                            <span className="font-bold">
                                Initial Calibration Phase ({weightTrends.length}
                                /4 weigh-ins):
                            </span>{' '}
                            The adaptive engine requires a minimum of 4 weight
                            logs across a 7-day period to establish
                            high-confidence EWMA smoothed baselines. Target
                            proposals are clamped with conservative bounds until
                            baseline calibration is reached.
                        </div>
                    </div>
                )}

                {/* Mathematical Engine & Metabolic Model Explainer Card */}
                {showMathExplainer && (
                    <Card className="border-border/80 bg-muted/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-emerald-600" />
                                <CardTitle className="text-base font-bold">
                                    Adaptive Metabolic Engine Architecture
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Transparent, peer-reviewed metabolic tracking
                                using Exponentially Weighted Moving Averages
                                (EWMA) and dynamic energy expenditure modeling.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Component 1: EWMA */}
                                <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3.5">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                        <Scale className="h-4 w-4 text-primary" />
                                        <span>1. EWMA Weight Smoothing</span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Scale weight fluctuates by
                                        &plusmn;1&ndash;2.5 kg daily due to
                                        sodium, glycogen hydration, and
                                        digestive waste. We apply an exponential
                                        smoothing coefficient of &alpha; = 0.25:
                                    </p>
                                    <div className="rounded bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                                        EWMA_t = 0.25 &times; W_t + 0.75 &times;
                                        EWMA_(t-1)
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Dampens transient water spikes to reveal
                                        genuine physiological tissue change over
                                        rolling 7-day windows.
                                    </p>
                                </div>

                                {/* Component 2: TDEE */}
                                <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3.5">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                        <Flame className="h-4 w-4 text-amber-500" />
                                        <span>
                                            2. Empirical TDEE Derivation
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Instead of static estimations
                                        (Mifflin-St Jeor), your actual Total
                                        Daily Energy Expenditure is derived from
                                        empirical intake and trend mass delta:
                                    </p>
                                    <div className="rounded bg-muted/60 p-2 font-mono text-[11px] text-foreground">
                                        TDEE = Avg_Intake - ((&Delta;EWMA
                                        &times; 7700) / 7)
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        7,700 kcal represents the standardized
                                        metabolic caloric density of 1 kg of
                                        adipose tissue.
                                    </p>
                                </div>

                                {/* Component 3: Safety Guardrails */}
                                <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3.5">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                        <span>
                                            3. Deficit Clamping & Floors
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground">
                                        Algorithms can overreact to anomalous
                                        weeks. The coach enforces strict medical
                                        safety boundaries:
                                    </p>
                                    <ul className="list-disc space-y-1 pl-4 text-[11px] text-muted-foreground">
                                        <li>
                                            Max weekly rate adjustment clamped
                                            to &plusmn;1.0 kg/wk (&le; 500 kcal
                                            shift).
                                        </li>
                                        <li>
                                            Metabolic calorie floors: 1,200
                                            kcal/day (female), 1,500 kcal/day
                                            (male).
                                        </li>
                                        <li>
                                            Human-in-the-loop: proposals require
                                            explicit user confirmation.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Active Target Banner */}
                {activeTarget && (
                    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Active Target Plan
                                    </CardTitle>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                >
                                    Active Plan
                                </Badge>
                            </div>
                            <CardDescription>
                                Currently active caloric and macronutrient
                                baseline targets applied to your diary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Daily Target
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-foreground">
                                        {Math.round(activeTarget.calories)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            kcal
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Protein Target
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {Math.round(activeTarget.protein_g)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            g
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Carbohydrates
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {Math.round(activeTarget.carbs_g)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            g
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Fat Target
                                    </div>
                                    <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                                        {Math.round(activeTarget.fat_g)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            g
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Checkpoint Proposal Card (Push-Right Design) */}
                {pendingAdjustment && (
                    <Card className="border-primary/40 bg-primary/5 shadow-md">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 animate-pulse text-amber-500" />
                                    <CardTitle className="text-lg font-bold">
                                        {t('strategy.weekly_brief_title')}
                                    </CardTitle>
                                    <Badge className="border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                        {t('status.decision_required')}
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Review Window:{' '}
                                    <span className="font-semibold text-foreground">
                                        {formatDate(
                                            pendingAdjustment.period_start,
                                        )}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-semibold text-foreground">
                                        {formatDate(
                                            pendingAdjustment.period_end,
                                        )}
                                    </span>
                                </div>
                            </div>
                            <CardDescription>
                                Based on your logged weight logs and daily diary
                                intake over the past 7 days, your realized
                                energy expenditure and target intake have been
                                calculated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Indicators */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Scale className="h-3.5 w-3.5" />
                                        <span>EWMA Weight Change</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1 text-xl font-bold">
                                        {pendingAdjustment.ewma_weight_change_kg >
                                        0 ? (
                                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                        ) : pendingAdjustment.ewma_weight_change_kg <
                                          0 ? (
                                            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                                        ) : null}
                                        <span>
                                            {pendingAdjustment.ewma_weight_change_kg >
                                            0
                                                ? '+'
                                                : ''}
                                            {
                                                pendingAdjustment.ewma_weight_change_kg
                                            }{' '}
                                            kg
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        {pendingAdjustment.starting_weight_kg}{' '}
                                        kg &rarr;{' '}
                                        {pendingAdjustment.ending_weight_kg} kg
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span>Avg Daily Intake</span>
                                    </div>
                                    <div className="mt-1 text-xl font-bold">
                                        {Math.round(
                                            pendingAdjustment.average_daily_calories,
                                        )}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            kcal/day
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        Logged in diary
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Flame className="h-3.5 w-3.5 text-primary" />
                                        <span>Calculated TDEE</span>
                                    </div>
                                    <div className="mt-1 text-xl font-bold text-primary">
                                        {Math.round(
                                            pendingAdjustment.calculated_tdee,
                                        )}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            kcal/day
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        Realized expenditure
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Proposed Target</span>
                                    </div>
                                    <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {
                                            pendingAdjustment.proposed_target_calories
                                        }{' '}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            kcal/day
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        Delta:{' '}
                                        {pendingAdjustment.proposed_target_calories -
                                            pendingAdjustment.current_target_calories >
                                        0
                                            ? '+'
                                            : ''}
                                        {pendingAdjustment.proposed_target_calories -
                                            pendingAdjustment.current_target_calories}{' '}
                                        kcal
                                    </div>
                                </div>
                            </div>

                            {/* Push-Right Comparative Plan Delta Table */}
                            <div
                                data-testid="plan-comparison"
                                className="overflow-hidden rounded-xl border border-border/60 bg-background/60"
                            >
                                <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    <span>Plan Comparison</span>
                                    <span>Current &rarr; Proposed</span>
                                </div>
                                <div className="divide-y divide-border/40 text-sm">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">
                                            Target Calories
                                        </span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-muted-foreground line-through">
                                                {
                                                    pendingAdjustment.current_target_calories
                                                }{' '}
                                                kcal
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-bold text-primary">
                                                {
                                                    pendingAdjustment.proposed_target_calories
                                                }{' '}
                                                kcal
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">
                                            Protein Target
                                        </span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            {activeTarget && (
                                                <>
                                                    <span className="text-muted-foreground line-through">
                                                        {Math.round(
                                                            activeTarget.protein_g,
                                                        )}{' '}
                                                        g
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </>
                                            )}
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                {Math.round(
                                                    pendingAdjustment.proposed_protein_g,
                                                )}{' '}
                                                g
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">
                                            Carbs Target
                                        </span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            {activeTarget && (
                                                <>
                                                    <span className="text-muted-foreground line-through">
                                                        {Math.round(
                                                            activeTarget.carbs_g,
                                                        )}{' '}
                                                        g
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </>
                                            )}
                                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                                {Math.round(
                                                    pendingAdjustment.proposed_carbs_g,
                                                )}{' '}
                                                g
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">
                                            Fat Target
                                        </span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            {activeTarget && (
                                                <>
                                                    <span className="text-muted-foreground line-through">
                                                        {Math.round(
                                                            activeTarget.fat_g,
                                                        )}{' '}
                                                        g
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                </>
                                            )}
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                {Math.round(
                                                    pendingAdjustment.proposed_fat_g,
                                                )}{' '}
                                                g
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-center justify-end gap-3 pt-2 sm:flex-row">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    handleReject(pendingAdjustment.id)
                                }
                                disabled={isDeciding}
                                className="w-full gap-2 sm:w-auto"
                            >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                {t('action.reject_plan')}
                            </Button>
                            <Button
                                onClick={() =>
                                    handleAccept(pendingAdjustment.id)
                                }
                                disabled={isDeciding}
                                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {t('action.accept_plan')}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Weight Trend Visualization */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <CardTitle className="text-base font-semibold">
                                    {t('strategy.ewma_chart_title')}
                                </CardTitle>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Exponentially Weighted Moving Average (&alpha; =
                                0.25)
                            </span>
                        </div>
                        <CardDescription>
                            Dampens daily water weight noise to reveal true
                            physiological fat and tissue changes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weightTrends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                <Scale className="mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">
                                    No weigh-ins logged yet
                                </p>
                                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                    Log your body weight in the diary to build
                                    your EWMA trend and trigger weekly adaptive
                                    adjustments.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <WeightTrendChart
                                    data={weightTrends.map((p) => ({
                                        date: p.date,
                                        rawWeightKg: p.weight_kg,
                                        trendWeightKg: p.ewma_kg,
                                    }))}
                                    unit="kg"
                                />

                                <div className="overflow-x-auto border-t border-border/50 pt-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-xs text-muted-foreground">
                                                <th className="py-2 text-left font-medium">
                                                    Date
                                                </th>
                                                <th className="py-2 text-right font-medium">
                                                    Recorded Weight
                                                </th>
                                                <th className="py-2 text-right font-medium">
                                                    EWMA Smoothed
                                                </th>
                                                <th className="py-2 text-right font-medium">
                                                    Daily Noise
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {weightTrends
                                                .slice(-10)
                                                .reverse()
                                                .map((point) => {
                                                    const noise =
                                                        point.weight_kg -
                                                        point.ewma_kg;
                                                    return (
                                                        <tr
                                                            key={point.date}
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <td className="py-2.5 font-medium">
                                                                {formatDate(
                                                                    point.date,
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 text-right font-semibold">
                                                                {point.weight_kg.toFixed(
                                                                    2,
                                                                )}{' '}
                                                                kg
                                                            </td>
                                                            <td className="py-2.5 text-right font-bold text-primary">
                                                                {point.ewma_kg.toFixed(
                                                                    2,
                                                                )}{' '}
                                                                kg
                                                            </td>
                                                            <td className="py-2.5 text-right text-xs">
                                                                <span
                                                                    className={
                                                                        noise >
                                                                        0
                                                                            ? 'text-amber-500'
                                                                            : noise <
                                                                                0
                                                                              ? 'text-emerald-500'
                                                                              : 'text-muted-foreground'
                                                                    }
                                                                >
                                                                    {noise > 0
                                                                        ? '+'
                                                                        : ''}
                                                                    {noise.toFixed(
                                                                        2,
                                                                    )}{' '}
                                                                    kg
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Adjustment History Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base font-semibold">
                                Checkpoint Decision History
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Record of previous weekly reviews and target
                            adjustment choices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No adjustments recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th className="py-2 text-left font-medium">
                                                Review Date
                                            </th>
                                            <th className="py-2 text-left font-medium">
                                                Period
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Trend Change
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Realized TDEE
                                            </th>
                                            <th className="py-2 text-right font-medium">
                                                Target Shift
                                            </th>
                                            <th className="py-2 text-center font-medium">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {history.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="py-2.5 font-medium">
                                                    {formatDate(
                                                        item.review_date,
                                                    )}
                                                </td>
                                                <td className="py-2.5 text-xs text-muted-foreground">
                                                    {formatDate(
                                                        item.period_start,
                                                    )}{' '}
                                                    &rarr;{' '}
                                                    {formatDate(
                                                        item.period_end,
                                                    )}
                                                </td>
                                                <td className="py-2.5 text-right font-semibold">
                                                    {item.ewma_weight_change_kg >
                                                    0
                                                        ? '+'
                                                        : ''}
                                                    {item.ewma_weight_change_kg}{' '}
                                                    kg
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    {Math.round(
                                                        item.calculated_tdee,
                                                    )}{' '}
                                                    kcal
                                                </td>
                                                <td className="py-2.5 text-right font-medium">
                                                    {
                                                        item.current_target_calories
                                                    }{' '}
                                                    &rarr;{' '}
                                                    <span className="font-bold text-foreground">
                                                        {
                                                            item.proposed_target_calories
                                                        }{' '}
                                                        kcal
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-center">
                                                    {item.status ===
                                                    'accepted' ? (
                                                        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600">
                                                            Accepted
                                                        </Badge>
                                                    ) : item.status ===
                                                      'rejected' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            Rejected
                                                        </Badge>
                                                    ) : item.status ===
                                                      'pending' ? (
                                                        <Badge className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-600">
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StrategyIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Adaptive Strategy',
            href: '/strategy',
        },
    ],
};
