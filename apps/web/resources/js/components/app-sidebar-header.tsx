import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PaletteSelector } from '@/components/palette-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { openFoodChecker } from '@/hooks/use-food-checker';
import { useTranslation } from '@/lib/i18n';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    side = 'left',
}: {
    breadcrumbs?: BreadcrumbItemType[];
    side?: 'left' | 'right';
}) {
    const { t } = useTranslation();

    const searchButton = (
        <button
            type="button"
            onClick={() => openFoodChecker()}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-muted hover:text-foreground"
            title={t('food_checker.trigger_button')}
        >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden md:inline">
                {t('food_checker.trigger_button')}
            </span>
            <kbd className="py-0.2 hidden rounded border border-border/80 bg-background px-1 text-[10px] font-semibold text-muted-foreground shadow-2xs sm:inline-block">
                ⌘K
            </kbd>
        </button>
    );

    if (side === 'right') {
        return (
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex items-center gap-2">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex items-center gap-1.5">
                    {searchButton}
                    <PaletteSelector />
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <SidebarTrigger className="-mr-1" />
                </div>
            </header>
        );
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-1.5">
                {searchButton}
                <PaletteSelector />
                <ThemeToggle />
                <LanguageSwitcher />
            </div>
        </header>
    );
}
