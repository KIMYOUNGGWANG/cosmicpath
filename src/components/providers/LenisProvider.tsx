'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import {
    DOCUMENT_SCROLL_LOCK_ATTRIBUTE,
    DOCUMENT_SCROLL_LOCK_EVENT,
} from '@/lib/scroll-lock';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            allowNestedScroll: true,
        });

        const syncLenisLockState = (isLocked: boolean) => {
            if (isLocked) {
                lenis.stop();
                return;
            }

            lenis.start();
        };

        const handleScrollLockChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ isLocked?: boolean }>;
            syncLenisLockState(Boolean(customEvent.detail?.isLocked));
        };

        syncLenisLockState(
            document.documentElement.hasAttribute(DOCUMENT_SCROLL_LOCK_ATTRIBUTE)
        );

        window.addEventListener(
            DOCUMENT_SCROLL_LOCK_EVENT,
            handleScrollLockChange as EventListener
        );

        let rafId = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        return () => {
            window.removeEventListener(
                DOCUMENT_SCROLL_LOCK_EVENT,
                handleScrollLockChange as EventListener
            );
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
