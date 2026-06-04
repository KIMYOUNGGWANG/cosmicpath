import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, ListChecks, Search, ShieldCheck, TrendingUp } from 'lucide-react';

export interface PaywallCopyInput {
    readonly isEnglish: boolean;
    readonly isRelationshipContactTiming: boolean;
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
}: PaywallCopyInput): PaywallIntroCopy {
    if (isRelationshipContactTiming) {
        return isEnglish
            ? {
                title: 'Open why, contact timing, and what to avoid',
                bodyLines: [
                    'The free brief showed the first contact verdict.',
                    'Unlock why it leaned that way, when to move, and which message can backfire.',
                ],
            }
            : {
                title: '왜 이 판정인지, 연락 타이밍, 피해야 할 메시지를 여세요',
                bodyLines: [
                    '무료 브리프에서 연락 판정은 확인했습니다.',
                    '이제 왜 그런지, 언제 움직일지, 어떤 말은 피해야 하는지 확인하세요.',
                ],
            };
    }

    return isEnglish
        ? {
            title: 'Open the evidence, timing, and action order',
            bodyLines: [
                'The free brief showed the verdict.',
                'Unlock why it was chosen, when to act, what to avoid, and what to do next.',
            ],
        }
        : {
            title: '근거·타이밍·행동 순서를 여세요',
            bodyLines: [
                '무료 브리프에서 판정은 확인했습니다.',
                '이제 왜 그런지, 언제 움직일지, 무엇을 피할지, 어떤 순서로 할지 확인하세요.',
            ],
        };
}

export function getLockedSections({
    isEnglish,
    isRelationshipContactTiming,
}: PaywallCopyInput): readonly PaywallLockedSection[] {
    if (isRelationshipContactTiming) {
        return isEnglish
            ? [
                { label: 'Verdict Evidence — why this contact answer was chosen', Icon: Search, tone: 'gold' },
                { label: 'Contact Timing — send now, wait, or narrow the move', Icon: TrendingUp, tone: 'gold' },
                { label: 'Message Risk — what not to send first', Icon: AlertTriangle, tone: 'red' },
            ]
            : [
                { label: '판정 근거 — 왜 연락/대기 답이 나왔는지', Icon: Search, tone: 'gold' },
                { label: '연락 타이밍 — 지금 보낼지, 기다릴지, 축소할지', Icon: TrendingUp, tone: 'gold' },
                { label: '메시지 리스크 — 먼저 보내면 안 되는 말', Icon: AlertTriangle, tone: 'red' },
            ];
    }

    return isEnglish
        ? [
            { label: 'Verdict Evidence — why this answer was chosen', Icon: Search, tone: 'gold' },
            { label: 'Timing Window — when to move and when to wait', Icon: TrendingUp, tone: 'gold' },
            { label: 'Action Order — first, second, and hold', Icon: ListChecks, tone: 'gold' },
            { label: 'Risk Warning — the move that can backfire', Icon: AlertTriangle, tone: 'red' },
            { label: 'Confidence Check — where the sources agree', Icon: ShieldCheck, tone: 'gold' },
        ]
        : [
            { label: '판정 근거 — 왜 이 답이 나왔는지', Icon: Search, tone: 'gold' },
            { label: '타이밍 구간 — 움직일 때와 기다릴 때', Icon: TrendingUp, tone: 'gold' },
            { label: '실행 순서 — 먼저 할 일과 보류할 일', Icon: ListChecks, tone: 'gold' },
            { label: '리스크 경고 — 역효과 나는 움직임', Icon: AlertTriangle, tone: 'red' },
            { label: '신뢰도 확인 — 원천이 겹치는 지점', Icon: ShieldCheck, tone: 'gold' },
        ];
}

export function getUnlockBenefits({
    isEnglish,
    isRelationshipContactTiming,
}: PaywallCopyInput): readonly PaywallVisualItem[] {
    if (isRelationshipContactTiming) {
        return isEnglish
            ? [
                {
                    title: 'Why This Verdict',
                    description: 'See which Saju, Astrology, and Tarot signals made the answer lean contact, wait, narrow, or hold.',
                    Icon: Search,
                },
                {
                    title: 'Contact Timing',
                    description: 'Open whether to send now, wait a beat, or change the first move.',
                    Icon: TrendingUp,
                },
                {
                    title: 'Message To Avoid',
                    description: 'Spot the kind of long explanation, message pressure or surveillance check, or test message that can backfire.',
                    Icon: AlertTriangle,
                },
            ]
            : [
                {
                    title: '왜 이 판정인지',
                    description: '사주, 점성술, 타로 중 어떤 신호 때문에 연락/대기/축소 판정이 나왔는지 엽니다.',
                    Icon: Search,
                },
                {
                    title: '연락 타이밍',
                    description: '지금 보내도 되는지, 한 박자 기다려야 하는지, 먼저 바꿔야 할 첫 행동을 확인합니다.',
                    Icon: TrendingUp,
                },
                {
                    title: '피해야 할 메시지',
                    description: '장문 설명, 확인 압박, 감시성 확인, 떠보기처럼 관계를 더 꼬이게 만드는 말을 먼저 걸러냅니다.',
                    Icon: AlertTriangle,
                },
            ];
    }

    return isEnglish
        ? [
            {
                title: 'Why This Verdict',
                description: 'See which Saju, Astrology, and Tarot signals made the answer lean move, wait, or narrow the option.',
                Icon: Search,
            },
            {
                title: 'When To Act',
                description: 'Open the timing window, including the better action month and the window to avoid.',
                Icon: TrendingUp,
            },
            {
                title: 'Action Order',
                description: 'Turn the verdict into a ranked sequence so you know what to do first, second, and what to hold.',
                Icon: ListChecks,
            },
            {
                title: 'Risk To Avoid',
                description: 'The blind spot that could make a good timing window fail if you rush the wrong part.',
                Icon: AlertTriangle,
            },
            {
                title: 'Source Confidence',
                description: 'Check whether the three systems agree strongly or whether the result needs a more cautious read.',
                Icon: ShieldCheck,
            },
        ]
        : [
            {
                title: '왜 이 판정인지',
                description: '사주, 점성술, 타로 중 어떤 신호 때문에 움직임/대기/축소 판정이 나왔는지 엽니다.',
                Icon: Search,
            },
            {
                title: '언제 움직일지',
                description: '실행하기 좋은 시점과 피해야 할 구간을 월 단위 타이밍으로 확인합니다.',
                Icon: TrendingUp,
            },
            {
                title: '실행 순서',
                description: '판정을 실제 행동으로 바꾸기 위해 먼저 할 일, 보류할 일, 확인할 일을 정리합니다.',
                Icon: ListChecks,
            },
            {
                title: '피해야 할 리스크',
                description: '타이밍이 좋아도 실패하게 만드는 사각지대와 무리수를 먼저 막습니다.',
                Icon: AlertTriangle,
            },
            {
                title: '근거 신뢰도',
                description: '세 원천이 강하게 같은 방향인지, 조심스럽게 읽어야 하는 결과인지 확인합니다.',
                Icon: ShieldCheck,
            },
        ];
}
