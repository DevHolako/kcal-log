import type {
  Food,
  DiaryEntry,
  TargetProfile,
  DailySummary,
  WeightLog,
  AdaptiveAdjustment,
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
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token ?? null;
    this.getAuthToken = config.getAuthToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // --- Health Check ---
  public async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }

  // --- Diary ---
  public async getDailySummary(date: string): Promise<DailySummary> {
    return this.request<DailySummary>(`/api/diary/summary?date=${encodeURIComponent(date)}`);
  }

  public async getDiaryEntries(date: string): Promise<DiaryEntry[]> {
    return this.request<DiaryEntry[]>(`/api/diary/entries?date=${encodeURIComponent(date)}`);
  }

  public async addDiaryEntry(entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    return this.request<DiaryEntry>('/api/diary/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  public async updateDiaryEntry(id: string | number, entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
    return this.request<DiaryEntry>(`/api/diary/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  public async deleteDiaryEntry(id: string | number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/diary/entries/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Foods ---
  public async searchFoods(query: string, barcode?: string): Promise<{ foods: Food[]; source: string }> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (barcode) params.set('barcode', barcode);
    return this.request<{ foods: Food[]; source: string }>(`/api/foods/search?${params.toString()}`);
  }

  public async getFood(id: string | number): Promise<Food> {
    return this.request<Food>(`/api/foods/${id}`);
  }

  // --- Target Profile ---
  public async getTargetProfile(): Promise<TargetProfile> {
    return this.request<TargetProfile>('/api/profile/target');
  }

  public async updateTargetProfile(profile: Partial<TargetProfile>): Promise<TargetProfile> {
    return this.request<TargetProfile>('/api/profile/target', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // --- Weight & Measurements ---
  public async getWeightLogs(limit = 30): Promise<WeightLog[]> {
    return this.request<WeightLog[]>(`/api/weight?limit=${limit}`);
  }

  public async addWeightLog(log: Partial<WeightLog>): Promise<WeightLog> {
    return this.request<WeightLog>('/api/weight', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  // --- Adaptive Adjustments ---
  public async getPendingAdjustment(): Promise<AdaptiveAdjustment | null> {
    return this.request<AdaptiveAdjustment | null>('/api/adaptive/pending');
  }

  public async respondToAdjustment(
    id: string | number,
    action: 'accept' | 'reject'
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/adaptive/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }
}
