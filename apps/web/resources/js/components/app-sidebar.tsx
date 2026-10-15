import { Link } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    ChefHat,
    FileText,
    FolderGit2,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar({ side = 'left' }: { side?: 'left' | 'right' }) {
    const { t } = useTranslation();

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

    const footerNavItems: NavItem[] = [
        {
            title: t('nav.repository'),
            href: 'https://github.com/DevHolako/kcal-log',
            icon: FolderGit2,
        },
        {
            title: t('nav.documentation'),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];
    return (
        <Sidebar collapsible="icon" variant="sidebar" side={side}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
