# ADR 0007: Dompdf for Headless PDF Generation

## Context
PDF reports must be generated in queued background jobs via Laravel Horizon. Alternatives include headless browsers (Browsershot/Puppeteer/Playwright) or Weasyprint, which require large Chromium/Node/Python dependencies in container environments.

## Decision
We adopt `barryvdh/laravel-dompdf` (wrapping `dompdf/dompdf`) for server-side PDF compilation:
- Charts and graphics are rendered as inline SVG vector graphics within Blade templates.
- Entire generation pipeline executes in pure PHP within existing worker containers.

## Consequences
- Keeps Docker images slim and eliminates Chromium memory leaks or headless browser crashes in Coolify.
- SVG rendering ensures crisp print-ready output without rasterization artifacts.
