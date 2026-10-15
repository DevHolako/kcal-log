import { Head } from '@inertiajs/react';
import { Check, Globe } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { PaletteSelector } from '@/components/palette-selector';
import { useAppearance } from '@/hooks/use-appearance';
import {
    type NavigationLayoutMode,
    useNavigationLayout,
} from '@/hooks/use-navigation-layout';
import { useTranslation } from '@/lib/i18n';
import { usePalette } from '@/lib/theme-palettes';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';

function LayoutWireframe({
    mode,
    isActive,
}: {
    mode: NavigationLayoutMode;
    isActive: boolean;
}) {
    const activeColor = isActive ? 'bg-primary' : 'bg-muted-foreground/30';
    const mutedBar = 'bg-muted-foreground/20';
    const contentBlock = 'bg-muted-foreground/10';

    if (mode === 'sidebar-left') {
        return (
            <div className="flex h-16 w-full gap-1.5 rounded-lg border border-border/70 bg-background/60 p-1.5">
                <div
                    className={cn(
                        'w-1/4 rounded transition-colors',
                        activeColor,
                    )}
                />
                <div className="flex flex-1 flex-col gap-1.5">
                    <div className={cn('h-2 w-full rounded', mutedBar)} />
                    <div className="flex flex-1 gap-1.5">
                        <div className={cn('flex-1 rounded', contentBlock)} />
                        <div className={cn('flex-1 rounded', contentBlock)} />
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'sidebar-right') {
        return (
            <div className="flex h-16 w-full gap-1.5 rounded-lg border border-border/70 bg-background/60 p-1.5">
                <div className="flex flex-1 flex-col gap-1.5">
                    <div className={cn('h-2 w-full rounded', mutedBar)} />
                    <div className="flex flex-1 gap-1.5">
                        <div className={cn('flex-1 rounded', contentBlock)} />
                        <div className={cn('flex-1 rounded', contentBlock)} />
                    </div>
                </div>
                <div
                    className={cn(
                        'w-1/4 rounded transition-colors',
                        activeColor,
                    )}
                />
            </div>
        );
    }

    if (mode === 'top-nav') {
        return (
            <div className="flex h-16 w-full flex-col gap-1.5 rounded-lg border border-border/70 bg-background/60 p-1.5">
                <div
                    className={cn(
                        'h-3 w-full rounded transition-colors',
                        activeColor,
                    )}
                />
                <div className="flex flex-1 gap-1.5">
                    <div className={cn('flex-1 rounded', contentBlock)} />
                    <div className={cn('flex-1 rounded', contentBlock)} />
                    <div className={cn('flex-1 rounded', contentBlock)} />
                </div>
            </div>
        );
    }

    // bottom-nav
    return (
        <div className="flex h-16 w-full flex-col justify-between gap-1 rounded-lg border border-border/70 bg-background/60 p-1.5">
            <div className={cn('h-2 w-full rounded', mutedBar)} />
            <div className="my-0.5 flex flex-1 gap-1.5">
                <div className={cn('flex-1 rounded', contentBlock)} />
                <div className={cn('flex-1 rounded', contentBlock)} />
            </div>
            <div
                className={cn(
                    'mx-auto h-2.5 w-3/4 rounded-full transition-colors',
                    activeColor,
                )}
            />
        </div>
    );
}

export default function Appearance() {
    const { t, locale, setLocale } = useTranslation();
    const { palette, presets, setPalette } = usePalette();
    const { resolvedAppearance } = useAppearance();
    const { layout, setLayout, options: layoutOptions } = useNavigationLayout();
    const isDark = resolvedAppearance === 'dark';

    return (
        <>
            <Head title={t('settings.appearance_title')} />

            <h1 className="sr-only">{t('settings.appearance_title')}</h1>

            <div className="space-y-8">
                {/* Theme Mode */}
                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title={t('settings.theme')}
                        description="Switch between light, dark, or system preference"
                    />
                    <AppearanceTabs />
                </div>

                {/* Navigation Layout */}
                <div className="space-y-4 border-t border-border/60 pt-6">
                    <Heading
                        variant="small"
                        title={t('settings.layout_mode')}
                        description="Select where navigation bars and drawers appear across your screen"
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {layoutOptions.map((opt) => {
                            const isActive = layout === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setLayout(opt.id)}
                                    className={cn(
                                        'group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:scale-[1.01]',
                                        isActive
                                            ? 'border-primary bg-card shadow-xs ring-2 ring-primary/40'
                                            : isDark
                                              ? 'border-neutral-800 bg-card/60 hover:border-neutral-700'
                                              : 'border-border/70 bg-card/60 hover:border-border hover:shadow-2xs',
                                    )}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={cn(
                                                    'text-sm font-semibold',
                                                    isDark
                                                        ? 'text-neutral-100'
                                                        : 'text-neutral-900',
                                                )}
                                            >
                                                {opt.title}
                                            </span>
                                            {isActive ? (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                </span>
                                            ) : (
                                                <span
                                                    className={cn(
                                                        'h-2.5 w-2.5 rounded-full border shadow-2xs transition-transform group-hover:scale-125',
                                                        isDark
                                                            ? 'border-white/20 bg-muted-foreground/30'
                                                            : 'border-black/10 bg-muted-foreground/20',
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <p
                                            className={cn(
                                                'mt-1 line-clamp-2 text-xs',
                                                isDark
                                                    ? 'text-neutral-400'
                                                    : 'text-neutral-600',
                                            )}
                                        >
                                            {opt.description}
                                        </p>
                                    </div>

                                    <div className="mt-3">
                                        <LayoutWireframe
                                            mode={opt.id}
                                            isActive={isActive}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-4 border-t border-border/60 pt-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Color Palette"
                            description="Choose an accent & nutrition theme that fits your training style"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                Custom builder:
                            </span>
                            <PaletteSelector />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {presets.map((preset) => {
                            const isActive = palette.id === preset.id;
                            const cardBg = isDark
                                ? preset.backgroundDark
                                : preset.backgroundLight;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setPalette(preset.id)}
                                    style={{
                                        backgroundColor: cardBg,
                                    }}
                                    className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:scale-[1.01] ${
                                        isActive
                                            ? 'border-primary shadow-xs ring-2 ring-primary/40'
                                            : isDark
                                              ? 'border-neutral-800 hover:border-neutral-700'
                                              : 'border-border/70 hover:border-border hover:shadow-2xs'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-sm font-semibold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}
                                        >
                                            {preset.name}
                                        </span>
                                        {isActive ? (
                                            <span
                                                className="flex h-5 w-5 items-center justify-center rounded-full shadow-2xs"
                                                style={{
                                                    backgroundColor:
                                                        preset.primary,
                                                    color: preset.primaryForeground,
                                                }}
                                            >
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </span>
                                        ) : (
                                            <span
                                                className={`h-2.5 w-2.5 rounded-full border shadow-2xs transition-transform group-hover:scale-125 ${isDark ? 'border-white/20' : 'border-black/10'}`}
                                                style={{
                                                    backgroundColor:
                                                        preset.primary,
                                                }}
                                            />
                                        )}
                                    </div>

                                    <p
                                        className={`mt-1 line-clamp-1 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}
                                    >
                                        {preset.description}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5">
                                        <div
                                            className="flex h-4 w-7 overflow-hidden rounded border border-black/20 shadow-2xs"
                                            title={`Light BG: ${preset.backgroundLight} | Dark BG: ${preset.backgroundDark}`}
                                        >
                                            <div
                                                className="flex h-full w-1/2 items-center justify-center text-[7px] font-bold text-neutral-800"
                                                style={{
                                                    backgroundColor:
                                                        preset.backgroundLight,
                                                }}
                                            >
                                                L
                                            </div>
                                            <div
                                                className="flex h-full w-1/2 items-center justify-center text-[7px] font-bold text-neutral-200"
                                                style={{
                                                    backgroundColor:
                                                        preset.backgroundDark,
                                                }}
                                            >
                                                D
                                            </div>
                                        </div>
                                        <span
                                            className="h-4 w-4 rounded-full border border-black/10 shadow-2xs"
                                            style={{
                                                backgroundColor: preset.primary,
                                            }}
                                            title={`Primary: ${preset.primary}`}
                                        />
                                        <span
                                            className="h-3.5 w-3.5 rounded-full shadow-2xs"
                                            style={{
                                                backgroundColor:
                                                    preset.macroCalories,
                                            }}
                                            title={`Calories: ${preset.macroCalories}`}
                                        />
                                        <span
                                            className="h-3.5 w-3.5 rounded-full shadow-2xs"
                                            style={{
                                                backgroundColor:
                                                    preset.macroProtein,
                                            }}
                                            title={`Protein: ${preset.macroProtein}`}
                                        />
                                        <span
                                            className="h-3.5 w-3.5 rounded-full shadow-2xs"
                                            style={{
                                                backgroundColor:
                                                    preset.macroCarbs,
                                            }}
                                            title={`Carbs: ${preset.macroCarbs}`}
                                        />
                                        <span
                                            className="h-3.5 w-3.5 rounded-full shadow-2xs"
                                            style={{
                                                backgroundColor:
                                                    preset.macroFat,
                                            }}
                                            title={`Fat: ${preset.macroFat}`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Interface Language */}
                <div className="space-y-4 border-t border-border/60 pt-6">
                    <Heading
                        variant="small"
                        title={t('settings.language')}
                        description="Select your preferred display language (English / Français)"
                    />
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setLocale('en')}
                            className={cn(
                                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                                locale === 'en'
                                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                                    : 'border-border/70 bg-card hover:border-border',
                            )}
                        >
                            <Globe className="h-4 w-4" />
                            English (EN)
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocale('fr')}
                            className={cn(
                                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                                locale === 'fr'
                                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                                    : 'border-border/70 bg-card hover:border-border',
                            )}
                        >
                            <Globe className="h-4 w-4" />
                            Français (FR)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
