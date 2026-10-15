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

    // Target macro calories and ratios
    const targetProteinKcal = Math.round(protein.target * 4);
    const targetCarbsKcal = Math.round(carbs.target * 4);
    const targetFatKcal = Math.round(fat.target * 9);
    const totalTargetMacroKcal =
        targetProteinKcal + targetCarbsKcal + targetFatKcal;

    const targetProteinPct =
        totalTargetMacroKcal > 0
            ? Math.round((targetProteinKcal / totalTargetMacroKcal) * 100)
            : 30;
    const targetCarbsPct =
        totalTargetMacroKcal > 0
            ? Math.round((targetCarbsKcal / totalTargetMacroKcal) * 100)
            : 45;
    const targetFatPct = Math.max(0, 100 - targetProteinPct - targetCarbsPct);

    const activeProteinPct =
        totalMacroKcal > 0
            ? Math.round((proteinKcal / totalMacroKcal) * 100)
            : targetProteinPct;
    const activeCarbsPct =
        totalMacroKcal > 0
            ? Math.round((carbsKcal / totalMacroKcal) * 100)
            : targetCarbsPct;
    const activeFatPct =
        totalMacroKcal > 0
            ? Math.max(0, 100 - activeProteinPct - activeCarbsPct)
            : targetFatPct;

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
                'grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12',
                className,
            )}
        >
            {/* Left Energy Visualizer (Donut Chart & Key Energy Stats) */}
            <div className="flex flex-col items-center justify-between gap-3 lg:col-span-5">
                <div className="relative flex w-full flex-col items-center justify-center">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[210px] w-full"
                    >
                        <PieChart>
                            {/* Subtle background track ring */}
                            <Pie
                                data={[{ value: 1 }]}
                                dataKey="value"
                                innerRadius={70}
                                outerRadius={92}
                                stroke="none"
                                fill="currentColor"
                                className="fill-muted/30 dark:fill-muted/20"
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
                                                        (
                                                        {formatNumber(
                                                            item.kcal,
                                                        )}{' '}
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
                                    innerRadius={70}
                                    outerRadius={92}
                                    strokeWidth={3}
                                    stroke="var(--color-card, #ffffff)"
                                    paddingAngle={chartData.length > 1 ? 3 : 0}
                                >
                                    {chartData.map((entry) => (
                                        <Cell
                                            key={entry.key}
                                            fill={entry.fill}
                                        />
                                    ))}
                                    <Label content={renderCenterLabel} />
                                </Pie>
                            ) : (
                                <Pie
                                    data={[{ value: 1 }]}
                                    dataKey="value"
                                    innerRadius={70}
                                    outerRadius={92}
                                    stroke="none"
                                    fill="transparent"
                                    isAnimationActive={false}
                                >
                                    <Label content={renderCenterLabel} />
                                </Pie>
                            )}
                        </PieChart>
                    </ChartContainer>
                </div>

                {/* Energy Telemetry 3-Part Metric Card */}
                <div className="grid w-full grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/25 p-2.5 text-center text-xs">
                    <div>
                        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Consumed
                        </div>
                        <div className="font-mono text-sm font-bold text-foreground">
                            {formatNumber(calories.consumed)}{' '}
                            <span className="text-[10px] font-normal text-muted-foreground">
                                kcal
                            </span>
                        </div>
                    </div>
                    <div className="border-x border-border/50">
                        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Goal
                        </div>
                        <div className="font-mono text-sm font-bold text-foreground">
                            {formatNumber(calories.target)}{' '}
                            <span className="text-[10px] font-normal text-muted-foreground">
                                kcal
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            {isOverTarget ? 'Surplus' : 'Remaining'}
                        </div>
                        <div
                            className={cn(
                                'font-mono text-sm font-bold',
                                isOverTarget ? 'text-rose-500' : 'text-primary',
                            )}
                        >
                            {isOverTarget
                                ? `+${formatNumber(overAmount)}`
                                : formatNumber(remainingKcal)}{' '}
                            <span className="text-[10px] font-normal text-muted-foreground">
                                kcal
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Macro Breakdown Cards & Energy Distribution Bar */}
            <div className="flex flex-col justify-between gap-3.5 lg:col-span-7">
                {/* 3 Macro Cards (Protein, Carbs, Fat) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Protein Card */}
                    <div
                        className="flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all hover:scale-[1.01]"
                        style={{
                            borderColor:
                                'color-mix(in srgb, var(--color-macro-protein, #3b82f6) 28%, transparent)',
                            backgroundColor:
                                'color-mix(in srgb, var(--color-macro-protein, #3b82f6) 5%, transparent)',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="flex items-center gap-1.5 text-xs font-bold"
                                style={{
                                    color: 'var(--color-macro-protein, #3b82f6)',
                                }}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-protein, #3b82f6)',
                                        boxShadow:
                                            '0 0 6px var(--color-macro-protein, #3b82f6)',
                                    }}
                                />
                                {t('nutrition.protein')}
                            </span>
                            <span
                                className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold"
                                style={{
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-macro-protein, #3b82f6) 16%, transparent)',
                                    color: 'var(--color-macro-protein, #3b82f6)',
                                }}
                            >
                                {protein.target > 0
                                    ? `${Math.round((protein.consumed / protein.target) * 100)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="font-mono text-xl font-extrabold text-foreground">
                                {formatNumber(protein.consumed)}g
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                                / {formatNumber(protein.target)}g
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{formatNumber(proteinKcal)} kcal</span>
                            <span className="font-mono text-[10px]">
                                {targetProteinKcal} kcal goal
                            </span>
                        </div>
                        <div
                            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
                            style={{
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-macro-protein, #3b82f6) 18%, transparent)',
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    backgroundColor:
                                        'var(--color-macro-protein, #3b82f6)',
                                    width: `${Math.min(100, protein.target > 0 ? (protein.consumed / protein.target) * 100 : 0)}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Carbs Card */}
                    <div
                        className="flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all hover:scale-[1.01]"
                        style={{
                            borderColor:
                                'color-mix(in srgb, var(--color-macro-carbs, #f59e0b) 28%, transparent)',
                            backgroundColor:
                                'color-mix(in srgb, var(--color-macro-carbs, #f59e0b) 5%, transparent)',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="flex items-center gap-1.5 text-xs font-bold"
                                style={{
                                    color: 'var(--color-macro-carbs, #f59e0b)',
                                }}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-carbs, #f59e0b)',
                                        boxShadow:
                                            '0 0 6px var(--color-macro-carbs, #f59e0b)',
                                    }}
                                />
                                {t('nutrition.carbs')}
                            </span>
                            <span
                                className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold"
                                style={{
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-macro-carbs, #f59e0b) 16%, transparent)',
                                    color: 'var(--color-macro-carbs, #f59e0b)',
                                }}
                            >
                                {carbs.target > 0
                                    ? `${Math.round((carbs.consumed / carbs.target) * 100)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="font-mono text-xl font-extrabold text-foreground">
                                {formatNumber(carbs.consumed)}g
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                                / {formatNumber(carbs.target)}g
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{formatNumber(carbsKcal)} kcal</span>
                            <span className="font-mono text-[10px]">
                                {targetCarbsKcal} kcal goal
                            </span>
                        </div>
                        <div
                            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
                            style={{
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-macro-carbs, #f59e0b) 18%, transparent)',
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    backgroundColor:
                                        'var(--color-macro-carbs, #f59e0b)',
                                    width: `${Math.min(100, carbs.target > 0 ? (carbs.consumed / carbs.target) * 100 : 0)}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Fat Card */}
                    <div
                        className="flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all hover:scale-[1.01]"
                        style={{
                            borderColor:
                                'color-mix(in srgb, var(--color-macro-fat, #ec4899) 28%, transparent)',
                            backgroundColor:
                                'color-mix(in srgb, var(--color-macro-fat, #ec4899) 5%, transparent)',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="flex items-center gap-1.5 text-xs font-bold"
                                style={{
                                    color: 'var(--color-macro-fat, #ec4899)',
                                }}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-fat, #ec4899)',
                                        boxShadow:
                                            '0 0 6px var(--color-macro-fat, #ec4899)',
                                    }}
                                />
                                {t('nutrition.fat')}
                            </span>
                            <span
                                className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold"
                                style={{
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-macro-fat, #ec4899) 16%, transparent)',
                                    color: 'var(--color-macro-fat, #ec4899)',
                                }}
                            >
                                {fat.target > 0
                                    ? `${Math.round((fat.consumed / fat.target) * 100)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="font-mono text-xl font-extrabold text-foreground">
                                {formatNumber(fat.consumed)}g
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                                / {formatNumber(fat.target)}g
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{formatNumber(fatKcal)} kcal</span>
                            <span className="font-mono text-[10px]">
                                {targetFatKcal} kcal goal
                            </span>
                        </div>
                        <div
                            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
                            style={{
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-macro-fat, #ec4899) 18%, transparent)',
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    backgroundColor:
                                        'var(--color-macro-fat, #ec4899)',
                                    width: `${Math.min(100, fat.target > 0 ? (fat.consumed / fat.target) * 100 : 0)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Macro Caloric Energy Ratio Bar */}
                <div className="rounded-xl border border-border/60 bg-muted/25 p-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>
                            {hasData
                                ? 'Energy Intake Distribution'
                                : 'Planned Target Energy Ratio'}
                        </span>
                        <div className="flex items-center gap-3 font-mono text-[10px]">
                            <span className="flex items-center gap-1">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-protein, #3b82f6)',
                                    }}
                                />
                                P: {activeProteinPct}%
                            </span>
                            <span className="flex items-center gap-1">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-carbs, #f59e0b)',
                                    }}
                                />
                                C: {activeCarbsPct}%
                            </span>
                            <span className="flex items-center gap-1">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            'var(--color-macro-fat, #ec4899)',
                                    }}
                                />
                                F: {activeFatPct}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                            style={{
                                width: `${activeProteinPct}%`,
                                backgroundColor:
                                    'var(--color-macro-protein, #3b82f6)',
                            }}
                            className="h-full transition-all duration-500"
                            title={`Protein: ${activeProteinPct}%`}
                        />
                        <div
                            style={{
                                width: `${activeCarbsPct}%`,
                                backgroundColor:
                                    'var(--color-macro-carbs, #f59e0b)',
                            }}
                            className="h-full transition-all duration-500"
                            title={`Carbohydrates: ${activeCarbsPct}%`}
                        />
                        <div
                            style={{
                                width: `${activeFatPct}%`,
                                backgroundColor:
                                    'var(--color-macro-fat, #ec4899)',
                            }}
                            className="h-full transition-all duration-500"
                            title={`Fat: ${activeFatPct}%`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MacroDonutChart;
