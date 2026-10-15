import { useEffect, useState } from 'react';

export interface ThemePalette {
    id: string;
    name: string;
    description: string;
    primary: string; // hex
    primaryForeground: string; // hex
    macroCalories: string;
    macroProtein: string;
    macroCarbs: string;
    macroFat: string;
    macroWater: string;
    cardBgTint?: string;
}

export const PALETTE_PRESETS: ThemePalette[] = [
    {
        id: 'indigo',
        name: 'Electric Indigo',
        description: 'Modern high-tech fitness like Linear & Cronometer',
        primary: '#6366f1',
        primaryForeground: '#ffffff',
        macroCalories: '#f97316', // Coral
        macroProtein: '#0ea5e9', // Sky Blue
        macroCarbs: '#f59e0b', // Amber
        macroFat: '#8b5cf6', // Violet
        macroWater: '#06b6d4',
    },
    {
        id: 'coral',
        name: 'Sunset Coral',
        description: 'Warm metabolic energy inspired by Strava & Nike',
        primary: '#f43f5e',
        primaryForeground: '#ffffff',
        macroCalories: '#ea580c',
        macroProtein: '#3b82f6',
        macroCarbs: '#eab308',
        macroFat: '#ec4899',
        macroWater: '#06b6d4',
    },
    {
        id: 'cobalt',
        name: 'Royal Cobalt',
        description:
            'Athletic precision and clinical clarity like Garmin & Whoop',
        primary: '#2563eb',
        primaryForeground: '#ffffff',
        macroCalories: '#f59e0b',
        macroProtein: '#0284c7',
        macroCarbs: '#10b981',
        macroFat: '#f43f5e',
        macroWater: '#06b6d4',
    },
    {
        id: 'amber',
        name: 'Titanium Amber',
        description: 'Minimalist luxury and calm elegance like Oura Ring',
        primary: '#d97706',
        primaryForeground: '#ffffff',
        macroCalories: '#f59e0b',
        macroProtein: '#3b82f6',
        macroCarbs: '#d97706',
        macroFat: '#e11d48',
        macroWater: '#0ea5e9',
    },
    {
        id: 'orchid',
        name: 'Cyber Orchid',
        description: 'Futuristic neon synthwave with high-contrast pop',
        primary: '#a855f7',
        primaryForeground: '#ffffff',
        macroCalories: '#f43f5e',
        macroProtein: '#06b6d4',
        macroCarbs: '#f59e0b',
        macroFat: '#d946ef',
        macroWater: '#38bdf8',
    },
    {
        id: 'arctic',
        name: 'Arctic Frost',
        description: 'Cool Scandinavian minimalism with crisp glacier tones',
        primary: '#0284c7',
        primaryForeground: '#ffffff',
        macroCalories: '#f97316',
        macroProtein: '#0ea5e9',
        macroCarbs: '#14b8a6',
        macroFat: '#6366f1',
        macroWater: '#38bdf8',
    },
    {
        id: 'crimson',
        name: 'Crimson Flame',
        description:
            'High-intensity passion and bold drive for aggressive training',
        primary: '#e11d48',
        primaryForeground: '#ffffff',
        macroCalories: '#ea580c',
        macroProtein: '#2563eb',
        macroCarbs: '#f59e0b',
        macroFat: '#be123c',
        macroWater: '#06b6d4',
    },
    {
        id: 'espresso',
        name: 'Warm Espresso',
        description: 'Artisanal coffee and warm earthy organic tones',
        primary: '#78350f',
        primaryForeground: '#ffffff',
        macroCalories: '#ea580c',
        macroProtein: '#0284c7',
        macroCarbs: '#d97706',
        macroFat: '#be185d',
        macroWater: '#06b6d4',
    },
];

const STORAGE_KEY = 'kcal_palette_choice';
const CUSTOM_STORAGE_KEY = 'kcal_palette_custom';
const DEFAULT_PALETTE_ID = 'indigo';

