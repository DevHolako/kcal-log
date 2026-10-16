import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props as { name?: string };

    return (
        <div className="flex shrink-0 items-center gap-2">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="shrink-0 text-left text-sm">
                <span className="mb-0.5 leading-tight font-semibold whitespace-nowrap text-foreground">
                    {name || 'kcal-log'}
                </span>
            </div>
        </div>
    );
}
