import { describe, it, expect } from "vite-plus/test";
import {
  calculateBMR,
  calculateAge,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroGrams,
  DIET_PRESETS,
  kgToLbs,
  lbsToKg,
  calculateWeightEWMA,
} from "../index";

describe("Nutrition & BMR Calculations", () => {
  it("calculates age correctly from birthdate", () => {
    const ref = new Date("2026-10-14");
    expect(calculateAge("1990-05-15", ref)).toBe(36);
    expect(calculateAge("2000-11-20", ref)).toBe(25);
  });

  it("calculates Mifflin-St Jeor BMR for men", () => {
    // 80kg, 180cm, 30 years old male
    // BMR = (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 800 + 1125 - 150 + 5 = 1780
    const bmr = calculateBMR({
      sex: "male",
      weightKg: 80,
      heightCm: 180,
      ageYears: 30,
    });
    expect(bmr).toBe(1780);
  });

  it("calculates Mifflin-St Jeor BMR for women", () => {
    // 60kg, 165cm, 28 years old female
    // BMR = (10 * 60) + (6.25 * 165) - (5 * 28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const bmr = calculateBMR({
      sex: "female",
      weightKg: 60,
      heightCm: 165,
      ageYears: 28,
    });
    expect(bmr).toBe(1330);
  });

  it("calculates TDEE using activity multipliers", () => {
    const bmr = 1780;
    expect(calculateTDEE(bmr, "sedentary")).toBe(2136); // 1780 * 1.2
    expect(calculateTDEE(bmr, "moderately_active")).toBe(2759); // 1780 * 1.55
  });

  it("calculates target calories for weight loss with safety floor", () => {
    const tdee = 2500;
    // -0.5 kg/week = -550 kcal/day => 1950 kcal
    const target = calculateTargetCalories({
      tdee,
      goalType: "lose",
      weeklyRateKg: -0.5,
    });
    expect(target).toBe(1950);

    // Floor constraint test
    const lowTarget = calculateTargetCalories({
      tdee: 1400,
      goalType: "lose",
      weeklyRateKg: -1.0,
      floorCalories: 1200,
    });
    expect(lowTarget).toBe(1200);
  });

  it("calculates macronutrient gram targets accurately", () => {
    const calories = 2000;
    const balancedGrams = calculateMacroGrams(calories, DIET_PRESETS.balanced);
    // 30% protein = 600 kcal / 4 = 150g
    // 40% carbs = 800 kcal / 4 = 200g
    // 30% fat = 600 kcal / 9 = 67g
    // Fiber = 2 * 14 = 28g
    expect(balancedGrams.proteinG).toBe(150);
    expect(balancedGrams.carbsG).toBe(200);
    expect(balancedGrams.fatG).toBe(67);
    expect(balancedGrams.fiberG).toBe(28);
  });

  it("converts units correctly", () => {
    expect(kgToLbs(70)).toBe(154.3);
    expect(lbsToKg(154.32)).toBe(70);
  });

  it("smooths weight changes with EWMA", () => {
    const weights = [
      { date: "2026-10-01", weightKg: 80.0 },
      { date: "2026-10-02", weightKg: 81.2 }, // water spike
      { date: "2026-10-03", weightKg: 79.8 },
    ];
    const trend = calculateWeightEWMA(weights, 0.1);
    expect(trend).toHaveLength(3);
    expect(trend[0].trendWeightKg).toBe(80.0);
    // Day 2 trend: 0.1 * 81.2 + 0.9 * 80.0 = 8.12 + 72.0 = 80.12
    expect(trend[1].trendWeightKg).toBe(80.12);
  });
});
