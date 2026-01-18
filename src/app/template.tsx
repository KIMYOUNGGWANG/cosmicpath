'use client';

import { PageTransition } from '@/components/layout/PageTransition';
import { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
    return <PageTransition>{children}</PageTransition>;
}
