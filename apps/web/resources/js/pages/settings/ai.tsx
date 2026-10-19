import { Head, router, useForm } from '@inertiajs/react';
import {
    Bot,
    CheckCircle2,
    Cpu,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Unlink,
} from 'lucide-react';
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

type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'deepseek';

interface ModelOption {
    id: string;
    label: string;
}

interface Props {
    connection: {
        connected: boolean;
        provider: ProviderType;
        model: string;
        last_verified_at: string | null;
    };
    availableModels?: ModelOption[];
    status?: string;
}

const PROVIDER_MODELS: Record<ProviderType, { id: string; label: string }[]> = {
    openai: [
        {
            id: 'gpt-4o-mini',
            label: 'GPT-4o Mini (Fast & Economical - Recommended)',
        },
        { id: 'gpt-4o', label: 'GPT-4o (High Reasoning)' },
    ],
    anthropic: [
        {
            id: 'claude-3-5-haiku-20241022',
            label: 'Claude 3.5 Haiku (Fast & Economical - Recommended)',
        },
        {
            id: 'claude-3-5-sonnet-20241022',
            label: 'Claude 3.5 Sonnet (High Reasoning)',
        },
    ],
    gemini: [
        {
            id: 'gemini-2.5-flash',
            label: 'Gemini 2.5 Flash (Fast & Economical - Recommended)',
        },
        {
            id: 'gemini-2.5-pro',
            label: 'Gemini 2.5 Pro (High Reasoning)',
        },
        {
            id: 'gemini-1.5-flash',
            label: 'Gemini 1.5 Flash (Economical)',
        },
    ],
    deepseek: [
        {
            id: 'deepseek-chat',
            label: 'DeepSeek-V3 Chat (Fast & Economical - Recommended)',
        },
        {
            id: 'deepseek-reasoner',
            label: 'DeepSeek-R1 Reasoner (Deep Reasoning)',
        },
    ],
};

