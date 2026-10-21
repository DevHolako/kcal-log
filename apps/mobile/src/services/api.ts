import { KcalApiClient } from '@kcal-log/api-client';
import type {
  Food,
  DiaryEntry,
  TargetProfile,
  WeightLog,
  AdaptiveAdjustment,
  WaterLog,
  DiaryDayResponse,
} from '@kcal-log/types';
import { APP_CONFIG } from '../config';
import { storage } from './storage';
import type { UserSession } from '../types';

export function normalizeFood(raw: any): Food {
  if (!raw) {
    return {
      id: 0,
      name: 'Unknown Food',
      brand: null,
      barcode: null,
      caloriesPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      fiberPer100g: 0,
      isCustom: false,
      servings: [],
    };
  }

  return {
    id: raw.id ?? 0,
    name: raw.name ?? 'Food Item',
    brand: raw.brand ?? null,
    barcode: raw.barcode ?? null,
    caloriesPer100g: Number(raw.calories_per_100g ?? raw.caloriesPer100g ?? 0),
    proteinPer100g: Number(raw.protein_per_100g ?? raw.proteinPer100g ?? 0),
    carbsPer100g: Number(raw.carbs_per_100g ?? raw.carbsPer100g ?? 0),
    fatPer100g: Number(raw.fat_per_100g ?? raw.fatPer100g ?? 0),
    fiberPer100g: Number(raw.fiber_per_100g ?? raw.fiberPer100g ?? 0),
    isCustom: Boolean(raw.is_custom ?? raw.isCustom),
    servings: Array.isArray(raw.servings)
      ? raw.servings.map((s: any) => ({
          id: s.id ?? 0,
          foodId: s.food_id ?? s.foodId ?? raw.id ?? 0,
          description: s.description ?? 'serving',
          grams: Number(s.grams ?? 100),
        }))
      : [],
  };
}

