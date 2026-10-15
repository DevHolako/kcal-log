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
                                    className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:scale-[1.01] ${isActive ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/30' : 'border-border/70 hover:border-border hover:bg-muted/30'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">
                                            {preset.name}
                                        </span>
                                        {isActive ? (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </span>
                                        ) : null}
                                    </div>

                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                        {preset.description}
                                    </p>

                                    <div className="mt-3 flex items-center gap-1.5">
                                        <span
                                            className="h-4 w-4 rounded-full shadow-2xs"
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
