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
    if (savedUrl) {
      this.setBaseUrl(savedUrl);
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
    await storage.setJSON(APP_CONFIG.STORAGE_KEYS.USER_PROFILE, {
      user: response.user,
      activeTarget: response.active_target,
    });

    return {
      token: response.token,
      user: response.user,
      profile: response.profile,
      activeTarget: response.active_target,
    };
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.client.revokeAllTokens();
      }
    } catch {
      // Best-effort remote revocation
    } finally {
      this.setToken(null);
      await storage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_PROFILE);
    }
  }

  public async getCurrentUser(): Promise<{
    user: UserSession;
    profile: Record<string, unknown> | null;
    activeTarget: TargetProfile | null;
  }> {
    const res = await this.client.getUser();
    return {
      user: res.user as UserSession,
      profile: res.profile ?? null,
      activeTarget: res.target_profile ?? null,
    };
  }

  // --- Diary Operations ---
  public async getDiaryDay(date: string): Promise<DiaryDayResponse> {
    try {
      const response = await this.client.getDiaryDay(date);
      // Cache response locally for offline reading
      await storage.setJSON(`${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${date}`, response);
      return response;
    } catch (err) {
      // Offline fallback: check local cache
      const cached = await storage.getJSON<DiaryDayResponse | null>(
        `${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${date}`,
        null
      );
      if (cached) {
        return cached;
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
      return res.items || [];
    } catch {
      // Offline fallback: check cached foods matching query
      const cachedFoods = await storage.getJSON<Food[]>(APP_CONFIG.STORAGE_KEYS.FOODS_CACHE, []);
      const lower = query.toLowerCase().trim();
      if (lower.length > 0) {
        return cachedFoods.filter(f => f.name.toLowerCase().includes(lower));
      }
      return cachedFoods;
    }
  }

  public async lookupBarcode(barcode: string): Promise<Food> {
    const food = await this.client.getFoodByBarcode(barcode);
    // Add discovered food to offline catalog cache
    await this.cacheFoodItem(food);
    return food;
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
