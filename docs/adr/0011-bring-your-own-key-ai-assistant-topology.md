# ADR 0011: Bring-Your-Own-Key AI Assistant Topology and FrankenPHP Scoped Execution

## Context
Users want an AI assistant (`NutritionAssistant`) capable of querying their nutritional logs, targets, and foods using tools provided by the Laravel AI SDK. Providing a centralized system API key incurs unpredictable operational costs and quota abuse risks. Additionally, in our deployment topology (ADR 0009), FrankenPHP operates in worker mode where PHP processes persist across requests; modifying global configuration dynamically without strict isolation could leak a user's API key into subsequent requests handled by the same worker.

## Decision
1. **Isolated BYOK Storage**: We store user API keys in a dedicated `user_ai_connections` table isolated from user profiles. Sensitive attributes (`api_key`) use Laravel's `encrypted` cast, are hidden from JSON serialization, and are validated via an initial lightweight provider handshake before activation.
2. **FrankenPHP Scoped Runtime**: Dynamic configuration is executed via a `ScopedAiRunner` service that applies the user's provider credentials into `config(['ai.providers...'])` only for the duration of the invocation, resetting the configuration in a guaranteed `finally` block to prevent worker state bleed.
3. **Server-Sent Events for Streaming**: LLM token streaming and tool execution progress stream via standard HTTP Server-Sent Events (SSE) rather than Laravel Reverb WebSockets, matching the native streaming semantics of the Laravel AI SDK and avoiding channel state overhead.
4. **Read-Only Scoped Tooling**: Assistant tools (`DailySummary`, `DiaryEntries`, `FoodSearch`, `TargetProfile`, `WeightHistory`) are strictly read-only, capped to a maximum 30-day query window, and hard-scoped to `auth()->id()`.

## Consequences
- Zero platform API billing liabilities; users pay directly via their own OpenAI or Anthropic accounts.
- Prevents inter-request credential contamination in persistent worker environments.
- Feature gracefully degrades: users without a configured `UserAiConnection` are prompted to add their key in settings before chat access is enabled.
