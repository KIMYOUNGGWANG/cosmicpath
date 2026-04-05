'use client';

import type { ReactNode } from 'react';

import { GlobalHeader } from '@/components/common/GlobalHeader';
import { cn } from '@/lib/utils';

interface ProductShellProps {
    children: ReactNode;
    language?: 'ko' | 'en';
    showBackButton?: boolean;
    className?: string;
}

export function ProductShell({
    children,
    language = 'ko',
    showBackButton = true,
    className,
}: ProductShellProps) {
    return (
        <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-accent-gold selection:text-bg-void font-outfit">
            <div className="aurora-bg fixed inset-0 z-0" />
            <div className="noise-overlay" />

            <GlobalHeader language={language} showBackButton={showBackButton} />

            <div className={cn('relative z-10 safe-area-top', className)}>
                {children}
            </div>
        </main>
    );
}
