import * as React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
} from '@/components/ui/chart';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface DailyIntakeItem {
    date: string;
    day: string; // "Mon", "Tue"...
    calories: number;
    target: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

export interface WeeklyIntakeBarChartProps {
    data: DailyIntakeItem[];
    selectedDate?: string;
    onSelectDate?: (date: string) => void;
    className?: string;
}

const chartConfig = {
    calories: {
        label: 'Calories',
        color: 'var(--color-primary, #6366f1)',
    },
    target: {
        label: 'Daily Target',
        color: 'var(--color-muted-foreground, #71717a)',
    },
} satisfies ChartConfig;

export function WeeklyIntakeBarChart({
    data,
    selectedDate,
    onSelectDate,
    className,
}: WeeklyIntakeBarChartProps) {
    const { formatNumber } = useTranslation();

    // Compute weekly metrics
    const loggedDays = data.filter((d) => d.calories > 0);
    const totalWeeklyCalories = loggedDays.reduce(
        (acc, curr) => acc + curr.calories,
        0,
    );
    const avgDailyCalories =
        loggedDays.length > 0
            ? Math.round(totalWeeklyCalories / loggedDays.length)
            : 0;
    const targetCalories = data[0]?.target || 2000;

    const daysOnTarget = data.filter((d) => {
        if (d.calories === 0) return false;
        // On target if within 10% tolerance or under target
        return d.calories <= d.target * 1.05;
    }).length;

    return (
        <Card
            className={cn(
                'overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs',
                className,
            )}
        >
            <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-base font-bold tracking-tight">
                        7-Day Energy Intake
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Daily calorie consumption vs. your active nutrition
                        target
                    </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1">
                        <span className="text-muted-foreground">
                            Daily Avg:
                        </span>
                        <strong className="font-mono text-foreground">
                            {formatNumber(avgDailyCalories)} kcal
                        </strong>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1">
                        <span className="text-muted-foreground">Target:</span>
                        <strong className="font-mono text-primary">
                            {formatNumber(targetCalories)} kcal
                        </strong>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[200px] w-full"
                >
                    <BarChart
                        data={data}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                        onClick={(state: any) => {
                            if (
                                state?.activePayload &&
                                state.activePayload.length > 0
                            ) {
                                const clickedItem = state.activePayload[0]
                                    .payload as DailyIntakeItem;
                                if (clickedItem?.date && onSelectDate) {
                                    onSelectDate(clickedItem.date);
                                }
                            }
                        }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="var(--color-border, rgba(150, 150, 150, 0.2))"
                        />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: 'var(--color-muted-foreground)',
                                fontSize: 11,
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: 'var(--color-muted-foreground)',
                                fontSize: 11,
                            }}
                            domain={[
                                0,
                                (dataMax: number) =>
                                    Math.max(
                                        Math.ceil((dataMax || 2000) * 1.15),
                                        targetCalories * 1.15,
                                    ),
                            ]}
                        />
                        <ReferenceLine
                            y={targetCalories}
                            stroke="var(--color-muted-foreground)"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            label={{
                                value: `Target: ${targetCalories}`,
                                position: 'insideTopRight',
                                fill: 'var(--color-muted-foreground)',
                                fontSize: 10,
                                fontWeight: 600,
                            }}
                        />
                        <ChartTooltip
                            cursor={{
                                fill: 'var(--color-muted, rgba(150, 150, 150, 0.1))',
                            }}
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0]
                                    .payload as DailyIntakeItem;
                                const diff = item.calories - item.target;
                                const isOver = diff > 0 && item.target > 0;

                                return (
                                    <div className="min-w-[140px] rounded-lg border border-border/80 bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-sm">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-1.5 font-bold">
                                            <span>{item.day}</span>
                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                {item.date}
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Calories:
                                                </span>
                                                <span className="font-mono font-bold text-foreground">
                                                    {formatNumber(
                                                        item.calories,
                                                    )}{' '}
                                                    kcal
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Target:
                                                </span>
                                                <span className="font-mono text-muted-foreground">
                                                    {formatNumber(item.target)}{' '}
                                                    kcal
                                                </span>
                                            </div>
                                            {item.calories > 0 && (
                                                <div className="flex items-center justify-between border-t border-border/40 pt-1 font-semibold">
                                                    <span className="text-muted-foreground">
                                                        Variance:
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'font-mono text-[11px]',
                                                            isOver
                                                                ? 'text-rose-500'
                                                                : 'text-emerald-500',
                                                        )}
                                                    >
                                                        {isOver
                                                            ? `+${formatNumber(diff)}`
                                                            : `${formatNumber(diff)}`}{' '}
                                                        kcal
                                                    </span>
                                                </div>
                                            )}
                                            {item.protein ||
                                            item.carbs ||
                                            item.fat ? (
                                                <div className="mt-1.5 grid grid-cols-3 gap-1 border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground">
                                                    <div>
                                                        P:{' '}
                                                        <strong className="text-foreground">
                                                            {item.protein || 0}g
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        C:{' '}
                                                        <strong className="text-foreground">
                                                            {item.carbs || 0}g
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        F:{' '}
                                                        <strong className="text-foreground">
                                                            {item.fat || 0}g
                                                        </strong>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Bar
                            dataKey="calories"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                        >
                            {data.map((entry) => {
                                const isSelected = entry.date === selectedDate;
                                const isOver =
                                    entry.calories > entry.target &&
                                    entry.target > 0;

                                let fillColor = 'var(--color-primary, #6366f1)';
                                if (entry.calories === 0) {
                                    fillColor = 'var(--color-muted, #e4e4e7)';
                                } else if (isOver) {
                                    fillColor =
                                        'var(--color-macro-calories, #f43f5e)';
                                }

                                return (
                                    <Cell
                                        key={entry.date}
                                        fill={fillColor}
                                        fillOpacity={isSelected ? 1 : 0.8}
                                        stroke={
                                            isSelected
                                                ? 'var(--color-foreground)'
                                                : 'none'
                                        }
                                        strokeWidth={isSelected ? 2 : 0}
                                        className="transition-all hover:opacity-100"
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ChartContainer>

                {/* Footer status summary */}
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>Click any day to jump to its diary entries</span>
                    </span>
                    <span className="font-semibold text-foreground">
                        {daysOnTarget} of {loggedDays.length || 7} days on
                        target
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export default WeeklyIntakeBarChart;
