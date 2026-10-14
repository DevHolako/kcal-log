# Architecture Specification: kcal-log

## 1. System Overview & Monorepo Topology

`kcal-log` is an open-source, privacy-first nutrition and fitness tracking monorepo designed as a clean, performant alternative to MyFitnessPal. It provides a shared Laravel REST API consumed by both an Inertia.js React web application and an Android mobile application built with React Native and Expo.

### Monorepo Structure

```
/
├── apps/
│   ├── web/                     # Laravel 12 + Inertia.js (React 19) + Tailwind CSS + shadcn/ui
│   └── mobile/                  # React Native + Expo Android application
├── packages/
│   ├── types/                   # Shared TypeScript models, DTOs, OpenAPI types, repo constants
│   ├── api-client/              # Universal typed HTTP client for Laravel REST API
│   └── nutrition/               # Isomorphic calculations (BMR, TDEE, macro splits, weight trend)
├── docs/
│   ├── adr/                     # Architectural Decision Records
│   ├── architecture.md          # System architecture specification
│   ├── decisions.md             # Running decision journal
│   └── secrets.md               # Secret inventory, backup, and rotation procedures
├── workflows/                   # Loop specifications (meal logging, weigh-in, adaptive targets, exports)
├── scripts/
│   └── check-secrets.sh         # Pre-commit secret leak prevention script
├── .gitignore                   # Universal monorepo ignore rules
├── pnpm-workspace.yaml          # Vite+ / pnpm workspace definition
└── package.json                 # Monorepo root tasks and toolchain configuration
```

---

## 2. Shared Repository Identity

The repository coordinates release workflows, self-updates, and API clients using a single source of truth derived from the `origin` remote:

- **Repository Owner**: `DevHolako`
- **Repository Name**: `kcal-log`
- **GitHub Target**: `DevHolako/kcal-log`

This value is defined canonically in `@kcal-log/types` and referenced by both mobile self-update checks and GitHub Actions release pipelines.

---

## 3. Technology Stack & Toolchain

### Backend & API
- **Framework**: Laravel 12 (latest stable).
- **Authentication**: Laravel Sanctum (session-based cookies for `/apps/web`, Bearer tokens for `/apps/mobile`).
- **Database**: PostgreSQL 16+ for local dev and production; SQLite in-memory for automated tests.
- **Queues**: Laravel Horizon backed by Redis.
- **Realtime / WebSockets**: Laravel Reverb + Laravel Echo on private channels (`private-user.{id}`).
- **PDF Generation**: `barryvdh/laravel-dompdf` (Dompdf, pure PHP, no Chromium dependency).
- **API Documentation**: OpenAPI / Swagger generation.

### Web Application (`/apps/web`)
- **Integration**: Inertia.js React.
- **UI & Styling**: React 19, Tailwind CSS v4, shadcn/ui component primitives.
- **Bundler**: Vite with `laravel-vite-plugin` running under the Vite+ (`vp`) runtime.
- **Internationalization**: i18n-ready supporting English (`en`) and French (`fr`).

### Mobile Application (`/apps/mobile`)
- **Platform**: Android APK via React Native + Expo (prebuild compatible).
- **Offline Storage**: Local SQLite storage for diary caching and offline mutation queue.
- **Barcode Scanning**: Native camera integration with Open Food Facts barcode resolution.
- **Self-Update**: Native GitHub Releases updater verifying asset SHA-256 against published checksums.

### JavaScript Toolchain: Vite+ (`vp`)
- The workspace uses Vite+ (`vp` CLI) with its managed Node.js runtime (`v24.21.0`).
- Package manager: `pnpm` configured via `pnpm-workspace.yaml`.
- All frontend linting, formatting, tests, and builds run through `vp`.

---

## 4. Open Food Facts Integration & Resilience Chain

To protect user experience against network failures, rate limiting, and third-party API downtime, all food queries execute through a non-blocking 3-tier fallback chain:

```
[ Food Query: Text / Barcode ]
               │
               ▼
   [ 1. User OFF Session ] ──(Success)──► [ Cache in local DB & Return ]
               │ (Fails / Disconnected)
               ▼
   [ 2. Anonymous OFF API ] ──(Success)──► [ Cache in local DB & Return ]
               │ (Fails / Rate Limited / Offline)
               ▼
   [ 3. Local Database ] ──► [ Cached OFF Foods + Custom User Foods ]
```

- **Credential Isolation**: User Open Food Facts credentials/tokens are stored in `user_off_connections` encrypted at rest using Laravel's `encrypted` cast.
- If encryption keys rotate or tokens expire, the link gracefully drops to unauthenticated mode without interrupting diary operations or crashing the application.

---

## 5. Security Architecture (Public Repository Standard)

Because `kcal-log` is a public GitHub repository, zero secrets, `.env` files, or keystore files are permitted in git history:
1. **Pre-commit Gate**: `scripts/check-secrets.sh` blocks staging or committing credentials, `.env*` files, and private keys.
2. **Key Storage**: All secrets reside in GitHub Secrets and Coolify environment variables.
3. **App Key Lifecycle**: `APP_KEY` is generated once and persisted. Rotations use `APP_PREVIOUS_KEYS`.
4. **Android Signing**: The release keystore is base64-encoded in GitHub Secrets and decoded in ephemeral CI containers during tag builds (`v*`). The signing certificate SHA-256 is verified before release.
