# ADR 0008: Realtime Sync via Laravel Reverb Private User Channels

## Context
Users log intake across multiple devices (e.g. mobile app while on the go, web app while at work). Realtime synchronization prevents stale state, and async export jobs need immediate delivery upon completion.

## Decision
We utilize Laravel Reverb and Laravel Echo over WebSockets with private user channels (`private-user.{id}`):
- `DiaryUpdated`: Broadcast when any diary entry, meal copy, or measurement is logged or modified.
- `ExportReady`: Broadcast when a PDF or data export finishes, carrying the signed download URL.
- Sanctum handles channel authorization for both session (web) and bearer tokens (mobile).

## Consequences
- Fast, secure, multi-device sync without continuous polling overhead.
- Native integration with Laravel broadcasting and Horizon queue workers.
