import { Check, Palette, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePalette, type ThemePalette } from '@/lib/theme-palettes';

interface PaletteSelectorProps {
    className?: string;
}

export function PaletteSelector({ className = '' }: PaletteSelectorProps) {
    const { palette, presets, setPalette } = usePalette();
    const [open, setOpen] = useState(false);
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Custom palette local state
    const [customPrimary, setCustomPrimary] = useState(palette.primary);
    const [customBgLight, setCustomBgLight] = useState(
        palette.backgroundLight || '#f5f7ff',
    );
    const [customBgDark, setCustomBgDark] = useState(
        palette.backgroundDark || '#0c0f1d',
    );
    const [customCalories, setCustomCalories] = useState(palette.macroCalories);
    const [customProtein, setCustomProtein] = useState(palette.macroProtein);
    const [customCarbs, setCustomCarbs] = useState(palette.macroCarbs);
    const [customFat, setCustomFat] = useState(palette.macroFat);

    const handleApplyPreset = (presetId: string) => {
        setPalette(presetId);
        setIsCustomMode(false);
    };

    const handleSaveCustom = (e: React.FormEvent) => {
        e.preventDefault();
        const custom: ThemePalette = {
            id: 'custom',
            name: 'Custom Palette',
            description: 'User-defined bespoke color scheme',
            primary: customPrimary,
            primaryForeground: '#ffffff',
            backgroundLight: customBgLight,
            backgroundDark: customBgDark,
            cardLight: '#ffffff',
            cardDark: '#13182c',
            plateBgTint: `${customPrimary}12`,
            macroCalories: customCalories,
            macroProtein: customProtein,
            macroCarbs: customCarbs,
            macroFat: customFat,
            macroWater: '#06b6d4',
        };
        setPalette('custom', custom);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 px-0 text-muted-foreground hover:text-foreground ${className}`}
                    aria-label="Theme palette"
                    title="Change Theme Palette"
                >
                    <Palette className="h-4 w-4 text-primary transition-transform hover:scale-110" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Palette className="h-5 w-5 text-primary" />
                        Choose Theme Palette
                    </DialogTitle>
                    <DialogDescription>
                        Select from 8 curated palettes with bespoke background
                        colors, or build your own custom scheme.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Mode Toggle: Presets vs Custom */}
                    <div className="flex rounded-lg bg-muted/60 p-1 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setIsCustomMode(false)}
                            className={`flex-1 rounded-md py-1.5 transition-colors ${!isCustomMode ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Curated Presets (8)
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCustomMode(true)}
                            className={`flex-1 rounded-md py-1.5 transition-colors ${isCustomMode ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Custom Palette Builder
                        </button>
                    </div>

                    {!isCustomMode ? (
                        /* Preset Grid - Each plate features its bespoke background */
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {presets.map((preset) => {
                                const isActive = palette.id === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() =>
                                            handleApplyPreset(preset.id)
                                        }
                                        style={{
                                            backgroundColor:
                                                preset.backgroundLight,
                                        }}
                                        className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all hover:scale-[1.01] ${isActive ? 'border-primary shadow-xs ring-2 ring-primary/40' : 'border-border/70 hover:border-border hover:shadow-2xs'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-neutral-900">
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
                                                    className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-2xs transition-transform group-hover:scale-125"
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

                                        {/* Color Swatches including Background Plate Color */}
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
                                                    backgroundColor:
                                                        preset.primary,
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
                    ) : (
                        /* Custom Palette Form */
                        <form
                            onSubmit={handleSaveCustom}
                            className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-2xs"
                        >
                            <div className="flex items-center gap-2 pb-1 text-xs font-semibold text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>
                                    Define your personalized nutrient & brand
                                    colors:
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Primary Brand Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customPrimary}
                                            onChange={(e) =>
                                                setCustomPrimary(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customPrimary}
                                            onChange={(e) =>
                                                setCustomPrimary(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Page Background (Light)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customBgLight}
                                            onChange={(e) =>
                                                setCustomBgLight(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customBgLight}
                                            onChange={(e) =>
                                                setCustomBgLight(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Page Background (Dark)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customBgDark}
                                            onChange={(e) =>
                                                setCustomBgDark(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customBgDark}
                                            onChange={(e) =>
                                                setCustomBgDark(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Calories Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customCalories}
                                            onChange={(e) =>
                                                setCustomCalories(
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customCalories}
                                            onChange={(e) =>
                                                setCustomCalories(
                                                    e.target.value,
                                                )
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Protein Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customProtein}
                                            onChange={(e) =>
                                                setCustomProtein(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customProtein}
                                            onChange={(e) =>
                                                setCustomProtein(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">
                                        Carbohydrates Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customCarbs}
                                            onChange={(e) =>
                                                setCustomCarbs(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customCarbs}
                                            onChange={(e) =>
                                                setCustomCarbs(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Fat Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customFat}
                                            onChange={(e) =>
                                                setCustomFat(e.target.value)
                                            }
                                            className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                                        />
                                        <Input
                                            value={customFat}
                                            onChange={(e) =>
                                                setCustomFat(e.target.value)
                                            }
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCustomMode(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm">
                                    Apply Custom Palette
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
