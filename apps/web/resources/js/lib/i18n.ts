import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export type Locale = 'en' | 'fr';

export const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Navigation & Layout
        'nav.dashboard': 'Dashboard',
        'nav.diary': 'Daily Diary',
        'nav.strategy': 'Adaptive Strategy',
        'nav.foods': 'Foods & Search',
        'nav.recipes': 'Recipes & Meals',
        'nav.reports': 'Reports & Exports',
        'nav.settings': 'Settings',
        'nav.appearance': 'Appearance',
        'nav.profile': 'Profile',
        'nav.security': 'Security',
        'nav.repository': 'Repository',
        'nav.documentation': 'Documentation',
        'nav.assistant': 'AI Assistant',
        'nav.assistant_short': 'Assistant',
        'nav.open_food_facts': 'Open Food Facts',

        // Auth & User menu
        'auth.logout': 'Log out',
        'auth.login': 'Log in',
        'auth.register': 'Register',

        // Nutrients
        'nutrition.calories': 'Calories',
        'nutrition.protein': 'Protein',
        'nutrition.carbs': 'Carbohydrates',
        'nutrition.fat': 'Fat',
        'nutrition.water': 'Water',
        'nutrition.fiber': 'Fiber',
        'nutrition.sugar': 'Sugar',
        'nutrition.saturated_fat': 'Saturated Fat',
        'nutrition.net_carbs': 'Net Carbs',
        'nutrition.sodium': 'Sodium',

        // Meal Slots
        'slot.breakfast': 'Breakfast',
        'slot.lunch': 'Lunch',
        'slot.dinner': 'Dinner',
        'slot.snack': 'Snacks',

        // Status & Metrics
        'status.remaining': 'Remaining',
        'status.over_goal': 'Over Goal',
        'status.goal': 'Goal',
        'status.today': 'Today',
        'status.yesterday': 'Yesterday',
        'status.tomorrow': 'Tomorrow',
        'status.logged_weight': 'Logged Weight',
        'status.no_target': 'Not configured',
        'status.active_plan': 'Active Plan',
        'status.decision_required': 'Decision Required',
        'status.accepted': 'Accepted',
        'status.rejected': 'Rejected',
        'status.pending': 'Pending',

        // Common Actions
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'action.add_food': 'Add Food',
        'action.quick_add': 'Quick Add',
        'action.scan_barcode': 'Scan Barcode',
        'action.scan': 'Scan',
        'action.log_water': 'Log Water',
        'action.save': 'Save',
        'action.cancel': 'Cancel',
        'action.delete': 'Delete',
        'action.edit': 'Edit',
        'action.close': 'Close',
        'action.lookup': 'Lookup',
        'action.confirm': 'Confirm',
        'action.confirm_log': 'Confirm Log',
        'action.log_to_diary': 'Log to Diary',
        'action.create': 'Create',
        'action.create_recipe': 'Create Recipe',
        'action.create_food': 'Create Food',
        'action.customize': 'Customize',
        'action.log_serving': 'Log Serving',
        'action.download': 'Download',
        'action.export': 'Export',
        'action.export_report': 'Export Report',
        'action.recalculate': 'Recalculate Trend',
        'action.calculating': 'Calculating...',
        'action.accept_plan': 'Accept & Activate Plan',
        'action.reject_plan': 'Reject & Keep Current Targets',

        // Diary & Dashboard
        'diary.title': 'Daily Diary',
        'diary.energy_macro_targets': 'Energy & Macronutrient Targets',
        'diary.daily_nutrition': 'Daily Nutrition',
        'diary.calories_consumed': 'Calories Consumed',
        'diary.budget': 'Calorie Budget',
        'diary.intake_bar_chart': '7-Day Energy Intake',
        'diary.water_intake': 'Water Hydration',
        'diary.weight_tracking': 'Weight Tracking',
        'diary.record_weight': 'Log Body Weight',
        'diary.weight_placeholder': 'e.g. 78.5',
        'diary.weigh_in': 'Morning Weigh-In',
        'diary.log_weight': 'Log Weight',
        'diary.update_weight': 'Update Weight',
        'diary.current_weight': 'Current Weight',
        'diary.not_logged': 'Not logged yet',
        'diary.weight_kg': 'Weight (kg)',
        'diary.weight_note': 'Notes (optional)',
        'diary.delete_weight': 'Delete weigh-in',
        'diary.confirm_delete_weight':
            "Are you sure you want to delete today's weight log?",
        'diary.measurements': 'Circumference Measurements',
        'diary.measurements_desc':
            'Track waist, hips, chest and body circumferences.',
        'diary.record_measurements': 'Record Measurements',
        'diary.update_measurements': 'Update Measurements',
        'diary.waist_cm': 'Waist (cm)',
        'diary.hips_cm': 'Hips (cm)',
        'diary.chest_cm': 'Chest (cm)',
        'diary.neck_cm': 'Neck (cm)',
        'diary.biceps_cm': 'Biceps (cm)',
        'diary.thighs_cm': 'Thighs (cm)',
        'diary.calves_cm': 'Calves (cm)',
        'diary.exercise_activity': 'Exercise & Activity',
        'diary.log_exercise': 'Log Exercise',
        'diary.exercise_name': 'Activity Name',
        'diary.exercise_type': 'Activity Type',
        'diary.duration_minutes': 'Duration (minutes)',
        'diary.calories_burned': 'Calories Burned (kcal)',
        'diary.no_exercises': 'No exercise logged for this day.',
        'diary.delete_measurements': 'Delete measurements',
        'diary.confirm_delete_measurements':
            "Are you sure you want to delete today's circumference measurements?",
        'diary.cardio': 'Cardio',
        'diary.strength': 'Strength Training',
        'diary.other_activity': 'Other / Sports',
        'diary.delete_exercise': 'Delete exercise',
        'diary.confirm_delete_exercise':
            'Are you sure you want to delete this exercise log?',
        'diary.no_measurements': 'No body measurements recorded for this day.',
        'diary.recent_foods': 'Recent & Logged Foods',
        'diary.open_food_facts_catalog': 'Open Food Facts Catalog',
        'diary.no_foods_in_slot': 'No food items logged in this meal slot yet.',
        'diary.portion_size': 'Portion Size',
        'diary.grams': 'grams',
        'diary.servings': 'servings',
        'diary.quick_add_title': 'Quick Add Calories',
        'diary.quick_add_description':
            'Log calories directly without selecting an item from the database.',
        'diary.meal_slot': 'Meal Slot',
        'diary.description': 'Description',
        'diary.description_placeholder': 'e.g. Afternoon snack, protein bar...',
        'diary.calories_kcal': 'Calories (kcal)',
        'diary.add_calories': 'Add Calories',

        // Barcode Scanner
        'scanner.title': 'Scan Food Barcode',
        'scanner.description':
            'Scan any food package barcode to look it up in Open Food Facts and your saved food catalog.',
        'scanner.align': 'Align barcode inside frame',
        'scanner.manual_prompt': 'Or enter barcode manually:',
        'scanner.permission_denied':
            'Camera access was denied. Please enable camera permissions in your browser or enter the barcode below.',
        'scanner.unsupported':
            'Camera API is not supported on this browser or environment.',
        'scanner.retry': 'Retry Camera',
        'scanner.looking_up': 'Looking up barcode {code}...',
        'scanner.not_found': 'No food found matching barcode {code}.',
        'scanner.failed':
            'Failed to lookup barcode {code}. Check network connection.',
        'scanner.notice':
            'Camera stream active. If your browser does not support live barcode detection, enter the digits below.',

        // Foods Catalog
        'foods.title': 'Food Catalog & Search',
        'foods.subtitle':
            'Browse and search nutrition data from Open Food Facts and your custom foods.',
        'foods.add_custom': 'Add Custom Food',
        'foods.create_custom_food': 'Create Custom Food',
        'foods.search_placeholder':
            'Search by name, brand, or barcode (e.g. Oats, Danone, 6111035000058)...',
        'foods.unified_search_label': 'Search Food Database & Open Food Facts',
        'foods.badge_in_database': 'In Database',
        'foods.badge_custom': 'Custom Food',
        'foods.badge_openfoodfacts': 'Open Food Facts',
        'foods.sync_progress_title': 'Open Food Facts Sync in Progress',
        'foods.sync_progress_items': '{count} items saved',
        'foods.sync_completed': 'Catalog sync completed successfully!',
        'foods.barcode_placeholder':
            'Enter barcode number (e.g. 3017620422003, 3229820129488)...',
        'foods.text_search': 'Text Search',
        'foods.barcode_lookup': 'Barcode Lookup',
        'foods.scan_camera': 'Scan with Camera',
        'foods.per_100g': 'Per 100g',
        'foods.portion_and_log': 'Portion & Log',
        'foods.no_foods_found': 'No foods found matching your query.',
        'foods.create_custom_title': 'Create Custom Food',
        'foods.edit_custom_title': 'Edit Custom Food',
        'foods.edit_custom_desc':
            'Update nutritional values and portion information for this item.',
        'foods.food_name': 'Food Name',
        'foods.brand': 'Brand',
        'foods.serving_size_g': 'Serving Size (g)',
        'foods.save_custom': 'Save Custom Food',
        'foods.common_cached': 'Common & Cached Foods',
        'foods.my_custom': 'My Custom Foods',
        'foods.portion_calculator': 'Portion Nutrition Calculator',
        'foods.unit_mode_weight': 'By Weight / Volume',
        'foods.unit_mode_serving': 'By Serving Size',
        'foods.enter_grams_ml': 'Exact Amount (g / ml)',
        'foods.quick_presets': 'Quick Portions',
        'foods.zero_calorie_badge': '0 kcal • Water / Zero-Calorie Item',
        'foods.zero_calorie_explanation':
            'Natural mineral water, unsweetened tea, and black coffee naturally contain 0 calories and 0g macronutrients.',
        'foods.view_details': 'View Full Details',
        'foods.nutrition_facts': 'Nutrition Facts',
        'foods.back_to_catalog': 'Back to Food Catalog',
        'foods.per_selected_portion': 'Selected Portion',
        'foods.portion_multiplier': 'Portion Multiplier',
        'foods.degraded_mode': 'Degraded Mode: Offline Cache',
        'foods.clear_search': 'Clear results',
        'foods.sync_button': 'Sync Open Food Facts',
        'foods.sync_title': 'Sync from Open Food Facts',
        'foods.sync_description':
            'Ingest verified staple and nutrient-rich foods directly into your local database.',
        'foods.sync_count_label': 'Number of items to fetch',
        'foods.sync_category_label': 'Category or diet focus',
        'foods.sync_category_staples':
            'Everyday Staples (Chicken, Oats, Salmon, Rice, Milk)',
        'foods.sync_category_protein':
            'High Protein (Whey, Meat, Tuna, Eggs, Tofu)',
        'foods.sync_category_produce':
            'Fresh Produce (Fruits, Greens, Sweet Potatoes)',
        'foods.sync_category_dairy':
            'Dairy & Alternatives (Yogurt, Cheeses, Skyr)',
        'foods.sync_category_grains':
            'Grains & Legumes (Oats, Rice, Quinoa, Lentils)',
        'foods.sync_custom_terms_label':
            'Or custom comma-separated search terms',
        'foods.sync_custom_terms_placeholder': 'e.g. tofu, matcha, almond milk',
        'foods.sync_start': 'Start Syncing',
        'foods.syncing': 'Syncing...',
        'foods.sync_dispatched':
            'Sync started in background! New foods will stream into your catalog.',
        'foods.showing_count': 'Showing {showing} of {total} cached foods',
        'foods.off_banner_title': 'Open Food Facts Ready — No Account Required',
        'foods.off_banner_desc':
            'Barcode scanning and global food search work automatically out-of-the-box. If you want to contribute product edits or sync your catalog additions, you can optionally connect your personal Open Food Facts account.',
        'foods.off_banner_action': 'Connect OFF Account',
        'foods.off_banner_dismiss': 'Dismiss',

        // Food Nutrition Checker
        'food_checker.title': 'Food Nutrition Checker',
        'food_checker.subtitle':
            'Search and inspect calories, macros, and nutrients without logging.',
        'food_checker.search_placeholder':
            'Search any food (e.g. chia seeds, oats, skyr, barcode)...',
        'food_checker.trigger_button': 'Check Food',
        'food_checker.quick_check': 'Check Food',
        'food_checker.popular_searches': 'Popular & Quick Lookups',
        'food_checker.recent_foods': 'Recently Cached Foods',
        'food_checker.searching': 'Searching Open Food Facts & database...',
        'food_checker.no_results': 'No foods found matching "{query}"',
        'food_checker.back_to_search': 'Back to Search',
        'food_checker.portion_calculator':
            'Interactive Portion & Macro Checker',
        'food_checker.macro_distribution': 'Caloric Macro Distribution',
        'food_checker.log_optional': 'Log to Diary (Optional)',
        'food_checker.log_success': 'Food logged to your diary successfully!',
        'food_checker.log_to_diary': 'Log This Portion',
        'food_checker.logging': 'Logging...',
        'food_checker.check_another': 'Check Another Food',
        'food_checker.open_full_page': 'View Full Page',
        'food_checker.shortcut_hint': 'Press ⌘K or Ctrl+K to search anytime',
        'food_checker.protein_cals': '{percent}% of calories ({grams}g)',
        'food_checker.carbs_cals': '{percent}% of calories ({grams}g)',
        'food_checker.fat_cals': '{percent}% of calories ({grams}g)',

        // Recipes & Meals
        'recipes.title': 'Recipes & Meals',
        'recipes.subtitle':
            'Build composite recipes from multiple foods, view aggregate macros, and log them to your food diary with 1 click.',
        'recipes.tab_my_recipes': 'My Custom Recipes',
        'recipes.tab_starter_kits': 'Starter Meal-Prep Kits',
        'recipes.free_apis_title':
            'Ready Meal-Prep Kits & Free Recipe API Integrations',
        'recipes.free_apis_desc':
            'kcal-log provides 6 built-in macro-balanced meal prep kits ready to log directly or import as customizable templates. The platform is architected to seamlessly hook into external recipe databases:',
        'recipes.no_recipes': 'No custom recipes created yet',
        'recipes.no_recipes_desc':
            'Combine ingredients into reusable composite recipes, or browse our ready-to-log meal-prep kits.',
        'recipes.browse_kits': 'Browse Starter Kits',
        'recipes.per_serving': 'Per Serving',
        'recipes.ingredients': 'Ingredients',
        'recipes.create_title': 'Create New Recipe',
        'recipes.create_recipe': 'Create Recipe',
        'recipes.edit_recipe': 'Edit Recipe',
        'recipes.edit_title': 'Edit Recipe',
        'recipes.edit_description':
            'Update recipe ingredients, portion sizes, or servings yield.',
        'recipes.update_recipe': 'Update Recipe',
        'recipes.recipe_name': 'Recipe Name',
        'recipes.servings_count': 'Servings Yield',
        'recipes.save_recipe': 'Save Recipe',
        'recipes.add_ingredient': 'Add Ingredient',
        'recipes.search_ingredient': 'Type food name to search...',
        'recipes.searching_foods': 'Searching database & Open Food Facts...',
        'recipes.no_foods_found': 'No food items found matching "{query}".',
        'recipes.add_this_ingredient': 'Add This Ingredient',
        'recipes.grocery_list': 'Grocery List',
        'recipes.grocery_list_desc':
            'Generate a consolidated grocery checklist from your meal prep kits and custom recipes.',
        'recipes.select_meals': 'Select Meals & Portions',
        'recipes.servings': 'Servings',
        'recipes.cat_protein': '🥩 Meats, Poultry & Protein',
        'recipes.cat_produce': '🥦 Fresh Produce & Vegetables',
        'recipes.cat_dairy': '🥛 Dairy & Eggs',
        'recipes.cat_pantry': '🍚 Grains, Oils & Pantry',
        'recipes.copy_list': 'Copy Checklist',
        'recipes.copied': 'Copied to clipboard!',
        'recipes.clear_list': 'Clear selection',
        'recipes.empty_grocery':
            'Select at least one recipe or starter kit to generate your grocery list.',

        // Adaptive Strategy
        'strategy.title': 'Adaptive Nutrition Strategy',
        'strategy.subtitle':
            'Automated weekly EWMA weight smoothing, metabolic energy expenditure derivation, and personalized checkpoint briefs.',
        'strategy.how_it_works': 'How the Engine Works',
        'strategy.hide_logic': 'Hide Logic',
        'strategy.active_plan_title': 'Active Target Plan',
        'strategy.active_plan_desc':
            'Currently active caloric and macronutrient baseline targets applied to your diary.',
        'strategy.weekly_brief_title': 'Weekly Checkpoint Brief',
        'strategy.review_window': 'Review Window',
        'strategy.ewma_weight_change': 'EWMA Weight Change',
        'strategy.avg_daily_intake': 'Avg Daily Intake',
        'strategy.calculated_tdee': 'Calculated TDEE',
        'strategy.proposed_target': 'Proposed Target',
        'strategy.plan_comparison': 'Plan Comparison',
        'strategy.current_to_proposed': 'Current → Proposed',
        'strategy.ewma_chart_title': 'EWMA Weight Smoothing Trend',
        'strategy.ewma_formula_label':
            'Exponentially Weighted Moving Average (α = 0.25)',
        'strategy.ewma_chart_desc':
            'Dampens daily water weight noise to reveal true physiological fat and tissue changes.',
        'strategy.history_title': 'Checkpoint Decision History',
        'strategy.no_history': 'No adjustments recorded yet.',
        'strategy.calibration_alert_title': 'Initial Calibration Phase',
        'strategy.calibration_alert_desc':
            'The adaptive engine requires a minimum of 4 weight logs across a 7-day period to establish high-confidence EWMA smoothed baselines.',

        // Reports & Exports
        'reports.title': 'Reports & Data Exports',
        'reports.subtitle':
            'Generate downloadable PDF summary reports, spreadsheet CSVs, or raw JSON data archives.',
        'reports.exec_summary_title': '30-Day Executive Summary',
        'reports.adherence_rate': 'Adherence Rate',
        'reports.days_tracked': 'Days Tracked',
        'reports.weight_trend_shift': 'Weight Trend Shift',
        'reports.avg_hydration': 'Avg Hydration',
        'reports.recent_exports': 'Recent Data Exports',
        'reports.request_export': 'Request Export',
        'reports.download_pdf': 'Download PDF',
        'reports.download_csv': 'Download CSV',
        'reports.download_json': 'Download JSON',
        'reports.no_exports': 'No exports generated yet.',
        'reports.avg_daily_calories': 'Avg Daily Calories',
        'reports.target_adherence': 'Target Adherence',
        'reports.avg_macronutrients': 'Avg Macronutrients',
        'reports.target': 'Target',
        'reports.export_format': 'Export Format',
        'reports.date_range': 'Date Range',
        'reports.preset_7d': 'Last 7 Days',
        'reports.preset_30d': 'Last 30 Days',
        'reports.preset_90d': 'Last 90 Days',
        'reports.from': 'From',
        'reports.to': 'To',
        'reports.generate_export': 'Generate {type} Export',
        'reports.generating': 'Generating Export...',

        // Settings & Appearance
        'settings.title': 'Settings',
        'settings.subtitle': 'Manage your profile and account settings',
        'settings.nav_profile': 'Profile',
        'settings.nav_security': 'Security',
        'settings.nav_appearance': 'Appearance',
        'settings.nav_off': 'Open Food Facts',
        'settings.nav_ai': 'AI Assistant',
        'settings.appearance_title': 'Appearance',
        'settings.appearance_subtitle':
            'Customize layout, palette themes, and navigation styles.',
        'settings.theme': 'Theme Mode',
        'settings.theme_light': 'Light',
        'settings.theme_dark': 'Dark',
        'settings.theme_system': 'System',
        'settings.layout_mode': 'Navigation Layout',
        'settings.layout_left_sidebar': 'Left Sidebar',
        'settings.layout_right_sidebar': 'Right Sidebar',
        'settings.layout_top_nav': 'Top Navigation Bar',
        'settings.layout_bottom_dock': 'Bottom Floating Dock',
        'settings.palette': 'Design Token Palette',
        'settings.language': 'Interface Language',
    },
    fr: {
        // Navigation & Layout
        'nav.dashboard': 'Tableau de bord',
        'nav.diary': 'Journal quotidien',
        'nav.strategy': 'Stratégie adaptative',
        'nav.foods': 'Aliments et recherche',
        'nav.recipes': 'Recettes et repas',
        'nav.reports': 'Rapports et exports',
        'nav.settings': 'Paramètres',
        'nav.appearance': 'Apparence',
        'nav.profile': 'Profil',
        'nav.security': 'Sécurité',
        'nav.repository': 'Dépôt GitHub',
        'nav.documentation': 'Documentation',
        'nav.assistant': 'Assistant IA',
        'nav.assistant_short': 'Assistant',
        'nav.open_food_facts': 'Open Food Facts',

        // Auth & User menu
        'auth.logout': 'Se déconnecter',
        'auth.login': 'Connexion',
        'auth.register': 'Créer un compte',

        // Nutrients
        'nutrition.calories': 'Calories',
        'nutrition.protein': 'Protéines',
        'nutrition.carbs': 'Glucides',
        'nutrition.fat': 'Lipides',
        'nutrition.water': 'Eau',
        'nutrition.fiber': 'Fibres',
        'nutrition.sugar': 'Sucres',
        'nutrition.saturated_fat': 'Graisses saturées',
        'nutrition.net_carbs': 'Glucides nets',
        'nutrition.sodium': 'Sodium',

        // Meal Slots
        'slot.breakfast': 'Petit-déjeuner',
        'slot.lunch': 'Déjeuner',
        'slot.dinner': 'Dîner',
        'slot.snack': 'Collations',

        // Status & Metrics
        'status.remaining': 'Restant',
        'status.over_goal': 'Objectif dépassé',
        'status.goal': 'Objectif',
        'status.today': "Aujourd'hui",
        'status.yesterday': 'Hier',
        'status.tomorrow': 'Demain',
        'status.logged_weight': 'Poids enregistré',
        'status.no_target': 'Non configuré',
        'status.active_plan': 'Plan actif',
        'status.decision_required': 'Décision requise',
        'status.accepted': 'Accepté',
        'status.rejected': 'Refusé',
        'status.pending': 'En attente',

        // Common Actions
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'action.add_food': 'Ajouter un aliment',
        'action.quick_add': 'Ajout rapide',
        'action.scan_barcode': 'Scanner le code-barres',
        'action.scan': 'Scanner',
        'action.log_water': 'Ajouter de l’eau',
        'action.save': 'Enregistrer',
        'action.cancel': 'Annuler',
        'action.delete': 'Supprimer',
        'action.edit': 'Modifier',
        'action.close': 'Fermer',
        'action.lookup': 'Rechercher',
        'action.confirm': 'Confirmer',
        'action.confirm_log': 'Valider la saisie',
        'action.log_to_diary': 'Ajouter au journal',
        'action.create': 'Créer',
        'action.create_recipe': 'Créer une recette',
        'action.create_food': 'Créer un aliment',
        'action.customize': 'Personnaliser',
        'action.log_serving': 'Enregistrer la portion',
        'action.download': 'Télécharger',
        'action.export': 'Exporter',
        'action.export_report': 'Exporter le rapport',
        'action.recalculate': 'Recalculer la tendance',
        'action.calculating': 'Calcul en cours...',
        'action.accept_plan': 'Accepter et activer le plan',
        'action.reject_plan': 'Refuser et garder les objectifs actuels',

        // Diary & Dashboard
        'diary.title': 'Journal quotidien',
        'diary.energy_macro_targets':
            'Objectifs énergétiques et macronutriments',
        'diary.daily_nutrition': 'Nutrition du jour',
        'diary.calories_consumed': 'Calories consommées',
        'diary.budget': 'Budget calorique',
        'diary.intake_bar_chart': 'Apport énergétique sur 7 jours',
        'diary.water_intake': 'Hydratation',
        'diary.weight_tracking': 'Suivi du poids',
        'diary.record_weight': 'Enregistrer le poids',
        'diary.weight_placeholder': 'ex. 78,5',
        'diary.weigh_in': 'Pesée du matin',
        'diary.log_weight': 'Enregistrer le poids',
        'diary.update_weight': 'Modifier le poids',
        'diary.current_weight': 'Poids actuel',
        'diary.not_logged': 'Pas encore pesé',
        'diary.weight_kg': 'Poids (kg)',
        'diary.weight_note': 'Remarques (optionnel)',
        'diary.delete_weight': 'Supprimer la pesée',
        'diary.confirm_delete_weight':
            'Voulez-vous supprimer la pesée de ce jour ?',
        'diary.measurements': 'Mensurations corporelles',
        'diary.measurements_desc':
            'Suivez le tour de taille, hanches, poitrine et mensurations.',
        'diary.record_measurements': 'Enregistrer les mesures',
        'diary.update_measurements': 'Modifier les mesures',
        'diary.waist_cm': 'Tour de taille (cm)',
        'diary.hips_cm': 'Tour de hanches (cm)',
        'diary.chest_cm': 'Tour de poitrine (cm)',
        'diary.neck_cm': 'Tour de cou (cm)',
        'diary.biceps_cm': 'Tour de biceps (cm)',
        'diary.thighs_cm': 'Tour de cuisse (cm)',
        'diary.calves_cm': 'Tour de mollet (cm)',
        'diary.exercise_activity': 'Exercices & Activité',
        'diary.log_exercise': 'Enregistrer un exercice',
        'diary.exercise_name': 'Nom de l’activité',
        'diary.exercise_type': 'Type d’activité',
        'diary.duration_minutes': 'Durée (minutes)',
        'diary.calories_burned': 'Calories brûlées (kcal)',
        'diary.no_exercises': 'Aucun exercice enregistré pour ce jour.',
        'diary.delete_measurements': 'Supprimer les mesures',
        'diary.confirm_delete_measurements':
            'Voulez-vous supprimer les mensurations de ce jour ?',
        'diary.cardio': 'Cardio',
        'diary.strength': 'Musculation / Renforcement',
        'diary.other_activity': 'Autre / Sport',
        'diary.delete_exercise': "Supprimer l'exercice",
        'diary.confirm_delete_exercise': 'Voulez-vous supprimer cet exercice ?',
        'diary.no_measurements': 'Aucune mensuration enregistrée pour ce jour.',
        'diary.recent_foods': 'Aliments récents et favoris',
        'diary.open_food_facts_catalog': 'Catalogue Open Food Facts',
        'diary.no_foods_in_slot':
            'Aucun aliment enregistré dans ce repas pour le moment.',
        'diary.portion_size': 'Taille de portion',
        'diary.grams': 'grammes',
        'diary.servings': 'portions',
        'diary.quick_add_title': 'Ajout rapide de calories',
        'diary.quick_add_description':
            'Enregistrez directement des calories sans sélectionner un aliment du catalogue.',
        'diary.meal_slot': 'Repas',
        'diary.description': 'Description',
        'diary.description_placeholder':
            'ex. Collation après-midi, barre protéinée...',
        'diary.calories_kcal': 'Calories (kcal)',
        'diary.add_calories': 'Ajouter les calories',

        // Barcode Scanner
        'scanner.title': 'Scanner le code-barres',
        'scanner.description':
            'Scannez le code-barres d’un aliment pour le rechercher dans Open Food Facts et vos favoris.',
        'scanner.align': 'Alignez le code-barres dans le cadre',
        'scanner.manual_prompt': 'Ou saisissez le code-barres manuellement :',
        'scanner.permission_denied':
            'Accès à la caméra refusé. Activez l’autorisation caméra ou saisissez le code ci-dessous.',
        'scanner.unsupported':
            'L’API de caméra n’est pas prise en charge sur ce navigateur ou environnement.',
        'scanner.retry': 'Réessayer la caméra',
        'scanner.looking_up': 'Recherche du code-barres {code}...',
        'scanner.not_found': 'Aucun aliment trouvé pour le code-barres {code}.',
        'scanner.failed':
            'Échec de la recherche du code-barres {code}. Vérifiez votre connexion.',
        'scanner.notice':
            'Flux caméra actif. Si votre navigateur ne gère pas la détection automatique, saisissez le code ci-dessous.',

        // Foods Catalog
        'foods.title': 'Catalogue & Recherche d’aliments',
        'foods.subtitle':
            'Parcourez et recherchez les données nutritionnelles d’Open Food Facts et vos aliments personnalisés.',
        'foods.add_custom': 'Créer un aliment',
        'foods.create_custom_food': 'Créer un aliment personnalisé',
        'foods.search_placeholder':
            'Rechercher par aliment, marque ou code-barres (ex. Avoine, Danone, 6111035000058)...',
        'foods.unified_search_label':
            'Recherche dans la base & Open Food Facts',
        'foods.badge_in_database': 'En base locale',
        'foods.badge_custom': 'Aliment personnalisé',
        'foods.badge_openfoodfacts': 'Open Food Facts',
        'foods.sync_progress_title': 'Synchronisation Open Food Facts en cours',
        'foods.sync_progress_items': '{count} aliments ajoutés',
        'foods.sync_completed': 'Synchronisation terminée avec succès !',
        'foods.barcode_placeholder':
            'Saisir le code-barres (ex. 3017620422003)...',
        'foods.text_search': 'Recherche textuelle',
        'foods.barcode_lookup': 'Recherche code-barres',
        'foods.scan_camera': 'Scanner avec la caméra',
        'foods.per_100g': 'Pour 100g',
        'foods.portion_and_log': 'Choisir portion et enregistrer',
        'foods.no_foods_found': 'Aucun aliment trouvé pour votre recherche.',
        'foods.create_custom_title': 'Créer un aliment personnalisé',
        'foods.edit_custom_title': 'Modifier l’aliment personnalisé',
        'foods.edit_custom_desc':
            'Modifiez les valeurs nutritionnelles et les informations de portion de cet aliment.',
        'foods.food_name': 'Nom de l’aliment',
        'foods.brand': 'Marque',
        'foods.serving_size_g': 'Portion de référence (g)',
        'foods.save_custom': 'Enregistrer l’aliment',
        'foods.common_cached': 'Aliments courants et en cache',
        'foods.my_custom': 'Mes aliments personnalisés',
        'foods.portion_calculator': 'Calculateur de portions et nutriments',
        'foods.unit_mode_weight': 'Par poids / volume',
        'foods.unit_mode_serving': 'Par portion prédéfinie',
        'foods.enter_grams_ml': 'Quantité exacte (g / ml)',
        'foods.quick_presets': 'Portions rapides',
        'foods.zero_calorie_badge': '0 kcal • Eau / Boisson sans calorie',
        'foods.zero_calorie_explanation':
            'L’eau minérale naturelle, le café noir et le thé non sucré contiennent naturellement 0 calorie et 0g de macronutriments.',
        'foods.view_details': 'Voir les détails complets',
        'foods.nutrition_facts': 'Valeurs nutritionnelles',
        'foods.back_to_catalog': 'Retour au catalogue d’aliments',
        'foods.per_selected_portion': 'Portion sélectionnée',
        'foods.portion_multiplier': 'Multiplicateur de portion',
        'foods.degraded_mode': 'Mode dégradé : Cache hors ligne',
        'foods.clear_search': 'Effacer les résultats',
        'foods.sync_button': 'Synchroniser Open Food Facts',
        'foods.sync_title': 'Synchroniser le catalogue Open Food Facts',
        'foods.sync_description':
            'Importez des aliments vérifiés de référence directement dans votre base de données locale.',
        'foods.sync_count_label': 'Nombre d’éléments à récupérer',
        'foods.sync_category_label': 'Catégorie ou priorité alimentaire',
        'foods.sync_category_staples':
            'Indispensables du quotidien (Poulet, Avoine, Saumon, Riz, Lait)',
        'foods.sync_category_protein':
            'Riche en protéines (Whey, Viandes, Thon, Œufs, Tofu)',
        'foods.sync_category_produce':
            'Fruits & Légumes frais (Épinards, Avocat, Patate douce)',
        'foods.sync_category_dairy':
            'Produits laitiers & Alternatifs (Skyr, Yaourt grec, Fromages)',
        'foods.sync_category_grains':
            'Céréales & Légumineuses (Quinoa, Lentilles, Pain complet)',
        'foods.sync_custom_terms_label':
            'Ou mots-clés personnalisés (séparés par des virgules)',
        'foods.sync_custom_terms_placeholder':
            'ex. tofu, matcha, lait d’amande',
        'foods.sync_start': 'Lancer la synchronisation',
        'foods.syncing': 'Synchronisation...',
        'foods.sync_dispatched':
            'Synchronisation lancée en arrière-plan ! Les nouveaux aliments apparaissent en direct.',
        'foods.showing_count':
            'Affichage de {showing} sur {total} aliments en cache',
        'foods.off_banner_title': 'Open Food Facts prêt — Aucun compte requis',
        'foods.off_banner_desc':
            'La recherche et le scan de code-barres mondial fonctionnent automatiquement sans compte. Pour contribuer aux fiches produits ou synchroniser vos ajouts, vous pouvez associer votre compte Open Food Facts.',
        'foods.off_banner_action': 'Associer mon compte',
        'foods.off_banner_dismiss': 'Ignorer',

        // Food Nutrition Checker
        'food_checker.title': 'Vérificateur nutritionnel d’aliments',
        'food_checker.subtitle':
            'Recherchez et inspectez les calories, macros et nutriments sans enregistrer.',
        'food_checker.search_placeholder':
            'Rechercher un aliment (ex. graines de chia, avoine, skyr, code-barres)...',
        'food_checker.trigger_button': 'Vérifier un aliment',
        'food_checker.quick_check': 'Vérifier un aliment',
        'food_checker.popular_searches': 'Recherches populaires & rapides',
        'food_checker.recent_foods': 'Aliments récemment en cache',
        'food_checker.searching':
            'Recherche dans Open Food Facts et la base...',
        'food_checker.no_results': 'Aucun aliment trouvé pour « {query} »',
        'food_checker.back_to_search': 'Retour à la recherche',
        'food_checker.portion_calculator':
            'Calculateur interactif de portion & macros',
        'food_checker.macro_distribution': 'Répartition calorique des macros',
        'food_checker.log_optional': 'Enregistrer dans le journal (optionnel)',
        'food_checker.log_success':
            'Aliment enregistré avec succès dans votre journal !',
        'food_checker.log_to_diary': 'Enregistrer cette portion',
        'food_checker.logging': 'Enregistrement...',
        'food_checker.check_another': 'Vérifier un autre aliment',
        'food_checker.open_full_page': 'Voir la fiche complète',
        'food_checker.shortcut_hint':
            'Appuyez sur ⌘K ou Ctrl+K pour rechercher à tout moment',
        'food_checker.protein_cals': '{percent}% des calories ({grams}g)',
        'food_checker.carbs_cals': '{percent}% des calories ({grams}g)',
        'food_checker.fat_cals': '{percent}% des calories ({grams}g)',

        // Recipes & Meals
        'recipes.title': 'Recettes & Repas préparés',
        'recipes.subtitle':
            'Composez des recettes multi-ingrédients, visualisez les macros combinées et enregistrez-les en 1 clic dans votre journal.',
        'recipes.tab_my_recipes': 'Mes recettes personnalisées',
        'recipes.tab_starter_kits': 'Kits de repas préparés (Meal-Prep)',
        'recipes.free_apis_title':
            'Kits prêts à l’emploi & Intégrations API de recettes gratuites',
        'recipes.free_apis_desc':
            'kcal-log inclut 6 kits de meal-prep équilibrés prêts à enregistrer ou à importer. La plateforme est conçue pour se connecter directement à des bases de données culinaires externes :',
        'recipes.no_recipes':
            'Aucune recette personnalisée créée pour le moment',
        'recipes.no_recipes_desc':
            'Combinez vos ingrédients en recettes réutilisables, ou découvrez nos kits de meal-prep prêts à l’emploi.',
        'recipes.browse_kits': 'Découvrir les kits',
        'recipes.per_serving': 'Par portion',
        'recipes.ingredients': 'Ingrédients',
        'recipes.create_title': 'Créer une nouvelle recette',
        'recipes.create_recipe': 'Créer une recette',
        'recipes.edit_recipe': 'Modifier la recette',
        'recipes.edit_title': 'Modifier la recette',
        'recipes.edit_description':
            'Mettez à jour les ingrédients, portions ou le rendement de la recette.',
        'recipes.update_recipe': 'Mettre à jour la recette',
        'recipes.recipe_name': 'Nom de la recette',
        'recipes.servings_count': 'Nombre de portions',
        'recipes.save_recipe': 'Enregistrer la recette',
        'recipes.add_ingredient': 'Ajouter l’ingrédient',
        'recipes.search_ingredient': 'Rechercher un ingrédient...',
        'recipes.searching_foods':
            'Recherche dans la base & Open Food Facts...',
        'recipes.no_foods_found': 'Aucun aliment trouvé pour « {query} ».',
        'recipes.add_this_ingredient': 'Ajouter cet ingrédient',
        'recipes.grocery_list': 'Liste de courses',
        'recipes.grocery_list_desc':
            'Générez une liste de courses consolidée à partir de vos repas préparés et recettes.',
        'recipes.select_meals': 'Sélectionner les repas et portions',
        'recipes.servings': 'Portions',
        'recipes.cat_protein': '🥩 Viandes, volailles & protéines',
        'recipes.cat_produce': '🥦 Légumes frais & fruits',
        'recipes.cat_dairy': '🥛 Produits laitiers & œufs',
        'recipes.cat_pantry': '🍚 Céréales, huiles & épicerie',
        'recipes.copy_list': 'Copier la liste',
        'recipes.copied': 'Copié dans le presse-papiers !',
        'recipes.clear_list': 'Effacer la sélection',
        'recipes.empty_grocery':
            'Sélectionnez au moins une recette ou un kit pour générer votre liste de courses.',

        // Adaptive Strategy
        'strategy.title': 'Stratégie nutritionnelle adaptative',
        'strategy.subtitle':
            'Lissage hebdomadaire du poids par EWMA, calcul de la dépense métabolique réelle et bilans personnalisés.',
        'strategy.how_it_works': 'Comprendre le moteur adaptatif',
        'strategy.hide_logic': 'Masquer les explications',
        'strategy.active_plan_title': 'Plan d’objectifs actif',
        'strategy.active_plan_desc':
            'Objectifs caloriques et en macronutriments actuellement appliqués à votre journal quotidien.',
        'strategy.weekly_brief_title': 'Bilan hebdomadaire adaptatif',
        'strategy.review_window': 'Période analysée',
        'strategy.ewma_weight_change': 'Évolution du poids EWMA',
        'strategy.avg_daily_intake': 'Apport moyen journalier',
        'strategy.calculated_tdee': 'Dépense réelle calculée (TDEE)',
        'strategy.proposed_target': 'Nouvel objectif proposé',
        'strategy.plan_comparison': 'Comparaison des plans',
        'strategy.current_to_proposed': 'Actuel → Proposé',
        'strategy.ewma_chart_title': 'Courbe de lissage du poids par EWMA',
        'strategy.ewma_formula_label':
            'Moyenne mobile à pondération exponentielle (α = 0,25)',
        'strategy.ewma_chart_desc':
            'Filtre les variations quotidiennes de rétention d’eau pour révéler l’évolution réelle du tissu corporel.',
        'strategy.history_title': 'Historique des bilans et décisions',
        'strategy.no_history': 'Aucun ajustement enregistré pour le moment.',
        'strategy.calibration_alert_title': 'Phase d’étalonnage initial',
        'strategy.calibration_alert_desc':
            'Le moteur adaptatif nécessite au moins 4 pesées sur une période de 7 jours pour établir une référence fiable lissée par EWMA.',

        // Reports & Exports
        'reports.title': 'Rapports & Exports de données',
        'reports.subtitle':
            'Générez des rapports récapitulatifs au format PDF, des fichiers CSV pour tableur ou des archives de données JSON brutes.',
        'reports.exec_summary_title': 'Synthèse exécutive sur 30 jours',
        'reports.adherence_rate': 'Taux d’adhérence',
        'reports.days_tracked': 'Jours enregistrés',
        'reports.weight_trend_shift': 'Évolution tendance du poids',
        'reports.avg_hydration': 'Hydratation moyenne',
        'reports.recent_exports': 'Exports de données récents',
        'reports.request_export': 'Demander un export',
        'reports.download_pdf': 'Télécharger le PDF',
        'reports.download_csv': 'Télécharger le CSV',
        'reports.download_json': 'Télécharger le JSON',
        'reports.no_exports': 'Aucun export généré pour le moment.',
        'reports.avg_daily_calories': 'Calories quotidiennes moyennes',
        'reports.target_adherence': 'Respect de l’objectif',
        'reports.avg_macronutrients': 'Macronutriments moyens',
        'reports.target': 'Objectif',
        'reports.export_format': 'Format d’export',
        'reports.date_range': 'Période',
        'reports.preset_7d': '7 derniers jours',
        'reports.preset_30d': '30 derniers jours',
        'reports.preset_90d': '90 derniers jours',
        'reports.from': 'Du',
        'reports.to': 'Au',
        'reports.generate_export': 'Générer l’export {type}',
        'reports.generating': 'Génération en cours...',

        // Settings & Appearance
        'settings.title': 'Paramètres',
        'settings.subtitle':
            'Gérez votre profil et les paramètres de votre compte',
        'settings.nav_profile': 'Profil',
        'settings.nav_security': 'Sécurité',
        'settings.nav_appearance': 'Apparence',
        'settings.nav_off': 'Open Food Facts',
        'settings.nav_ai': 'Assistant IA',
        'settings.appearance_title': 'Apparence',
        'settings.appearance_subtitle':
            'Personnalisez la disposition de l’interface, les palettes de couleurs et le mode de navigation.',
        'settings.theme': 'Mode de thème',
        'settings.theme_light': 'Clair',
        'settings.theme_dark': 'Sombre',
        'settings.theme_system': 'Système',
        'settings.layout_mode': 'Disposition de la navigation',
        'settings.layout_left_sidebar': 'Barre latérale gauche',
        'settings.layout_right_sidebar': 'Barre latérale droite',
        'settings.layout_top_nav': 'Barre de navigation supérieure',
        'settings.layout_bottom_dock': 'Dock flottant inférieur',
        'settings.palette': 'Palette de tokens de design',
        'settings.language': 'Langue de l’interface',
    },
};

