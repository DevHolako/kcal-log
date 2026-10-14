# Workflow: Weekly Adaptive Target Review

## Purpose
Monitors progress against goal rate (loss, maintenance, or gain) by comparing actual weight trend against logged caloric consumption, formulating recommended target adjustments.

## Trigger
**Scheduled Event**: Runs automatically once per week (configurable, default: Sunday night / Monday morning) via Laravel Horizon queue scheduler for each active user.

## Steps & Autonomous Action
1. **Trend & Intake Analysis (Autonomous)**:
   - Evaluates past 14 days of data.
   - Calculates actual weekly weight change rate using smoothed weight slope.
   - Calculates average daily logged caloric intake.
   - Compares expected rate versus actual rate (3500 kcal deficit ≈ 1 lb / 7700 kcal ≈ 1 kg).
2. **Adjustment Proposal Generation**:
   - Computes recommended calorie delta (capped at ±150 kcal/day per week for health and adherence safety).
   - Proportionally adjusts macronutrient gram targets according to user's saved macro ratio preferences.
   - Saves proposal to `adaptive_adjustments` table with status `pending`.
3. **Dispatch Decision Brief**:
   - Generates in-app notification and push alert (FCM on mobile, database notification on web).
   - The brief summarizes:
     - 7-day average intake: e.g., 2,150 kcal/day.
     - 14-day smoothed weight change: e.g., -0.2 kg/week (Goal: -0.5 kg/week).
     - Recommendation: Decrease daily target by -100 kcal (New target: 1,950 kcal, P: 150g, C: 195g, F: 65g).

## Checkpoint (Push Right)
- **User Decision Required**: The user reviews the Brief with two primary actions:
  - **Accept**: Applies new calorie and macro targets to the user's active `TargetProfile`. Marks adjustment `accepted`.
  - **Decline / Postpone**: Keeps existing targets. Marks adjustment `rejected` or leaves for later review.
- Targets are **never** silently overwritten without this explicit confirmation.

## Edge Cases
- **Insufficient Data**: If fewer than 4 days of food logs or weigh-ins occurred over the prior week, the workflow skips generation and alerts the user: "Not enough data logged this week to calculate an adaptive adjustment."
