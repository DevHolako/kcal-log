import * as React from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
} from '@/components/ui/chart';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface MacroDataPoint {
    consumed: number;
    target: number;
    unit?: string;
}

export interface MacroDonutChartProps {
    calories: {
        consumed: number;
        target: number;
        remaining?: number;
        unit?: string;
    };
    protein: MacroDataPoint;
    carbs: MacroDataPoint;
    fat: MacroDataPoint;
    className?: string;
}

const chartConfig = {
    protein: {
        label: 'Protein',
        color: 'var(--color-macro-protein, #3b82f6)',
    },
    carbs: {
        label: 'Carbs',
        color: 'var(--color-macro-carbs, #f59e0b)',
    },
    fat: {
        label: 'Fat',
        color: 'var(--color-macro-fat, #ec4899)',
    },
} satisfies ChartConfig;

export function MacroDonutChart({
    calories,
    protein,
    carbs,
    fat,
    className,
}: MacroDonutChartProps) {
    const { t, formatNumber } = useTranslation();

    // Calculate caloric values for each macro: Protein (4 kcal/g), Carbs (4 kcal/g), Fat (9 kcal/g)
    const proteinKcal = Math.round(protein.consumed * 4);
    const carbsKcal = Math.round(carbs.consumed * 4);
    const fatKcal = Math.round(fat.consumed * 9);
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    const hasData = totalMacroKcal > 0;

    const chartData = React.useMemo(() => {
        if (!hasData) {
            if (calories.consumed > 0) {
                return [
                    {
                        key: 'calories',
                        name: t('nutrition.calories'),
                        value: calories.consumed,
                        grams: 0,
                        kcal: calories.consumed,
                        percent: 100,
                        fill: 'var(--color-primary, #6366f1)',
                    },
                ];
            }
            return [];
        }

        return [
            {
                key: 'protein',
                name: t('nutrition.protein'),
                value: proteinKcal,
                grams: protein.consumed,
                kcal: proteinKcal,
                percent: Math.round((proteinKcal / totalMacroKcal) * 100),
                fill: 'var(--color-macro-protein, #3b82f6)',
            },
            {
                key: 'carbs',
                name: t('nutrition.carbs'),
                value: carbsKcal,
                grams: carbs.consumed,
                kcal: carbsKcal,
                percent: Math.round((carbsKcal / totalMacroKcal) * 100),
                fill: 'var(--color-macro-carbs, #f59e0b)',
            },
            {
                key: 'fat',
                name: t('nutrition.fat'),
                value: fatKcal,
                grams: fat.consumed,
                kcal: fatKcal,
                percent: Math.round((fatKcal / totalMacroKcal) * 100),
                fill: 'var(--color-macro-fat, #ec4899)',
            },
        ];
    }, [
        hasData,
        calories.consumed,
        totalMacroKcal,
        proteinKcal,
        carbsKcal,
        fatKcal,
        protein.consumed,
        carbs.consumed,
        fat.consumed,
        t,
    ]);

    const remainingKcal = Math.max(0, calories.target - calories.consumed);
    const isOverTarget =
        calories.consumed > calories.target && calories.target > 0;
    const overAmount = isOverTarget ? calories.consumed - calories.target : 0;

    const renderCenterLabel = ({ viewBox }: { viewBox?: any }) => {
        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
            return (
                <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 6}
                        className="fill-foreground font-mono text-3xl font-extrabold tracking-tight md:text-4xl"
                    >
                        {formatNumber(calories.consumed)}
                    </tspan>
                    <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 18}
                        className="fill-muted-foreground text-xs font-semibold tracking-wider uppercase"
                    >
                        kcal
                    </tspan>
                </text>
            );
        }
        return null;
    };

    return (
        <div
            role="region"
            aria-label="Daily Nutrition Donut Chart"
            className={cn(
                'grid grid-cols-1 items-center gap-6 lg:grid-cols-12',
                className,
            )}
        >
            {/* Donut Chart with Center Text */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-5">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full"
                >
                    <PieChart>
                        {/* Subtle background track ring */}
                        <Pie
                            data={[{ value: 1 }]}
                            dataKey="value"
                            innerRadius={72}
                            outerRadius={96}
                            stroke="none"
                            fill="currentColor"
                            className="fill-muted/40 dark:fill-muted/20"
                            isAnimationActive={false}
                        />

                        {chartData.length > 0 && (
                            <ChartTooltip
                                cursor={false}
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length)
                                        return null;
                                    const item = payload[0].payload;

                                    return (
                                        <div className="rounded-lg border border-border/60 bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.fill,
                                                    }}
                                                />
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="mt-1 space-y-0.5 text-muted-foreground">
                                                <div>
                                                    <strong className="text-foreground">
                                                        {formatNumber(
                                                            item.grams,
                                                        )}
                                                        g
                                                    </strong>{' '}
                                                    ({formatNumber(item.kcal)}{' '}
                                                    kcal)
                                                </div>
                                                <div className="font-mono text-[10px] text-muted-foreground/80">
                                                    {item.percent}% of
                                                    macronutrient calories
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}

                        {chartData.length > 0 ? (
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={72}
                                outerRadius={96}
                                strokeWidth={3}
                                stroke="var(--color-card, #ffffff)"
                                paddingAngle={chartData.length > 1 ? 3 : 0}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={entry.key} fill={entry.fill} />
                                ))}
                                <Label content={renderCenterLabel} />
                            </Pie>
                        ) : (
                            <Pie
                                data={[{ value: 1 }]}
                                dataKey="value"
                                innerRadius={72}
                                outerRadius={96}
                                stroke="none"
                                fill="transparent"
                                isAnimationActive={false}
                            >
                                <Label content={renderCenterLabel} />
                            </Pie>
                        )}
                    </PieChart>
                </ChartContainer>

                {/* Subtitle status badge */}
                <div className="mt-2 text-center text-xs">
                    {isOverTarget ? (
                        <span className="font-semibold text-rose-500">
                            +{formatNumber(overAmount)} kcal over target
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            <strong className="text-foreground">
                                {formatNumber(remainingKcal)}
                            </strong>{' '}
                            kcal remaining
                            {calories.target > 0 &&
                                ` of ${formatNumber(calories.target)} goal`}
                        </span>
                    )}
                </div>
            </div>

            {/* Macro Breakdown Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-7">
                {/* Protein Card */}
                <div className="flex flex-col justify-between rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3.5 transition-colors hover:border-blue-500/35">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            {t('nutrition.protein')}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-muted-foreground">
                            {protein.target > 0
                                ? `${Math.round((protein.consumed / protein.target) * 100)}%`
                                : '—'}
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="font-mono text-lg font-bold text-foreground">
                            {formatNumber(protein.consumed)}g
                        </span>
                        <span className="text-xs text-muted-foreground">
                            / {formatNumber(protein.target)}g
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-500/15">
                        <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, protein.target > 0 ? (protein.consumed / protein.target) * 100 : 0)}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Carbs Card */}
                <div className="flex flex-col justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5 transition-colors hover:border-amber-500/35">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            {t('nutrition.carbs')}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-muted-foreground">
                            {carbs.target > 0
                                ? `${Math.round((carbs.consumed / carbs.target) * 100)}%`
                                : '—'}
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="font-mono text-lg font-bold text-foreground">
                            {formatNumber(carbs.consumed)}g
                        </span>
                        <span className="text-xs text-muted-foreground">
                            / {formatNumber(carbs.target)}g
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-500/15">
                        <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, carbs.target > 0 ? (carbs.consumed / carbs.target) * 100 : 0)}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Fat Card */}
                <div className="flex flex-col justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3.5 transition-colors hover:border-rose-500/35">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            {t('nutrition.fat')}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-muted-foreground">
                            {fat.target > 0
                                ? `${Math.round((fat.consumed / fat.target) * 100)}%`
                                : '—'}
                        </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                        <span className="font-mono text-lg font-bold text-foreground">
                            {formatNumber(fat.consumed)}g
                        </span>
                        <span className="text-xs text-muted-foreground">
                            / {formatNumber(fat.target)}g
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rose-500/15">
                        <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, fat.target > 0 ? (fat.consumed / fat.target) * 100 : 0)}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MacroDonutChart;