/**
 * Resolve active locale following precedence:
 * Profile / prop -> localStorage -> navigator -> default 'en'
 */
export function getActiveLocale(overrideLocale?: string | null): Locale {
    if (overrideLocale === 'fr' || overrideLocale === 'en') {
        return overrideLocale;
    }

    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kcal_locale');
        if (stored === 'fr' || stored === 'en') {
            return stored;
        }

        const navLang = navigator.language?.toLowerCase() || '';
        if (navLang.startsWith('fr')) {
            return 'fr';
        }
    }

    return 'en';
}

/**
 * Set the global locale, persisting to localStorage and notifying active components.
 */
export function setGlobalLocale(locale: Locale): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('kcal_locale', locale);
        document.documentElement.lang = locale;
        window.dispatchEvent(
            new CustomEvent('locale-change', { detail: locale }),
        );
    }
}

/**
 * Format a number using native Intl.NumberFormat according to the active locale.
 */
export function formatNumber(
    value: number,
    locale: Locale = 'en',
    options?: Intl.NumberFormatOptions,
): string {
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(intlLocale, {
        maximumFractionDigits: 2,
        ...options,
    }).format(value);
}

/**
 * Format a date string or Date object using native Intl.DateTimeFormat according to active locale.
 */
export function formatLocaleDate(
    dateInput: string | Date | null | undefined,
    locale: Locale = 'en',
    options?: Intl.DateTimeFormatOptions,
): string {
    if (!dateInput) return '';

    let date: Date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        const cleanStr = dateInput.includes('T')
            ? dateInput
            : `${dateInput.replace(' ', 'T')}Z`;
        date = new Date(cleanStr.endsWith('Z') ? cleanStr : `${cleanStr}Z`);
    }

    if (isNaN(date.getTime())) return String(dateInput);

    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(intlLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
        ...options,
    }).format(date);
}

