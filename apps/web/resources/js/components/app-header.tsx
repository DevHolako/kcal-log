import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    ChefHat,
    FileText,
    FolderGit2,
    Menu,
    Search,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PaletteSelector } from '@/components/palette-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { openFoodChecker } from '@/hooks/use-food-checker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem, User } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const activeItemStyles =
    'text-primary font-semibold bg-primary/10 dark:bg-primary/20 dark:text-primary';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { t } = useTranslation();
    const page = usePage();
    const auth = (page.props as { auth?: { user?: User | null } })?.auth;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    const mainNavItems: NavItem[] = [
        {
            title: t('nav.diary'),
            href: '/diary',
            icon: CalendarDays,
        },
        {
            title: t('nav.strategy'),
            href: '/strategy',
            icon: TrendingUp,
        },
        {
            title: t('nav.foods'),
            href: '/foods',
            icon: UtensilsCrossed,
        },
        {
            title: t('nav.recipes'),
            href: '/recipes',
            icon: ChefHat,
        },
        {
            title: t('nav.reports'),
            href: '/reports',
            icon: FileText,
        },
    ];

    const rightNavItems: NavItem[] = [
        {
            title: t('nav.repository'),
            href: 'https://github.com/DevHolako/kcal-log',
            icon: FolderGit2,
        },
        {
            title: t('nav.documentation'),
            href: '/docs/api',
            icon: BookOpen,
        },
    ];

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-sidebar-border/80 bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col items-stretch justify-between bg-sidebar p-6"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-7 w-7 fill-current text-primary" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col justify-between py-6">
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => openFoodChecker()}
                                            className="flex items-center space-x-3 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                                        >
                                            <Search className="h-5 w-5 shrink-0" />
                                            <span>
                                                {t(
                                                    'food_checker.trigger_button',
                                                )}
                                            </span>
                                            <kbd className="ml-auto rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                                ⌘K
                                            </kbd>
                                        </button>

                                        {mainNavItems.map((item) => {
                                            const active = isCurrentUrl(
                                                item.href,
                                            );
                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                                        active
                                                            ? 'bg-primary/15 font-semibold text-primary'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5 shrink-0" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col space-y-4 border-t border-border/60 pt-4">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-xs text-muted-foreground">
                                                Theme & Palette
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <PaletteSelector />
                                                <ThemeToggle />
                                                <LanguageSwitcher />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-4 w-4" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-2 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3 text-sm transition-colors hover:text-primary',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-primary shadow-xs"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
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

                        <div className="hidden items-center gap-1.5 md:flex">
                            <PaletteSelector />
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>

                        <div className="ml-1 hidden gap-1 lg:flex">
                            {rightNavItems.map((item) => (
                                <Tooltip key={item.title}>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={toUrl(item.href)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <span className="sr-only">
                                                {item.title}
                                            </span>
                                            {item.icon && (
                                                <item.icon className="size-4.5 opacity-80 group-hover:opacity-100" />
                                            )}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{item.title}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
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
            {breadcrumbs.length > 0 && (
                <div className="flex w-full border-b border-sidebar-border/70 bg-card/40">
                    <div className="mx-auto flex h-10 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
