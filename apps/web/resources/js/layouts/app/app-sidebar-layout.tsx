import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    side = 'left',
}: AppLayoutProps) {
    return (
        <AppShell
            variant="sidebar"
            className={side === 'right' ? 'flex-row-reverse' : undefined}
        >
            <AppSidebar side={side} />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} side={side} />
                {children}
            </AppContent>
        </AppShell>
    );
}
