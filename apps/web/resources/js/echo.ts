import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
        __REVERB__?: {
            key?: string;
            host?: string;
            port?: number;
            scheme?: string;
        };
    }
}

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (echoInstance) {
        return echoInstance;
    }

    const isHttps = window.location.protocol === 'https:';
    const globalReverb = window.__REVERB__;

    const appKey =
        globalReverb?.key || import.meta.env.VITE_REVERB_APP_KEY || '';

    if (!appKey) {
        return null;
    }

    const host =
        globalReverb?.host ||
        import.meta.env.VITE_REVERB_HOST ||
        window.location.hostname;

    // For HTTPS connections (production with Caddy / Coolify reverse proxy),
    // WebSocket traffic connects via the standard port 443 on /app/*
    // Internal server port 9080 is not exposed externally.
    const rawPort =
        globalReverb?.port ||
        (import.meta.env.VITE_REVERB_PORT
            ? Number(import.meta.env.VITE_REVERB_PORT)
            : undefined);

    const port = isHttps
        ? rawPort === 9080 || !rawPort
            ? 443
            : rawPort
        : rawPort || 9080;

    const forceTLS =
        isHttps ||
        globalReverb?.scheme === 'https' ||
        import.meta.env.VITE_REVERB_SCHEME === 'https';

    window.Pusher = Pusher;

    try {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: appKey,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS,
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo = echoInstance;
    } catch {
        return null;
    }

    return echoInstance;
}
