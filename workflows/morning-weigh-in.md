# Workflow: Morning Weigh-in & Measurements

## Purpose
Captures morning body weight and optional circumference measurements to maintain trendlines and power the adaptive calorie adjustment algorithm.

## Trigger
**Daily Schedule / Routine Event**: User weighs themselves in the morning and enters their measurement.

## Steps & Autonomous Action
1. **Entry Capture**:
   - User inputs weight (kg or lbs according to preference) and optional measurements (waist, hips, chest, neck).
   - Fast numeric keypad entry on mobile; single-field focus on web.
2. **Trend Computation (Autonomous)**:
   - System records weigh-in timestamp and raw value.
   - Computes 7-day exponentially weighted moving average (EWMA) to smooth water retention fluctuations.
   - Calculates progress toward user's target weight and target rate (e.g. -0.5 kg/week).
3. **Storage & Dashboard Sync**:
   - Persists measurement in `weight_logs` / `body_measurements`.
   - Updates dashboard charts immediately with new raw point and recalculated trendline.

## Checkpoint
**Zero-blocking checkpoint**: Data is saved immediately on submission. If a sudden abnormal change (>3% in 24 hours) is entered, a confirmation toast warns: "This is a large change from yesterday. Did you mean X kg?" to prevent typos without blocking entry.

## Edge Cases
- **Missing Days**: The EWMA algorithm handles sparse weigh-ins gracefully using time-decayed exponential weighting.
- **Unit Mismatches**: Stored internally in metric (kg/cm) and converted on display according to user's unit settings.
