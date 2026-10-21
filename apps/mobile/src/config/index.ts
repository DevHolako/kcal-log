import {
  REPOSITORY_OWNER,
  REPOSITORY_NAME,
  REPOSITORY_FULL_NAME,
  GITHUB_LATEST_RELEASE_URL,
} from '@kcal-log/types';

export const APP_CONFIG = {
  APP_NAME: 'kcal-log',
  VERSION: '0.1.0',
  DEFAULT_API_BASE_URL: 'http://10.0.2.2:9000', // Default Android emulator host loopback
  REPOSITORY_OWNER,
  REPOSITORY_NAME,
  REPOSITORY_FULL_NAME,
  GITHUB_LATEST_RELEASE_URL,
  STORAGE_KEYS: {
    AUTH_TOKEN: '@kcal_log:auth_token',
    USER_PROFILE: '@kcal_log:user_profile',
    API_BASE_URL: '@kcal_log:api_base_url',
    OFFLINE_QUEUE: '@kcal_log:offline_queue',
    DIARY_CACHE_PREFIX: '@kcal_log:diary_day:',
    FOODS_CACHE: '@kcal_log:foods_cache',
    WEIGHT_CACHE: '@kcal_log:weight_cache',
    LAST_SYNC_TIMESTAMP: '@kcal_log:last_sync',
  },
} as const;