export function normalizeDiaryDay(raw: any, date: string): DiaryDayResponse {
  if (!raw) {
    return {
      date,
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      target: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      remaining: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      entries: [],
      waterLogs: [],
      waterTotalMl: 0,
      waterTargetMl: 2000,
      weightLog: null,
      measurements: null,
      exercises: [],
      exerciseCaloriesBurned: 0,
    };
  }

  // If already normalized with valid arrays and objects
  if (
    raw.totals &&
    typeof raw.totals.calories === 'number' &&
    raw.target &&
    typeof raw.target.calories === 'number' &&
    raw.remaining &&
    typeof raw.remaining.calories === 'number' &&
    Array.isArray(raw.entries)
  ) {
    return {
      date: raw.date || date,
      totals: raw.totals,
      target: raw.target,
      remaining: raw.remaining,
      entries: raw.entries.map((entry: any) => ({
        ...entry,
        mealSlot: entry.meal_slot ?? entry.mealSlot ?? 'breakfast',
        food: entry.food ? normalizeFood(entry.food) : undefined,
      })),
      waterLogs: Array.isArray(raw.waterLogs) ? raw.waterLogs : [],
      waterTotalMl: Number(raw.waterTotalMl ?? 0),
      waterTargetMl: Number(raw.waterTargetMl ?? 2000),
      weightLog: raw.weightLog ?? null,
      measurements: raw.measurements ?? null,
      exercises: Array.isArray(raw.exercises) ? raw.exercises : [],
      exerciseCaloriesBurned: Number(raw.exerciseCaloriesBurned ?? 0),
    };
  }

  const summary = raw.summary || {};
  const slots = raw.slots || {};

  // Extract entries from slots: { breakfast: { entries: [...] }, ... }
  const allEntries: DiaryEntry[] = [];
  const slotKeys: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  for (const slotKey of slotKeys) {
    const slotData = slots[slotKey];
    const slotEntries = Array.isArray(slotData?.entries)
      ? slotData.entries
      : Array.isArray(slotData)
        ? slotData
        : [];

    for (const entry of slotEntries) {
      if (!entry) continue;
      allEntries.push({
        id: entry.id,
        userId: entry.user_id ?? entry.userId ?? 0,
        date: entry.date ?? raw.date ?? date,
        mealSlot: (entry.meal_slot ?? entry.mealSlot ?? slotKey) as any,
        foodId: entry.food_id ?? entry.foodId ?? 0,
        foodServingId: entry.food_serving_id ?? entry.foodServingId ?? null,
        quantity: Number(entry.quantity ?? 1),
        consumedGrams: Number(entry.grams ?? entry.consumedGrams ?? 100),
        calories: Number(entry.calories ?? 0),
        protein: Number(entry.protein ?? 0),
        carbs: Number(entry.carbs ?? 0),
        fat: Number(entry.fat ?? 0),
        fiber: Number(entry.fiber ?? 0),
        servingDescription:
          entry.serving_description ??
          entry.servingDescription ??
          entry.serving?.description ??
          (entry.food?.name ? `${entry.food.name}` : undefined),
        food: entry.food ? normalizeFood(entry.food) : undefined,
        createdAt: entry.created_at ?? entry.createdAt,
        updatedAt: entry.updated_at ?? entry.updatedAt,
      });
    }
  }

  // Also handle if raw had entries at root
  if (Array.isArray(raw.entries) && allEntries.length === 0) {
    for (const entry of raw.entries) {
      if (!entry) continue;
      allEntries.push({
        id: entry.id,
        userId: entry.user_id ?? entry.userId ?? 0,
        date: entry.date ?? raw.date ?? date,
        mealSlot: (entry.meal_slot ?? entry.mealSlot ?? 'breakfast') as any,
        foodId: entry.food_id ?? entry.foodId ?? 0,
        foodServingId: entry.food_serving_id ?? entry.foodServingId ?? null,
        quantity: Number(entry.quantity ?? 1),
        consumedGrams: Number(entry.grams ?? entry.consumedGrams ?? 100),
        calories: Number(entry.calories ?? 0),
        protein: Number(entry.protein ?? 0),
        carbs: Number(entry.carbs ?? 0),
        fat: Number(entry.fat ?? 0),
        fiber: Number(entry.fiber ?? 0),
        servingDescription:
          entry.serving_description ??
          entry.servingDescription ??
          entry.serving?.description,
        food: entry.food ? normalizeFood(entry.food) : undefined,
        createdAt: entry.created_at ?? entry.createdAt,
        updatedAt: entry.updated_at ?? entry.updatedAt,
      });
    }
  }

  const totals = {
    calories: Number(
      summary.total_calories ??
        raw.totals?.calories ??
        allEntries.reduce((s, e) => s + e.calories, 0)
    ),
    protein: Number(
      summary.total_protein ??
        raw.totals?.protein ??
        allEntries.reduce((s, e) => s + e.protein, 0)
    ),
    carbs: Number(
      summary.total_carbs ??
        raw.totals?.carbs ??
        allEntries.reduce((s, e) => s + e.carbs, 0)
    ),
    fat: Number(
      summary.total_fat ??
        raw.totals?.fat ??
        allEntries.reduce((s, e) => s + e.fat, 0)
    ),
    fiber: Number(
      summary.total_fiber ??
        raw.totals?.fiber ??
        allEntries.reduce((s, e) => s + e.fiber, 0)
    ),
  };

  const target = {
    calories: Number(summary.target_calories ?? raw.target?.calories ?? 2000),
    protein: Number(summary.target_protein ?? raw.target?.protein ?? 150),
    carbs: Number(summary.target_carbs ?? raw.target?.carbs ?? 200),
    fat: Number(summary.target_fat ?? raw.target?.fat ?? 65),
  };

  const remaining = {
    calories: Number(
      summary.remaining_calories ??
        raw.remaining?.calories ??
        Math.max(0, target.calories - totals.calories)
    ),
    protein: Number(
      summary.remaining_protein ??
        raw.remaining?.protein ??
        Math.max(0, target.protein - totals.protein)
    ),
    carbs: Number(
      summary.remaining_carbs ??
        raw.remaining?.carbs ??
        Math.max(0, target.carbs - totals.carbs)
    ),
    fat: Number(
      summary.remaining_fat ??
        raw.remaining?.fat ??
        Math.max(0, target.fat - totals.fat)
    ),
  };

  return {
    date: raw.date ?? date,
    totals,
    target,
    remaining,
    entries: allEntries,
    waterLogs: Array.isArray(raw.waterLogs) ? raw.waterLogs : [],
    waterTotalMl: Number(summary.water_ml ?? raw.waterTotalMl ?? 0),
    waterTargetMl: Number(summary.target_water_ml ?? raw.waterTargetMl ?? 2000),
    weightLog:
      summary.weight_kg != null
        ? {
            id: 0,
            userId: 0,
            date: raw.date ?? date,
            weightKg: Number(summary.weight_kg),
            note: summary.weight_note ?? null,
            trendWeightKg: null,
            recordedAt: raw.date ?? date,
          }
        : raw.weightLog ?? null,
    measurements: summary.body_measurement ?? raw.measurements ?? null,
    exercises: Array.isArray(summary.exercise_logs)
      ? summary.exercise_logs
      : Array.isArray(raw.exercises)
        ? raw.exercises
        : [],
    exerciseCaloriesBurned: Number(
      summary.exercise_calories_burned ?? raw.exerciseCaloriesBurned ?? 0
    ),
  };
}

