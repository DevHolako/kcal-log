import { Head, Link, router } from '@inertiajs/react';
import {
    Bot,
    KeyRound,
    Loader2,
    MessageSquare,
    Plus,
    Send,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

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

interface Props {
    isConnected: boolean;
    conversations: Conversation[];
    activeConversation?: {
        id: number;
        title: string;
        messages: Message[];
    } | null;
}

const STARTER_PROMPTS = [
    'What are my calorie and macronutrient targets today?',
    'What foods have I logged today so far?',
    'How do my calories compare to my goal over the past 3 days?',
    'Give me high-protein meal suggestions fitting my remaining targets.',
];

export default function AssistantPage({
    isConnected,
    conversations,
    activeConversation,
}: Props) {
    const [prompt, setPrompt] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [messages, setMessages] = useState<Message[]>(
        activeConversation?.messages || [],
    );
    const [streamingContent, setStreamingContent] = useState('');
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [streamError, setStreamError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(activeConversation?.messages || []);
        setStreamingContent('');
        setStreamError(null);
    }, [activeConversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

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

    const handleSendPrompt = async (textToSend?: string) => {
        const text = textToSend || prompt;
        if (!text.trim() || isStreaming) return;

        if (!activeConversation) {
            // Create conversation and then send prompt
            router.post(
                '/assistant/conversations',
                {},
                {
                    onSuccess: () => {
                        // User will be redirected to new conversation
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
                            } else if (data.type === 'done') {
                                setActiveTool(null);
                            }
                        } catch {
                            // Non-json or keep-alive heartbeat
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
        } catch (err: any) {
            setStreamError(
                err.message || 'An error occurred during communication.',
            );
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
            setActiveTool(null);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        void handleSendPrompt();
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'AI Assistant', href: '/assistant' },
            ]}
        >
            <Head title="Nutrition Assistant" />

            <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 p-4 lg:flex-row">
                {/* Onboarding State: Key Not Configured */}
                {!isConnected ? (
                    <div className="m-auto max-w-lg text-center">
                        <Card className="border-border/80 shadow-md">
                            <CardHeader className="space-y-3 pb-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Bot className="h-7 w-7" />
                                </div>
                                <CardTitle className="text-xl">
                                    AI Nutrition Assistant
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Connect your OpenAI or Anthropic API key to
                                    activate your personalized, privacy-first
                                    nutrition assistant.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
                                    <p>
                                        • <strong>Bring Your Own Key:</strong>{' '}
                                        Pay standard wholesale token rates
                                        directly to your provider.
                                    </p>
                                    <p>
                                        • <strong>Smart Tools:</strong> Queries
                                        your diary entries, food items, and
                                        targets safely without write operations.
                                    </p>
                                </div>

                                <Button asChild className="w-full gap-2">
                                    <Link href="/settings/ai">
                                        <KeyRound className="h-4 w-4" />
                                        Configure AI Credentials
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
                        {/* Conversation Sidebar */}
                        <div className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 lg:w-72">
                            <Button
                                onClick={handleCreateConversation}
                                className="w-full gap-2 shadow-xs"
                                variant="outline"
                            >
                                <Plus className="h-4 w-4" />
                                New Conversation
                            </Button>

                            <div className="flex-1 space-y-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No conversations yet.
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
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
                                                className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                    <span className="truncate">
                                                        {conv.title}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleDeleteConversation(
                                                            e,
                                                            conv.id,
                                                        )
                                                    }
                                                    className={`rounded p-1 opacity-0 transition group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 ${
                                                        isActive
                                                            ? 'text-primary-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                    title="Delete thread"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Main Chat Panel */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-semibold">
                                        {activeConversation?.title ||
                                            'Nutrition Assistant'}
                                    </h3>
                                </div>

                                <Link
                                    href="/settings/ai"
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    AI Settings
                                </Link>
                            </div>

                            {/* Message Transcript */}
                            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                                {messages.length === 0 && !streamingContent ? (
                                    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center space-y-4 text-center">
                                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold">
                                                How can I help you today?
                                            </h4>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Ask about your logged calories,
                                                macro targets, food details, or
                                                progress trends.
                                            </p>
                                        </div>

                                        <div className="grid w-full grid-cols-1 gap-2 text-left">
                                            {STARTER_PROMPTS.map(
                                                (promptText, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() =>
                                                            handleSendPrompt(
                                                                promptText,
                                                            )
                                                        }
                                                        className="rounded-lg border border-border/60 p-2.5 text-left text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
                                                    >
                                                        &ldquo;{promptText}
                                                        &rdquo;
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${
                                                msg.role === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                                                    msg.role === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border border-border/40 bg-muted/60 text-foreground'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Streaming Message Indicator */}
                                {streamingContent && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-2xl border border-border/40 bg-muted/60 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                            {streamingContent}
                                            <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-primary" />
                                        </div>
                                    </div>
                                )}

                                {activeTool && (
                                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs font-medium text-primary">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Checking your nutrition data ({activeTool})...
                                    </div>
                                )}

                                {isStreaming && !streamingContent && !activeTool && (
                                    <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Thinking and analyzing nutrition logs...
                                    </div>
                                )}

                                {streamError && (
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                        {streamError}
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="border-t border-border/40 bg-background p-3">
                                <form
                                    onSubmit={onSubmit}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        value={prompt}
                                        onChange={(e) =>
                                            setPrompt(e.target.value)
                                        }
                                        placeholder="Ask your nutrition assistant..."
                                        disabled={isStreaming}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isStreaming || !prompt.trim()}
                                        size="icon"
                                    >
                                        {isStreaming ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
