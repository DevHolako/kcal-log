# ADR 0001: React Native with Expo for Mobile App

## Context
The project requires a cross-platform Android application that replicates the core UX of MyFitnessPal (diary, barcode scanning, offline queue, self-updating via GitHub Releases). The backend is Laravel with Sanctum, and shared packages (`@kcal-log/types`, `@kcal-log/api-client`, `@kcal-log/nutrition`) are authored in TypeScript.

## Decision
We select React Native with Expo (prebuild/bare workflow compatible) for `/apps/mobile`.

## Consequences
- Allows 100% code sharing for nutrition math, API client models, and TypeScript types across web and mobile.
- Expo Modules provide robust access to native hardware features like the camera (barcode scanning) and local SQLite storage for offline caching.
- Simplifies CI/CD pipelines since Vite+ / Node toolchains can lint, test, and typecheck both frontend workspaces.
- Avoids dual-language maintenance overhead that Kotlin/Jetpack Compose or Flutter would require.