export class MobileApiService {
  private client: KcalApiClient;
  private currentBaseUrl: string;
  private token: string | null = null;
  private onUnauthorizedCallback?: () => void;

  constructor(baseUrl: string = APP_CONFIG.DEFAULT_API_BASE_URL) {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    this.currentBaseUrl = cleanUrl;
    this.client = new KcalApiClient({
      baseUrl: cleanUrl,
      token: null,
      onUnauthorized: () => {
        this.token = null;
        storage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
      },
    });
  }

  public setOnUnauthorized(cb: () => void): void {
    this.onUnauthorizedCallback = cb;
  }

  public async initialize(): Promise<string | null> {
    const savedUrl = await storage.getItem(APP_CONFIG.STORAGE_KEYS.API_BASE_URL);
    if (savedUrl && !savedUrl.includes('10.0.2.2')) {
      this.setBaseUrl(savedUrl);
    } else {
      this.setBaseUrl(APP_CONFIG.DEFAULT_API_BASE_URL);
    }
    const savedToken = await storage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (savedToken) {
      this.setToken(savedToken);
      return savedToken;
    }
    return null;
  }

  public getBaseUrl(): string {
    return this.currentBaseUrl;
  }

  public setBaseUrl(url: string): void {
    const cleanUrl = url.replace(/\/+$/, '');
    this.currentBaseUrl = cleanUrl;
    this.client = new KcalApiClient({
      baseUrl: cleanUrl,
      token: this.token,
      onUnauthorized: this.onUnauthorizedCallback,
    });
    storage.setItem(APP_CONFIG.STORAGE_KEYS.API_BASE_URL, cleanUrl);
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    this.client.setToken(token);
    if (token) {
      storage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      storage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  public async login(
    email: string,
    password: string,
    deviceName: string = 'Android Mobile'
  ): Promise<{
    token: string;
    user: UserSession;
    profile: Record<string, unknown> | null;
    activeTarget: TargetProfile | null;
  }> {
    const response = await this.client.request<{
      token: string;
      token_type: string;
      user: { id: number | string; name: string; email: string };
      profile: Record<string, unknown> | null;
      active_target: TargetProfile | null;
    }>('/api/v1/auth/tokens', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        device_name: deviceName,
      }),
    });

