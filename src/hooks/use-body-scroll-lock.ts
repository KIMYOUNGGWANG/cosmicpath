import { useEffect, useCallback } from 'react';
import { useLenis } from '@/components/providers/LenisProvider';

/**
 * Robust hook to lock body scroll when a modal/overlay is open.
 * Handles scrollbar layout shift, touch passthrough, and Lenis smooth scrolling.
 */
export function useBodyScrollLock(isOpen: boolean, config: { 
    allowTouch?: boolean;
    reserveScrollBarGap?: boolean;
} = {}) {
    const { lenis } = useLenis();

    useEffect(() => {
        if (!isOpen) return undefined;

        // Store original styles for both html and body to restore them perfectly
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyPaddingRight = document.body.style.paddingRight;
        const originalBodyTouchAction = document.body.style.touchAction;
        const originalOverscrollBehavior = document.body.style.overscrollBehavior;

        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // 1. Forceful Native Lock
        document.documentElement.style.setProperty('overflow', 'hidden', 'important');
        document.body.style.setProperty('overflow', 'hidden', 'important');
        document.body.style.overscrollBehavior = 'none';
        
        if (!config.allowTouch) {
            document.body.style.touchAction = 'none';
        }
        if (config.reserveScrollBarGap !== false && scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // 2. Lenis Lock (Global Engine Stop)
        if (lenis) {
            lenis.stop();
        }

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.paddingRight = originalBodyPaddingRight;
            document.body.style.touchAction = originalBodyTouchAction;
            document.body.style.overscrollBehavior = originalOverscrollBehavior;
            
            if (lenis) {
                lenis.start();
            }
        };
    }, [isOpen, lenis, config.allowTouch, config.reserveScrollBarGap]);
}
