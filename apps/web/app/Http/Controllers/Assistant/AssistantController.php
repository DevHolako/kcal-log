<?php

namespace App\Http\Controllers\Assistant;

use App\Ai\Agents\NutritionAssistant;
use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use App\Models\UserAiConnection;
use App\Services\ScopedAiRunner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class AssistantController extends Controller
{
    public function __construct(
        protected ScopedAiRunner $runner,
    ) {}

    /**
     * Display assistant chat interface.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $isConnected = UserAiConnection::where('user_id', $user->id)
            ->where('is_connected', true)
            ->exists();

        $conversations = AiConversation::where('user_id', $user->id)
            ->latest('updated_at')
            ->get();

        $conversationId = $request->query('conversation');
        $activeConversation = null;

        if ($conversationId) {
            $activeConversation = AiConversation::where('user_id', $user->id)
                ->where('id', $conversationId)
                ->with('messages')
                ->first();
        } elseif ($conversations->isNotEmpty()) {
            $activeConversation = AiConversation::where('user_id', $user->id)
                ->where('id', $conversations->first()->id)
                ->with('messages')
                ->first();
        }

        return Inertia::render('assistant', [
            'isConnected' => $isConnected,
            'conversations' => $conversations,
            'activeConversation' => $activeConversation ? [
                'id' => $activeConversation->id,
                'title' => $activeConversation->title,
                'messages' => $activeConversation->messages,
            ] : null,
        ]);
    }

    /**
     * Create a new conversation thread.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $conversation = AiConversation::create([
            'user_id' => $user->id,
            'title' => 'New Conversation',
        ]);

        return redirect()->route('assistant.index', ['conversation' => $conversation->id]);
    }

    /**
     * Delete a conversation thread.
     */
    public function destroy(AiConversation $conversation, Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($conversation->user_id !== $user->id) {
            abort(403);
        }

        $conversation->delete();

        return redirect()->route('assistant.index');
    }

    /**
     * Stream assistant response via Server-Sent Events (SSE).
     */
    public function stream(AiConversation $conversation, Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($conversation->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'prompt' => ['required', 'string', 'max:2000'],
        ]);

        $prompt = (string) $validated['prompt'];

        // Persist user prompt
        AiMessage::create([
            'ai_conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $prompt,
        ]);

        // Auto-title conversation on first prompt
        if ($conversation->title === 'New Conversation') {
            $conversation->update([
                'title' => Str::limit($prompt, 35),
            ]);
        }

        return response()->stream(function () use ($user, $conversation, $prompt) {
            try {
                $this->runner->run($user, function (UserAiConnection $connection) use ($user, $conversation, $prompt) {
                    $agent = new NutritionAssistant($user, $conversation);
                    $streamable = $agent->stream($prompt, provider: $connection->provider, model: $connection->model);

                    $fullText = '';
                    foreach ($streamable as $event) {
                        if ($event instanceof TextDelta) {
                            $fullText .= $event->delta;
                            echo 'data: '.json_encode(['type' => 'text', 'delta' => $event->delta])."\n\n";
                            if (ob_get_level() > 0) {
                                ob_flush();
                            }
                            flush();
                        } elseif ($event instanceof ToolCall) {
                            echo 'data: '.json_encode(['type' => 'tool_call', 'tool' => $event->toolCall->name])."\n\n";
                            if (ob_get_level() > 0) {
                                ob_flush();
                            }
                            flush();
                        } elseif ($event instanceof ToolResult) {
                            echo 'data: '.json_encode(['type' => 'tool_result', 'tool' => $event->toolCall->name])."\n\n";
                            if (ob_get_level() > 0) {
                                ob_flush();
                            }
                            flush();
                        }
                    }

                    if (! empty($fullText)) {
                        AiMessage::create([
                            'ai_conversation_id' => $conversation->id,
                            'role' => 'assistant',
                            'content' => $fullText,
                        ]);
                    }

                    echo 'data: '.json_encode(['type' => 'done'])."\n\n";
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                });
            } catch (Throwable $e) {
                $msgLower = strtolower($e->getMessage());
                $isQuotaOrAuth = $e->getCode() === 429
                    || $e->getCode() === 401
                    || str_contains($msgLower, 'quota')
                    || str_contains($msgLower, 'rate limit')
                    || str_contains($msgLower, '429')
                    || str_contains($msgLower, 'unauthorized')
                    || str_contains($msgLower, 'api key');

                if ($isQuotaOrAuth) {
                    UserAiConnection::where('user_id', $user->id)->update([
                        'is_connected' => false,
                    ]);

                    echo 'data: '.json_encode([
                        'type' => 'provider_error',
                        'message' => 'Your AI provider reported an issue: '.$e->getMessage().'. Please check your API key and billing quota in Settings.',
                        'action_url' => '/settings/ai',
                    ], JSON_UNESCAPED_SLASHES)."\n\n";
                } else {
                    echo 'data: '.json_encode(['type' => 'error', 'message' => $e->getMessage()])."\n\n";
                }

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
