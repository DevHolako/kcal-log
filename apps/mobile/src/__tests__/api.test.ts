import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { MobileApiService } from '../services/api';
import { storage } from '../services/storage';
import { APP_CONFIG } from '../config';

describe('Mobile API Service & Offline Cache', () => {
  let apiService: MobileApiService;

  beforeEach(async () => {
    storage.setMemoryMode(true);
    await storage.clear();
    apiService = new MobileApiService('http://10.0.2.2:9000/');
    vi.restoreAllMocks();
  });

  it('normalizes base URL and trims trailing slashes', () => {
    expect(apiService.getBaseUrl()).toBe('http://10.0.2.2:9000');
    apiService.setBaseUrl('https://api.kcallog.org///');
    expect(apiService.getBaseUrl()).toBe('https://api.kcallog.org');
  });

  it('persists and restores auth tokens', async () => {
    expect(apiService.getToken()).toBeNull();
    apiService.setToken('test-sanctum-bearer-token');
    expect(apiService.getToken()).toBe('test-sanctum-bearer-token');

    const stored = await storage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    expect(stored).toBe('test-sanctum-bearer-token');

    apiService.setToken(null);
    expect(apiService.getToken()).toBeNull();
    const cleared = await storage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    expect(cleared).toBeNull();
  });

  it('serves cached diary response when network fetch fails', async () => {
    const testDate = '2026-10-21';
    const cachedResponse = {
      date: testDate,
      totals: { calories: 1850, protein: 140, carbs: 180, fat: 60, fiber: 25 },
      target: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      remaining: { calories: 150, protein: 10, carbs: 20, fat: 5 },
      entries: [],
      waterLogs: [],
      waterTotalMl: 1500,
      exercises: [],
      exerciseCaloriesBurned: 0,
    };

    // Populate local storage cache
    await storage.setJSON(
      `${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${testDate}`,
      cachedResponse
    );

    // Mock network fetch to fail (offline)
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to connect'));

    const result = await apiService.getDiaryDay(testDate);
    expect(result).toEqual(cachedResponse);
    expect(result.totals.calories).toBe(1850);
  });

  it('caches discovered foods from barcode scan into offline food catalog', async () => {
    const fakeFood = {
      id: 55,
      name: 'Organic Greek Yogurt',
      brand: 'Dairy Co',
      barcode: '1234567890123',
      isCustom: false,
      caloriesPer100g: 59,
      proteinPer100g: 10,
      carbsPer100g: 3.6,
      fatPer100g: 0.4,
      servings: [
        { id: 1, foodId: 55, description: '1 cup (170g)', grams: 170, isDefault: true },
      ],
    };

    await apiService.cacheFoodItem(fakeFood);

    // Mock fetch to reject (offline condition)
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline mode'));

    const offlineCatalog = await apiService.searchFoods('Yogurt');
    expect(offlineCatalog).toHaveLength(1);
    expect(offlineCatalog[0].name).toBe('Organic Greek Yogurt');
  });
});
