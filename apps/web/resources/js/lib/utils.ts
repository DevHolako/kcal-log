import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const cleanStr = dateStr.includes('T')
        ? dateStr
        : `${dateStr.replace(' ', 'T')}Z`;
    const date = new Date(cleanStr.endsWith('Z') ? cleanStr : `${cleanStr}Z`);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}
