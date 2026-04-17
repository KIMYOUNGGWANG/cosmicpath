'use client';

import { useEffect } from 'react';

const IGNORED_WARNINGS = [
    '.dampingFactor has been deprecated. use smoothTime (in seconds) instead.',
    '.draggingDampingFactor has been deprecated. use draggingSmoothTime (in seconds) instead.',
];

function shouldIgnoreConsoleWarn(args: unknown[]): boolean {
    return typeof args[0] === 'string' && IGNORED_WARNINGS.includes(args[0]);
}

export default function DevConsoleFilter() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const originalWarn = console.warn.bind(console);

        console.warn = (...args: unknown[]) => {
            if (shouldIgnoreConsoleWarn(args)) {
                return;
            }

            originalWarn(...args);
        };

        return () => {
            console.warn = originalWarn;
        };
    }, []);

    return null;
}