/**
 * Translate a key into the active locale with parameter interpolation.
 */
export function t(
    key: string,
    locale: Locale = 'en',
    params?: Record<string, string | number>,
): string {
    const dict = translations[locale] || translations.en;
    let translation = dict[key] || translations.en[key] || key;

    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            translation = translation.replace(
                new RegExp(`{${paramKey}}`, 'g'),
                String(paramValue),
            );
        });
    }

    return translation;
}

/**
 * React hook to access translation and locale formatting functions.
 */
export function useTranslation() {
    let propLocale: string | null = null;
    try {
        const page = usePage();
        propLocale = (page?.props as any)?.locale ?? null;
    } catch {
        // Fallback outside Inertia context
    }

    const [currentLocale, setCurrentLocale] = useState<Locale>(() =>
        getActiveLocale(propLocale),
    );

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const detail = (event as CustomEvent<Locale>).detail;
            if (detail === 'en' || detail === 'fr') {
                setCurrentLocale(detail);
            } else {
                setCurrentLocale(getActiveLocale());
            }
        };

        window.addEventListener('locale-change', handleLocaleChange);
        return () => {
            window.removeEventListener('locale-change', handleLocaleChange);
        };
    }, []);

    return {
        locale: currentLocale,
        setLocale: setGlobalLocale,
        t: (key: string, params?: Record<string, string | number>) =>
            t(key, currentLocale, params),
        formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
            formatNumber(value, currentLocale, options),
        formatDate: (
            date: string | Date | null | undefined,
            options?: Intl.DateTimeFormatOptions,
        ) => formatLocaleDate(date, currentLocale, options),
    };
}
