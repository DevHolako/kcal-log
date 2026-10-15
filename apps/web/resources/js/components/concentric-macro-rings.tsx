import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface MacroRingData {
    consumed: number;
    target: number;
    remaining?: number;
    unit?: string;
}

export interface ConcentricMacroRingsProps {
    calories: MacroRingData;
    protein: MacroRingData;
    carbs: MacroRingData;
    fat: MacroRingData;
    className?: string;
}

interface RingConfig {
    id: 'calories' | 'protein' | 'carbs' | 'fat';
    label: string;
    radius: number;
    strokeWidth: number;
    colorVar: string;
    bgColorVar?: string;
    data: MacroRingData;
}

export default function ConcentricMacroRings({
    calories,
    protein,
    carbs,
    fat,
    className,
}: ConcentricMacroRingsProps) {
    const { t, formatNumber } = useTranslation();
    const size = 200;
    const center = size / 2;

    const rings: RingConfig[] = [
        {
            id: 'calories',
            label: t('nutrition.calories'),
            radius: 82,
            strokeWidth: 8,
            colorVar: 'var(--color-macro-calories, #10b981)',
            data: calories,
        },
        {
            id: 'protein',
            label: t('nutrition.protein'),
            radius: 68,
            strokeWidth: 7,
            colorVar: 'var(--color-macro-protein, #3b82f6)',
            data: protein,
        },
        {
            id: 'carbs',
            label: t('nutrition.carbs'),
            radius: 54,
            strokeWidth: 7,
            colorVar: 'var(--color-macro-carbs, #f59e0b)',
            data: carbs,
        },
        {
            id: 'fat',
            label: t('nutrition.fat'),
            radius: 40,
            strokeWidth: 6,
            colorVar: 'var(--color-macro-fat, #f43f5e)',
            data: fat,
        },
    ];

    const calTarget = calories.target > 0 ? calories.target : 0;
    const calConsumed = Math.round(calories.consumed);
    const calRemaining =
        calTarget > 0 ? Math.round(calTarget - calConsumed) : 0;
    const isCalOver = calTarget > 0 && calRemaining < 0;

    const accessibleDescription = `Daily Nutrition Summary: ${formatNumber(calConsumed)} of ${formatNumber(calTarget)} calories consumed, ${formatNumber(Math.abs(calRemaining))} calories ${isCalOver ? 'over target' : 'remaining'}. Protein: ${formatNumber(Math.round(protein.consumed))} of ${formatNumber(Math.round(protein.target))}g. Carbohydrates: ${formatNumber(Math.round(carbs.consumed))} of ${formatNumber(Math.round(carbs.target))}g. Fat: ${formatNumber(Math.round(fat.consumed))} of ${formatNumber(Math.round(fat.target))}g.`;

    return (
        <div
            className={cn('flex flex-col items-center gap-6', className)}
            role="region"
            aria-label="Daily Nutrition Rings"
        >
            {/* Screen Reader Summary */}
            <span className="sr-only">{accessibleDescription}</span>

            {/* SVG Concentric Visualizer */}
            <div className="relative flex items-center justify-center">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="-rotate-90 transform drop-shadow-xs"
                    aria-hidden="true"
                >
                    {rings.map((ring) => {
                        const target = ring.data.target;
                        const isConfigured = target > 0;
                        const circumference = 2 * Math.PI * ring.radius;
                        const progress = isConfigured
                            ? ring.data.consumed / target
                            : 0;
                        const clampedProgress = Math.min(
                            1,
                            Math.max(0, progress),
                        );
                        const strokeDashoffset =
                            circumference * (1 - clampedProgress);
                        const isOver = progress > 1;

                        return (
                            <g key={ring.id}>
                                {/* Background Track */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={ring.radius}
                                    fill="transparent"
                                    stroke="currentColor"
                                    className="text-muted/30 dark:text-muted/20"
                                    strokeWidth={ring.strokeWidth}
                                    strokeDasharray={
                                        isConfigured ? undefined : '4 4'
                                    }
                                />

                                {/* Active Progress Arc */}
                                {isConfigured && (
                                    <circle
                                        cx={center}
                                        cy={center}
                                        r={ring.radius}
                                        fill="transparent"
                                        stroke={ring.colorVar}
                                        strokeWidth={ring.strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out"
                                    />
                                )}

                                {/* Over-Target Accent Marker */}
                                {isOver && (
                                    <circle
                                        cx={center}
                                        cy={center}
                                        r={ring.radius}
                                        fill="transparent"
                                        stroke="var(--color-status-error, #ef4444)"
                                        strokeWidth={ring.strokeWidth + 2}
                                        strokeDasharray={`${ring.strokeWidth * 1.5} ${circumference}`}
                                        strokeDashoffset={0}
                                        strokeLinecap="round"
                                        className="animate-pulse"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Central Readout */}
                <div
                    className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
                    aria-hidden="true"
                >
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {isCalOver
                            ? t('status.over_goal')
                            : t('status.remaining')}
                    </span>
                    <span
                        className={cn(
                            'text-2xl font-black tracking-tight tabular-nums',
                            isCalOver
                                ? 'text-status-error'
                                : 'text-macro-calories',
                        )}
                    >
                        {calTarget > 0
                            ? formatNumber(Math.abs(calRemaining))
                            : '--'}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                        kcal
                    </span>
                </div>
            </div>

            {/* Accessible Legend & Independent Metrics Grid */}
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {rings.map((ring) => {
                    const consumed = Math.round(ring.data.consumed);
                    const target = Math.round(ring.data.target);
                    const unit =
                        ring.data.unit ||
                        (ring.id === 'calories' ? 'kcal' : 'g');
                    const isConfigured = target > 0;
                    const percent = isConfigured
                        ? Math.round((consumed / target) * 100)
                        : null;
                    const isOver = isConfigured && consumed > target;

                    return (
                        <div
                            key={ring.id}
                            className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs backdrop-blur-xs transition-colors hover:border-border"
                        >
                            <div className="flex items-center justify-between gap-1">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor: ring.colorVar,
                                        }}
                                        aria-hidden="true"
                                    />
                                    {ring.label}
                                </span>
                                {percent !== null && (
                                    <span
                                        className={cn(
                                            'text-[11px] font-bold tabular-nums',
                                            isOver
                                                ? 'text-status-error'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {percent}%
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
                                    {formatNumber(consumed)}
                                </span>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    /{' '}
                                    {isConfigured
                                        ? `${formatNumber(target)} ${unit}`
                                        : t('status.no_target')}
                                </span>
                            </div>

                            {/* Mini Progress Bar */}
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        backgroundColor: isOver
                                            ? 'var(--color-status-error, #ef4444)'
                                            : ring.colorVar,
                                        width: isConfigured
                                            ? `${Math.min(100, Math.max(0, (consumed / target) * 100))}%`
                                            : '0%',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
