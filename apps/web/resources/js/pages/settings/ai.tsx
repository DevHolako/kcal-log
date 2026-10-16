import { Head, useForm } from '@inertiajs/react';
import { Bot, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck, Unlink } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

interface Props {
    connection: {
        connected: boolean;
        provider: 'openai' | 'anthropic';
        model: string;
        last_verified_at: string | null;
    };
    status?: string;
}

const PROVIDER_MODELS = {
    openai: [
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Economical - Recommended)' },
        { id: 'gpt-4o', label: 'GPT-4o (High Reasoning)' },
    ],
    anthropic: [
        { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast & Economical - Recommended)' },
        { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (High Reasoning)' },
    ],
};

export default function AiSettings({ connection, status }: Props) {
    const [showKey, setShowKey] = useState(false);

    const connectForm = useForm({
        provider: connection.provider || 'openai',
        model: connection.model || 'gpt-4o-mini',
        api_key: '',
    });

    const disconnectForm = useForm({});

    const handleProviderChange = (newProvider: 'openai' | 'anthropic') => {
        const defaultModel = PROVIDER_MODELS[newProvider][0].id;
        connectForm.setData({
            ...connectForm.data,
            provider: newProvider,
            model: defaultModel,
        });
    };

    const handleConnect: FormEventHandler = (e) => {
        e.preventDefault();
        connectForm.post('/settings/ai/connect', {
            preserveScroll: true,
            onSuccess: () => connectForm.reset('api_key'),
        });
    };

    const handleDisconnect: FormEventHandler = (e) => {
        e.preventDefault();
        disconnectForm.post('/settings/ai/disconnect', {
            preserveScroll: true,
        });
    };

    return (
        <SettingsLayout>
            <Head title="AI Assistant Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="AI Assistant (Bring Your Own Key)"
                    description="Connect your OpenAI or Anthropic API key to activate your personal nutrition assistant"
                />

                {status && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {status}
                    </div>
                )}

                {/* Privacy & BYOK Architecture Notice */}
                <Card className="border-border/60 bg-muted/40">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-base font-semibold">
                                Privacy-First Bring-Your-Own-Key Architecture
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                            Your API credentials remain entirely in your control (ADR 0011):
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5 pt-0 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>
                                <strong>Zero Platform Markup:</strong> Pay your provider directly at wholesale API token rates.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>
                                <strong>Encrypted at Rest:</strong> Keys are stored using AES-256 encryption and isolated from user profiles.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>
                                <strong>FrankenPHP Scoped Isolation:</strong> API keys are loaded dynamically per-request and safely cleaned up in worker memory.
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {connection.connected ? (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-medium">
                                            AI Assistant Active
                                        </CardTitle>
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        >
                                            Connected
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Configured with{' '}
                                        <strong className="text-foreground capitalize">
                                            {connection.provider}
                                        </strong>{' '}
                                        ({connection.model})
                                    </CardDescription>
                                </div>
                                <Bot className="h-8 w-8 text-emerald-500/60" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {connection.last_verified_at && (
                                <p className="text-xs text-muted-foreground">
                                    Last verified:{' '}
                                    {new Date(connection.last_verified_at).toLocaleString()}
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <form onSubmit={handleDisconnect}>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={disconnectForm.processing}
                                        className="gap-2"
                                    >
                                        <Unlink className="h-4 w-4" />
                                        Disconnect Provider
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Configuration / Update Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base font-medium">
                                {connection.connected ? 'Update AI Credentials' : 'Connect AI Provider'}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Enter your personal API key. We will execute a lightweight test ping to verify it before saving.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleConnect} className="space-y-4">
                            {/* Provider Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="provider">AI Provider</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleProviderChange('openai')}
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider === 'openai'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="font-semibold text-sm">OpenAI</span>
                                        <span className="text-xs text-muted-foreground">
                                            GPT-4o Mini, GPT-4o
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleProviderChange('anthropic')}
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider === 'anthropic'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="font-semibold text-sm">Anthropic</span>
                                        <span className="text-xs text-muted-foreground">
                                            Claude 3.5 Haiku, Claude 3.5 Sonnet
                                        </span>
                                    </button>
                                </div>
                                <InputError message={connectForm.errors.provider} />
                            </div>

                            {/* Model Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="model">Model Tier</Label>
                                <select
                                    id="model"
                                    value={connectForm.data.model}
                                    onChange={(e) => connectForm.setData('model', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    {PROVIDER_MODELS[connectForm.data.provider as 'openai' | 'anthropic'].map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={connectForm.errors.model} />
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <Label htmlFor="api_key">
                                    {connectForm.data.provider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type={showKey ? 'text' : 'password'}
                                        value={connectForm.data.api_key}
                                        onChange={(e) => connectForm.setData('api_key', e.target.value)}
                                        placeholder={
                                            connectForm.data.provider === 'openai'
                                                ? 'sk-proj-...'
                                                : 'sk-ant-api03-...'
                                        }
                                        className="pr-10"
                                        autoComplete="off"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={connectForm.errors.api_key} />
                            </div>

                            <Button
                                type="submit"
                                disabled={connectForm.processing}
                                className="w-full sm:w-auto"
                            >
                                {connectForm.processing ? 'Verifying Key...' : 'Verify & Save Credentials'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
    );
}
