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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-amber-500" />
                                    <span className="font-bold text-lg text-foreground">
                                        {Math.round(activeTarget.calories)} kcal / day
                                    </span>
                                    <Badge variant="outline" className="capitalize text-xs">
                                        Goal: {activeTarget.goal_type}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Diet Preset: <span className="font-medium capitalize text-foreground">{activeTarget.diet_type.replace('_', ' ')}</span> &bull; Pace: {activeTarget.weekly_rate_kg > 0 ? '+' : ''}{activeTarget.weekly_rate_kg} kg/week
                                </p>
                            </div>

                            <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                                <Link href="/onboarding?recalibrate=1">
                                    <Sparkles className="h-4 w-4" />
                                    Recalibrate Nutrition Targets
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Protein</span>
                                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {Math.round(activeTarget.protein_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Carbs</span>
                                <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                                    {Math.round(activeTarget.carbs_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Fat</span>
                                <p className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                                    {Math.round(activeTarget.fat_g)} g
                                </p>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Hydration</span>
                                <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                    {Math.round(activeTarget.water_ml)} ml
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                        <div className="space-y-1">
                            <p className="font-medium text-foreground">No active targets found</p>
                            <p className="text-xs text-muted-foreground">
                                Set up your personalized nutrition baseline to calculate daily calories and macros.
                            </p>
                        </div>
                        <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
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
