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
- **Database Engine**: MariaDB 10.11+ configured with `utf8mb4_unicode_ci` for local dev and production deployments (with in-memory SQLite for high-speed automated tests).
- **Precision Storage**: Fixed-point `decimal` fields throughout MariaDB schema (`decimal(8,2)` for calories/nutrients, `decimal(5,2)` for weights and circumferences, `decimal(4,2)` for body fat and weekly rates) to prevent IEEE-754 floating-point drift.
- **Food Data Schema**: Unified `foods` and `food_servings` tables supporting both global cached Open Food Facts items (`is_custom = false`, `user_id = null`) and private user custom foods (`is_custom = true`, `user_id = {id}`).
- **Open Food Facts Security**: Credentials stored in `user_off_connections` using Laravel's `encrypted` attribute casting and hidden from JSON serialization.
- **Denormalized Daily Diary**: `diary_entries` stores calculated macro/calorie snapshots at logging time to enable O(1) daily totals without per-item joins.
- **Static Analysis Compliance**: All Eloquent models, relations, factories, and seeders strictly typed and validated against Larastan / PHPStan Level 5+ checks.

---

## 3. Auth, Onboarding & Nutrition Math (Phase 3)
- **Authentication**: Laravel Sanctum with dual driver pattern: SPA session cookies for `/apps/web`, Bearer API tokens for `/apps/mobile`.
- **Formulas**: Mifflin-St Jeor equation for BMR, standard physical activity levels (PAL: 1.2 to 1.9), and deficit/surplus calculations.
- **Auditability**: `target_profiles` persists both calculated targets and raw user formula inputs (`birth_date`, `sex`, `height_cm`, `weight_kg`, `activity_level`, `goal_type`, `weekly_rate_kg`).
- **Shared Code**: Nutrition calculations compiled into `@kcal-log/nutrition` for isomorphic execution across web and mobile.

---

## 4. Open Food Facts & Resilience (Phase 4)
- **Credential Storage**: Isolated in `user_off_connections` table, protected by Laravel's `encrypted` cast, hidden from serialization, never exposed via API.
- **Fallback Chain**: 3-tier lookup: (1) Authenticated OFF -> (2) Anonymous OFF -> (3) Local MariaDB/SQLite cache. Degraded mode explicitly communicated to the user with `is_degraded: true` flag and UI alert badges.
- **API Courtesy**: Identifiable User-Agent (`kcal-log/1.0 (https://github.com/DevHolako/kcal-log)`), 3s network timeout with non-blocking graceful fallback.
- **Auto-caching & Normalization**: Seamlessly persists discovered OFF foods and standard portions (`100g` default + extracted serving package) into `foods` and `food_servings` tables.
- **Custom Food Management**: Full CRUD for private user custom foods (`is_custom = true`, `user_id = {id}`) with multi-serving support and strict ownership isolation (403 Forbidden on foreign access).
- **Portion Nutrition Calculator**: High-precision formula calculating exact scaled calories, macros (protein, carbs, fat), fiber, sugar, and sodium for any serving multiplier.
- **Web UI & Settings**: Inertia pages for live food search and portion calculation (`/foods`) and Open Food Facts account management (`/settings/open-food-facts`).

---

## 5. Daily Diary, Reporting & Exports (Phase 5)
- **Diary Engine & Nutrition Aggregation**: Multi-slot meal structure (`breakfast`, `lunch`, `dinner`, `snack`) with frozen nutritional snapshot (`calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`) saved on `diary_entries` at logging time. Daily totals, targets, and remaining allowances computed in O(1) time without joins.
- **Quick-Add & Water Tracking**: Support for raw calorie quick-adds with arbitrary notes, plus millilitre-based water intake tracking (`water_logs`) with daily totals.
- **PDF Generation**: `barryvdh/laravel-dompdf` selected for pure-PHP server-side generation, avoiding Chromium/Puppeteer overhead in container environments. Generates clean nutrition summaries with KPI summary cards, SVG visual meters, and itemized daily tables.
- **Data Portability**: Full multi-table CSV (daily totals, entries, weights) and structured JSON exports excluding all sensitive connection tokens. Secured in private storage (`storage/app/private/exports/...`) and delivered via signed/authenticated streaming downloads.
- **Interactive UI**: Responsive Inertia Diary page (`/diary` & `/dashboard`) with date navigator (Yesterday/Today/Tomorrow), progress meters, Add Food search/portion modal, Quick-Add dialog, and Reports download manager (`/reports`).

---

