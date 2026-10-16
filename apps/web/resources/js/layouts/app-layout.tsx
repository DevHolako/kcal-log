import type { ReactNode } from 'react';
import FoodCheckerModal from '@/components/food-checker-modal';
import { useFoodChecker } from '@/hooks/use-food-checker';
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
    const { isOpen, setIsOpen, initialFood } = useFoodChecker();

    let content = (
        <AppSidebarLayout breadcrumbs={breadcrumbs} side="left">
            {children}
        </AppSidebarLayout>
    );

    if (layout === 'top-nav') {
        content = (
            <AppHeaderLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppHeaderLayout>
        );
    } else if (layout === 'bottom-nav') {
        content = (
            <AppBottomNavLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppBottomNavLayout>
        );
    } else if (layout === 'sidebar-right') {
        content = (
            <AppSidebarLayout breadcrumbs={breadcrumbs} side="right">
                {children}
            </AppSidebarLayout>
        );
    }

    return (
        <>
            {content}
            <FoodCheckerModal
                open={isOpen}
                onOpenChange={setIsOpen}
                initialFood={initialFood}
            />
        </>
    );
}
