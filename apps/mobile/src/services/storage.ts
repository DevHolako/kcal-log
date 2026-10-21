import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private memoryFallback = new Map<string, string>();
  private useMemoryOnly = false;

  constructor() {
    // If running in non-native or test environment without native bridge, detect safely
    if (typeof AsyncStorage === 'undefined' || !AsyncStorage?.getItem) {
      this.useMemoryOnly = true;
    }
  }

  public setMemoryMode(enable: boolean): void {
    this.useMemoryOnly = enable;
  }

  public async getItem(key: string): Promise<string | null> {
    if (this.useMemoryOnly) {
      return this.memoryFallback.get(key) ?? null;
    }
    try {
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch {
      return this.memoryFallback.get(key) ?? null;
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    this.memoryFallback.set(key, value);
    if (!this.useMemoryOnly) {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        // Fallback to in-memory silently
      }
    }
  }

  public async removeItem(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    if (!this.useMemoryOnly) {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
  }

  public async getJSON<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const raw = await this.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  public async setJSON<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    await this.setItem(key, raw);
  }

  public async clear(): Promise<void> {
    this.memoryFallback.clear();
    if (!this.useMemoryOnly) {
      try {
        await AsyncStorage.clear();
      } catch {
        // Fallback
      }
    }
  }
}

export const storage = new StorageService();
