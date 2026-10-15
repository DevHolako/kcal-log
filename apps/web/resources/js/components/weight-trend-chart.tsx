import { useId } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export interface WeightPoint {
    date: string; // YYYY-MM-DD
    rawWeightKg?: number | null;
    trendWeightKg?: number | null;
}

export interface WeightTrendChartProps {
    data: WeightPoint[];
    targetWeightKg?: number | null;
    unit?: string;
    className?: string;
}

const chartConfig = {
    trendWeight: {
        label: 'Trend Weight',
        color: 'var(--color-macro-calories, #10b981)',
    },
    rawWeight: {
        label: 'Scale Weight',
        color: 'var(--color-chart-weight-raw, #94a3b8)',
    },
    targetWeight: {
        label: 'Goal Target',
        color: 'var(--color-primary, #059669)',
    },
} satisfies ChartConfig;

export default function WeightTrendChart({
    data,
    targetWeightKg,
    unit = 'kg',
    className,
}: WeightTrendChartProps) {
    const gradientId = useId().replace(/:/g, '');

    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                <p className="text-sm font-medium">
                    No weight logs recorded yet.
                </p>
                <p className="mt-1 text-xs">
                    Log your morning weigh-ins in the Diary to track your
                    smoothed EWMA weight trend.
                </p>
            </div>
        );
    }

    // Determine min and max for responsive Y-axis bounds
    const allValues: number[] = [];
    data.forEach((p) => {
        if (typeof p.rawWeightKg === 'number') allValues.push(p.rawWeightKg);
        if (typeof p.trendWeightKg === 'number')
            allValues.push(p.trendWeightKg);
    });
    if (typeof targetWeightKg === 'number' && targetWeightKg > 0) {
        allValues.push(targetWeightKg);
    }

    const minVal = allValues.length
        ? Math.floor(Math.min(...allValues) - 1.5)
        : 60;
    const maxVal = allValues.length
        ? Math.ceil(Math.max(...allValues) + 1.5)
        : 90;

    // Format chart date labels
    const chartData = data.map((d) => {
        const parts = d.date.split('-');
        const monthDay = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : d.date;
        return {
            ...d,
            displayDate: monthDay,
            rawWeight: d.rawWeightKg ?? undefined,
            trendWeight: d.trendWeightKg ?? undefined,
        };
    });

    const latestPoint = data[data.length - 1];
    const initialPoint = data[0];
    const totalTrendDelta =
        latestPoint?.trendWeightKg && initialPoint?.trendWeightKg
            ? Math.round(
                  (latestPoint.trendWeightKg - initialPoint.trendWeightKg) *
                      100,
              ) / 100
            : null;

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {/* Header info */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Weight Trend (EWMA α=0.25)
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                            {latestPoint?.trendWeightKg !== undefined &&
                            latestPoint?.trendWeightKg !== null
                                ? `${latestPoint.trendWeightKg} ${unit}`
                                : latestPoint?.rawWeightKg
                                  ? `${latestPoint.rawWeightKg} ${unit}`
                                  : '--'}
                        </span>
                        {totalTrendDelta !== null && (
                            <span
                                className={cn(
                                    'text-xs font-semibold tabular-nums',
                                    totalTrendDelta <= 0
                                        ? 'text-macro-calories'
                                        : 'text-status-warning',
                                )}
                            >
                                {totalTrendDelta > 0
                                    ? `+${totalTrendDelta}`
                                    : totalTrendDelta}{' '}
                                {unit} overall
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-macro-calories" />
                        Smoothed Trend
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Scale Reading
                    </span>
                    {targetWeightKg && (
                        <span className="flex items-center gap-1.5">
                            <span className="h-0.5 w-3 border-b-2 border-dashed border-primary" />
                            Goal ({targetWeightKg} {unit})
                        </span>
                    )}
                </div>
            </div>

            {/* shadcn Recharts Area Container */}
            <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id={`fillTrend-${gradientId}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="var(--color-macro-calories, #10b981)"
                                stopOpacity={0.4}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-macro-calories, #10b981)"
                                stopOpacity={0.0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-border, #e2e8f0)"
                        strokeOpacity={0.6}
                    />
                    <XAxis
                        dataKey="displayDate"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value}
                        className="text-[11px] font-medium"
                    />
                    <YAxis
                        domain={[minVal, maxVal]}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickCount={5}
                        className="text-[11px] font-medium tabular-nums"
                    />
                    <ChartTooltip
                        cursor={{
                            stroke: 'var(--color-border)',
                            strokeWidth: 1,
                        }}
                        content={
                            <ChartTooltipContent
                                indicator="dot"
                                labelFormatter={(label, payload) => {
                                    const item = payload?.[0]?.payload;
                                    return item ? `Date: ${item.date}` : label;
                                }}
                            />
                        }
                    />

                    {/* Target weight line */}
                    {targetWeightKg && targetWeightKg > 0 && (
                        <ReferenceLine
                            y={targetWeightKg}
                            stroke="var(--color-primary, #059669)"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                        />
                    )}

                    {/* Smoothed EWMA Area Curve */}
                    <Area
                        type="monotone"
                        dataKey="trendWeight"
                        stroke="var(--color-macro-calories, #10b981)"
                        strokeWidth={2.5}
                        fill={`url(#fillTrend-${gradientId})`}
                        name="Smoothed Trend"
                    />

                    {/* Raw Scale Weight Scatter Line */}
                    <Line
                        type="monotone"
                        dataKey="rawWeight"
                        stroke="var(--color-chart-weight-raw, #94a3b8)"
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        dot={{
                            r: 3,
                            fill: 'var(--color-chart-weight-raw, #94a3b8)',
                            strokeWidth: 0,
                        }}
                        name="Scale Weight"
                    />
                </AreaChart>
            </ChartContainer>

            <p className="text-[11px] text-muted-foreground">
                Trend weight applies Exponential Smoothing (\(\alpha=0.25\)) to
                filter daily sodium, water, and glycogen shifts.
            </p>
        </div>
    );
}
