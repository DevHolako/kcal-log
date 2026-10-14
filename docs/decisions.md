# Engineering Decisions Log: kcal-log

This journal tracks all significant architectural, tooling, and design decisions across every phase of the project.

---

## 1. Monorepo Organization & Toolchain (Phase 1)
- **Monorepo Layout**: `/apps/web` (Laravel + Inertia + React), `/apps/mobile` (Expo React Native), `/packages/types`, `/packages/api-client`, `/packages/nutrition`.
- **Toolchain**: Vite+ (`vp` CLI v1.1.0) with managed Node runtime (`v24.21.0`) and `pnpm` workspace manager (`pnpm-workspace.yaml`). No Turborepo or Bun.
- **Git Branching Strategy**: Single branch per phase (e.g. `phase-1-scaffold`), conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), public repo security compliance.
- **Repository Remote Identity**: Derived once from `origin` remote: `DevHolako/kcal-log`.
- **Secret Guardrails**: Git pre-commit hook (`scripts/check-secrets.sh`) preventing `.env`, keystore, and key commits.

---

## 2. Domain & Data Precision (Phase 2)
- **Domain Modeling**: Standardized vocabulary documented in `GLOSSARY.md` (`Food`, `DiaryEntry`, `MealSlot`, `Serving`, `TargetProfile`, `DailySummary`, `OFFConnection`, `AdaptiveAdjustment`, `WeightLog`, `CustomFood`, `FoodServing`).
- **Precision Storage**: PostgreSQL `decimal` fields throughout schema (`decimal(8,2)` for calories/nutrients, `decimal(5,2)` for weights and circumferences) to prevent IEEE-754 floating-point drift.
- **Food Data Schema**: Unified `foods` and `food_servings` tables supporting both global cached Open Food Facts items and private user custom foods.

---

## 3. Auth, Onboarding & Nutrition Math (Phase 3)
- **Authentication**: Laravel Sanctum with dual driver pattern: SPA session cookies for `/apps/web`, Bearer API tokens for `/apps/mobile`.
- **Formulas**: Mifflin-St Jeor equation for BMR, standard physical activity levels (PAL: 1.2 to 1.9), and deficit/surplus calculations.
- **Auditability**: `target_profiles` persists both calculated targets and raw user formula inputs (`birth_date`, `sex`, `height_cm`, `weight_kg`, `activity_level`, `goal_type`, `weekly_rate_kg`).
- **Shared Code**: Nutrition calculations compiled into `@kcal-log/nutrition` for isomorphic execution across web and mobile.

---

## 4. Open Food Facts & Resilience (Phase 4)
- **Credential Storage**: Isolated in `user_off_connections` table, protected by Laravel's `encrypted` cast, hidden from serialization, never exposed via API.
- **Fallback Chain**: 3-tier lookup: (1) Authenticated OFF -> (2) Anonymous OFF -> (3) Local PostgreSQL cache. Degraded mode explicitly communicated to the user.
- **API Courtesy**: Identifiable User-Agent (`kcal-log/1.0 (https://github.com/DevHolako/kcal-log)`), client-side rate-limit backoff handling.

---

## 5. Reporting & Exports (Phase 5)
- **PDF Generation**: `barryvdh/laravel-dompdf` selected for pure-PHP server-side generation, avoiding Chromium/Puppeteer overhead in container environments.
- **Data Portability**: Full CSV and JSON exports excluding all sensitive connection tokens.

---

## 6. Realtime, Queues & Adaptive System (Phase 6)
- **Queues**: Laravel Horizon managing Redis queues for async exports, OFF sync, and notifications.
- **Realtime**: Laravel Reverb + Echo with private user channels (`private-user.{id}`) for `DiaryUpdated` and `ExportReady` events.
- **Adaptive Adjustment Checkpoint**: Weekly automated EWMA trend calculation with an explicit user confirmation checkpoint brief (push-right design). Proposals logged in `adaptive_adjustments`.

---

## 7. Mobile Platform & Self-Update (Phase 7)
- **Framework**: React Native with Expo (prebuild compatible). Maximizes code sharing with TypeScript packages.
- **Distribution & Self-Update**: Independent Android APK distribution via GitHub Releases. Checks latest releases against local semver, downloads and verifies SHA-256 hash before invoking Android `FileProvider` intent.

---

## 8. Deployment & CI/CD (Phase 8)
- **Production Runtime**: FrankenPHP for high-performance web serving, with dedicated lightweight containers for Horizon worker, schedule runner, and Reverb WebSocket server.
- **CI/CD**: GitHub Actions executing Vite+ checks (`vp lint`, `vp test`), Larastan, and signed Android release builds upon tag `v*`.