## 6. Realtime, Queues & Adaptive System (Phase 6)
- **Queues & Horizon**: `laravel/horizon` managing Redis queues with supervisor configurations across `default`, `reports`, and `sync` queues. Asynchronous `ProcessReportExportJob` offloading CPU-intensive PDF/CSV/JSON report generation.
- **Realtime WebSockets (Reverb)**: `laravel/reverb` WebSocket server configured on port `9080` (maintaining the 9000-range port discipline alongside backend 9000 and Vite 9173). Private user channels (`user.{id}`) authorized in `routes/channels.php`.
- **Event Broadcasting**: `DiaryUpdated`, `ExportReady`, and `AdaptiveAdjustmentProposed` events broadcast over private channels. Frontend `echo.ts` client wired with automatic reactive reload in Diary, Reports, and Strategy views.
- **Adaptive Adjustment Engine**: `AdaptiveAdjustmentService` implementing Exponentially Weighted Moving Average (EWMA, $\alpha = 0.25$) bodyweight smoothing to isolate real fat/tissue changes from water fluctuations. Computes realized metabolic TDEE via energy balance equation (`average_daily_calories - (ewma_weight_change * 7700 / 7)`), applying caloric safety floors (1200 kcal female, 1500 kcal male).
- **Weekly Checkpoint Decision Brief**: Interactive Inertia `/strategy` dashboard and REST API (`/api/v1/adaptive/*`) featuring push-right comparative plan analysis (Current vs Proposed), EWMA trend visualization, and one-click acceptance/rejection with target profile activation.
- **Automated Scheduling**: Artisan command `adaptive:calculate` and `CalculateAdaptiveAdjustmentsJob` scheduled weekly for batch processing.

---

## 7. Mobile Platform & Self-Update (Phase 7)
- **Framework & Monorepo Integration**: React Native with Expo SDK 52 (prebuild compatible bare workflow) in `/apps/mobile`. Seamlessly consumes shared workspace packages (`@kcal-log/types`, `@kcal-log/api-client`, `@kcal-log/nutrition`) with Vite+ (`vp`) test runner.
- **Authentication**: Laravel Sanctum Bearer token driver via `/api/v1/auth/tokens`, isolated from web SPA session cookies. Configurable API server host (defaulting to `http://10.0.2.2:9000` for Android emulator loopback) with persistent token storage and automatic 401 revocation handlers.
- **MyFitnessPal Diary UX**: Intuitive date switcher, Calorie Budget card (`Goal - Food + Exercise = Remaining`), macro meters (Carbs, Protein, Fat) with gram allowances, 4 meal intake slots (`breakfast`, `lunch`, `dinner`, `snack`) with entry subtotals and quick-add dialogs, plus daily water tracker.
- **Food Catalog & Barcode Scanner**: Multi-tier food search fallback, native camera barcode scanner using `expo-camera` with viewfinder reticle, manual barcode fallback, and real-time portion scaling calculator modal.
- **Morning Weigh-in & EWMA Trend Smoothing**: Fast numeric input for body weight (kg/lbs switcher), body circumferences (waist, hips, chest), and Exponentially Weighted Moving Average (EWMA, $\alpha = 0.1$) trendline smoothing to filter water noise.
- **Weekly Adaptive Strategy Checkpoint (ADR 0003)**: Mobile decision brief displaying proposed calorie and macronutrient deltas alongside 14-day smoothed weight changes, with one-click Accept (`/api/v1/adaptive/{id}/accept`) and Decline (`/api/v1/adaptive/{id}/reject`) buttons.
- **Android APK Self-Update via GitHub Releases (ADR 0006)**: Automated check against `DevHolako/kcal-log` GitHub Releases API on app launch and in Settings. Parses semver tags, discovers `.apk` asset and `.sha256` checksum, cryptographically computes SHA-256 hash of the downloaded binary, verifies exact match, and triggers Android `FileProvider` package installer intent. Untrusted/mismatched binaries are strictly rejected.
- **Offline Resilience & Mutation Queue**: Persistent local cache for diary records and discovered foods. When network connectivity drops, mutations (`ADD_FOOD`, `DELETE_ENTRY`, `QUICK_ADD`, `LOG_WATER`, `LOG_WEIGHT`) are enqueued into a FIFO retry queue with optimistic UI updates and status banners, auto-synchronizing once reconnected.

---

## 8. Deployment & CI/CD (Phase 8)
- **Production Runtime**: FrankenPHP for high-performance web serving, with dedicated lightweight containers for Horizon worker, schedule runner, and Reverb WebSocket server.
- **CI/CD**: GitHub Actions executing Vite+ checks (`vp lint`, `vp test`), Larastan, and signed Android release builds upon tag `v*`.
