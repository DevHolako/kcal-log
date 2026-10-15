import { useEffect, useState } from 'react';

export interface ThemePalette {
    id: string;
    name: string;
    description: string;
    primary: string; // hex
    primaryForeground: string; // hex
    backgroundLight: string; // light theme background
    backgroundDark: string; // dark theme background
    cardLight: string; // light theme card surface
    cardDark: string; // dark theme card surface
    macroCalories: string;
    macroProtein: string;
    macroCarbs: string;
    macroFat: string;
    macroWater: string;
    plateBgTint?: string;
}

export const PALETTE_PRESETS: ThemePalette[] = [
    {
        id: 'macrofactor',
        name: 'MacroFactor Elite',
        description:
            'Evidence-based nutrition aesthetic with precision Malin blue',
        primary: '#679ffa',
        primaryForeground: '#ffffff',
        backgroundLight: '#fbfbfd',
        backgroundDark: '#181b20',
        cardLight: '#ffffff',
        cardDark: '#22262e',
        plateBgTint: 'rgba(103, 159, 250, 0.06)',
        macroCalories: '#f97316', // Coral
        macroProtein: '#38bdf8', // Cyan
        macroCarbs: '#fbbf24', // Amber
        macroFat: '#fb7185', // Rose
        macroWater: '#06b6d4',
    },
    {
        id: 'coral',
        name: 'Sunset Coral (Oura)',
        description:
            'Circadian warmth & metabolic flow inspired by Oura Ring & Strava',
        primary: '#fc6558',
        primaryForeground: '#ffffff',
        backgroundLight: '#f7f5f0',
        backgroundDark: '#151619',
        cardLight: '#ffffff',
        cardDark: '#1f2126',
        plateBgTint: 'rgba(252, 101, 88, 0.06)',
        macroCalories: '#fc6558',
        macroProtein: '#5ea7db', // Ensō Blue
        macroCarbs: '#d99b43', // Sand Gold
        macroFat: '#be4a6e', // Nordic Plum
        macroWater: '#06b6d4',
    },
    {
        id: 'whoop',
        name: 'WHOOP Cyber-Pulse',
        description:
            'High-strain athletic telemetry with neon Action Teal & dark carbon',
        primary: '#00f19f',
        primaryForeground: '#0b0d10',
        backgroundLight: '#f4f6f8',
        backgroundDark: '#0b0d10',
        cardLight: '#ffffff',
        cardDark: '#15181e',
        plateBgTint: 'rgba(0, 241, 159, 0.08)',
        macroCalories: '#ff5e00', // Peak Orange
        macroProtein: '#2563eb', // Royal Blue
        macroCarbs: '#f59e0b', // Power Gold
        macroFat: '#c91235', // Strain Red
        macroWater: '#06b6d4',
    },
    {
        id: 'apple-fitness',
        name: 'Apple Fitness Rings',
        description:
            'Iconic activity rings with vibrant Move, Stand & Exercise neon',
        primary: '#ff2d55',
        primaryForeground: '#ffffff',
        backgroundLight: '#f6f7fb',
        backgroundDark: '#0c0d10',
        cardLight: '#ffffff',
        cardDark: '#17181f',
        plateBgTint: 'rgba(255, 45, 85, 0.06)',
        macroCalories: '#ff2d55', // Move Red
        macroProtein: '#0a84ff', // Stand Cyan
        macroCarbs: '#32d74b', // Exercise Green
        macroFat: '#bf5af2', // Mindfulness Purple
        macroWater: '#06b6d4',
    },
    {
        id: 'eco-wellness',
        name: 'Biophilic Eco-Wellness',
        description:
            'Calming botanical earth tones inspired by clean organic longevity',
        primary: '#5b9a77',
        primaryForeground: '#ffffff',
        backgroundLight: '#f3f6f3',
        backgroundDark: '#0e1712',
        cardLight: '#ffffff',
        cardDark: '#16231b',
        plateBgTint: 'rgba(91, 154, 119, 0.08)',
        macroCalories: '#d97757', // Terracotta
        macroProtein: '#3b82a6', // River Slate
        macroCarbs: '#d4a359', // Golden Wheat
        macroFat: '#8b5e3c', // Nutmeg Bark
        macroWater: '#06b6d4',
    },
    {
        id: 'synthwave',
        name: 'Bento Synthwave',
        description:
            'Electric neon violet cyberpunk glow with high-contrast vibrancy',
        primary: '#8b5cf6',
        primaryForeground: '#ffffff',
        backgroundLight: '#f7f6fc',
        backgroundDark: '#0e0c15',
        cardLight: '#ffffff',
        cardDark: '#181524',
        plateBgTint: 'rgba(139, 92, 246, 0.07)',
        macroCalories: '#ff6b4a', // Solar Neon
        macroProtein: '#00f0ff', // Cyan Glow
        macroCarbs: '#ffc83b', // Amber Spark
        macroFat: '#e024c3', // Cyber Magenta
        macroWater: '#38bdf8',
    },
    {
        id: 'clinical',
        name: 'Clinical HealthTech',
        description:
            'Crisp medical precision inspired by continuous metabolic tracking',
        primary: '#0284c7',
        primaryForeground: '#ffffff',
        backgroundLight: '#f8fafc',
        backgroundDark: '#0a111e',
        cardLight: '#ffffff',
        cardDark: '#121e33',
        plateBgTint: 'rgba(2, 132, 199, 0.06)',
        macroCalories: '#ea580c',
        macroProtein: '#0284c7',
        macroCarbs: '#10b981',
        macroFat: '#9333ea',
        macroWater: '#06b6d4',
    },
    {
        id: 'cortado',
        name: 'Warm Cortado Espresso',
        description:
            'Rich roasted espresso & warm golden oat parchment comfort',
        primary: '#b45309',
        primaryForeground: '#ffffff',
        backgroundLight: '#faf6f0',
        backgroundDark: '#17100b',
        cardLight: '#ffffff',
        cardDark: '#241b14',
        plateBgTint: 'rgba(180, 83, 9, 0.06)',
        macroCalories: '#d97706',
        macroProtein: '#3b82f6',
        macroCarbs: '#eab308',
        macroFat: '#9f1239',
        macroWater: '#06b6d4',
    },
];