export function getStoredPalette(): ThemePalette {
    if (typeof window === 'undefined') {
        return PALETTE_PRESETS[0];
    }

    const storedId = localStorage.getItem(STORAGE_KEY) || DEFAULT_PALETTE_ID;

    if (storedId === 'custom') {
        try {
            const rawCustom = localStorage.getItem(CUSTOM_STORAGE_KEY);
            if (rawCustom) {
                const parsed = JSON.parse(rawCustom) as ThemePalette;
                if (parsed && parsed.primary) {
                    return parsed;
                }
            }
        } catch {
            // fallback
        }
    }

    const found = PALETTE_PRESETS.find((p) => p.id === storedId);
    return found || PALETTE_PRESETS[0];
}

export function applyPaletteToDOM(palette: ThemePalette): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-foreground', palette.primaryForeground);
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty(
        '--color-primary-foreground',
        palette.primaryForeground,
    );
    root.style.setProperty('--ring', palette.primary);
    root.style.setProperty('--sidebar-primary', palette.primary);
    root.style.setProperty(
        '--sidebar-primary-foreground',
        palette.primaryForeground,
    );

    root.style.setProperty('--macro-calories', palette.macroCalories);
    root.style.setProperty('--color-macro-calories', palette.macroCalories);
    root.style.setProperty('--macro-protein', palette.macroProtein);
    root.style.setProperty('--color-macro-protein', palette.macroProtein);
    root.style.setProperty('--macro-carbs', palette.macroCarbs);
    root.style.setProperty('--color-macro-carbs', palette.macroCarbs);
    root.style.setProperty('--macro-fat', palette.macroFat);
    root.style.setProperty('--color-macro-fat', palette.macroFat);
    root.style.setProperty('--macro-water', palette.macroWater);
    root.style.setProperty('--color-macro-water', palette.macroWater);

    root.style.setProperty('--chart-1', palette.primary);
    root.style.setProperty('--chart-2', palette.macroProtein);
    root.style.setProperty('--chart-3', palette.macroCarbs);
    root.style.setProperty('--chart-4', palette.macroFat);
    root.style.setProperty('--chart-5', palette.macroCalories);
    root.style.setProperty('--color-chart-1', palette.primary);
    root.style.setProperty('--color-chart-2', palette.macroProtein);
    root.style.setProperty('--color-chart-3', palette.macroCarbs);
    root.style.setProperty('--color-chart-4', palette.macroFat);
    root.style.setProperty('--color-chart-5', palette.macroCalories);
    root.style.setProperty('--chart-weight-trend', palette.primary);
    root.style.setProperty('--color-chart-weight-trend', palette.primary);
}

export function setPalette(
    paletteId: string,
    customPalette?: ThemePalette,
): void {
    if (typeof window === 'undefined') return;

    if (paletteId === 'custom' && customPalette) {
        localStorage.setItem(STORAGE_KEY, 'custom');
        localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customPalette));
        applyPaletteToDOM(customPalette);
        window.dispatchEvent(
            new CustomEvent('palette-change', { detail: customPalette }),
        );
        return;
    }

    const found = PALETTE_PRESETS.find((p) => p.id === paletteId);
    if (found) {
        localStorage.setItem(STORAGE_KEY, found.id);
        applyPaletteToDOM(found);
        window.dispatchEvent(
            new CustomEvent('palette-change', { detail: found }),
        );
    }
}

export function initializePalette(): void {
    if (typeof window === 'undefined') return;
    const active = getStoredPalette();
    applyPaletteToDOM(active);
}

export function usePalette() {
    const [palette, setCurrentPalette] = useState<ThemePalette>(() =>
        getStoredPalette(),
    );

    useEffect(() => {
        const handlePaletteChange = (e: Event) => {
            const detail = (e as CustomEvent<ThemePalette>).detail;
            if (detail) {
                setCurrentPalette(detail);
            } else {
                setCurrentPalette(getStoredPalette());
            }
        };

        window.addEventListener('palette-change', handlePaletteChange);
        return () => {
            window.removeEventListener('palette-change', handlePaletteChange);
        };
    }, []);

    return {
        palette,
        presets: PALETTE_PRESETS,
        setPalette: (id: string, custom?: ThemePalette) =>
            setPalette(id, custom),
    };
}
