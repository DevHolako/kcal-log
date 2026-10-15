import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { PaletteSelector } from '@/components/palette-selector';
import { usePalette } from '@/lib/theme-palettes';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { palette, presets, setPalette } = usePalette();

    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-8">
                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title="Theme Mode"
                        description="Switch between light, dark, or system preference"
                    />
                    <AppearanceTabs />
                </div>

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
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setPalette(preset.id)}
                                    style={{
                                        backgroundColor: preset.backgroundLight,
                                    }}
                                    className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:scale-[1.01] ${isActive ? 'border-primary shadow-xs ring-2 ring-primary/40' : 'border-border/70 hover:border-border hover:shadow-2xs'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-neutral-900">
                                            {preset.name}
                                        </span>
                                        {isActive ? (
                                            <span
                                                className="flex h-5 w-5 items-center justify-center rounded-full text-white shadow-2xs"
                                                style={{
                                                    backgroundColor:
                                                        preset.primary,
                                                }}
                                            >
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </span>
                                        ) : (
                                            <span
                                                className="h-2 w-2 rounded-full border border-black/10 transition-transform group-hover:scale-125"
                                                style={{
                                                    backgroundColor:
                                                        preset.primary,
                                                }}
                                            />
                                        )}
                                    </div>

                                    <p className="mt-1 line-clamp-1 text-xs text-neutral-600">
                                        {preset.description}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5">
                                        <span
                                            className="flex items-center justify-center rounded border border-black/10 px-1 py-0.5 text-[9px] font-bold shadow-2xs"
                                            style={{
                                                backgroundColor:
                                                    preset.backgroundLight,
                                                color: '#333',
                                            }}
                                            title={`Background: ${preset.backgroundLight}`}
                                        >
                                            BG
                                        </span>
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
