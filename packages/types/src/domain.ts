/**
 * Canonical Domain Types for kcal-log (conforming to GLOSSARY.md).
 */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'        // 1.2
  | 'lightly_active'   // 1.375
  | 'moderately_active'// 1.55
  | 'very_active'      // 1.725
  | 'extra_active'     // 1.9
  | 'extremely_active';// 1.9

export type GoalType = 'lose' | 'maintain' | 'gain';

export type UnitSystem = 'metric' | 'imperial';

export type DietPreference = 'balanced' | 'low_carb' | 'high_protein' | 'keto' | 'custom';

export interface FoodServing {
  id: string | number;
  foodId: string | number;
  description: string;       // e.g. "1 medium (118g)", "1 cup (240ml)", "1 slice (35g)"
  grams: number;             // conversion to grams
  isDefault?: boolean;
}

export interface Food {
  id: string | number;
  offId?: string | null;      // Open Food Facts barcode/ID
  userId?: string | number | null; // Null if global/OFF, set if user custom
  name: string;
  brand?: string | null;
  barcode?: string | null;
  isCustom: boolean;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  sodiumPer100g?: number;     // mg
  servings: FoodServing[];
  imageUrl?: string | null;
  lastSyncedAt?: string | null;
}

export interface DiaryEntry {
  id: string | number;
  userId: string | number;
  date: string;               // YYYY-MM-DD
  mealSlot: MealSlot;
  foodId: string | number;
  food?: Food;
  servingId?: string | number | null;
  servingDescription?: string;
  quantity: number;           // e.g. 1.5 servings
  consumedGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TargetProfile {
  id: string | number;
  userId: string | number;
  isActive: boolean;
  sex: Sex;
  birthDate: string;          // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  weeklyRateKg: number;       // e.g. -0.5, 0, +0.25
  unitSystem: UnitSystem;
  dietPreference: DietPreference;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG?: number;
  targetWaterMl?: number;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalWaterMl: number;
  exerciseCaloriesBurned: number;
  targetCalories: number;
  remainingCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface WeightLog {
  id: string | number;
  userId: string | number;
  recordedAt: string;         // ISO timestamp
  weightKg: number;
  trendWeightKg?: number;     // EWMA smoothed value
  waistCm?: number | null;
  hipsCm?: number | null;
  chestCm?: number | null;
  notes?: string | null;
}

export interface AdaptiveAdjustment {
  id: string | number;
  userId: string | number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  evaluatedAt: string;
  proposedCalorieDelta: number;
  proposedProteinG: number;
  proposedCarbsG: number;
  proposedFatG: number;
  averageDailyIntakeKcal: number;
  smoothedWeightChangeKg: number;
  reason: string;
}

export interface WaterLog {
  id: string | number;
  userId: string | number;
  date: string;
  amountMl: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BodyMeasurement {
  id: string | number;
  userId: string | number;
  date: string;
  neckCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  chestCm?: number | null;
  bicepsCm?: number | null;
  thighsCm?: number | null;
  calvesCm?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExerciseLog {
  id: string | number;
  userId: string | number;
  date: string;
  name: string;
  exerciseType: 'cardio' | 'strength' | 'other' | string;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeItem {
  id?: string | number;
  foodId: string | number;
  foodServingId?: string | number | null;
  quantity: number;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  food?: Food;
}

export interface MealRecipe {
  id: string | number;
  userId: string | number;
  name: string;
  description?: string | null;
  servings: number;
  isRecipe: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number | null;
  items?: RecipeItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DiaryDayResponse {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  entries: DiaryEntry[];
  waterLogs: WaterLog[];
  waterTotalMl: number;
  waterTargetMl?: number | null;
  weightLog?: WeightLog | null;
  measurements?: BodyMeasurement | null;
  exercises: ExerciseLog[];
  exerciseCaloriesBurned: number;
}

export interface AuthTokenResponse {
  token: string;
  tokenId: string | number;
  deviceName: string;
  createdAt: string;
}

