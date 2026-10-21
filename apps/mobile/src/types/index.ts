import type {
  MealSlot,
  TargetProfile,
} from '@kcal-log/types';

export type RootTab = 'diary' | 'search' | 'weigh_in' | 'adaptive' | 'settings';

export type OfflineMutationType =
  | 'ADD_FOOD'
  | 'DELETE_ENTRY'
  | 'QUICK_ADD'
  | 'LOG_WATER'
  | 'LOG_WEIGHT';

export interface OfflineMutation<T = unknown> {
  id: string;
  type: OfflineMutationType;
  payload: T;
  createdAt: string;
  retryCount: number;
}

export interface AddFoodPayload {
  date: string;
  mealSlot: MealSlot;
  foodId: string | number;
  foodServingId?: string | number | null;
  quantity: number;
  consumedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  foodName?: string;
  servingDescription?: string;
}

export interface QuickAddPayload {
  date: string;
  mealSlot: MealSlot;
  calories: number;
  name?: string;
}

export interface LogWaterPayload {
  date: string;
  amountMl: number;
}

export interface LogWeightPayload {
  weightKg: number;
  recordedAt?: string;
  waistCm?: number | null;
  hipsCm?: number | null;
  chestCm?: number | null;
  notes?: string | null;
}

export interface DeleteEntryPayload {
  entryId: string | number;
  date: string;
}

export interface GitHubReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  content_type: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  apkAsset?: GitHubReleaseAsset | null;
  expectedSha256?: string | null;
}

export interface UserSession {
  id: number | string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: UserSession | null;
  activeTarget: TargetProfile | null;
  apiUrl: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}
