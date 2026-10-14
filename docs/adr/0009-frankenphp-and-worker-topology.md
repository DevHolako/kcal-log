# ADR 0009: FrankenPHP and Dedicated Worker Service Topology

## Context
Deploying modern Laravel applications with WebSockets, queued tasks, and scheduled jobs in Docker/Coolify requires a clean process boundary and robust performance.

## Decision
We deploy using FrankenPHP (official Caddy-based PHP application server) and partition runtime responsibilities across distinct containers:
1. `web`: FrankenPHP serving HTTP/HTTPS requests and Inertia frontend assets.
2. `queue`: Worker container running `php artisan horizon` managing async queues.
3. `scheduler`: Worker running `php artisan schedule:work` executing recurring jobs (weekly adaptive recalculations, data purges).
4. `reverb`: Worker running `php artisan reverb:start` handling WebSocket connections.

## Consequences
- Single binary server architecture simplifies image building and Caddy SSL management.
- Isolates heavy background task execution from real-time web request handling.
