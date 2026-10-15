#!/usr/bin/env sh
set -e

# Ensure writable directories exist even with mounted volumes
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

# Clean stale bootstrap caches and discover installed production packages
rm -f bootstrap/cache/*.php || true
php artisan package:discover || true

# Cache configuration, routes, and views if in production, primary web role, and not disabled
if [ "$APP_ENV" = "production" ] && [ "$SKIP_OPTIMIZATIONS" != "true" ] && { [ "$1" = "frankenphp" ] || [ "$ROLE" = "web" ]; }; then
    echo "⚡ Optimizing Laravel production caches..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
    php artisan event:cache || true
fi

# Ensure storage symlink is active
if [ "$1" = "frankenphp" ] || [ "$ROLE" = "web" ] || [ "$LINK_STORAGE" = "true" ]; then
    echo "🔗 Ensuring storage symlink..."
    php artisan storage:link --force || true
fi

# Run database migrations only on primary web container if flag enabled
if [ "$RUN_MIGRATIONS" = "true" ] && { [ "$1" = "frankenphp" ] || [ "$ROLE" = "web" ]; }; then
    echo "📦 Running database migrations..."
    php artisan migrate --force
fi

# Execute main process (FrankenPHP or worker command)
exec "$@"
