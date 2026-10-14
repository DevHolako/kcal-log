# Workflow: Export and Reporting

## Purpose
Generates downloadable, comprehensive PDF reports and data exports (CSV and JSON) of nutrition, weight, exercise, and diary history for coach review, medical visits, or personal data ownership.

## Trigger
**On-demand Event**: User requests an export or PDF report via the web or mobile interface, specifying date range (e.g. 7 days, 30 days, 90 days, or custom).

## Steps & Autonomous Action
1. **Request Dispatch**:
   - Web/Mobile sends export request to Laravel REST API with date range and format (`pdf`, `csv`, or `json`).
   - Endpoint validates range and dispatches a background queued job (`GenerateExportJob` / `GeneratePdfReportJob`) onto Horizon queue.
2. **Data Assembly & Document Generation (Autonomous)**:
   - Worker queries diary entries, daily summaries, macronutrient distributions, weight logs, and water records.
   - Excludes sensitive fields (OFF credentials, passwords, tokens).
   - For PDF: compiles formatted HTML with embedded Chart.js SVG snapshots and renders via headless PDF generator.
   - For CSV: generates archive containing `diary_entries.csv`, `weight_logs.csv`, `daily_summaries.csv`.
   - For JSON: generates standardized JSON schema archive.
   - Stores artifact in private storage with signed temporary download URL.
3. **Completion Notification**:
   - Realtime event broadcasted via Laravel Reverb to user's active session.
   - In-app notification with ready download link.

## Checkpoint
**Delivery Checkpoint**: User is presented with a direct "Download Ready" modal/toast with the signed URL. No data is modified.

## Edge Cases
- **Large Date Range**: Long-running generation jobs (>30s) run asynchronously without holding web request connections open.
- **Expiry**: Generated download URLs expire after 24 hours.
