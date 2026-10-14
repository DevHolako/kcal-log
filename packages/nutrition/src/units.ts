/**
 * Unit conversion utilities with fixed precision.
 */

export const LBS_PER_KG = 2.20462262185;
export const INCHES_PER_CM = 0.3937007874;
export const FL_OZ_PER_ML = 0.033814;

export function kgToLbs(kg: number): number {
  return Math.round(kg * LBS_PER_KG * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / LBS_PER_KG) * 100) / 100;
}

export function cmToInches(cm: number): number {
  return Math.round(cm * INCHES_PER_CM * 10) / 10;
}

export function inchesToCm(inches: number): number {
  return Math.round((inches / INCHES_PER_CM) * 10) / 10;
}

export function mlToFlOz(ml: number): number {
  return Math.round(ml * FL_OZ_PER_ML * 10) / 10;
}

export function flOzToMl(flOz: number): number {
  return Math.round(flOz / FL_OZ_PER_ML);
}
