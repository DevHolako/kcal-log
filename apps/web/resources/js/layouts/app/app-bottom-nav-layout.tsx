import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ChefHat,
    FileText,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { AppShell } from '@/components/app-shell';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PaletteSelector } from '@/components/palette-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { AppLayoutProps, NavItem, User } from '@/types';

export default function AppBottomNavLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { t } = useTranslation();
    const page = usePage();
    const auth = (page.props as { auth?: { user?: User | null } })?.auth;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();

    const bottomNavItems: (NavItem & { shortTitle: string })[] = [
        {
            title: t('nav.diary'),
            shortTitle: t('nav.diary'),
            href: '/diary',
            icon: CalendarDays,
        },
        {
            title: t('nav.strategy'),
            shortTitle: t('nav.strategy'),
            href: '/strategy',
            icon: TrendingUp,
        },
        {
            title: t('nav.foods'),
            shortTitle: t('nav.foods'),
            href: '/foods',
            icon: UtensilsCrossed,
        },
        {
            title: t('nav.recipes'),
            shortTitle: t('nav.recipes'),
            href: '/recipes',
            icon: ChefHat,
        },
        {
            title: t('nav.reports'),
            shortTitle: t('nav.reports'),
            href: '/reports',
            icon: FileText,
        },
    ];

    return (
        <AppShell variant="bottom">
            {/* Top Slim Header for Logo, Breadcrumbs, Theme Controls, and User Profile */}
            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-14 items-center justify-between px-4 md:max-w-7xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-2"
                        >
                            <AppLogo />
                        </Link>
                        {breadcrumbs.length > 0 && (
                            <div className="hidden items-center border-l border-border/60 pl-3 md:flex">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <PaletteSelector />
                        <ThemeToggle />
                        <LanguageSwitcher />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-9 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full ring-1 ring-border">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(
                                                auth?.user?.name ?? '',
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth?.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Breadcrumb Row if present */}
            {breadcrumbs.length > 0 && (
                <div className="border-b border-border/60 bg-muted/30 px-4 py-1.5 md:hidden">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            {/* Main Page Content - Padded at the bottom so the dock never hides page elements */}
            <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col pb-28 md:pb-28">
                {children}
            </main>

            {/* Floating Glassmorphic Bottom Navigation Dock */}
            <nav
                aria-label="Bottom Navigation"
                className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:px-6"
            >
                <div className="pointer-events-auto flex w-full max-w-lg items-center justify-around gap-1 rounded-2xl border border-border/80 bg-card/90 p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl sm:max-w-xl dark:border-border/60 dark:bg-card/85 dark:shadow-black/40">
                    {bottomNavItems.map((item) => {
                        const active = isCurrentUrl(item.href);
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition-all sm:py-2.5',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                )}
                            >
                                {item.icon && (
                                    <item.icon
                                        className={cn(
                                            'h-5 w-5 shrink-0 transition-transform',
                                            active && 'scale-110',
                                        )}
                                    />
                                )}
                                <span className="line-clamp-1 text-[11px] leading-none font-medium tracking-tight">
                                    <span className="sm:hidden">
                                        {item.shortTitle}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {item.title}
                                    </span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </AppShell>
    );
}
