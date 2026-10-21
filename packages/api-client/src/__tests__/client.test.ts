import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { KcalApiClient } from "../client";

describe("KcalApiClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("normalizes base URL by stripping trailing slash", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 1, name: "Test" } }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({
      baseUrl: "https://api.kcal-log.test///",
      token: "secret-token",
    });

    await client.getUser();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe("https://api.kcal-log.test/api/v1/user");
  });

  it("attaches Authorization header when Bearer token is provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 1 } }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({
      baseUrl: "https://api.kcal-log.test",
      token: "my-bearer-token",
    });

    await client.getUser();

    const options = mockFetch.mock.calls[0][1];
    expect(options.headers["Authorization"]).toBe("Bearer my-bearer-token");
    expect(options.headers["Accept"]).toBe("application/json");
  });

  it("uses dynamic getAuthToken when static token is omitted", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 2 } }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({
      baseUrl: "https://api.kcal-log.test",
      getAuthToken: async () => "async-token-123",
    });

    await client.getUser();

    const options = mockFetch.mock.calls[0][1];
    expect(options.headers["Authorization"]).toBe("Bearer async-token-123");
  });

  it("triggers onUnauthorized callback on 401 response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Unauthenticated." }),
    });
    globalThis.fetch = mockFetch as any;

    const onUnauthorized = vi.fn();
    const client = new KcalApiClient({
      baseUrl: "https://api.kcal-log.test",
      onUnauthorized,
    });

    await expect(client.getUser()).rejects.toThrow("Unauthenticated.");
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("throws descriptive error message on API failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({ message: "The date field is required." }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({
      baseUrl: "https://api.kcal-log.test",
    });

    await expect(client.getDiaryDay("")).rejects.toThrow(
      "The date field is required."
    );
  });

  it("formats diary queries to /api/v1/diary with date parameter", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        date: "2026-10-16",
        totals: { calories: 1800, protein: 140, carbs: 180, fat: 50, fiber: 25 },
        target: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
        remaining: { calories: 200, protein: 10, carbs: 20, fat: 15 },
        entries: [],
        waterLogs: [],
        waterTotalMl: 1500,
        exercises: [],
        exerciseCaloriesBurned: 300,
      }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({ baseUrl: "https://api.kcal-log.test" });
    const result = await client.getDiaryDay("2026-10-16");

    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.kcal-log.test/api/v1/diary?date=2026-10-16"
    );
    expect(result.date).toBe("2026-10-16");
    expect(result.totals.calories).toBe(1800);
  });

  it("formats food search queries to /api/v1/foods/search", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], count: 0 }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({ baseUrl: "https://api.kcal-log.test" });
    await client.searchFoods("oats", "0123456789");

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe(
      "https://api.kcal-log.test/api/v1/foods/search?q=oats&barcode=0123456789"
    );
  });

  it("dispatches biomarker logs to v1 diary endpoints", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 10, date: "2026-10-16" }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({ baseUrl: "https://api.kcal-log.test" });

    // Water
    await client.storeWaterLog({ date: "2026-10-16", amount_ml: 500 });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.kcal-log.test/api/v1/diary/water"
    );
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");

    // Exercise
    await client.storeExercise({
      date: "2026-10-16",
      name: "Running",
      exercise_type: "cardio",
      duration_minutes: 30,
      calories_burned: 280,
    });
    expect(mockFetch.mock.calls[1][0]).toBe(
      "https://api.kcal-log.test/api/v1/diary/exercises"
    );

    // Body Measurements
    await client.storeMeasurements({
      date: "2026-10-16",
      waist_cm: 82.5,
      hips_cm: 98.0,
    });
    expect(mockFetch.mock.calls[2][0]).toBe(
      "https://api.kcal-log.test/api/v1/diary/measurements"
    );
  });

  it("dispatches recipe operations to /api/v1/recipes", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 4, name: "Berry Oatmeal" }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({ baseUrl: "https://api.kcal-log.test" });

    await client.createRecipe({
      name: "Berry Oatmeal",
      servings: 1,
      items: [{ food_id: 1, quantity: 1, grams: 100 }],
    });

    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.kcal-log.test/api/v1/recipes"
    );
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");

    await client.getRecipe(4);
    expect(mockFetch.mock.calls[1][0]).toBe(
      "https://api.kcal-log.test/api/v1/recipes/4"
    );
  });

  it("dispatches adaptive responses to /api/v1/adaptive endpoints", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Success" }),
    });
    globalThis.fetch = mockFetch as any;

    const client = new KcalApiClient({ baseUrl: "https://api.kcal-log.test" });

    await client.acceptAdaptiveAdjustment(7);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.kcal-log.test/api/v1/adaptive/7/accept"
    );
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });
});
