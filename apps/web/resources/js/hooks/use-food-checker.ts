import { useCallback, useEffect, useState } from 'react';
import type { FoodItem } from '@/pages/foods';

export function openFoodChecker(food?: FoodItem | null) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('open-food-checker', {
                detail: { food: food ?? null },
            }),
        );
    }
}

export function useFoodChecker() {
    const [isOpen, setIsOpen] = useState(false);
    const [initialFood, setInitialFood] = useState<FoodItem | null>(null);

    const open = useCallback((food?: FoodItem | null) => {
        setInitialFood(food ?? null);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setInitialFood(null);
    }, []);

    useEffect(() => {
        const handleOpenEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ food?: FoodItem | null }>;
            setInitialFood(customEvent.detail?.food ?? null);
            setIsOpen(true);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K opens food checker from anywhere
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                // If user is inside an input or textarea that is not part of search, still allow Cmd+K
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener('open-food-checker', handleOpenEvent);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('open-food-checker', handleOpenEvent);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return {
        isOpen,
        setIsOpen,
        initialFood,
        open,
        close,
    };
}
