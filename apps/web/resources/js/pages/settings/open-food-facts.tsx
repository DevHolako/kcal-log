import { Head, useForm } from '@inertiajs/react';
import { Database, KeyRound, Link as LinkIcon, ShieldCheck, Unlink } from 'lucide-react';
import type { FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

interface Props {
    connection: {
        connected: boolean;
        username: string | null;
        last_synced_at: string | null;
    };
    status?: string;
}

export default function OpenFoodFactsSettings({ connection, status }: Props) {
    const connectForm = useForm({
        username: '',
        password: '',
    });

    const disconnectForm = useForm({});

    const handleConnect: FormEventHandler = (e) => {
        e.preventDefault();
        connectForm.post('/settings/open-food-facts/connect', {
            preserveScroll: true,
            onSuccess: () => connectForm.reset('password'),
        });
    };

    const handleDisconnect: FormEventHandler = (e) => {
        e.preventDefault();
        disconnectForm.post('/settings/open-food-facts/disconnect', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Open Food Facts Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Open Food Facts"
                    description="Connect your Open Food Facts account for authenticated lookups and contributions"
                />

                {status && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {status}
                    </div>
                )}

                {/* Privacy and Architecture Notice */}
                <Card className="border-border/60 bg-muted/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-base font-semibold">
                                Privacy-First 3-Tier Fallback
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                            Your password is encrypted at rest using AES-256 and never logged or exposed in client requests. Lookups seamlessly fall back across three tiers:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">1</span>
                            <span><strong>Authenticated OFF:</strong> Uses your linked personal session</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">2</span>
                            <span><strong>Anonymous OFF:</strong> App fallback with polite User-Agent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">3</span>
                            <span><strong>Local Cache:</strong> High-speed offline food database</span>
                        </div>
                    </CardContent>
                </Card>

                {connection.connected ? (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-medium">Account Linked</CardTitle>
                                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                            Connected
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Logged in as <strong className="text-foreground">{connection.username}</strong>
                                    </CardDescription>
                                </div>
                                <Database className="h-8 w-8 text-emerald-500/60" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {connection.last_synced_at && (
                                <p className="text-xs text-muted-foreground">
                                    Last synchronized: {new Date(connection.last_synced_at).toLocaleString()}
                                </p>
                            )}

                            <form onSubmit={handleDisconnect}>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    disabled={disconnectForm.processing}
                                    className="gap-2"
                                >
                                    <Unlink className="h-4 w-4" />
                                    Disconnect Account
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-medium">Link Open Food Facts</CardTitle>
                                    <CardDescription>
                                        Enter your Open Food Facts credentials to enable Tier 1 authentication.
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary">Not Connected</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleConnect} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="off-username">Username</Label>
                                    <Input
                                        id="off-username"
                                        type="text"
                                        placeholder="e.g. foodlover42"
                                        value={connectForm.data.username}
                                        onChange={(e) => connectForm.setData('username', e.target.value)}
                                        required
                                        autoComplete="username"
                                    />
                                    <InputError message={connectForm.errors.username} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="off-password">Password</Label>
                                    <Input
                                        id="off-password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={connectForm.data.password}
                                        onChange={(e) => connectForm.setData('password', e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <InputError message={connectForm.errors.password} />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Button
                                        type="submit"
                                        disabled={connectForm.processing}
                                        className="gap-2"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        {connectForm.processing ? 'Verifying...' : 'Connect Open Food Facts'}
                                    </Button>

                                    <a
                                        href="https://world.openfoodfacts.org"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                                    >
                                        Need an account? Sign up at openfoodfacts.org
                                    </a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

OpenFoodFactsSettings.layout = {
    breadcrumbs: [
        {
            title: 'Open Food Facts settings',
            href: '/settings/open-food-facts',
        },
    ],
};