export default function AiSettings({
    connection,
    availableModels = [],
    status,
}: Props) {
    const [showKey, setShowKey] = useState(false);
    const [discoveredModels, setDiscoveredModels] = useState<ModelOption[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);

    const connectForm = useForm<{
        provider: ProviderType;
        model: string;
        api_key: string;
    }>({
        provider: connection.provider || 'openai',
        model: connection.model || 'gpt-4o-mini',
        api_key: '',
    });

    const disconnectForm = useForm({});

    const handleProviderChange = (newProvider: ProviderType) => {
        setDiscoveredModels([]);
        const defaultModel = PROVIDER_MODELS[newProvider][0].id;
        connectForm.setData({
            ...connectForm.data,
            provider: newProvider,
            model: defaultModel,
        });
    };

    const handleFetchModels = async () => {
        const key = connectForm.data.api_key.trim();
        if (!key) return;
        setIsFetchingModels(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/settings/ai/models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    provider: connectForm.data.provider,
                    api_key: key,
                }),
            });
            const data = await res.json();
            if (
                data.models &&
                Array.isArray(data.models) &&
                data.models.length > 0
            ) {
                setDiscoveredModels(data.models);
                connectForm.setData('model', data.models[0].id);
            }
        } catch {
            // Fallback
        } finally {
            setIsFetchingModels(false);
        }
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
        <>
            <Head title="AI Assistant Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="AI Assistant (Bring Your Own Key)"
                    description="Connect your OpenAI, Anthropic, Gemini, or DeepSeek API key to activate your personal nutrition assistant"
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
                            Your API credentials remain entirely in your control
                            (ADR 0011):
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1.5 pt-0 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                                <strong>Zero Platform Markup:</strong> Pay your
                                provider directly at wholesale API token rates.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                                <strong>Encrypted at Rest:</strong> Keys are
                                stored using AES-256 encryption and isolated
                                from user profiles.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                                <strong>FrankenPHP Scoped Isolation:</strong>{' '}
                                API keys are loaded dynamically per-request and
                                safely cleaned up in worker memory.
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
                                    {new Date(
                                        connection.last_verified_at,
                                    ).toLocaleString()}
                                </p>
                            )}

                            {/* Dynamic Model Switcher for Connected Provider */}
                            <div className="space-y-2 rounded-lg border border-border/60 bg-background/50 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                                        <Cpu className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>
                                            Active Model (From{' '}
                                            <span className="capitalize">
                                                {connection.provider}
                                            </span>
                                            )
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        Dynamic Provider Model
                                    </span>
                                </div>
                                <select
                                    value={connection.model}
                                    onChange={(e) => {
                                        router.patch(
                                            '/settings/ai/model',
                                            { model: e.target.value },
                                            { preserveScroll: true },
                                        );
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                >
                                    {(availableModels &&
                                    availableModels.length > 0
                                        ? availableModels
                                        : [
                                              {
                                                  id: connection.model,
                                                  label: connection.model,
                                              },
                                          ]
                                    ).map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                {connection.connected
                                    ? 'Update AI Credentials'
                                    : 'Connect AI Provider'}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Enter your personal API key. We will execute a
                            lightweight test ping to verify it before saving.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleConnect} className="space-y-4">
                            {/* Provider Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="provider">AI Provider</Label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleProviderChange('openai')
                                        }
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider ===
                                            'openai'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            OpenAI
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            GPT-4o Mini, GPT-4o
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleProviderChange('anthropic')
                                        }
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider ===
                                            'anthropic'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            Anthropic
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Claude 3.5 Haiku, Sonnet
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleProviderChange('gemini')
                                        }
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider ===
                                            'gemini'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            Gemini
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Gemini 2.5 Flash, 2.5 Pro
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleProviderChange('deepseek')
                                        }
                                        className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
                                            connectForm.data.provider ===
                                            'deepseek'
                                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                : 'border-border/60 hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            DeepSeek
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            DeepSeek-V3, R1
                                        </span>
                                    </button>
                                </div>
                                <InputError
                                    message={connectForm.errors.provider}
                                />
                            </div>

                            {/* Model Selection */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="model">
                                        Model (Dynamic)
                                    </Label>
                                    {connectForm.data.api_key.trim().length >=
                                        8 && (
                                        <button
                                            type="button"
                                            onClick={handleFetchModels}
                                            disabled={isFetchingModels}
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            {isFetchingModels ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Fetching from provider...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-3 w-3" />
                                                    Discover models from
                                                    provider
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <select
                                    id="model"
                                    value={connectForm.data.model}
                                    onChange={(e) =>
                                        connectForm.setData(
                                            'model',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden"
                                >
                                    {(discoveredModels.length > 0
                                        ? discoveredModels
                                        : PROVIDER_MODELS[
                                              connectForm.data.provider
                                          ]
                                    ).map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={connectForm.errors.model}
                                />
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <Label htmlFor="api_key">
                                    {connectForm.data.provider === 'openai'
                                        ? 'OpenAI API Key'
                                        : connectForm.data.provider ===
                                            'anthropic'
                                          ? 'Anthropic API Key'
                                          : connectForm.data.provider ===
                                              'gemini'
                                            ? 'Google Gemini API Key'
                                            : 'DeepSeek API Key'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type={showKey ? 'text' : 'password'}
                                        value={connectForm.data.api_key}
                                        onChange={(e) =>
                                            connectForm.setData(
                                                'api_key',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            connectForm.data.provider ===
                                            'openai'
                                                ? 'sk-proj-...'
                                                : connectForm.data.provider ===
                                                    'anthropic'
                                                  ? 'sk-ant-api03-...'
                                                  : connectForm.data
                                                          .provider === 'gemini'
                                                    ? 'AIzaSy...'
                                                    : 'sk-...'
                                        }
                                        className="pr-10"
                                        autoComplete="off"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showKey ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={connectForm.errors.api_key}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={connectForm.processing}
                                className="w-full sm:w-auto"
                            >
                                {connectForm.processing
                                    ? 'Verifying Key...'
                                    : 'Verify & Save Credentials'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