    this.setToken(response.token);
    return {
      token: response.token,
      user: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      },
      profile: response.profile ?? null,
      activeTarget: response.active_target ?? null,
    };
  }

  public async logout(): Promise<void> {
    try {
      this.setToken(null);
      await storage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_PROFILE);
    } catch {
      // Ignored
    }
  }

  public async getCurrentUser(): Promise<UserSession> {
    const user = await this.client.getCurrentUser();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // --- Diary Operations ---
  public async getDiaryDay(date: string): Promise<DiaryDayResponse> {
    try {
      const response = await this.client.getDiaryDay(date);
      const normalized = normalizeDiaryDay(response, date);
      // Cache response locally for offline reading
      await storage.setJSON(`${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${date}`, normalized);
      return normalized;
    } catch (err) {
      // Offline fallback: check local cache
      const cached = await storage.getJSON<DiaryDayResponse | null>(
        `${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${date}`,
        null
      );
      if (cached) {
        if (
          cached.totals &&
          typeof cached.totals.calories === 'number' &&
          cached.target &&
          cached.remaining &&
          Array.isArray(cached.entries)
        ) {
          return cached;
        }
        return normalizeDiaryDay(cached, date);
      }
      throw err;
    }
  }

  public async logFood(data: {
    date: string;
    mealSlot: string;
    foodId: string | number;
    foodServingId?: string | number | null;
    quantity: number;
    consumedGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  }): Promise<DiaryEntry> {
    return this.client.addDiaryEntry({
      date: data.date,
      meal_slot: data.mealSlot,
      food_id: data.foodId,
      food_serving_id: data.foodServingId ?? null,
      quantity: data.quantity,
      grams: data.consumedGrams,
    });
  }

  public async deleteDiaryEntry(entryId: string | number): Promise<{ message: string }> {
    return this.client.deleteDiaryEntry(entryId);
  }

  public async quickAddCalories(data: {
    date: string;
    mealSlot: string;
    calories: number;
    name?: string;
  }): Promise<any> {
    return this.client.quickAddDiary({
      date: data.date,
      meal_slot: data.mealSlot,
      calories: data.calories,
      description: data.name ?? 'Quick Add',
    });
  }

  public async logWater(date: string, amountMl: number): Promise<WaterLog> {
    return this.client.storeWaterLog({ date, amount_ml: amountMl });
  }

  public async deleteWater(waterLogId: string | number): Promise<{ message: string }> {
    return this.client.deleteWaterLog(waterLogId);
  }

  public async logWeight(data: {
    weightKg: number;
    recordedAt?: string;
    waistCm?: number | null;
    hipsCm?: number | null;
    chestCm?: number | null;
    notes?: string | null;
  }): Promise<WeightLog> {
    const log = await this.client.storeWeight({
      date: (data.recordedAt ?? new Date().toISOString()).split('T')[0],
      weight_kg: data.weightKg,
    });

    if (data.waistCm || data.hipsCm || data.chestCm || data.notes) {
      await this.client.storeMeasurements({
        date: (data.recordedAt ?? new Date().toISOString()).split('T')[0],
        waist_cm: data.waistCm ?? null,
        hips_cm: data.hipsCm ?? null,
        chest_cm: data.chestCm ?? null,
        notes: data.notes ?? null,
      });
    }

    return log;
  }

  // --- Food Catalog & Barcode ---
  public async searchFoods(query: string): Promise<Food[]> {
    try {
      const res = await this.client.searchFoods(query);
      const rawList = res?.items ?? (res as any)?.data ?? [];
      const list = rawList.map(normalizeFood);
      if (query.trim()) {
        for (const item of list.slice(0, 10)) {
          await this.cacheRecentFood(item);
        }
      }
      return list;
    } catch {
      return this.getCachedRecentFoods(query);
    }
  }

  public async lookupBarcode(barcode: string): Promise<Food> {
    return this.getFoodByBarcode(barcode);
  }

  public async getFoodByBarcode(barcode: string): Promise<Food> {
    const raw = await this.client.getFoodByBarcode(barcode);
    const unwrapped = (raw as any)?.data ?? raw;
    const food = normalizeFood(unwrapped);
    await this.cacheFoodItem(food);
    return food;
  }

  public async getCachedRecentFoods(query: string = ''): Promise<Food[]> {
    const cached = await storage.getJSON<Food[]>(APP_CONFIG.STORAGE_KEYS.FOODS_CACHE, []);
    const normalized = cached.map(normalizeFood);
    if (!query.trim()) {
      return normalized;
    }
    const lower = query.toLowerCase();
    return normalized.filter(f => f.name.toLowerCase().includes(lower));
  }

  public async cacheFoodItem(food: Food): Promise<void> {
    try {
      const cached = await storage.getJSON<Food[]>(APP_CONFIG.STORAGE_KEYS.FOODS_CACHE, []);
      const existsIndex = cached.findIndex(f => f.id === food.id || (f.barcode && f.barcode === food.barcode));
      if (existsIndex >= 0) {
        cached[existsIndex] = food;
      } else {
        cached.unshift(food);
        if (cached.length > 100) cached.pop();
      }
      await storage.setJSON(APP_CONFIG.STORAGE_KEYS.FOODS_CACHE, cached);
    } catch {
      // Cache error ignored
    }
  }

  private async cacheRecentFood(food: Food): Promise<void> {
    await this.cacheFoodItem(food);
  }

  // --- Adaptive System ---
  public async getCurrentAdaptiveAdjustment(): Promise<{
    adjustment: AdaptiveAdjustment | null;
    hasPending: boolean;
    recommendationText?: string;
  }> {
    const res = await this.client.getCurrentAdaptiveAdjustment();
    return {
      adjustment: res.adjustment,
      hasPending: res.adjustment ? res.adjustment.status === 'pending' : false,
      recommendationText: res.adjustment?.reason,
    };
  }

  public async acceptAdaptiveAdjustment(id: string | number): Promise<{
    message: string;
    activeTargetProfile: TargetProfile;
  }> {
    const res = await this.client.acceptAdaptiveAdjustment(id);
    return {
      message: res.message,
      activeTargetProfile: res.target,
    };
  }

  public async rejectAdaptiveAdjustment(id: string | number): Promise<{ message: string }> {
    return this.client.rejectAdaptiveAdjustment(id);
  }
}

export const api = new MobileApiService();
