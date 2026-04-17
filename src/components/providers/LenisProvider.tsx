'use client';

import { useEffect } from 'react';

export default function LenisProvider() {
    useEffect(() => {
        let rafId = 0;
        let isDisposed = false;
        let lenisInstance: { raf: (time: number) => void; destroy: () => void } | null = null;

        void import('lenis').then(({ default: Lenis }) => {
            if (isDisposed) return;

            lenisInstance = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
            });

            const raf = (time: number) => {
                lenisInstance?.raf(time);
                rafId = requestAnimationFrame(raf);
            };

            rafId = requestAnimationFrame(raf);
        });

        return () => {
            isDisposed = true;
            cancelAnimationFrame(rafId);
            lenisInstance?.destroy();
        };
    }, []);

    return null;
}
