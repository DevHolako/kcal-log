import type { ActivityLevel, GoalType } from '@kcal-log/types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,          // Little or no exercise, desk job
  lightly_active: 1.375,   // Light exercise 1-3 days/week
  moderately_active: 1.55, // Moderate exercise 3-5 days/week
  very_active: 1.725,      // Hard exercise 6-7 days/week
  extra_active: 1.9,       // Very hard exercise, physical job or 2x/day training
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE) from BMR and activity level.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates target calories based on TDEE, goal type, and weekly rate of change.
 * Standard energy equivalent: ~7,700 kcal per 1 kg of body fat (or ~1,100 kcal deficit/day for 1kg/week).
 * Minimum healthy floor: 1,200 kcal for women, 1,500 kcal for men.
 */
export function calculateTargetCalories(params: {
  tdee: number;
  goalType: GoalType;
  weeklyRateKg: number; // e.g. -0.5 for losing 0.5kg/week
  floorCalories?: number;
}): number {
  const { tdee, goalType, weeklyRateKg, floorCalories = 1200 } = params;

  if (goalType === 'maintain' || weeklyRateKg === 0) {
    return tdee;
  }

  // 1 kg of fat ~= 7700 kcal => daily delta = (weeklyRateKg * 7700) / 7
  const dailyDelta = Math.round((weeklyRateKg * 7700) / 7);
  const target = tdee + dailyDelta;

  return Math.max(target, floorCalories);
}
