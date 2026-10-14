# ADR 0004: Unified Foods Schema with Local Caching

## Context
Food data originates from both Open Food Facts (global crowd-sourced catalog) and user-authored custom foods. Storing them in separate disparate schemas creates duplication and complicates diary queries and recent food searches.

## Decision
We store all foods in a unified `foods` table:
- Global cached items from Open Food Facts have `off_id` populated, `user_id = null`, and `is_custom = false`.
- User-created custom foods have `user_id` set, `off_id = null`, and `is_custom = true`.
- Servings are normalized in `food_servings` (e.g. serving description, gram multiplier).
- Once cached locally from Open Food Facts, a food item is cached persistently, with `last_synced_at` recording the fetch date.

## Consequences
- Searches and recent food queries execute across a single query with clean permission checks (`WHERE user_id IS NULL OR user_id = :userId`).
- Prevents external OFF updates from modifying or corrupting user-created custom food items.
