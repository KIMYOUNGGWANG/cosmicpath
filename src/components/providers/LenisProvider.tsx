'use client';

import { useEffect } from 'react';
import {
    DOCUMENT_SCROLL_LOCK_ATTRIBUTE,
    DOCUMENT_SCROLL_LOCK_EVENT,
} from '@/lib/scroll-lock';

export default function LenisProvider() {
    useEffect(() => {
        let rafId = 0;
        let isDisposed = false;
        let lenisInstance: {
            raf: (time: number) => void;
            destroy: () => void;
            stop: () => void;
            start: () => void;
        } | null = null;

        const syncLenisLockState = (isLocked: boolean) => {
            if (isLocked) {
                lenisInstance?.stop();
                return;
            }

            lenisInstance?.start();
        };

        const handleScrollLockChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ isLocked?: boolean }>;
            syncLenisLockState(Boolean(customEvent.detail?.isLocked));
        };

        void import('lenis').then(({ default: Lenis }) => {
            if (isDisposed) return;

            lenisInstance = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                allowNestedScroll: true,
            });

            syncLenisLockState(
                document.documentElement.hasAttribute(DOCUMENT_SCROLL_LOCK_ATTRIBUTE)
            );

            window.addEventListener(
                DOCUMENT_SCROLL_LOCK_EVENT,
                handleScrollLockChange as EventListener
            );

            const raf = (time: number) => {
                lenisInstance?.raf(time);
                rafId = requestAnimationFrame(raf);
            };

            rafId = requestAnimationFrame(raf);
        });

        return () => {
            isDisposed = true;
            window.removeEventListener(
                DOCUMENT_SCROLL_LOCK_EVENT,
                handleScrollLockChange as EventListener
            );
            cancelAnimationFrame(rafId);
            lenisInstance?.destroy();
        };
    }, []);

    return null;
}
