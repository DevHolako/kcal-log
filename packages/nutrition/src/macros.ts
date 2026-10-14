import type { DietPreference } from '@kcal-log/types';

export interface MacroSplit {
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export const DIET_PRESETS: Record<DietPreference, MacroSplit> = {
  balanced: { proteinPercent: 30, carbsPercent: 40, fatPercent: 30 },
  high_protein: { proteinPercent: 35, carbsPercent: 45, fatPercent: 20 },
  low_carb: { proteinPercent: 40, carbsPercent: 20, fatPercent: 40 },
  keto: { proteinPercent: 25, carbsPercent: 5, fatPercent: 70 },
  custom: { proteinPercent: 30, carbsPercent: 40, fatPercent: 30 },
};

export interface MacroGrams {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

/**
 * Calculates macronutrient target grams from calorie target and percentage split.
 * Protein: 4 kcal/gram
 * Carbs: 4 kcal/gram
 * Fat: 9 kcal/gram
 * Fiber recommendation: ~14g per 1000 kcal
 */
export function calculateMacroGrams(calories: number, split: MacroSplit): MacroGrams {
  const proteinCalories = calories * (split.proteinPercent / 100);
  const carbsCalories = calories * (split.carbsPercent / 100);
  const fatCalories = calories * (split.fatPercent / 100);

  const proteinG = Math.round(proteinCalories / 4);
  const carbsG = Math.round(carbsCalories / 4);
  const fatG = Math.round(fatCalories / 9);
  const fiberG = Math.round((calories / 1000) * 14);

  return { proteinG, carbsG, fatG, fiberG };
}
