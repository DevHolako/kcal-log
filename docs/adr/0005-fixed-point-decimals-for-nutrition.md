# ADR 0005: Fixed-Point Decimal Storage for Nutrition and Measurements

## Context
Standard IEEE 754 floating-point numbers introduce subtle precision issues (e.g. `0.1 + 0.2 = 0.30000000000000004`). When summing calories, macros, or computing unit conversions (kg <-> lbs, cm <-> in), rounding drifts can confuse users and disrupt goal balancing.

## Decision
All nutritional data (calories, protein, carbohydrates, fats, fiber, sodium, water) and body measurements (weight, circumferences) use PostgreSQL fixed-point `decimal` data types:
- Energy (kcal): `decimal(8,2)`
- Macronutrients & fiber (g): `decimal(8,2)`
- Micronutrients (mg/mcg) and sodium: `decimal(8,2)`
- Body weight (kg): `decimal(5,2)`
- Body circumferences (cm): `decimal(5,2)`

## Consequences
- Accurate mathematical aggregation and display consistency across all diary entries, daily summaries, and export reports.
- Slight storage overhead compared to raw floats, which is negligible for this application scale.
