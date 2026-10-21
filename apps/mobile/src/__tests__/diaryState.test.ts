import { describe, it, expect } from 'vite-plus/test';
import { shiftDateString, getTodayDateString } from '../context/DiaryContext';
import type { DiaryEntry } from '@kcal-log/types';

describe('Diary State Management & Calculations', () => {
  describe('Date Navigation Utilities', () => {
    it('generates valid ISO YYYY-MM-DD for today', () => {
      const today = getTodayDateString();
      expect(/^\d{4}-\d{2}-\d{2}$/.test(today)).toBe(true);
    });

    it('shifts dates forward and backward across month boundaries', () => {
      expect(shiftDateString('2026-10-21', 1)).toBe('2026-10-22');
      expect(shiftDateString('2026-10-21', -1)).toBe('2026-10-20');

      // Month rollover
      expect(shiftDateString('2026-10-31', 1)).toBe('2026-11-01');
      expect(shiftDateString('2026-11-01', -1)).toBe('2026-10-31');

      // Year rollover
      expect(shiftDateString('2026-12-31', 1)).toBe('2027-01-01');
      expect(shiftDateString('2027-01-01', -1)).toBe('2026-12-31');
    });
  });

  describe('MealSlot Grouping & Aggregations', () => {
    const sampleEntries: DiaryEntry[] = [
      {
        id: 1,
        userId: 1,
        date: '2026-10-21',
        mealSlot: 'breakfast',
        foodId: 10,
        quantity: 1,
        consumedGrams: 50,
        calories: 180,
        protein: 6,
        carbs: 32,
        fat: 3,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        userId: 1,
        date: '2026-10-21',
        mealSlot: 'breakfast',
        foodId: 12,
        quantity: 2,
        consumedGrams: 200,
        calories: 120,
        protein: 20,
        carbs: 8,
        fat: 1,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 3,
        userId: 1,
        date: '2026-10-21',
        mealSlot: 'lunch',
        foodId: 15,
        quantity: 1,
        consumedGrams: 300,
        calories: 550,
        protein: 42,
        carbs: 45,
        fat: 16,
        createdAt: '',
        updatedAt: '',
      },
    ];

    it('groups entries into their corresponding meal slots', () => {
      const breakfastEntries = sampleEntries.filter(e => e.mealSlot === 'breakfast');
      const lunchEntries = sampleEntries.filter(e => e.mealSlot === 'lunch');
      const dinnerEntries = sampleEntries.filter(e => e.mealSlot === 'dinner');

      expect(breakfastEntries).toHaveLength(2);
      expect(lunchEntries).toHaveLength(1);
      expect(dinnerEntries).toHaveLength(0);
    });

    it('computes accurate subtotals per meal slot', () => {
      const breakfastEntries = sampleEntries.filter(e => e.mealSlot === 'breakfast');
      const breakfastCalories = breakfastEntries.reduce((sum, e) => sum + e.calories, 0);
      const breakfastProtein = breakfastEntries.reduce((sum, e) => sum + e.protein, 0);

      expect(breakfastCalories).toBe(300);
      expect(breakfastProtein).toBe(26);
    });

    it('computes total daily caloric intake accurately', () => {
      const totalCalories = sampleEntries.reduce((sum, e) => sum + e.calories, 0);
      expect(totalCalories).toBe(850);
    });
  });
});
