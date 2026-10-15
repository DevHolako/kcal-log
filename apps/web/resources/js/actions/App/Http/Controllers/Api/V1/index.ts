import AuthController from './AuthController'
import OnboardingController from './OnboardingController'
import FoodController from './FoodController'
import CustomFoodController from './CustomFoodController'
import OffConnectionController from './OffConnectionController'
import DiaryController from './DiaryController'
import RecipeController from './RecipeController'
import ExportController from './ExportController'
import AdaptiveController from './AdaptiveController'

const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
    OnboardingController: Object.assign(OnboardingController, OnboardingController),
    FoodController: Object.assign(FoodController, FoodController),
    CustomFoodController: Object.assign(CustomFoodController, CustomFoodController),
    OffConnectionController: Object.assign(OffConnectionController, OffConnectionController),
    DiaryController: Object.assign(DiaryController, DiaryController),
    RecipeController: Object.assign(RecipeController, RecipeController),
    ExportController: Object.assign(ExportController, ExportController),
    AdaptiveController: Object.assign(AdaptiveController, AdaptiveController),
}

export default V1