'use client';

import { useEffect } from 'react';
import {
    DOCUMENT_SCROLL_LOCK_ATTRIBUTE,
    DOCUMENT_SCROLL_LOCK_EVENT,
} from '@/lib/scroll-lock';

let activeLockCount = 0;
let lockedScrollY = 0;
let previousStyles: {
    htmlOverflow: string;
    bodyOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyLeft: string;
    bodyRight: string;
    bodyWidth: string;
    bodyPaddingRight: string;
} | null = null;

function lockDocumentScroll() {
    if (typeof window === 'undefined') return;

    activeLockCount += 1;
    if (activeLockCount > 1) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = Math.max(window.innerWidth - html.clientWidth, 0);

    lockedScrollY = window.scrollY;
    previousStyles = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyPaddingRight: body.style.paddingRight,
    };

    html.style.overflow = 'hidden';
    html.setAttribute(DOCUMENT_SCROLL_LOCK_ATTRIBUTE, 'true');
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    window.dispatchEvent(
        new CustomEvent(DOCUMENT_SCROLL_LOCK_EVENT, {
            detail: { isLocked: true },
        })
    );

    if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
    }
}

function unlockDocumentScroll() {
    if (typeof window === 'undefined' || activeLockCount === 0) return;

    activeLockCount -= 1;
    if (activeLockCount > 0) return;

    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = previousStyles?.htmlOverflow ?? '';
    html.removeAttribute(DOCUMENT_SCROLL_LOCK_ATTRIBUTE);
    body.style.overflow = previousStyles?.bodyOverflow ?? '';
    body.style.position = previousStyles?.bodyPosition ?? '';
    body.style.top = previousStyles?.bodyTop ?? '';
    body.style.left = previousStyles?.bodyLeft ?? '';
    body.style.right = previousStyles?.bodyRight ?? '';
    body.style.width = previousStyles?.bodyWidth ?? '';
    body.style.paddingRight = previousStyles?.bodyPaddingRight ?? '';

    window.dispatchEvent(
        new CustomEvent(DOCUMENT_SCROLL_LOCK_EVENT, {
            detail: { isLocked: false },
        })
    );

    window.scrollTo({ top: lockedScrollY });
    previousStyles = null;
}

export function useDocumentScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        lockDocumentScroll();
        return () => {
            unlockDocumentScroll();
        };
    }, [isLocked]);
}
