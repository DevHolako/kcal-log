import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Activity,
    CalendarCheck,
    Download,
    Droplets,
    FileCode,
    FileSpreadsheet,
    FileText,
    Flame,
    History,
    Loader2,
    Scale,
    ShieldCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEcho } from '@/echo';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';

export interface UserStats {
    periodDays: number;
    totalDaysLogged: number;
    loggingRate: number;
    avgCalories: number;
    targetCalories: number;
    calorieVariance: number;
    adherenceRate: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
    weightDelta: number | null;
    avgWater: number;
}

interface ReportExportItem {
    id: number;
    user_id: number;
    type: 'pdf' | 'csv' | 'json';
    date_from: string;
    date_to: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    file_path: string | null;
    expires_at: string | null;
    created_at: string;
}

interface Props {
    exports: {
        data: ReportExportItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    userStats?: UserStats;
    status?: string;
}

export default function ReportsIndex({ exports, userStats, status }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`user.${userId}`);
        channel.listen('.ExportReady', () => {
            router.reload({ only: ['exports'] });
        });

        return () => {
            channel.stopListening('.ExportReady');
        };
    }, [auth?.user?.id]);

    const form = useForm({
        type: 'pdf' as 'pdf' | 'csv' | 'json',
        date_from: thirtyDaysAgo,
        date_to: today,
    });

    const setPreset = (days: number) => {
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
        form.setData({
            ...form.data,
            date_from: start,
            date_to: today,
        });
    };

    const handleExport = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/reports/exports', {
            preserveScroll: true,
        });
    };

    const typeIcons = {
        pdf: <FileText className="h-4 w-4 text-rose-500" />,
        csv: <FileSpreadsheet className="h-4 w-4 text-emerald-500" />,
        json: <FileCode className="h-4 w-4 text-blue-500" />,
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={t('reports.title')} />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('reports.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('reports.subtitle')}
                    </p>
                </div>
            </div>

            {status && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            {/* Executive Summary 30-Day Mini-Dashboard */}
            {userStats && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                            {t('reports.exec_summary_title')}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {userStats.totalDaysLogged} of{' '}
                            {userStats.periodDays} days recorded (
                            {userStats.loggingRate}%)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Card 1: Caloric Average */}
                        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    {t('reports.avg_daily_calories')}
                                </CardTitle>
                                <Flame className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {userStats.avgCalories}{' '}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        kcal
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>
                                        {t('reports.target')}:{' '}
                                        {userStats.targetCalories} kcal
                                    </span>
                                    <span
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                            Math.abs(
                                                userStats.calorieVariance,
                                            ) <= 150
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : userStats.calorieVariance >
                                                    150
                                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}
                                    >
                                        {userStats.calorieVariance > 0
                                            ? '+'
                                            : ''}
                                        {userStats.calorieVariance} kcal
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Adherence Rate */}
                        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    {t('reports.target_adherence')}
                                </CardTitle>
                                <CalendarCheck className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {userStats.adherenceRate}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Within ±10% of caloric target on logged days
                                </p>
                            </CardContent>
                        </Card>

                        {/* Card 3: Macro Profile */}
                        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    {t('reports.avg_macronutrients')}
                                </CardTitle>
                                <Activity className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        style={{
                                            width: `${userStats.proteinPct}%`,
                                        }}
                                        className="bg-blue-600 dark:bg-blue-500"
                                        title={`Protein: ${userStats.proteinPct}%`}
                                    />
                                    <div
                                        style={{
                                            width: `${userStats.carbsPct}%`,
                                        }}
                                        className="bg-amber-500"
                                        title={`Carbs: ${userStats.carbsPct}%`}
                                    />
                                    <div
                                        style={{
                                            width: `${userStats.fatPct}%`,
                                        }}
                                        className="bg-rose-500"
                                        title={`Fat: ${userStats.fatPct}%`}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        P: {userStats.avgProtein}g (
                                        {userStats.proteinPct}%)
                                    </span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                        C: {userStats.avgCarbs}g (
                                        {userStats.carbsPct}%)
                                    </span>
                                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                                        F: {userStats.avgFat}g (
                                        {userStats.fatPct}%)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 4: Weight & Hydration */}
                        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-muted-foreground">
                                    Trend & Hydration
                                </CardTitle>
                                <Scale className="h-4 w-4 text-indigo-500" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="text-2xl font-bold tracking-tight text-foreground">
                                    {userStats.weightDelta !== null
                                        ? `${userStats.weightDelta > 0 ? '+' : ''}${userStats.weightDelta} kg`
                                        : 'Baseline'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Droplets className="h-3 w-3 text-cyan-500" />
                                    <span>
                                        {userStats.avgWater > 0
                                            ? `${userStats.avgWater} ml/day water`
                                            : 'No hydration logged'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Privacy & Portability Card */}
            <Card className="border-border/60 bg-muted/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <CardTitle className="text-base font-semibold">
                            Full Data Ownership & Zero Secret Leaks
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                        In accordance with kcal-log's privacy mandate, your
                        exports contain only your nutrition, body measurements,
                        and diary tracking history. Passwords, auth tokens, and
                        encrypted Open Food Facts credentials are completely
                        excluded.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Export Generator Form */}
                <Card className="h-fit border-border/70 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {t('reports.request_export')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Select output format and timeframe.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleExport}>
                        <CardContent className="space-y-4">
                            {/* Format Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">
                                    {t('reports.export_format')}
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData('type', 'pdf')
                                        }
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                                            form.data.type === 'pdf'
                                                ? 'border-primary bg-primary/10 font-bold text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        <FileText className="h-5 w-5 text-rose-500" />
                                        <span className="text-xs">PDF</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData('type', 'csv')
                                        }
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                                            form.data.type === 'csv'
                                                ? 'border-primary bg-primary/10 font-bold text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                                        <span className="text-xs">CSV</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            form.setData('type', 'json')
                                        }
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                                            form.data.type === 'json'
                                                ? 'border-primary bg-primary/10 font-bold text-primary'
                                                : 'border-border text-muted-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        <FileCode className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs">JSON</span>
                                    </button>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    {t('reports.date_range')}
                                </Label>
                                <div className="flex gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(7)}
                                        className="flex-1 text-xs"
                                    >
                                        {t('reports.preset_7d')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(30)}
                                        className="flex-1 text-xs"
                                    >
                                        {t('reports.preset_30d')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(90)}
                                        className="flex-1 text-xs"
                                    >
                                        {t('reports.preset_90d')}
                                    </Button>
                                </div>
                            </div>

                            {/* Date Inputs */}
                            <div className="space-y-3 pt-1">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="date_from"
                                        className="text-xs"
                                    >
                                        {t('reports.from')}
                                    </Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={form.data.date_from}
                                        onChange={(e) =>
                                            form.setData(
                                                'date_from',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="date_to"
                                        className="text-xs"
                                    >
                                        {t('reports.to')}
                                    </Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={form.data.date_to}
                                        onChange={(e) =>
                                            form.setData(
                                                'date_to',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="w-full gap-2"
                            >
                                {form.processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('reports.generating')}
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        {t('reports.generate_export', {
                                            type: form.data.type.toUpperCase(),
                                        })}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Export History Table */}
                <Card className="border-border/70 lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base font-semibold">
                                Generated Files
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                            {exports.total} file{exports.total === 1 ? '' : 's'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        {exports.data.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No exports generated yet. Select a format and
                                date range on the left to create your first
                                report.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {exports.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg border border-border bg-muted p-2">
                                                {typeIcons[item.type]}
                                            </div>

                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <span>
                                                        {item.type.toUpperCase()}{' '}
                                                        Report
                                                    </span>
                                                    {item.status ===
                                                    'completed' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                                                        >
                                                            Ready
                                                        </Badge>
                                                    ) : item.status ===
                                                      'processing' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-blue-500/40 bg-blue-500/10 text-[10px] text-blue-600 dark:text-blue-400"
                                                        >
                                                            Processing
                                                        </Badge>
                                                    ) : item.status ===
                                                      'pending' ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                                                        >
                                                            Queued
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[10px]"
                                                        >
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    Period:{' '}
                                                    {formatDate(item.date_from)}{' '}
                                                    to{' '}
                                                    {formatDate(item.date_to)}{' '}
                                                    &bull; Created{' '}
                                                    {formatDate(
                                                        item.created_at,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {item.status === 'completed' && (
                                            <a
                                                href={`/reports/exports/${item.id}/download`}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                {t('action.download')}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Reports & Exports',
            href: '/reports',
        },
    ],
};
