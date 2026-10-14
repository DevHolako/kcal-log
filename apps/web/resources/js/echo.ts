import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
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

    const appKey = import.meta.env.VITE_REVERB_APP_KEY;
    const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
    const port = Number(import.meta.env.VITE_REVERB_PORT || 9080);
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

    if (!appKey) {
        return null;
    }

    window.Pusher = Pusher;

    try {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: appKey,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo = echoInstance;
    } catch {
        return null;
    }

    return echoInstance;
}
