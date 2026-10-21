import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { OfflineQueueService } from '../services/offlineQueue';
import { storage } from '../services/storage';
import { api } from '../services/api';

describe('Offline Mutation Queue Engine', () => {
  let queueService: OfflineQueueService;

  beforeEach(async () => {
    storage.setMemoryMode(true);
    await storage.clear();
    queueService = new OfflineQueueService();
    await queueService.clearQueue();
    vi.restoreAllMocks();
  });

  it('enqueues mutations and notifies subscribers', async () => {
    const subscriber = vi.fn();
    const unsubscribe = queueService.subscribe(subscriber);

    expect(subscriber).toHaveBeenCalledWith(0);

    await queueService.enqueue('ADD_FOOD', {
      date: '2026-10-21',
      mealSlot: 'breakfast',
      foodId: 10,
      quantity: 1,
      consumedGrams: 100,
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 5,
    });

    expect(queueService.getPendingCount()).toBe(1);
    expect(subscriber).toHaveBeenCalledWith(1);

    const queued = queueService.getQueue();
    expect(queued).toHaveLength(1);
    expect(queued[0].type).toBe('ADD_FOOD');
    expect(queued[0].retryCount).toBe(0);

    unsubscribe();
  });

  it('processes mutations in FIFO order and removes succeeded items', async () => {
    const logFoodSpy = vi.spyOn(api, 'logFood').mockResolvedValue({
      id: 1,
      userId: 1,
      date: '2026-10-21',
      mealSlot: 'breakfast',
      foodId: 10,
      quantity: 1,
      consumedGrams: 100,
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 5,
      createdAt: '',
      updatedAt: '',
    });

    const logWaterSpy = vi.spyOn(api, 'logWater').mockResolvedValue({
      id: 1,
      userId: 1,
      date: '2026-10-21',
      amountMl: 250,
    });

    await queueService.enqueue('ADD_FOOD', {
      date: '2026-10-21',
      mealSlot: 'breakfast',
      foodId: 10,
      quantity: 1,
      consumedGrams: 100,
      calories: 250,
      protein: 10,
      carbs: 30,
      fat: 5,
    });

    await queueService.enqueue('LOG_WATER', {
      date: '2026-10-21',
      amountMl: 250,
    });

    expect(queueService.getPendingCount()).toBe(2);

    const result = await queueService.processQueue();
    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.remaining).toBe(0);

    expect(logFoodSpy).toHaveBeenCalledTimes(1);
    expect(logWaterSpy).toHaveBeenCalledTimes(1);
    expect(queueService.getPendingCount()).toBe(0);
  });

  it('pauses processing and keeps mutation in queue upon network failure', async () => {
    vi.spyOn(api, 'logFood').mockRejectedValue(new Error('Network request failed: fetch error'));

    await queueService.enqueue('ADD_FOOD', {
      date: '2026-10-21',
      mealSlot: 'lunch',
      foodId: 25,
      quantity: 2,
      consumedGrams: 200,
      calories: 400,
      protein: 20,
      carbs: 50,
      fat: 10,
    });

    const result = await queueService.processQueue();
    expect(result.processed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.remaining).toBe(1);
    expect(queueService.getPendingCount()).toBe(1);
  });

  it('discards item after 3 non-recoverable retries', async () => {
    vi.spyOn(api, 'logFood').mockRejectedValue(new Error('HTTP 422: Unprocessable Entity'));

    await queueService.enqueue('ADD_FOOD', {
      date: '2026-10-21',
      mealSlot: 'dinner',
      foodId: 999,
      quantity: 1,
      consumedGrams: 50,
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 2,
    });

    // Attempt 1
    await queueService.processQueue();
    expect(queueService.getPendingCount()).toBe(1);

    // Attempt 2
    await queueService.processQueue();
    expect(queueService.getPendingCount()).toBe(1);

    // Attempt 3: reached max retry threshold -> dropped
    const result = await queueService.processQueue();
    expect(result.failed).toBe(1);
    expect(queueService.getPendingCount()).toBe(0);
  });
});