const STORAGE_KEY = 'kcal_palette_choice';
const CUSTOM_STORAGE_KEY = 'kcal_palette_custom';
const DEFAULT_PALETTE_ID = 'macrofactor';

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

    // Migrate old 'indigo' default to 'macrofactor'
    if (storedId === 'indigo') {
        return PALETTE_PRESETS[0];
    }

    const found = PALETTE_PRESETS.find((p) => p.id === storedId);
    return found || PALETTE_PRESETS[0];
}

export function applyPaletteToDOM(palette: ThemePalette): void {
    if (typeof document === 'undefined') return;

    const bgLight = palette.backgroundLight || '#f5f7ff';
    const bgDark = palette.backgroundDark || '#0c0f1d';
    const cardLight = palette.cardLight || '#ffffff';
    const cardDark = palette.cardDark || '#13182c';

    let styleTag = document.getElementById(
        'theme-palette-dynamic-vars',
    ) as HTMLStyleElement | null;
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'theme-palette-dynamic-vars';
        document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
:root {
    --primary: ${palette.primary};
    --primary-foreground: ${palette.primaryForeground};
    --color-primary: ${palette.primary};
    --color-primary-foreground: ${palette.primaryForeground};
    --ring: ${palette.primary};
    --sidebar: ${bgLight};
    --color-sidebar: ${bgLight};
    --sidebar-foreground: #0f172a;
    --color-sidebar-foreground: #0f172a;
    --sidebar-primary: ${palette.primary};
    --sidebar-primary-foreground: ${palette.primaryForeground};
    --sidebar-accent: ${palette.primary}14;
    --color-sidebar-accent: ${palette.primary}14;
    --sidebar-accent-foreground: ${palette.primary};
    --color-sidebar-accent-foreground: ${palette.primary};
    --sidebar-border: rgba(0, 0, 0, 0.08);
    --color-sidebar-border: rgba(0, 0, 0, 0.08);
    --sidebar-ring: ${palette.primary};
    --color-sidebar-ring: ${palette.primary};

    --background: ${bgLight};
    --color-background: ${bgLight};
    --card: ${cardLight};
    --color-card: ${cardLight};

    --macro-calories: ${palette.macroCalories};
    --color-macro-calories: ${palette.macroCalories};
    --macro-protein: ${palette.macroProtein};
    --color-macro-protein: ${palette.macroProtein};
    --macro-carbs: ${palette.macroCarbs};
    --color-macro-carbs: ${palette.macroCarbs};
    --macro-fat: ${palette.macroFat};
    --color-macro-fat: ${palette.macroFat};
    --macro-water: ${palette.macroWater};
    --color-macro-water: ${palette.macroWater};

    --chart-1: ${palette.primary};
    --chart-2: ${palette.macroProtein};
    --chart-3: ${palette.macroCarbs};
    --chart-4: ${palette.macroFat};
    --chart-5: ${palette.macroCalories};
    --color-chart-1: ${palette.primary};
    --color-chart-2: ${palette.macroProtein};
    --color-chart-3: ${palette.macroCarbs};
    --color-chart-4: ${palette.macroFat};
    --color-chart-5: ${palette.macroCalories};
    --chart-weight-trend: ${palette.primary};
    --color-chart-weight-trend: ${palette.primary};
}

.dark {
    --primary: ${palette.primary};
    --primary-foreground: ${palette.primaryForeground};
    --color-primary: ${palette.primary};
    --color-primary-foreground: ${palette.primaryForeground};
    --ring: ${palette.primary};
    --sidebar: ${bgDark};
    --color-sidebar: ${bgDark};
    --sidebar-foreground: #f8fafc;
    --color-sidebar-foreground: #f8fafc;
    --sidebar-primary: ${palette.primary};
    --sidebar-primary-foreground: ${palette.primaryForeground};
    --sidebar-accent: ${palette.primary}20;
    --color-sidebar-accent: ${palette.primary}20;
    --sidebar-accent-foreground: ${palette.primary};
    --color-sidebar-accent-foreground: ${palette.primary};
    --sidebar-border: rgba(255, 255, 255, 0.08);
    --color-sidebar-border: rgba(255, 255, 255, 0.08);
    --sidebar-ring: ${palette.primary};
    --color-sidebar-ring: ${palette.primary};

    --background: ${bgDark};
    --color-background: ${bgDark};
    --card: ${cardDark};
    --color-card: ${cardDark};

    --macro-calories: ${palette.macroCalories};
    --color-macro-calories: ${palette.macroCalories};
    --macro-protein: ${palette.macroProtein};
    --color-macro-protein: ${palette.macroProtein};
    --macro-carbs: ${palette.macroCarbs};
    --color-macro-carbs: ${palette.macroCarbs};
    --macro-fat: ${palette.macroFat};
    --color-macro-fat: ${palette.macroFat};
    --macro-water: ${palette.macroWater};
    --color-macro-water: ${palette.macroWater};

    --chart-1: ${palette.primary};
    --chart-2: ${palette.macroProtein};
    --chart-3: ${palette.macroCarbs};
    --chart-4: ${palette.macroFat};
    --chart-5: ${palette.macroCalories};
    --color-chart-1: ${palette.primary};
    --color-chart-2: ${palette.macroProtein};
    --color-chart-3: ${palette.macroCarbs};
    --color-chart-4: ${palette.macroFat};
    --color-chart-5: ${palette.macroCalories};
    --chart-weight-trend: ${palette.primary};
    --color-chart-weight-trend: ${palette.primary};
}
`;

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

    root.style.removeProperty('--background');
    root.style.removeProperty('--color-background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--color-card');
    root.style.removeProperty('--sidebar');
    root.style.removeProperty('--color-sidebar');
    root.style.removeProperty('--sidebar-border');
    root.style.removeProperty('--color-sidebar-border');

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
