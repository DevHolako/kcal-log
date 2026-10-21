import { describe, it, expect } from 'vite-plus/test';
import {
  calculateWeightEWMA,
  kgToLbs,
  lbsToKg,
} from '@kcal-log/nutrition';

describe('Nutrition & Math Logic in Mobile Client', () => {
  it('accurately calculates MyFitnessPal equation: Goal - Food + Exercise = Remaining', () => {
    const goal = 2200;
    const foodConsumed = 1850;
    const exerciseBurned = 350;

    const remaining = goal - foodConsumed + exerciseBurned;
    expect(remaining).toBe(700);

    const netCalories = foodConsumed - exerciseBurned;
    expect(netCalories).toBe(1500);
    expect(goal - netCalories).toBe(700);
  });

  it('detects when calories exceed target allowance (negative remaining / over budget)', () => {
    const goal = 2000;
    const foodConsumed = 2350;
    const exerciseBurned = 100;

    const remaining = goal - foodConsumed + exerciseBurned;
    expect(remaining).toBe(-250);
    expect(remaining < 0).toBe(true);
  });

  it('scales food portion nutrients linearly with grams factor', () => {
    const caloriesPer100g = 165; // Chicken breast
    const proteinPer100g = 31;
    const fatPer100g = 3.6;

    const consumedGrams = 250; // 2.5x
    const factor = consumedGrams / 100;

    const scaledCalories = Math.round(caloriesPer100g * factor * 10) / 10;
    const scaledProtein = Math.round(proteinPer100g * factor * 10) / 10;
    const scaledFat = Math.round(fatPer100g * factor * 10) / 10;

    expect(scaledCalories).toBe(412.5);
    expect(scaledProtein).toBe(77.5);
    expect(scaledFat).toBe(9);
  });

  it('converts weight units accurately between kg and lbs', () => {
    const kg = 75;
    const lbs = kgToLbs(kg);
    expect(lbs).toBeCloseTo(165.35, 1);

    const convertedBack = lbsToKg(lbs);
    expect(convertedBack).toBeCloseTo(75, 1);
  });

  it('smooths raw scale weigh-ins using EWMA (alpha = 0.1)', () => {
    const logs = [
      { date: '2026-10-15', weightKg: 80.0 },
      { date: '2026-10-16', weightKg: 81.5 }, // Hydration spike
      { date: '2026-10-17', weightKg: 79.5 }, // Dip
      { date: '2026-10-18', weightKg: 79.8 },
    ];

    const ewma = calculateWeightEWMA(logs, 0.1);
    expect(ewma).toHaveLength(4);

    // Initial trend is first day
    expect(ewma[0].trendWeightKg).toBe(80.0);
    // Day 2 spike smoothed: 0.1 * 81.5 + 0.9 * 80.0 = 8.15 + 72.0 = 80.15
    expect(ewma[1].trendWeightKg).toBe(80.15);
    expect(ewma[1].trendWeightKg).toBeLessThan(81.5);
  });
});
