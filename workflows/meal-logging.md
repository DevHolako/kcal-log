# Workflow: Meal Logging

## Purpose
Enables users to log consumed food items and portions into their daily nutrition diary with minimal friction across web and mobile.

## Trigger
**Event-driven**: User initiates food intake logging at or around mealtimes (e.g. tapping "Add Food" in `breakfast`, `lunch`, `dinner`, or `snack`, or scanning a product barcode).

## Steps & Autonomous Action
1. **Intake Entry Point**:
   - Web / Mobile interface presents: Barcode Scanner (Mobile camera / barcode input), Text Search bar, Recent Foods list, Frequent Foods, and Quick Add (+kcal).
2. **Food Resolution (Fallback Chain)**:
   - Queries Open Food Facts authenticated session -> anonymous OFF -> local cache.
   - If found, food record is saved to local cache with nutrients per 100g and defined standard servings.
   - If not found or user chooses manual input, user enters name and macros to create a custom food.
3. **Portion & Unit Selection (Push Right)**:
   - System defaults to the user's most frequently logged serving size for that food (or the base package serving).
   - User adjusts quantity (e.g. 1.5) and serving unit (e.g. "grams" or "1 slice (35g)").
4. **Diary Record Creation**:
   - System records `DiaryEntry` linked to the user, selected `MealSlot`, and log date.
   - Updates `DailySummary` calories consumed and remaining macro allowances.
   - Broadcasts realtime event via Reverb for multi-device sync.

## Checkpoint
**Immediate Action / No Blocking Checkpoint**: Diary entry is committed immediately upon portion selection. User can edit or delete entries anytime.

## Edge Cases & Degradation
- **Network Disconnect**: Mobile app appends `DiaryEntry` to local SQLite offline queue and updates optimistic local UI; queues background sync to Laravel API on reconnection.
- **OFF Down**: System falls back silently to local cached items and prompts option to create a custom food.
