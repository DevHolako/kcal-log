import { APP_CONFIG } from '../config';
import { storage } from './storage';
import { api } from './api';
import type {
  OfflineMutation,
  OfflineMutationType,
  AddFoodPayload,
  QuickAddPayload,
  LogWaterPayload,
  LogWeightPayload,
  DeleteEntryPayload,
} from '../types';

export class OfflineQueueService {
  private queue: OfflineMutation[] = [];
  private isSyncing = false;
  private listeners: Array<(pendingCount: number) => void> = [];

  constructor() {
    this.loadQueue();
  }

  public async loadQueue(): Promise<OfflineMutation[]> {
    const saved = await storage.getJSON<OfflineMutation[]>(
      APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE,
      []
    );
    this.queue = saved;
    this.notifyListeners();
    return this.queue;
  }

  public async saveQueue(): Promise<void> {
    await storage.setJSON(APP_CONFIG.STORAGE_KEYS.OFFLINE_QUEUE, this.queue);
    this.notifyListeners();
  }

  public subscribe(listener: (pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    listener(this.queue.length);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.queue.length);
      } catch {
        // Listener error ignored
      }
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getQueue(): OfflineMutation[] {
    return [...this.queue];
  }

  public async enqueue<T>(type: OfflineMutationType, payload: T): Promise<OfflineMutation<T>> {
    const mutation: OfflineMutation<T> = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.queue.push(mutation as OfflineMutation);
    await this.saveQueue();
    return mutation;
  }

  public async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Process all queued mutations in FIFO order against the backend API.
   */
  public async processQueue(): Promise<{
    processed: number;
    failed: number;
    remaining: number;
  }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { processed: 0, failed: 0, remaining: this.queue.length };
    }

    this.isSyncing = true;
    let processed = 0;
    let failed = 0;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          await this.executeMutation(item);
          // Mutation succeeded: remove from front of queue
          this.queue.shift();
          processed++;
          await this.saveQueue();
        } catch (err: unknown) {
          const isNetworkError =
            err instanceof Error &&
            (err.message.includes('fetch') ||
              err.message.includes('Network') ||
              err.message.includes('Failed to fetch') ||
              err.message.includes('ECONNREFUSED'));

          if (isNetworkError) {
            // Transient network failure: keep in queue and abort loop to retry later
            break;
          }

          // Unrecoverable server/validation error (e.g. 422, 404): discard after 3 retries
          item.retryCount++;
          if (item.retryCount >= 3) {
            this.queue.shift();
            failed++;
            await this.saveQueue();
          } else {
            break;
          }
        }
      }
    } finally {
      this.isSyncing = false;
      await storage.setItem(APP_CONFIG.STORAGE_KEYS.LAST_SYNC_TIMESTAMP, new Date().toISOString());
      this.notifyListeners();
    }

    return {
      processed,
      failed,
      remaining: this.queue.length,
    };
  }

  private async executeMutation(mutation: OfflineMutation): Promise<void> {
    switch (mutation.type) {
      case 'ADD_FOOD': {
        const p = mutation.payload as AddFoodPayload;
        await api.logFood({
          date: p.date,
          mealSlot: p.mealSlot,
          foodId: p.foodId,
          foodServingId: p.foodServingId,
          quantity: p.quantity,
          consumedGrams: p.consumedGrams,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
          fiber: p.fiber,
        });
        break;
      }
      case 'DELETE_ENTRY': {
        const p = mutation.payload as DeleteEntryPayload;
        await api.deleteDiaryEntry(p.entryId);
        break;
      }
      case 'QUICK_ADD': {
        const p = mutation.payload as QuickAddPayload;
        await api.quickAddCalories({
          date: p.date,
          mealSlot: p.mealSlot,
          calories: p.calories,
          name: p.name,
        });
        break;
      }
      case 'LOG_WATER': {
        const p = mutation.payload as LogWaterPayload;
        await api.logWater(p.date, p.amountMl);
        break;
      }
      case 'LOG_WEIGHT': {
        const p = mutation.payload as LogWeightPayload;
        await api.logWeight({
          weightKg: p.weightKg,
          recordedAt: p.recordedAt,
          waistCm: p.waistCm,
          hipsCm: p.hipsCm,
          chestCm: p.chestCm,
          notes: p.notes,
        });
        break;
      }
      default:
        throw new Error(`Unknown offline mutation type: ${(mutation as { type: string }).type}`);
    }
  }
}

export const offlineQueue = new OfflineQueueService();
