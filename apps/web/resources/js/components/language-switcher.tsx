import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';

interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { locale, setLocale } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground ${className}`}
                    aria-label="Change language"
                >
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="uppercase">{locale}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                    onClick={() => setLocale('en')}
                    className={`cursor-pointer text-xs ${locale === 'en' ? 'font-semibold text-primary' : ''}`}
                >
                    English (EN)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLocale('fr')}
                    className={`cursor-pointer text-xs ${locale === 'fr' ? 'font-semibold text-primary' : ''}`}
                >
                    Français (FR)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
