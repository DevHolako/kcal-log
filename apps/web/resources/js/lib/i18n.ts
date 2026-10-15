import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export type Locale = 'en' | 'fr';

export const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Navigation
        'nav.diary': 'Daily Diary',
        'nav.strategy': 'Adaptive Strategy',
        'nav.foods': 'Foods & Search',
        'nav.recipes': 'Recipes & Meals',
        'nav.reports': 'Reports & Exports',
        'nav.settings': 'Settings',

        // Nutrients
        'nutrition.calories': 'Calories',
        'nutrition.protein': 'Protein',
        'nutrition.carbs': 'Carbohydrates',
        'nutrition.fat': 'Fat',
        'nutrition.water': 'Water',
        'nutrition.fiber': 'Fiber',
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
        'status.logged_weight': 'Logged Weight',
        'status.no_target': 'Not configured',

        // Common Actions
        'action.add_food': 'Add Food',
        'action.quick_add': 'Quick Add',
        'action.scan_barcode': 'Scan Barcode',
        'action.log_water': 'Log Water',
        'action.save': 'Save',
        'action.cancel': 'Cancel',
        'action.delete': 'Delete',
        'action.edit': 'Edit',
        'action.close': 'Close',
        'action.lookup': 'Lookup',

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
    },
    fr: {
        // Navigation
        'nav.diary': 'Journal quotidien',
        'nav.strategy': 'Stratégie adaptative',
        'nav.foods': 'Aliments et recherche',
        'nav.recipes': 'Recettes et repas',
        'nav.reports': 'Rapports et exports',
        'nav.settings': 'Paramètres',

        // Nutrients
        'nutrition.calories': 'Calories',
        'nutrition.protein': 'Protéines',
        'nutrition.carbs': 'Glucides',
        'nutrition.fat': 'Lipides',
        'nutrition.water': 'Eau',
        'nutrition.fiber': 'Fibres',
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
        'status.logged_weight': 'Poids enregistré',
        'status.no_target': 'Non configuré',

        // Common Actions
        'action.add_food': 'Ajouter un aliment',
        'action.quick_add': 'Ajout rapide',
        'action.scan_barcode': 'Scanner le code-barres',
        'action.log_water': 'Ajouter de l’eau',
        'action.save': 'Enregistrer',
        'action.cancel': 'Annuler',
        'action.delete': 'Supprimer',
        'action.edit': 'Modifier',
        'action.close': 'Fermer',
        'action.lookup': 'Rechercher',

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
