#!/usr/bin/env sh
set -e

# Cache configuration, routes, and views if in production and not disabled
if [ "$APP_ENV" = "production" ] && [ "$SKIP_OPTIMIZATIONS" != "true" ]; then
    echo "⚡ Optimizing Laravel production caches..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
    php artisan event:cache || true
fi

# Run database migrations if flag enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "📦 Running database migrations..."
    php artisan migrate --force
fi

# Execute main process (FrankenPHP or worker command)
exec "$@"
