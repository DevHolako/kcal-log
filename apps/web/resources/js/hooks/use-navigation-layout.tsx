import { useSyncExternalStore } from 'react';
import type { NavigationLayoutMode } from '@/types';

export const NAVIGATION_LAYOUT_STORAGE_KEY = 'kcal_navigation_layout';
export const DEFAULT_NAVIGATION_LAYOUT: NavigationLayoutMode = 'sidebar-left';

export interface NavigationLayoutOption {
    id: NavigationLayoutMode;
    title: string;
    description: string;
}

export const NAVIGATION_LAYOUT_OPTIONS: NavigationLayoutOption[] = [
    {
        id: 'sidebar-left',
        title: 'Left Sidebar',
        description:
            'Classic docked collapsible sidebar on the left side of the workspace',
    },
    {
        id: 'sidebar-right',
        title: 'Right Sidebar',
        description:
            'Docked collapsible sidebar shifted to the right for focused reading flow',
    },
    {
        id: 'top-nav',
        title: 'Top Navigation',
        description:
            'Clean horizontal header bar spanning the full width of the screen',
    },
    {
        id: 'bottom-nav',
        title: 'Bottom Dock',
        description:
            'Modern floating bottom bar with quick touch-friendly navigation tabs',
    },
];

export function getStoredNavigationLayout(): NavigationLayoutMode {
    if (typeof window === 'undefined') {
        return DEFAULT_NAVIGATION_LAYOUT;
    }

    const stored = localStorage.getItem(
        NAVIGATION_LAYOUT_STORAGE_KEY,
    ) as NavigationLayoutMode | null;

    if (
        stored === 'sidebar-left' ||
        stored === 'sidebar-right' ||
        stored === 'top-nav' ||
        stored === 'bottom-nav'
    ) {
        return stored;
    }

    return DEFAULT_NAVIGATION_LAYOUT;
}

const listeners = new Set<() => void>();
let currentLayout: NavigationLayoutMode =
    typeof window !== 'undefined'
        ? getStoredNavigationLayout()
        : DEFAULT_NAVIGATION_LAYOUT;

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === NAVIGATION_LAYOUT_STORAGE_KEY && event.newValue) {
            const next = event.newValue as NavigationLayoutMode;
            if (
                next === 'sidebar-left' ||
                next === 'sidebar-right' ||
                next === 'top-nav' ||
                next === 'bottom-nav'
            ) {
                currentLayout = next;
                listeners.forEach((listener) => listener());
            }
        }
    });
}

export function setStoredNavigationLayout(mode: NavigationLayoutMode): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentLayout = mode;
    localStorage.setItem(NAVIGATION_LAYOUT_STORAGE_KEY, mode);
    listeners.forEach((listener) => listener());
    window.dispatchEvent(
        new CustomEvent('navigation-layout-change', { detail: mode }),
    );
}

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export function initializeNavigationLayout(): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentLayout = getStoredNavigationLayout();
}

export function useNavigationLayout() {
    const layout = useSyncExternalStore(
        subscribe,
        () => currentLayout,
        () => DEFAULT_NAVIGATION_LAYOUT,
    );

    return {
        layout,
        setLayout: setStoredNavigationLayout,
        options: NAVIGATION_LAYOUT_OPTIONS,
    };
}
