# Notes: kcal-log (MyFitnessPal Monorepo)

## Context & Vision
- Building a modern, open-source MyFitnessPal replacement as a monorepo.
- Core goal: replicate MyFitnessPal's simple, intuitive nutrition and body tracking UX.
- Platforms: Responsive Web (Laravel + Inertia.js + React + shadcn/ui) + Mobile (Android APK).
- Backend & Shared API: Laravel (latest stable), Sanctum (session for web, Bearer tokens for mobile).
- Toolchain: Vite+ (`vp` CLI) with managed Node runtime for web, linting, testing, and formatting.
- Database: PostgreSQL (production/local), SQLite (automated tests), Redis (caching & queues).
- Queues & Realtime: Laravel Horizon (queues), Laravel Reverb + Laravel Echo (WebSockets).
- External Food Database: Open Food Facts (OFF) with user credential sync + anonymous fallback.
- Public Repository: `DevHolako/kcal-log` (strict secret hygiene: no committed secrets, pre-commit checks).
- Workspace Package Manager: `pnpm` workspace managed via `vp`, Node pinned to `v24.21.0`, Vite+ pinned to `1.1.0`.
- Data Precision: PostgreSQL `decimal` fields for all energy, nutrients, and measurements.
- Mobile Client: React Native with Expo in `/apps/mobile`, self-updating via verified GitHub Releases SHA-256.
- Food Storage: Unified `foods` and `food_servings` tables with offline caching.

## Channels & User Interfaces
- **Web App (`/apps/web`)**: Desktop and mobile browser interface using Inertia.js + React 19 + Tailwind CSS + shadcn/ui.
- **Mobile App (`/apps/mobile`)**: Android APK consuming REST API with local offline caching and camera barcode scanning.
- **Background Workers**: Horizon processing OFF synchronization, adaptive nutrition recalculations, PDF generation, and export streams.
- **Realtime Channel**: Reverb WebSockets broadcasting diary updates and export completion notifications.
