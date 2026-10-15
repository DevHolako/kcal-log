import { Link } from '@inertiajs/react';
import { Flame, Sparkles, Utensils } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface TargetProfileSummary {
    id: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    water_ml: number;
    bmr: number | null;
    tdee: number | null;
    goal_type: string;
    weekly_rate_kg: number;
    diet_type: string;
}

export interface UserProfileSummary {
    id: number;
    date_of_birth: string;
    sex: string;
    height_cm: number;
    activity_level: string;
}

interface Props {
    activeTarget?: TargetProfileSummary | null;
    userProfile?: UserProfileSummary | null;
}

export default function NutritionSettings({ activeTarget }: Props) {
    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Nutrition Setup & Targets"
                description="Re-run the setup wizard anytime to recalibrate your daily caloric baseline and macronutrient split based on updated body weight, activity level, or goals."
            />

            <div className="space-y-4 rounded-xl border border-slate-200 bg-card p-5 shadow-xs dark:border-slate-800">
                {activeTarget ? (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 border-b border-border/50 pb-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-amber-500" />
                                    <span className="text-lg font-bold text-foreground">
                                        {Math.round(activeTarget.calories)} kcal
                                        / day
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs capitalize"
                                    >
                                        Goal: {activeTarget.goal_type}
                                    </Badge>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Diet Preset:{' '}
                                    <span className="font-medium text-foreground capitalize">
                                        {activeTarget.diet_type.replace(
                                            '_',
                                            ' ',
                                        )}
                                    </span>{' '}
                                    &bull; Pace:{' '}
                                    {activeTarget.weekly_rate_kg > 0 ? '+' : ''}
                                    {activeTarget.weekly_rate_kg} kg/week
                                </p>
                            </div>

                            <Button
                                asChild
                                className="gap-2 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                            >
                                <Link href="/onboarding?recalibrate=1">
                                    <Sparkles className="h-4 w-4" />
                                    Recalibrate Nutrition Targets
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Protein
                                </span>
                                <p className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {Math.round(activeTarget.protein_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Carbs
                                </span>
                                <p className="mt-0.5 text-base font-bold text-amber-600 dark:text-amber-400">
                                    {Math.round(activeTarget.carbs_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Fat
                                </span>
                                <p className="mt-0.5 text-base font-bold text-sky-600 dark:text-sky-400">
                                    {Math.round(activeTarget.fat_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Hydration
                                </span>
                                <p className="mt-0.5 text-base font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(activeTarget.water_ml)} ml
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
                        <div className="space-y-1">
                            <p className="font-medium text-foreground">
                                No active targets found
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Set up your personalized nutrition baseline to
                                calculate daily calories and macros.
                            </p>
                        </div>
                        <Button
                            asChild
                            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <Link href="/onboarding?recalibrate=1">
                                <Utensils className="h-4 w-4" />
                                Start Nutrition Setup
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
