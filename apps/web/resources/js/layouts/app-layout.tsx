import type { ReactNode } from 'react';
import { useNavigationLayout } from '@/hooks/use-navigation-layout';
import AppBottomNavLayout from '@/layouts/app/app-bottom-nav-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}) {
    const { layout } = useNavigationLayout();

    if (layout === 'top-nav') {
        return (
            <AppHeaderLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppHeaderLayout>
        );
    }

    if (layout === 'bottom-nav') {
        return (
            <AppBottomNavLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppBottomNavLayout>
        );
    }

    if (layout === 'sidebar-right') {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs} side="right">
                {children}
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs} side="left">
            {children}
        </AppSidebarLayout>
    );
}
