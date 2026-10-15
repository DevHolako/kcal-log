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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Daily Diary',
        href: '/diary',
        icon: CalendarDays,
    },
    {
        title: 'Adaptive Strategy',
        href: '/strategy',
        icon: TrendingUp,
    },
    {
        title: 'Foods & Search',
        href: '/foods',
        icon: UtensilsCrossed,
    },
    {
        title: 'Recipes & Meals',
        href: '/recipes',
        icon: ChefHat,
    },
    {
        title: 'Reports & Exports',
        href: '/reports',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/DevHolako/kcal-log',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar({ side = 'left' }: { side?: 'left' | 'right' }) {
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
