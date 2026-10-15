# ==============================================================================
# Multi-Stage Production Dockerfile for kcal-log
# Powered by FrankenPHP (Caddy + PHP 8.4) with Inertia React & Vite+
# ==============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

# Copy root monorepo config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/

# Install Node dependencies
RUN pnpm install --frozen-lockfile

# Copy web frontend source files
COPY apps/web/resources ./apps/web/resources
COPY apps/web/public ./apps/web/public
COPY apps/web/routes ./apps/web/routes
COPY apps/web/app ./apps/web/app
COPY apps/web/vite.config.ts apps/web/tsconfig.json apps/web/components.json ./apps/web/

# Build production assets (Vite+ / Rolldown)
RUN pnpm --filter @kcal-log/web build

# --- Stage 2: Install PHP Composer Dependencies ---
FROM composer:2 AS composer-builder
WORKDIR /app/apps/web

COPY apps/web/composer.json apps/web/composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

# --- Stage 3: Production Runtime (FrankenPHP) ---
FROM dunglas/frankenphp:1-php8.4-alpine AS runner

# Install essential PHP extensions for Laravel + MariaDB + Redis + Horizon
RUN install-php-extensions \
    pdo_mysql \
    redis \
    bcmath \
    pcntl \
    opcache \
    gd \
    zip \
    intl

# Copy custom configurations
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/php.ini /usr/local/etc/php/conf.d/kcal-log.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

# Copy application source code
COPY . /app

# Copy pre-built vendor dependencies and frontend assets
COPY --from=composer-builder /app/apps/web/vendor /app/apps/web/vendor
COPY --from=frontend-builder /app/apps/web/public/build /app/apps/web/public/build

# Set permissions for Laravel writable directories
RUN mkdir -p /app/apps/web/storage/framework/cache/data \
             /app/apps/web/storage/framework/sessions \
             /app/apps/web/storage/framework/views \
             /app/apps/web/storage/logs \
             /app/apps/web/bootstrap/cache && \
    chown -R www-data:www-data /app/apps/web/storage /app/apps/web/bootstrap/cache && \
    chmod -R 775 /app/apps/web/storage /app/apps/web/bootstrap/cache

# Environment defaults
ENV SERVER_NAME=":80"
ENV APP_ENV="production"
ENV FRANKENPHP_CONFIG="worker /app/apps/web/public/index.php"

WORKDIR /app/apps/web

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
