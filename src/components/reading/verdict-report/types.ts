import type React from 'react';
import type { PremiumReportData } from '../premium-report';

export type VerdictReportLanguage = 'ko' | 'en';

export type TarotCardSummary = {
    readonly name: string;
    readonly isReversed: boolean;
};

export type TabId =
    | 'tarot'
    | 'saju'
    | 'astro'
    | 'numerology'
    | 'fortune'
    | 'life'
    | 'special';

export type EvidenceTab = {
    readonly id: TabId;
    readonly label: string;
    readonly icon: React.ReactNode;
    readonly summary: string;
};

export type VerdictReportProps = {
    readonly report: PremiumReportData;
    readonly metadata?: Record<string, unknown>;
    readonly language?: VerdictReportLanguage;
    readonly isLoading?: boolean;
    readonly onRetry?: () => void;
    readonly tarotCards?: readonly TarotCardSummary[];
    readonly onCardClick?: (idx: number) => void;
    readonly scoreGridNode?: React.ReactNode;
    readonly isFreeView?: boolean;
};
