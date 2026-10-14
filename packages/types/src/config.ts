/**
 * Canonical GitHub Repository Identity derived from git origin remote.
 * Single source of truth used across mobile self-update checks and CI/CD pipelines.
 */
export const REPOSITORY_OWNER = 'DevHolako' as const;
export const REPOSITORY_NAME = 'kcal-log' as const;
export const REPOSITORY_FULL_NAME = `${REPOSITORY_OWNER}/${REPOSITORY_NAME}` as const;
export const GITHUB_API_BASE = 'https://api.github.com' as const;
export const GITHUB_LATEST_RELEASE_URL = `${GITHUB_API_BASE}/repos/${REPOSITORY_FULL_NAME}/releases/latest` as const;
