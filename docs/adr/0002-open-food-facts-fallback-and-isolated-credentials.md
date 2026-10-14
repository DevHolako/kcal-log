# ADR 0002: Open Food Facts Fallback Chain and Isolated Credentials

## Context
Food data originates from Open Food Facts (OFF), where users can authenticate with their personal accounts. The GitHub repository is public, and credentials or tokens must never leak, log, or cause system failures if network issues, rate limits, or encryption key rotations occur.

## Decision
1. We isolate OFF authentication data in a dedicated `user_off_connections` table. Sensitive attributes use Laravel's `encrypted` cast, are hidden from JSON serialization, never logged, and never returned via the API.
2. If token decryption fails or authentication expires, the system treats the OFF link as disconnected without breaking the user account.
3. Food lookups use a resilient, non-blocking 3-tier fallback chain:
   - Tier 1: OFF authenticated user session (if connected and valid).
   - Tier 2: OFF anonymous public endpoint (with app User-Agent and backoff).
   - Tier 3: Local PostgreSQL/SQLite cached food database and custom foods.

## Consequences
- Guarantees zero downtime or app freezes if Open Food Facts API is slow, down, or rate-limited.
- Strict isolation prevents third-party credential exposure even in full database exports.
- Degraded mode is clearly indicated to the user when results come from offline cache.
