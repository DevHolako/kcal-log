/**
 * Calculates Exponentially Weighted Moving Average (EWMA) for body weight smoothing.
 * Alpha = 0.1 gives a smooth 10-14 day characteristic response window that suppresses
 * daily sodium/hydration water variance while capturing true tissue mass trends.
 */
export function calculateWeightEWMA(
  weights: { date: string; weightKg: number }[],
  alpha: number = 0.1
): { date: string; rawWeightKg: number; trendWeightKg: number }[] {
  if (weights.length === 0) return [];

  // Ensure chronological order
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));

  const result: { date: string; rawWeightKg: number; trendWeightKg: number }[] = [];
  let currentTrend = sorted[0].weightKg;

  for (const entry of sorted) {
    currentTrend = alpha * entry.weightKg + (1 - alpha) * currentTrend;
    result.push({
      date: entry.date,
      rawWeightKg: Math.round(entry.weightKg * 100) / 100,
      trendWeightKg: Math.round(currentTrend * 100) / 100,
    });
  }

  return result;
}
