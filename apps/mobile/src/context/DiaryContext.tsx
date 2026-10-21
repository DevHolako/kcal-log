import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  DiaryDayResponse,
  DiaryEntry,
} from '@kcal-log/types';
import { api, normalizeDiaryDay } from '../services/api';
import { offlineQueue } from '../services/offlineQueue';
import { storage } from '../services/storage';
import { APP_CONFIG } from '../config';
import { useAuth } from './AuthContext';
import type { AddFoodPayload, QuickAddPayload } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateStr: string, offsetDays: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

interface DiaryContextType {
  currentDate: string;
  diaryDay: DiaryDayResponse | null;
  isLoading: boolean;
  isOffline: boolean;
  pendingMutationsCount: number;
  setDate: (date: string) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  refreshDiary: () => Promise<void>;
  addFoodEntry: (payload: AddFoodPayload) => Promise<void>;
  deleteFoodEntry: (entryId: string | number) => Promise<void>;
  quickAddCalories: (payload: QuickAddPayload) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  deleteWater: (waterLogId: string | number) => Promise<void>;
  logWeight: (data: {
    weightKg: number;
    waistCm?: number | null;
    hipsCm?: number | null;
    chestCm?: number | null;
    notes?: string | null;
  }) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [diaryDay, setDiaryDay] = useState<DiaryDayResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingMutationsCount, setPendingMutationsCount] = useState<number>(0);

  // Monitor offline queue size
  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe(count => {
      setPendingMutationsCount(count);
    });
    return () => unsubscribe();
  }, []);

  const loadDiaryDay = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const data = await api.getDiaryDay(date);
      setDiaryDay(normalizeDiaryDay(data, date));
      setIsOffline(false);
    } catch {
      // Check cached copy
      const cached = await storage.getJSON<DiaryDayResponse | null>(
        `${APP_CONFIG.STORAGE_KEYS.DIARY_CACHE_PREFIX}${date}`,
        null
      );
      if (cached) {
        setDiaryDay(normalizeDiaryDay(cached, date));
        setIsOffline(true);
      } else {
        // Construct fallback empty day response
        setDiaryDay(
          normalizeDiaryDay(
            {
              date,
              totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
              target: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
              remaining: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
              entries: [],
              waterLogs: [],
              waterTotalMl: 0,
              waterTargetMl: 2000,
              exercises: [],
              exerciseCaloriesBurned: 0,
            },
            date
          )
        );
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadDiaryDay(currentDate);
      } else {
        setDiaryDay(null);
        setIsLoading(false);
      }
    }
  }, [currentDate, isAuthenticated, authLoading, loadDiaryDay]);

  const goToPreviousDay = () => setCurrentDate(prev => shiftDateString(prev, -1));
  const goToNextDay = () => setCurrentDate(prev => shiftDateString(prev, 1));
  const goToToday = () => setCurrentDate(getTodayDateString());

  const refreshDiary = async () => {
    await loadDiaryDay(currentDate);
  };

  const syncOfflineQueue = async () => {
    await offlineQueue.processQueue();
    await loadDiaryDay(currentDate);
  };

  const addFoodEntry = async (payload: AddFoodPayload) => {
    // 1. Optimistic UI update
    if (diaryDay) {
      const optimisticEntry: DiaryEntry = {
        id: `temp-${Date.now()}`,
        userId: 0,
        date: payload.date,
        mealSlot: payload.mealSlot,
        foodId: payload.foodId,
        quantity: payload.quantity,
        consumedGrams: payload.consumedGrams,
        calories: payload.calories,
        protein: payload.protein,
        carbs: payload.carbs,
        fat: payload.fat,
        fiber: payload.fiber ?? 0,
        servingDescription: payload.servingDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        food: payload.foodName
          ? {
              id: payload.foodId,
              name: payload.foodName,
              isCustom: false,
              caloriesPer100g: 0,
              proteinPer100g: 0,
              carbsPer100g: 0,
              fatPer100g: 0,
              servings: [],
            }
          : undefined,
      };

      const newTotals = {
        calories: diaryDay.totals.calories + payload.calories,
        protein: diaryDay.totals.protein + payload.protein,
        carbs: diaryDay.totals.carbs + payload.carbs,
        fat: diaryDay.totals.fat + payload.fat,
        fiber: diaryDay.totals.fiber + (payload.fiber ?? 0),
      };

      const newRemaining = {
        calories: diaryDay.target.calories - newTotals.calories + diaryDay.exerciseCaloriesBurned,
        protein: Math.max(0, diaryDay.target.protein - newTotals.protein),
        carbs: Math.max(0, diaryDay.target.carbs - newTotals.carbs),
        fat: Math.max(0, diaryDay.target.fat - newTotals.fat),
      };

      setDiaryDay({
        ...diaryDay,
        entries: [...diaryDay.entries, optimisticEntry],
        totals: newTotals,
        remaining: newRemaining,
      });
    }

    // 2. Dispatch to API or Enqueue
    try {
      await api.logFood(payload);
      setIsOffline(false);
      // Reload server state
      await loadDiaryDay(payload.date);
    } catch {
      await offlineQueue.enqueue('ADD_FOOD', payload);
      setIsOffline(true);
    }
  };

  const deleteFoodEntry = async (entryId: string | number) => {
    // 1. Optimistic removal
    if (diaryDay) {
      const removed = diaryDay.entries.find(e => e.id === entryId);
      if (removed) {
        const newTotals = {
          calories: Math.max(0, diaryDay.totals.calories - removed.calories),
          protein: Math.max(0, diaryDay.totals.protein - removed.protein),
          carbs: Math.max(0, diaryDay.totals.carbs - removed.carbs),
          fat: Math.max(0, diaryDay.totals.fat - removed.fat),
          fiber: Math.max(0, diaryDay.totals.fiber - (removed.fiber ?? 0)),
        };

        const newRemaining = {
          calories: diaryDay.target.calories - newTotals.calories + diaryDay.exerciseCaloriesBurned,
          protein: Math.max(0, diaryDay.target.protein - newTotals.protein),
          carbs: Math.max(0, diaryDay.target.carbs - newTotals.carbs),
          fat: Math.max(0, diaryDay.target.fat - newTotals.fat),
        };

        setDiaryDay({
          ...diaryDay,
          entries: diaryDay.entries.filter(e => e.id !== entryId),
          totals: newTotals,
          remaining: newRemaining,
        });
      }
    }

    // 2. API or Enqueue
    try {
      if (typeof entryId === 'number' || !String(entryId).startsWith('temp-')) {
        await api.deleteDiaryEntry(entryId);
      }
      setIsOffline(false);
    } catch {
      await offlineQueue.enqueue('DELETE_ENTRY', { entryId, date: currentDate });
      setIsOffline(true);
    }
  };

  const quickAddCalories = async (payload: QuickAddPayload) => {
    if (diaryDay) {
      const optimisticEntry: DiaryEntry = {
        id: `temp-${Date.now()}`,
        userId: 0,
        date: payload.date,
        mealSlot: payload.mealSlot,
        foodId: 0,
        quantity: 1,
        consumedGrams: 0,
        calories: payload.calories,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        servingDescription: payload.name ?? 'Quick Add',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newTotals = {
        ...diaryDay.totals,
        calories: diaryDay.totals.calories + payload.calories,
      };

      setDiaryDay({
        ...diaryDay,
        entries: [...diaryDay.entries, optimisticEntry],
        totals: newTotals,
        remaining: {
          ...diaryDay.remaining,
          calories: diaryDay.target.calories - newTotals.calories + diaryDay.exerciseCaloriesBurned,
        },
      });
    }

    try {
      await api.quickAddCalories(payload);
      setIsOffline(false);
      await loadDiaryDay(payload.date);
    } catch {
      await offlineQueue.enqueue('QUICK_ADD', payload);
      setIsOffline(true);
    }
  };

  const logWater = async (amountMl: number) => {
    if (diaryDay) {
      setDiaryDay({
        ...diaryDay,
        waterTotalMl: diaryDay.waterTotalMl + amountMl,
      });
    }

    try {
      await api.logWater(currentDate, amountMl);
      setIsOffline(false);
      await loadDiaryDay(currentDate);
    } catch {
      await offlineQueue.enqueue('LOG_WATER', { date: currentDate, amountMl });
      setIsOffline(true);
    }
  };

  const deleteWater = async (waterLogId: string | number) => {
    try {
      await api.deleteWater(waterLogId);
      await loadDiaryDay(currentDate);
    } catch {
      // Ignored
    }
  };

  const logWeight = async (data: {
    weightKg: number;
    waistCm?: number | null;
    hipsCm?: number | null;
    chestCm?: number | null;
    notes?: string | null;
  }) => {
    try {
      await api.logWeight(data);
      setIsOffline(false);
      await loadDiaryDay(currentDate);
    } catch {
      await offlineQueue.enqueue('LOG_WEIGHT', data);
      setIsOffline(true);
    }
  };

  return (
    <DiaryContext.Provider
      value={{
        currentDate,
        diaryDay,
        isLoading,
        isOffline,
        pendingMutationsCount,
        setDate: setCurrentDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        refreshDiary,
        addFoodEntry,
        deleteFoodEntry,
        quickAddCalories,
        logWater,
        deleteWater,
        logWeight,
        syncOfflineQueue,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = (): DiaryContextType => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
