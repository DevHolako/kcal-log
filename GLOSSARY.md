# kcal-log Domain

A nutrition and body tracking application providing an intuitive diary, barcode scanning, Open Food Facts synchronization, adaptive calorie adjustments, and multi-platform support.

## Language

**Food**:
A distinct nutritional item containing calories and macronutrients per 100g and defined serving units.
_Avoid_: Product, Item, Ingredient

**DiaryEntry**:
A specific logged instance of a Food at a given portion size, assigned to a user, date, and MealSlot.
_Avoid_: LogEntry, MealItem, FoodLog

**MealSlot**:
One of the standard daily intake periods: breakfast, lunch, dinner, or snack.
_Avoid_: MealType, Category

**Serving**:
A standardized measure for a food (e.g., "1 slice (40g)", "1 cup (240ml)") with an explicit gram-weight conversion factor.
_Avoid_: PortionSize, UnitAmount

**TargetProfile**:
A user's active baseline formula parameters (BMR via Mifflin-St Jeor, activity multiplier, calorie goal, and macro percentage/gram split).
_Avoid_: GoalSetting, NutritionPlan

**DailySummary**:
The calculated daily aggregation of consumed calories/macros versus TargetProfile allowances, including exercise adjustments and water intake.
_Avoid_: DailyStatus, BudgetSummary

**OFFConnection**:
A user-specific Open Food Facts connection maintaining credentials/tokens encrypted at rest, isolated from general user profile data.
_Avoid_: ThirdPartyAuth, ExternalLink

**AdaptiveAdjustment**:
A weekly computed adjustment to calorie/macro targets based on smoothed weight changes versus actual logged intake, subject to user confirmation.
_Avoid_: AutoTune, DynamicTarget, Recalibration

**CustomFood**:
A user-created Food record scoped exclusively to its author, never overwritten by external OFF updates.
_Avoid_: PrivateFood, UserItem

**FoodServing**:
A specific portion size option associated with a Food (e.g. "1 medium (118g)", "1 tbsp (15g)").
_Avoid_: PortionOption, ServingMeasure

**WeightLog**:
A timestamped record of a user's measured body weight stored in metric kilograms with high precision.
_Avoid_: WeighInRecord, ScaleEntry

**UserAiConnection**:
A user-specific AI provider connection maintaining credentials and model preferences encrypted at rest, isolated from general user profile data.
_Avoid_: ApiKey, AiToken, UserSecret, AiSetting

**NutritionAssistant**:
An AI-powered conversational assistant capable of querying a user's nutritional diary, body measurements, targets, and food databases via read-only tools.
_Avoid_: Chatbot, AiBot, ChatAgent

**AiConversation**:
A persisted multi-turn chat session between a user and the NutritionAssistant.
_Avoid_: ChatSession, Thread, Dialogue

**AiMessage**:
A distinct message record within an AiConversation representing user prompts, assistant answers, or tool interaction results.
_Avoid_: ChatMessage, PromptResponse, TurnRecord
