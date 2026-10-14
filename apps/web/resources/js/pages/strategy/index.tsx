import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Flame,
    History,
    RefreshCw,
    Scale,
    Sparkles,
    TrendingDown,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getEcho } from '@/echo';
import AppLayout from '@/layouts/app-layout';

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
    latestAdjustment,
    activeTarget,
    history,
    weightTrends,
}: Props) {
    const { auth } = usePage().props as any;
    const [isTriggering, setIsTriggering] = useState(false);
    const [isDeciding, setIsDeciding] = useState(false);

    // Setup realtime subscription to listen for new adjustment proposals
    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`user.${userId}`);
        channel.listen('.AdaptiveAdjustmentProposed', () => {
            router.reload({ only: ['pendingAdjustment', 'latestAdjustment', 'history', 'activeTarget'] });
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
            }
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
            }
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
            }
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Adaptive Strategy', href: '/strategy' },
            ]}
        >
            <Head title="Adaptive Strategy & Checkpoints" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Heading
                                title="Adaptive Nutrition Strategy"
                                description="Automated weekly EWMA weight smoothing, metabolic energy expenditure derivation, and personalized checkpoint briefs."
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleTrigger}
                        disabled={isTriggering}
                        className="gap-2 self-start sm:self-auto shrink-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
                        {isTriggering ? 'Calculating...' : 'Recalculate Trend'}
                    </Button>
                </div>

                {/* Active Target Banner */}
                {activeTarget && (
                    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-base font-semibold">Active Target Plan</CardTitle>
                                </div>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                    Active Plan
                                </Badge>
                            </div>
                            <CardDescription>
                                Currently active caloric and macronutrient baseline targets applied to your diary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs text-muted-foreground font-medium">Daily Target</div>
                                    <div className="text-2xl font-bold mt-1 text-foreground">
                                        {Math.round(activeTarget.calories)} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs text-muted-foreground font-medium">Protein Target</div>
                                    <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                                        {Math.round(activeTarget.protein_g)} <span className="text-xs font-normal text-muted-foreground">g</span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs text-muted-foreground font-medium">Carbohydrates</div>
                                    <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                                        {Math.round(activeTarget.carbs_g)} <span className="text-xs font-normal text-muted-foreground">g</span>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <div className="text-xs text-muted-foreground font-medium">Fat Target</div>
                                    <div className="text-2xl font-bold mt-1 text-sky-600 dark:text-sky-400">
                                        {Math.round(activeTarget.fat_g)} <span className="text-xs font-normal text-muted-foreground">g</span>
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                                    <CardTitle className="text-lg font-bold">Weekly Checkpoint Brief</CardTitle>
                                    <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
                                        Decision Required
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Review Window: <span className="font-semibold text-foreground">{pendingAdjustment.period_start}</span> to{' '}
                                    <span className="font-semibold text-foreground">{pendingAdjustment.period_end}</span>
                                </div>
                            </div>
                            <CardDescription>
                                Based on your logged weight logs and daily diary intake over the past 7 days, your realized energy expenditure and target intake have been calculated.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Indicators */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="rounded-lg bg-background/80 p-3 border border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Scale className="h-3.5 w-3.5" />
                                        <span>EWMA Weight Change</span>
                                    </div>
                                    <div className="text-xl font-bold mt-1 flex items-center gap-1">
                                        {pendingAdjustment.ewma_weight_change_kg > 0 ? (
                                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                        ) : pendingAdjustment.ewma_weight_change_kg < 0 ? (
                                            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                                        ) : null}
                                        <span>
                                            {pendingAdjustment.ewma_weight_change_kg > 0 ? '+' : ''}
                                            {pendingAdjustment.ewma_weight_change_kg} kg
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        {pendingAdjustment.starting_weight_kg} kg &rarr; {pendingAdjustment.ending_weight_kg} kg
                                    </div>
                                </div>

                                <div className="rounded-lg bg-background/80 p-3 border border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span>Avg Daily Intake</span>
                                    </div>
                                    <div className="text-xl font-bold mt-1">
                                        {Math.round(pendingAdjustment.average_daily_calories)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">kcal/day</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Logged in diary</div>
                                </div>

                                <div className="rounded-lg bg-background/80 p-3 border border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Flame className="h-3.5 w-3.5 text-primary" />
                                        <span>Calculated TDEE</span>
                                    </div>
                                    <div className="text-xl font-bold mt-1 text-primary">
                                        {Math.round(pendingAdjustment.calculated_tdee)}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">kcal/day</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Realized expenditure</div>
                                </div>

                                <div className="rounded-lg bg-background/80 p-3 border border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Proposed Target</span>
                                    </div>
                                    <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                                        {pendingAdjustment.proposed_target_calories}{' '}
                                        <span className="text-xs font-normal text-muted-foreground">kcal/day</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                        Delta:{' '}
                                        {pendingAdjustment.proposed_target_calories - pendingAdjustment.current_target_calories > 0 ? '+' : ''}
                                        {pendingAdjustment.proposed_target_calories - pendingAdjustment.current_target_calories} kcal
                                    </div>
                                </div>
                            </div>

                            {/* Push-Right Comparative Plan Delta Table */}
                            <div className="rounded-xl border border-border/60 overflow-hidden bg-background/60">
                                <div className="px-4 py-2.5 bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    <span>Plan Comparison</span>
                                    <span>Current &rarr; Proposed</span>
                                </div>
                                <div className="divide-y divide-border/40 text-sm">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">Target Calories</span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-muted-foreground line-through">
                                                {pendingAdjustment.current_target_calories} kcal
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-primary font-bold">
                                                {pendingAdjustment.proposed_target_calories} kcal
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">Protein Target</span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                {Math.round(pendingAdjustment.proposed_protein_g)} g
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">Carbs Target</span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                                                {Math.round(pendingAdjustment.proposed_carbs_g)} g
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="font-medium text-foreground">Fat Target</span>
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-sky-600 dark:text-sky-400 font-bold">
                                                {Math.round(pendingAdjustment.proposed_fat_g)} g
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => handleReject(pendingAdjustment.id)}
                                disabled={isDeciding}
                                className="w-full sm:w-auto gap-2"
                            >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                Reject & Keep Current Targets
                            </Button>
                            <Button
                                onClick={() => handleAccept(pendingAdjustment.id)}
                                disabled={isDeciding}
                                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Accept & Activate Plan
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
                                <CardTitle className="text-base font-semibold">EWMA Weight Smoothing Trend</CardTitle>
                            </div>
                            <span className="text-xs text-muted-foreground">Exponentially Weighted Moving Average (&alpha; = 0.25)</span>
                        </div>
                        <CardDescription>
                            Dampens daily water weight noise to reveal true physiological fat and tissue changes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weightTrends.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                                <Scale className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium text-foreground">No weigh-ins logged yet</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                    Log your body weight in the diary to build your EWMA trend and trigger weekly adaptive adjustments.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-xs text-muted-foreground">
                                                <th className="text-left py-2 font-medium">Date</th>
                                                <th className="text-right py-2 font-medium">Recorded Weight</th>
                                                <th className="text-right py-2 font-medium">EWMA Smoothed</th>
                                                <th className="text-right py-2 font-medium">Daily Noise</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {weightTrends.slice(-10).reverse().map((point) => {
                                                const noise = point.weight_kg - point.ewma_kg;
                                                return (
                                                    <tr key={point.date} className="hover:bg-muted/30">
                                                        <td className="py-2.5 font-medium">{point.date}</td>
                                                        <td className="py-2.5 text-right font-semibold">{point.weight_kg.toFixed(2)} kg</td>
                                                        <td className="py-2.5 text-right text-primary font-bold">{point.ewma_kg.toFixed(2)} kg</td>
                                                        <td className="py-2.5 text-right text-xs">
                                                            <span
                                                                className={
                                                                    noise > 0
                                                                        ? 'text-amber-500'
                                                                        : noise < 0
                                                                        ? 'text-emerald-500'
                                                                        : 'text-muted-foreground'
                                                                }
                                                            >
                                                                {noise > 0 ? '+' : ''}
                                                                {noise.toFixed(2)} kg
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
                            <CardTitle className="text-base font-semibold">Checkpoint Decision History</CardTitle>
                        </div>
                        <CardDescription>Record of previous weekly reviews and target adjustment choices.</CardDescription>
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
                                            <th className="text-left py-2 font-medium">Review Date</th>
                                            <th className="text-left py-2 font-medium">Period</th>
                                            <th className="text-right py-2 font-medium">Trend Change</th>
                                            <th className="text-right py-2 font-medium">Realized TDEE</th>
                                            <th className="text-right py-2 font-medium">Target Shift</th>
                                            <th className="text-center py-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30">
                                                <td className="py-2.5 font-medium">{item.review_date}</td>
                                                <td className="py-2.5 text-xs text-muted-foreground">
                                                    {item.period_start} &rarr; {item.period_end}
                                                </td>
                                                <td className="py-2.5 text-right font-semibold">
                                                    {item.ewma_weight_change_kg > 0 ? '+' : ''}
                                                    {item.ewma_weight_change_kg} kg
                                                </td>
                                                <td className="py-2.5 text-right">{Math.round(item.calculated_tdee)} kcal</td>
                                                <td className="py-2.5 text-right font-medium">
                                                    {item.current_target_calories} &rarr;{' '}
                                                    <span className="font-bold text-foreground">
                                                        {item.proposed_target_calories} kcal
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-center">
                                                    {item.status === 'accepted' ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                                            Accepted
                                                        </Badge>
                                                    ) : item.status === 'rejected' ? (
                                                        <Badge variant="outline" className="text-muted-foreground text-xs">
                                                            Rejected
                                                        </Badge>
                                                    ) : item.status === 'pending' ? (
                                                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
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
        </AppLayout>
    );
}
