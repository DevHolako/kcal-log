import type { Sex } from '@kcal-log/types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 *
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export function calculateBMR(params: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const { sex, weightKg, heightCm, ageYears } = params;
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  const result = sex === 'male' ? base + 5 : base - 161;
  return Math.round(result);
}

/**
 * Calculates age in full years from an ISO birthdate string (YYYY-MM-DD).
 */
export function calculateAge(birthDateIso: string, referenceDate: Date = new Date()): number {
  const birthDate = new Date(birthDateIso);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
