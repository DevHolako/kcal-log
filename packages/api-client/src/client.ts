import type {
  Food,
  DiaryEntry,
  TargetProfile,
  DailySummary,
  WeightLog,
  AdaptiveAdjustment,
  WaterLog,
  BodyMeasurement,
  ExerciseLog,
  MealRecipe,
  DiaryDayResponse,
  AuthTokenResponse,
} from '@kcal-log/types';

export interface ApiClientConfig {
  baseUrl: string;
  token?: string | null;
  getAuthToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
}

export class KcalApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private getAuthToken?: () => string | null | Promise<string | null>;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.token = config.token ?? null;
    this.getAuthToken = config.getAuthToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    let authToken = this.token;
    if (!authToken && this.getAuthToken) {
      authToken = await this.getAuthToken();
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: authToken ? 'same-origin' : 'include',
    });

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = (errorData as { message: string }).message;
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // --- Auth & Token Management ---
  public async createToken(deviceName: string): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>('/api/v1/auth/tokens', {
      method: 'POST',
      body: JSON.stringify({ device_name: deviceName }),
    });
  }

  public async getTokens(): Promise<{ tokens: Array<{ id: string | number; name: string; last_used_at: string | null; created_at: string }> }> {
    return this.request('/api/v1/auth/tokens');
  }

  public async revokeToken(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/auth/tokens/${id}`, {
      method: 'DELETE',
    });
  }

  public async revokeAllTokens(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/v1/auth/tokens', {
      method: 'DELETE',
    });
  }

  public async getUser(): Promise<{ user: any; profile?: any; target_profile?: TargetProfile | null }> {
    return this.request('/api/v1/user');
  }

  // --- Food Catalog & Custom Foods ---
  public async searchFoods(query: string, barcode?: string): Promise<{ items: Food[]; count: number }> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (barcode) params.set('barcode', barcode);
    const res = await this.request<any>(`/api/v1/foods/search?${params.toString()}`);
    const items = res?.items ?? res?.data ?? [];
    const count = res?.count ?? res?.total ?? (Array.isArray(items) ? items.length : 0);
    return { items, count };
  }

  public async getFoodByBarcode(barcode: string): Promise<Food> {
    const res = await this.request<any>(`/api/v1/foods/barcode/${encodeURIComponent(barcode)}`);
    return res?.data ?? res;
  }

  public async getFood(id: string | number): Promise<Food> {
    return this.request<Food>(`/api/v1/foods/${id}`);
  }

  public async calculateFood(
    id: string | number,
    payload: { grams?: number; serving_id?: string | number | null; quantity?: number }
  ): Promise<any> {
    return this.request(`/api/v1/foods/${id}/calculate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getCustomFoods(): Promise<{ foods: Food[] }> {
    return this.request<{ foods: Food[] }>('/api/v1/foods/custom');
  }

  public async createCustomFood(food: Partial<Food>): Promise<Food> {
    return this.request<Food>('/api/v1/foods/custom', {
      method: 'POST',
      body: JSON.stringify(food),
    });
  }

  public async getCustomFood(id: string | number): Promise<Food> {
    return this.request<Food>(`/api/v1/foods/custom/${id}`);
  }

  public async updateCustomFood(id: string | number, food: Partial<Food>): Promise<Food> {
    return this.request<Food>(`/api/v1/foods/custom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(food),
    });
  }

  public async deleteCustomFood(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/foods/custom/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Nutrition Diary & Biomarkers ---
  public async getDiaryDay(date: string): Promise<DiaryDayResponse> {
    return this.request<DiaryDayResponse>(`/api/v1/diary?date=${encodeURIComponent(date)}`);
  }

  public async addDiaryEntry(entry: {
    food_id: number | string;
    meal_slot: string;
    date: string;
    quantity?: number;
    grams?: number;
    food_serving_id?: number | string | null;
  }): Promise<DiaryEntry> {
    return this.request<DiaryEntry>('/api/v1/diary', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  public async quickAddDiary(entry: {
    date: string;
    meal_slot: string;
    calories: number;
    description?: string;
    protein?: number;
    carbs?: number;
    fat?: number;
  }): Promise<any> {
    return this.request('/api/v1/diary/quick-add', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  public async updateDiaryEntry(
    id: string | number,
    entry: {
      meal_slot?: string;
      quantity?: number;
      grams?: number;
      food_serving_id?: number | string | null;
    }
  ): Promise<DiaryEntry> {
    return this.request<DiaryEntry>(`/api/v1/diary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  public async deleteDiaryEntry(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/diary/${id}`, {
      method: 'DELETE',
    });
  }

  public async storeWaterLog(payload: { date: string; amount_ml: number }): Promise<WaterLog> {
    return this.request<WaterLog>('/api/v1/diary/water', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteWaterLog(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/diary/water/${id}`, {
      method: 'DELETE',
    });
  }

  public async storeWeight(payload: { date: string; weight_kg: number }): Promise<WeightLog> {
    return this.request<WeightLog>('/api/v1/diary/weight', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteWeight(date: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/diary/weight?date=${encodeURIComponent(date)}`, {
      method: 'DELETE',
    });
  }

  public async storeMeasurements(payload: {
    date: string;
    neck_cm?: number | null;
    waist_cm?: number | null;
    hips_cm?: number | null;
    chest_cm?: number | null;
    biceps_cm?: number | null;
    thighs_cm?: number | null;
    calves_cm?: number | null;
    notes?: string | null;
  }): Promise<BodyMeasurement> {
    return this.request<BodyMeasurement>('/api/v1/diary/measurements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteMeasurements(date: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/diary/measurements?date=${encodeURIComponent(date)}`, {
      method: 'DELETE',
    });
  }

  public async storeExercise(payload: {
    date: string;
    name: string;
    exercise_type: string;
    duration_minutes: number;
    calories_burned: number;
    notes?: string | null;
  }): Promise<ExerciseLog> {
    return this.request<ExerciseLog>('/api/v1/diary/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async deleteExercise(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/diary/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Recipes ---
  public async getRecipes(): Promise<{ recipes: MealRecipe[] }> {
    return this.request<{ recipes: MealRecipe[] }>('/api/v1/recipes');
  }

  public async createRecipe(recipe: {
    name: string;
    description?: string | null;
    servings: number;
    items: Array<{
      food_id: number | string;
      food_serving_id?: number | string | null;
      quantity: number;
      grams: number;
    }>;
  }): Promise<MealRecipe> {
    return this.request<MealRecipe>('/api/v1/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  }

  public async getRecipe(id: string | number): Promise<MealRecipe> {
    return this.request<MealRecipe>(`/api/v1/recipes/${id}`);
  }

  public async updateRecipe(
    id: string | number,
    recipe: {
      name: string;
      description?: string | null;
      servings: number;
      items: Array<{
        food_id: number | string;
        food_serving_id?: number | string | null;
        quantity: number;
        grams: number;
      }>;
    }
  ): Promise<MealRecipe> {
    return this.request<MealRecipe>(`/api/v1/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    });
  }

  public async deleteRecipe(id: string | number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/recipes/${id}`, {
      method: 'DELETE',
    });
  }

  public async logRecipeToDiary(
    id: string | number,
    payload: {
      date: string;
      meal_slot: string;
      servings: number;
      log_as_individual?: boolean;
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/recipes/${id}/log`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Adaptive System ---
  public async getCurrentAdaptiveAdjustment(): Promise<{ adjustment: AdaptiveAdjustment | null }> {
    const res = await this.request<any>('/api/v1/adaptive/current');
    const adjustment = res?.adjustment ?? res?.pending ?? res?.latest ?? null;
    return { adjustment };
  }

  public async getAdaptiveHistory(): Promise<{ history: AdaptiveAdjustment[] }> {
    return this.request('/api/v1/adaptive/history');
  }

  public async acceptAdaptiveAdjustment(id: string | number): Promise<{ message: string; target: TargetProfile }> {
    return this.request(`/api/v1/adaptive/${id}/accept`, {
      method: 'POST',
    });
  }

  public async rejectAdaptiveAdjustment(id: string | number): Promise<{ message: string }> {
    return this.request(`/api/v1/adaptive/${id}/reject`, {
      method: 'POST',
    });
  }

  public async triggerAdaptiveCalculation(): Promise<any> {
    return this.request('/api/v1/adaptive/trigger', {
      method: 'POST',
    });
  }

  // --- Reports & Exports ---
  public async getExports(): Promise<{ exports: any[] }> {
    return this.request('/api/v1/reports/exports');
  }

  public async createExport(payload: {
    format: 'csv' | 'json';
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    return this.request('/api/v1/reports/exports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
