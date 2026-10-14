# ADR 0003: Adaptive Target Adjustment with Human Checkpoint

## Context
Weight fluctuates due to water retention, sodium, and daily variance. Automatic target adjustments based on raw weight changes can cause rapid, unhealthy, or unexpected caloric swings without user comprehension.

## Decision
We implement weekly adaptive caloric adjustments using exponential smoothing on daily weigh-ins compared against logged caloric intake. The background scheduler computes the delta autonomously, but **pushes the checkpoint right** by creating a decision-ready brief:
- The user receives an in-app and push notification detailing the 7–14 day trend and the proposed target change (e.g. -120 kcal/day).
- The adjustment is only applied to the user's active `TargetProfile` if the user explicitly reviews and accepts it.
- All adjustment proposals (accepted, rejected, or expired) are permanently recorded in an `adaptive_adjustments` audit table with rationale.

## Consequences
- Maintains user agency and trust over their personal nutrition targets.
- Prevents silent target drifts while automating complex trend analysis.
