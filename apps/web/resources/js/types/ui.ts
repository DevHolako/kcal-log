import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type NavigationLayoutMode =
    | 'sidebar-left'
    | 'sidebar-right'
    | 'top-nav'
    | 'bottom-nav';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    side?: 'left' | 'right';
};

export type AppVariant = 'header' | 'sidebar' | 'bottom';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
