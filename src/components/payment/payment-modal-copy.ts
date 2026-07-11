import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, ListChecks, Search, ShieldCheck, TrendingUp } from 'lucide-react';

export interface PaywallCopyInput {
    readonly isEnglish: boolean;
    readonly isRelationshipContactTiming: boolean;
    readonly isPriceBlocked?: boolean;
    readonly priceLabel?: string | null;
}

export interface PaywallIntroCopy {
    readonly title: string;
    readonly bodyLines: readonly string[];
}

export interface PaywallVisualItem {
    readonly title: string;
    readonly description: string;
    readonly Icon: LucideIcon;
}

export interface PaywallLockedSection {
    readonly label: string;
    readonly Icon: LucideIcon;
    readonly tone: 'gold' | 'red';
}

export function getPaywallIntroCopy({
    isEnglish,
    isRelationshipContactTiming,
    isPriceBlocked = false,
    priceLabel,
}: PaywallCopyInput): PaywallIntroCopy {
    const pricePrefix = priceLabel ? ` ${priceLabel}` : '';
    const relationshipUnlockLine = isPriceBlocked
        ? (isEnglish
            ? 'Stripe confirmation is paused, so checkout will show the exact one-time price after the product is available.'
            : 'Stripe 가격 확인이 보류되어, 상품 확인 후 정확한 one-time 금액을 다시 표시합니다.')
        : (isEnglish
            ? `One-time${pricePrefix} opens the decision fork, evidence conflicts, and a bounded 7-day experiment.`
            : `one-time${pricePrefix}로 결정 갈림길, 근거 충돌, 중단 기준이 있는 7일 실험을 엽니다.`);
    const decisionUnlockLine = isPriceBlocked
        ? (isEnglish
            ? 'Stripe confirmation is paused, so checkout will show the exact one-time price after the product is available.'
            : 'Stripe 가격 확인이 보류되어, 상품 확인 후 정확한 one-time 금액을 다시 표시합니다.')
        : (isEnglish
            ? `One-time${pricePrefix} opens the decision fork, evidence conflicts, and a bounded 7-day experiment.`
            : `one-time${pricePrefix}로 결정 갈림길, 근거 충돌, 중단 기준이 있는 7일 실험을 엽니다.`);

    if (isRelationshipContactTiming) {
        return isEnglish
            ? {
                title: 'Open the 7-Day Decision Packet',
                bodyLines: [
                    'The free brief showed the first contact verdict.',
                    `${relationshipUnlockLine} Keep it permanently, then review what happened after seven days.`,
                ],
            }
            : {
                title: '7일 결정 패킷을 여세요',
                bodyLines: [
                    '무료 브리프에서 연락 판정은 확인했습니다.',
                    relationshipUnlockLine,
                    '패킷은 영구 보관됩니다. 7일 뒤 실제 결과를 확인하세요.',
                ],
            };
    }

    return isEnglish
        ? {
            title: 'Open the 7-Day Decision Packet',
            bodyLines: [
                'The free brief showed the verdict.',
                `${decisionUnlockLine} Keep it permanently, then review what happened after seven days.`,
            ],
        }
        : {
            title: '7일 결정 패킷을 여세요',
            bodyLines: [
                '무료 브리프에서 판정은 확인했습니다.',
                decisionUnlockLine,
                '패킷은 영구 보관됩니다. 7일 뒤 실제 결과를 확인하세요.',
            ],
        };
}

export function getLockedSections({
    isEnglish,
}: PaywallCopyInput): readonly PaywallLockedSection[] {
    return isEnglish
        ? [
            { label: 'Decision fork — compare the two real options', Icon: TrendingUp, tone: 'gold' },
            { label: 'Evidence disagreement — see where the three sources diverge', Icon: Search, tone: 'gold' },
            { label: 'Reality checks — verify the facts before acting', Icon: ListChecks, tone: 'gold' },
            { label: '7-day experiment — one bounded action with a stop rule', Icon: TrendingUp, tone: 'gold' },
            { label: 'If/Then rule — know the next move for each result', Icon: AlertTriangle, tone: 'red' },
            { label: 'Permanent access — keep and revisit the packet', Icon: ShieldCheck, tone: 'gold' },
        ]
        : [
            { label: '결정 갈림길 — 실제 두 선택지를 나란히 비교', Icon: TrendingUp, tone: 'gold' },
            { label: '근거 충돌 — 세 원천이 갈리는 지점을 공개', Icon: Search, tone: 'gold' },
            { label: '현실 확인 — 행동 전에 검증할 사실', Icon: ListChecks, tone: 'gold' },
            { label: '7일 실험 — 중단 기준이 있는 한 가지 행동', Icon: TrendingUp, tone: 'gold' },
            { label: '조건별 다음 수 — 결과별 If/Then 규칙', Icon: AlertTriangle, tone: 'red' },
            { label: '영구 보관 — 패킷을 저장하고 다시 확인', Icon: ShieldCheck, tone: 'gold' },
        ];
}

export function getUnlockBenefits({
    isEnglish,
    isRelationshipContactTiming,
}: PaywallCopyInput): readonly PaywallVisualItem[] {
    return isEnglish
        ? [
            {
                title: 'Decision fork',
                description: isRelationshipContactTiming
                    ? 'Compare contact, wait, and close against the same evidence.'
                    : 'Compare the two live options against the same evidence.',
                Icon: Search,
            },
            {
                title: 'Reality checks',
                description: isRelationshipContactTiming
                    ? 'Separate facts from interpretation and rule out message pressure or surveillance checks.'
                    : 'Separate what can be verified this week from interpretation.',
                Icon: TrendingUp,
            },
            {
                title: '7-day experiment',
                description: 'Run one reversible action with a success signal and a stop rule.',
                Icon: ListChecks,
            },
            {
                title: 'If/Then rule',
                description: 'Choose the next move before emotion rewrites the result.',
                Icon: AlertTriangle,
            },
            {
                title: 'Permanent access',
                description: 'Return to the same packet and record what actually happened.',
                Icon: ShieldCheck,
            },
        ]
        : [
            {
                title: '결정 갈림길',
                description: isRelationshipContactTiming
                    ? '연락, 대기, 정리를 같은 근거 위에서 비교합니다.'
                    : '지금 살아 있는 두 선택지를 같은 근거 위에서 비교합니다.',
                Icon: Search,
            },
            {
                title: '현실 확인',
                description: isRelationshipContactTiming
                    ? '사실과 해석을 나누고 확인 압박이나 감시성 확인을 먼저 제외합니다.'
                    : '이번 주에 검증 가능한 사실과 해석을 분리합니다.',
                Icon: TrendingUp,
            },
            {
                title: '7일 실험',
                description: '성공 신호와 중단 기준을 정한 되돌릴 수 있는 행동 하나를 실행합니다.',
                Icon: ListChecks,
            },
            {
                title: '조건별 다음 수',
                description: '감정이 결과를 다시 쓰기 전에 If/Then 규칙으로 다음 수를 정합니다.',
                Icon: AlertTriangle,
            },
            {
                title: '영구 보관',
                description: '같은 패킷을 다시 열고 실제로 일어난 결과를 기록합니다.',
                Icon: ShieldCheck,
            },
        ];
}
