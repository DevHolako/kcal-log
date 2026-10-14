import { Head, useForm } from '@inertiajs/react';
import {
    Calendar,
    Download,
    FileCheck,
    FileCode,
    FileSpreadsheet,
    FileText,
    History,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    status?: string;
}

export default function ReportsIndex({ exports, status }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const form = useForm({
        type: 'pdf' as 'pdf' | 'csv' | 'json',
        date_from: thirtyDaysAgo,
        date_to: today,
    });

    const setPreset = (days: number) => {
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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
            <Head title="Reports & Data Exports" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Data Exports</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate downloadable PDF summary reports, spreadsheet CSVs, or raw JSON data archives.
                    </p>
                </div>
            </div>

            {status && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
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
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                        In accordance with kcal-log's privacy mandate, your exports contain only your nutrition, body measurements, and diary tracking history. Passwords, auth tokens, and encrypted Open Food Facts credentials are completely excluded.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Export Generator Form */}
                <Card className="lg:col-span-1 border-border/70 h-fit">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Generate Export</CardTitle>
                        <CardDescription className="text-xs">
                            Select output format and timeframe.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleExport}>
                        <CardContent className="space-y-4">
                            {/* Format Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Export Format</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => form.setData('type', 'pdf')}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition-colors ${
                                            form.data.type === 'pdf'
                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                : 'border-border hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                    >
                                        <FileText className="h-5 w-5 text-rose-500" />
                                        <span className="text-xs">PDF</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => form.setData('type', 'csv')}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition-colors ${
                                            form.data.type === 'csv'
                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                : 'border-border hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                    >
                                        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                                        <span className="text-xs">CSV</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => form.setData('type', 'json')}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition-colors ${
                                            form.data.type === 'json'
                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                : 'border-border hover:bg-muted/50 text-muted-foreground'
                                        }`}
                                    >
                                        <FileCode className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs">JSON</span>
                                    </button>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Quick Range</Label>
                                <div className="flex gap-1.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(7)}
                                        className="text-xs flex-1"
                                    >
                                        7 Days
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(30)}
                                        className="text-xs flex-1"
                                    >
                                        30 Days
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPreset(90)}
                                        className="text-xs flex-1"
                                    >
                                        90 Days
                                    </Button>
                                </div>
                            </div>

                            {/* Date Inputs */}
                            <div className="space-y-3 pt-1">
                                <div className="space-y-1">
                                    <Label htmlFor="date_from" className="text-xs">Start Date</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={form.data.date_from}
                                        onChange={(e) => form.setData('date_from', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="date_to" className="text-xs">End Date</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={form.data.date_to}
                                        onChange={(e) => form.setData('date_to', e.target.value)}
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
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Generate {form.data.type.toUpperCase()} Export
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Export History Table */}
                <Card className="lg:col-span-2 border-border/70">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            <CardTitle className="text-base font-semibold">Generated Files</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                            {exports.total} file{exports.total === 1 ? '' : 's'}
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-0">
                        {exports.data.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No exports generated yet. Select a format and date range on the left to create your first report.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {exports.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted border border-border">
                                                {typeIcons[item.type]}
                                            </div>

                                            <div className="space-y-0.5">
                                                <div className="text-sm font-semibold flex items-center gap-2">
                                                    <span>{item.type.toUpperCase()} Report</span>
                                                    {item.status === 'completed' ? (
                                                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                                            Ready
                                                        </Badge>
                                                    ) : item.status === 'processing' ? (
                                                        <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                                                            Processing
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    Period: {item.date_from} to {item.date_to} &bull; Created {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {item.status === 'completed' && (
                                            <a
                                                href={`/reports/exports/${item.id}/download`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Download
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
