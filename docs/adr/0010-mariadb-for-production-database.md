# ADR 0010: MariaDB for Production and Local Database

## Context
Initial design considered PostgreSQL. During workspace initialization, MariaDB was requested as the primary relational database system.

## Decision
We configure MariaDB (`driver: mariadb`, port 3306) as the database connection for local development and production Coolify deployments. Automated feature and unit tests continue to run seamlessly using in-memory SQLite (`:memory:`).

## Consequences
- Native support in Laravel 11/12 via `driver => 'mariadb'`.
- Fully compatible with `decimal(8,2)` and `decimal(5,2)` precision types for nutrition and anthropometric data.
- Lightweight container footprint in Coolify / Docker.
