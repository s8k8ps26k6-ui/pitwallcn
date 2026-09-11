'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
/** Refresh server observations, without synthesizing a live clock or telemetry. */
export function WeekendRefresh() {
    const router = useRouter();
    useEffect(() => {
        const refresh = () => { if (document.visibilityState === 'visible')
            router.refresh(); };
        const timer = window.setInterval(refresh, 60000);
        document.addEventListener('visibilitychange', refresh);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
    }, [router]);
    return null;
}
