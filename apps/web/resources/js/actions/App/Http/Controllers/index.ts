import Api from './Api'
import OnboardingController from './OnboardingController'
import DiaryController from './DiaryController'
import FoodController from './FoodController'
import RecipeController from './RecipeController'
import ExportController from './ExportController'
import AdaptiveController from './AdaptiveController'
import Assistant from './Assistant'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    OnboardingController: Object.assign(OnboardingController, OnboardingController),
    DiaryController: Object.assign(DiaryController, DiaryController),
    FoodController: Object.assign(FoodController, FoodController),
    RecipeController: Object.assign(RecipeController, RecipeController),
    ExportController: Object.assign(ExportController, ExportController),
    AdaptiveController: Object.assign(AdaptiveController, AdaptiveController),
    Assistant: Object.assign(Assistant, Assistant),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers