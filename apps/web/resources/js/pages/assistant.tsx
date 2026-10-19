import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Bot,
    Check,
    Copy,
    Cpu,
    Database,
    Eye,
    EyeOff,
    ExternalLink,
    KeyRound,
    Loader2,
    MessageSquare,
    Plus,
    Scale,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Target,
    Trash2,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'deepseek';

interface Message {
    id?: number;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    created_at?: string;
}

interface Conversation {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

interface ConnectionInfo {
    provider: ProviderType;
    model: string;
    last_verified_at: string | null;
}

interface Props {
    isConnected: boolean;
    connection?: ConnectionInfo | null;
    conversations: Conversation[];
    activeConversation?: {
        id: number;
        title: string;
        messages: Message[];
    } | null;
}

const PROVIDER_METADATA: Record<
    ProviderType,
    {
        name: string;
        tagline: string;
        badge: string;
        keyUrl: string;
        keyPlaceholder: string;
    }
> = {
    openai: {
        name: 'OpenAI',
        tagline: 'GPT-4o & GPT-4o Mini',
        badge: 'Popular',
        keyUrl: 'https://platform.openai.com/api-keys',
        keyPlaceholder: 'sk-proj-...',
    },
    anthropic: {
        name: 'Anthropic',
        tagline: 'Claude 3.5 Haiku & Sonnet',
        badge: 'High Reasoning',
        keyUrl: 'https://console.anthropic.com/settings/keys',
        keyPlaceholder: 'sk-ant-...',
    },
    gemini: {
        name: 'Google Gemini',
        tagline: 'Gemini 2.5 Flash & Pro',
        badge: 'Ultra Fast',
        keyUrl: 'https://aistudio.google.com/app/apikey',
        keyPlaceholder: 'AIzaSy...',
    },
    deepseek: {
        name: 'DeepSeek',
        tagline: 'DeepSeek-V3 & R1 Reasoner',
        badge: 'Economical',
        keyUrl: 'https://platform.deepseek.com/api_keys',
        keyPlaceholder: 'sk-...',
    },
};

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

const STARTER_PROMPTS = [
    {
        title: "Today's Calorie & Macro Budget",
        description:
            'Compare current consumption against remaining daily targets.',
        prompt: 'What are my calorie and macronutrient targets today, and how much have I consumed so far?',
        badge: 'Targets & Diary',
        icon: Target,
    },
    {
        title: 'High-Protein Meal Suggestions',
        description:
            'Get actionable recipe or food suggestions tailored to your remaining macros.',
        prompt: 'Give me high-protein meal suggestions fitting my remaining targets today.',
        badge: 'Smart Recommendations',
        icon: Utensils,
    },
    {
        title: '3-Day Intake vs Targets Review',
        description:
            'Analyze rolling caloric deficits, adherence, and average protein.',
        prompt: 'How do my calories and protein compare to my goal over the past 3 days?',
        badge: 'Macro Trends',
        icon: Scale,
    },
    {
        title: "Review Today's Logged Foods",
        description:
            'Inspect all entries logged today with nutritional breakdowns.',
        prompt: "What foods have I logged today so far and what's my current macro breakdown?",
        badge: 'Daily Log',
        icon: Sparkles,
    },
];

const QUICK_PILLS = [
    'Remaining macros today?',
    'High-protein dinner idea',
    '3-day calorie adherence',
    'Review my logged meals',
    'Compare intake with weight trend',
];

const TOOL_DESCRIPTIONS: Record<string, string> = {
    get_target_profiles: 'Inspecting your active macro targets & goals...',
    GetTargetProfileTool: 'Inspecting your active macro targets & goals...',
    get_diary_entries: "Scanning today's diary logs...",
    GetDiaryEntriesTool: "Scanning today's diary logs...",
    get_daily_summaries: 'Aggregating daily macro totals & adherence...',
    GetDailySummaryTool: 'Aggregating daily macro totals & adherence...',
    get_food_database: 'Searching verified food database & ingredients...',
    SearchFoodDatabaseTool: 'Searching verified food database & ingredients...',
    get_weight_logs: 'Retrieving body weight history...',
    GetWeightHistoryTool: 'Retrieving body weight history...',
};

function formatMessageContent(content: string) {
    return content;
}

function formatRelativeTime(dateStr?: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

export default function AssistantPage({
    isConnected,
    connection,
    conversations,
    activeConversation,
}: Props) {
    // Chat state
    const [prompt, setPrompt] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [messages, setMessages] = useState<Message[]>(
        activeConversation?.messages || [],
    );
    const [streamingContent, setStreamingContent] = useState('');
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [providerError, setProviderError] = useState<{
        message: string;
        action_url: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Inline connect form state
    const [showKey, setShowKey] = useState(false);
    const connectForm = useForm<{
        provider: ProviderType;
        model: string;
        api_key: string;
        redirect_to: string;
    }>({
        provider: 'openai',
        model: 'gpt-4o-mini',
        api_key: '',
        redirect_to: '/assistant',
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setMessages(activeConversation?.messages || []);
        setStreamingContent('');
        setStreamError(null);
        setProviderError(null);
    }, [activeConversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter((c) => c.title.toLowerCase().includes(q));
    }, [conversations, searchQuery]);

    const handleCreateConversation = () => {
        router.post('/assistant/conversations');
    };

    const handleDeleteConversation = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            router.delete(`/assistant/conversations/${id}`);
        }
    };

    const handleSelectConversation = (id: number) => {
        router.get(`/assistant?conversation=${id}`);
    };

    const handleCopyMessage = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            // Clipboard fallback
        }
    };

    const handleSendPrompt = async (textToSend?: string) => {
        const text = textToSend || prompt;
        if (!text.trim() || isStreaming) return;

        if (!activeConversation) {
            router.post(
                '/assistant/conversations',
                {},
                {
                    onSuccess: () => {
                        // User redirected to new conversation
                    },
                },
            );
            return;
        }

        const userMsg: Message = {
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setPrompt('');
        setIsStreaming(true);
        setStreamingContent('');
        setStreamError(null);
        setProviderError(null);

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const response = await fetch(
                `/assistant/conversations/${activeConversation.id}/stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'text/event-stream',
                    },
                    body: JSON.stringify({ prompt: text }),
                },
            );

            if (!response.ok || !response.body) {
                throw new Error('Failed to connect to assistant stream.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.type === 'text') {
                                accumulated += data.delta;
                                setStreamingContent(accumulated);
                            } else if (data.type === 'tool_call') {
                                setActiveTool(data.tool);
                            } else if (data.type === 'tool_result') {
                                setActiveTool(null);
                            } else if (data.type === 'error') {
                                setStreamError(data.message);
                            } else if (data.type === 'provider_error') {
                                setProviderError({
                                    message: data.message,
                                    action_url: data.action_url,
                                });
                            } else if (data.type === 'done') {
                                setActiveTool(null);
                            }
                        } catch {
                            // Heartbeat or malformed chunk
                        }
                    }
                }
            }

            if (accumulated) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: accumulated,
                        created_at: new Date().toISOString(),
                    },
                ]);
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An error occurred during communication.';
            setStreamError(errorMessage);
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
            setActiveTool(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSendPrompt();
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        void handleSendPrompt();
    };

    const handleProviderChange = (newProvider: ProviderType) => {
        const defaultModel = PROVIDER_MODELS[newProvider][0].id;
        connectForm.setData({
            ...connectForm.data,
            provider: newProvider,
            model: defaultModel,
        });
    };

    const handleConnectSubmit = (e: FormEvent) => {
        e.preventDefault();
        connectForm.post('/settings/ai/connect', {
            preserveScroll: true,
            onSuccess: () => {
                connectForm.reset('api_key');
            },
        });
    };

    return (
        <>
            <Head title="AI Nutrition Assistant" />

            {!isConnected ? (
                /* ========================================================
                   UNCONNECTED ONBOARDING DASHBOARD: FULL-WIDTH SHOWCASE
                   ======================================================== */
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                        {/* Left Hero & Capabilities */}
                        <div className="space-y-8 lg:col-span-7">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-xs">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>
                                        Zero Platform Markup • Private by Design
                                    </span>
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                    Your Personal AI Nutrition & Macro Copilot
                                </h1>

                                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    Connect your OpenAI, Anthropic, Gemini, or
                                    DeepSeek API key. Query your logged foods,
                                    evaluate daily macronutrient targets, and
                                    get personalized meal recommendations
                                    directly at wholesale provider token rates.
                                </p>
                            </div>

                            {/* 4 Feature Highlights Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs transition hover:border-primary/40">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Target Profiles & Goals
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Calculates remaining calorie, protein,
                                        carb, and fat budgets based on your
                                        active goal.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs transition hover:border-primary/40">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                        <Utensils className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Diary & Meal Analysis
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Summarizes breakfast, lunch, and dinner
                                        entries without manual calculations or
                                        spreadsheets.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs transition hover:border-primary/40">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                        <Database className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Food & Macro Database
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Checks nutritional density, serving
                                        sizes, and micronutrient profiles
                                        instantly.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs transition hover:border-primary/40">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Weight & Trend Insights
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Correlates rolling caloric deficits
                                        against logged weigh-ins to forecast
                                        milestones.
                                    </p>
                                </div>
                            </div>

                            {/* Trust Architecture Pills */}
                            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    <span>AES-256 GCM Encrypted Vault</span>
                                </div>
                                <span className="hidden text-border sm:inline">
                                    •
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Cpu className="h-4 w-4 text-blue-500" />
                                    <span>Isolated Execution</span>
                                </div>
                                <span className="hidden text-border sm:inline">
                                    •
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    <span>Wholesale Provider Rates</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Quick Setup Card */}
                        <div className="lg:col-span-5">
                            <Card className="border-border/80 bg-card shadow-xl">
                                <CardHeader className="space-y-2 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold">
                                                Connect AI Provider
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Start chatting immediately
                                                without leaving this page
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <form
                                        onSubmit={handleConnectSubmit}
                                        className="space-y-4"
                                    >
                                        {/* Provider Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Select AI Provider
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(
                                                    [
                                                        'openai',
                                                        'anthropic',
                                                        'gemini',
                                                        'deepseek',
                                                    ] as ProviderType[]
                                                ).map((prov) => {
                                                    const meta =
                                                        PROVIDER_METADATA[prov];
                                                    const isSelected =
                                                        connectForm.data
                                                            .provider === prov;
                                                    return (
                                                        <button
                                                            key={prov}
                                                            type="button"
                                                            onClick={() =>
                                                                handleProviderChange(
                                                                    prov,
                                                                )
                                                            }
                                                            className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                                                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                                            }`}
                                                        >
                                                            <div className="flex w-full items-center justify-between">
                                                                <span className="text-xs font-bold text-foreground">
                                                                    {meta.name}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="px-1 py-0 text-[10px] font-normal opacity-80"
                                                                >
                                                                    {meta.badge}
                                                                </Badge>
                                                            </div>
                                                            <span className="mt-0.5 text-[11px] opacity-70">
                                                                {meta.tagline}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <InputError
                                                message={
                                                    connectForm.errors.provider
                                                }
                                            />
                                        </div>

                                        {/* Model Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold">
                                                Model
                                            </Label>
                                            <Select
                                                value={connectForm.data.model}
                                                onValueChange={(val) =>
                                                    connectForm.setData(
                                                        'model',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PROVIDER_MODELS[
                                                        connectForm.data
                                                            .provider
                                                    ].map((m) => (
                                                        <SelectItem
                                                            key={m.id}
                                                            value={m.id}
                                                        >
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    connectForm.errors.model
                                                }
                                            />
                                        </div>

                                        {/* API Key Input */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="quick_api_key"
                                                    className="text-xs font-semibold"
                                                >
                                                    {
                                                        PROVIDER_METADATA[
                                                            connectForm.data
                                                                .provider
                                                        ].name
                                                    }{' '}
                                                    API Key
                                                </Label>
                                                <a
                                                    href={
                                                        PROVIDER_METADATA[
                                                            connectForm.data
                                                                .provider
                                                        ].keyUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                                                >
                                                    Get API key
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>

                                            <div className="relative">
                                                <Input
                                                    id="quick_api_key"
                                                    type={
                                                        showKey
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    value={
                                                        connectForm.data.api_key
                                                    }
                                                    onChange={(e) =>
                                                        connectForm.setData(
                                                            'api_key',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        PROVIDER_METADATA[
                                                            connectForm.data
                                                                .provider
                                                        ].keyPlaceholder
                                                    }
                                                    autoComplete="off"
                                                    className="pr-10 font-mono text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowKey(!showKey)
                                                    }
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
                                                message={
                                                    connectForm.errors.api_key
                                                }
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={
                                                connectForm.processing ||
                                                !connectForm.data.api_key.trim()
                                            }
                                            className="w-full gap-2 font-semibold shadow-sm"
                                        >
                                            {connectForm.processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Verifying Credentials...
                                                </>
                                            ) : (
                                                <>
                                                    <KeyRound className="h-4 w-4" />
                                                    Verify & Connect Assistant
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-center text-[11px] text-muted-foreground">
                                            Your key never leaves your encrypted
                                            server vault and is never used for
                                            AI training.
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                /* ========================================================
                   CONNECTED STATE: FULL-VIEWPORT AI WORKSPACE
                   ======================================================== */
                <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background lg:flex-row">
                    {/* Left Conversations Sidebar */}
                    <aside className="flex w-full shrink-0 flex-col border-b border-border/60 bg-muted/15 lg:w-80 lg:border-r lg:border-b-0">
                        {/* Sidebar Header & Search */}
                        <div className="space-y-3 border-b border-border/40 p-4">
                            <Button
                                onClick={handleCreateConversation}
                                className="w-full gap-2 font-semibold shadow-xs"
                                variant="default"
                            >
                                <Plus className="h-4 w-4" />
                                New Conversation
                            </Button>

                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search conversations..."
                                    className="h-8 bg-background/60 pl-8 text-xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Conversations Scrollable List */}
                        <div className="flex-1 space-y-1 overflow-y-auto p-2">
                            {filteredConversations.length === 0 ? (
                                <div className="px-4 py-12 text-center text-xs text-muted-foreground">
                                    {searchQuery ? (
                                        <p>
                                            No conversations matching &ldquo;
                                            {searchQuery}&rdquo;.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            <MessageSquare className="mx-auto h-6 w-6 opacity-40" />
                                            <p>No conversations yet.</p>
                                            <p className="text-[11px] opacity-70">
                                                Click &ldquo;New
                                                Conversation&rdquo; to begin.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const isActive =
                                        activeConversation?.id === conv.id;
                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() =>
                                                handleSelectConversation(
                                                    conv.id,
                                                )
                                            }
                                            className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                                                isActive
                                                    ? 'border border-primary/20 bg-primary/10 font-semibold text-primary shadow-xs'
                                                    : 'text-foreground hover:bg-muted/60'
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                <MessageSquare
                                                    className={`h-4 w-4 shrink-0 ${
                                                        isActive
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs">
                                                        {conv.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {formatRelativeTime(
                                                            conv.updated_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    handleDeleteConversation(
                                                        e,
                                                        conv.id,
                                                    )
                                                }
                                                className="rounded-md p-1.5 opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                                title="Delete thread"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Sidebar Footer: Active Provider Card */}
                        <div className="border-t border-border/40 bg-muted/20 p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex min-w-0 items-center gap-2">
                                    <div className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-foreground capitalize">
                                            {connection?.provider || 'AI'}{' '}
                                            Online
                                        </p>
                                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                                            {connection?.model || 'Active'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Link href="/settings/ai">
                                        <KeyRound className="h-3 w-3" />
                                        Keys
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Chat Panel */}
                    <main className="flex flex-1 flex-col overflow-hidden bg-background">
                        {/* Top Header Bar */}
                        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-card/40 px-4 backdrop-blur-xs sm:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-semibold text-foreground">
                                        {activeConversation?.title ||
                                            'Nutrition Assistant'}
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span>5 Smart Tools Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {connection?.model && (
                                    <Badge
                                        variant="secondary"
                                        className="hidden font-mono text-[11px] sm:inline-flex"
                                    >
                                        {connection.model}
                                    </Badge>
                                )}

                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <Link href="/settings/ai">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">
                                            AI Settings
                                        </span>
                                    </Link>
                                </Button>
                            </div>
                        </header>

                        {/* Transcript Area */}
                        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                            {messages.length === 0 && !streamingContent ? (
                                /* ========================================================
                                   EMPTY STATE / STARTER PROMPTS HERO
                                   ======================================================== */
                                <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center space-y-6 py-6 text-center">
                                    <div className="relative">
                                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 opacity-20 blur-sm" />
                                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                                            <Bot className="h-7 w-7" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                            How can I help you reach your goals?
                                        </h3>
                                        <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm">
                                            I have read-only access to your
                                            active targets, daily logs, and food
                                            library to deliver instant, grounded
                                            nutrition coaching.
                                        </p>
                                    </div>

                                    {/* Capabilities Badges */}
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="gap-1 py-1 text-[11px]"
                                        >
                                            <Target className="h-3 w-3 text-emerald-500" />
                                            Target Profiles
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="gap-1 py-1 text-[11px]"
                                        >
                                            <Utensils className="h-3 w-3 text-amber-500" />
                                            Diary Entries
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="gap-1 py-1 text-[11px]"
                                        >
                                            <Scale className="h-3 w-3 text-purple-500" />
                                            Daily Summaries
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="gap-1 py-1 text-[11px]"
                                        >
                                            <Database className="h-3 w-3 text-blue-500" />
                                            Food Database
                                        </Badge>
                                    </div>

                                    {/* Starter Cards Grid */}
                                    <div className="grid w-full grid-cols-1 gap-3 pt-2 text-left sm:grid-cols-2">
                                        {STARTER_PROMPTS.map((item, i) => {
                                            const IconComp = item.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSendPrompt(
                                                            item.prompt,
                                                        )
                                                    }
                                                    className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-xs transition hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm"
                                                >
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                <IconComp className="h-3.5 w-3.5" />
                                                            </div>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] font-normal"
                                                            >
                                                                {item.badge}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="text-xs font-semibold text-foreground transition group-hover:text-primary">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </div>

                                                    <span className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
                                                        Ask this prompt
                                                        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* ========================================================
                                   MESSAGE LOG
                                   ======================================================== */
                                <>
                                    {messages.map((msg, idx) => {
                                        const isUser = msg.role === 'user';
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex ${
                                                    isUser
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                                        isUser
                                                            ? 'rounded-tr-xs bg-primary text-primary-foreground shadow-sm'
                                                            : 'rounded-tl-xs border border-border/60 bg-card text-foreground shadow-xs'
                                                    }`}
                                                >
                                                    {!isUser && (
                                                        <div className="mb-2 flex items-center justify-between border-b border-border/30 pb-1.5 text-[11px] text-muted-foreground">
                                                            <span className="flex items-center gap-1 font-semibold text-primary">
                                                                <Bot className="h-3 w-3" />
                                                                Nutrition
                                                                Copilot
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCopyMessage(
                                                                        msg.content,
                                                                        idx,
                                                                    )
                                                                }
                                                                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] opacity-0 transition group-hover:opacity-100 hover:bg-muted"
                                                                title="Copy message"
                                                            >
                                                                {copiedIndex ===
                                                                idx ? (
                                                                    <>
                                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                                        <span>
                                                                            Copied
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="h-3 w-3" />
                                                                        <span>
                                                                            Copy
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div>
                                                        {formatMessageContent(
                                                            msg.content,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* Streaming In-Progress Assistant Bubble */}
                            {streamingContent && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs border border-border/60 bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground shadow-xs">
                                        <div className="mb-2 flex items-center gap-1 border-b border-border/30 pb-1.5 text-[11px] font-semibold text-primary">
                                            <Bot className="h-3 w-3" />
                                            <span>Nutrition Copilot</span>
                                        </div>
                                        <div>
                                            {streamingContent}
                                            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tool Execution Pulse */}
                            {activeTool && (
                                <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-primary">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>
                                        {TOOL_DESCRIPTIONS[activeTool] ||
                                            `Executing tool (${activeTool})...`}
                                    </span>
                                </div>
                            )}

                            {/* Streaming Thinking State */}
                            {isStreaming &&
                                !streamingContent &&
                                !activeTool && (
                                    <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span>
                                            Analyzing nutrition logs and
                                            formulating response...
                                        </span>
                                    </div>
                                )}

                            {/* Streaming Error */}
                            {streamError && (
                                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{streamError}</span>
                                </div>
                            )}

                            {/* Provider Authentication / Quota Error */}
                            {providerError && (
                                <div className="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <AlertCircle className="h-4 w-4" />
                                        AI Provider Action Required
                                    </div>
                                    <p className="text-muted-foreground dark:text-neutral-300">
                                        {providerError.message}
                                    </p>
                                    <div className="pt-1">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="destructive"
                                            className="gap-2"
                                        >
                                            <Link
                                                href={providerError.action_url}
                                            >
                                                <KeyRound className="h-3.5 w-3.5" />
                                                Open AI Settings
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Bottom Input Area */}
                        <div className="space-y-2.5 border-t border-border/40 bg-card/50 p-3 backdrop-blur-xs sm:p-4">
                            {/* Suggestion Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                <span className="mr-1 shrink-0 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    Suggestions:
                                </span>
                                {QUICK_PILLS.map((pill, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSendPrompt(pill)}
                                        disabled={isStreaming}
                                        className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:bg-muted hover:text-foreground disabled:opacity-50"
                                    >
                                        {pill}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Form */}
                            <form
                                onSubmit={onSubmit}
                                className="relative rounded-2xl border border-border/80 bg-background shadow-xs transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
                            >
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything about your calories, macros, diary logs, or food ideas..."
                                    disabled={isStreaming}
                                    className="max-h-32 min-h-[46px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:ring-0 focus:outline-hidden"
                                />

                                <div className="flex items-center justify-between border-t border-border/20 px-3 py-2 text-[11px] text-muted-foreground">
                                    <span className="hidden sm:inline">
                                        Press{' '}
                                        <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                                            Enter
                                        </kbd>{' '}
                                        to send,{' '}
                                        <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                                            Shift+Enter
                                        </kbd>{' '}
                                        for newline
                                    </span>

                                    <Button
                                        type="submit"
                                        disabled={isStreaming || !prompt.trim()}
                                        size="sm"
                                        className="ml-auto h-7 gap-1.5 px-3 text-xs"
                                    >
                                        {isStreaming ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>Thinking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send</span>
                                                <Send className="h-3 w-3" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </main>
                </div>
            )}
        </>
    );
}

AssistantPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'AI Assistant',
            href: '/assistant',
        },
    ],
};
