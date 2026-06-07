import type { ReadingContext } from '@/lib/ai/prompt-builder';

export interface ContextOption {
    value: ReadingContext;
    labelKo: string;
    labelEn: string;
    eyebrowKo: string;
    eyebrowEn: string;
    summaryKo: string;
    summaryEn: string;
    questionSuggestionsKo: string[];
    questionSuggestionsEn: string[];
}

export const PRIMARY_ENGLISH_GUIDE_HREF = '/guides/what-is-korean-saju';

export const READING_CONTEXTS: ContextOption[] = [
    {
        value: 'love',
        labelKo: '연애 / 관계',
        labelEn: 'Love / Relationship',
        eyebrowKo: '관계의 온도와 다음 움직임',
        eyebrowEn: 'Relational chemistry and the next move',
        summaryKo: '먼저 연락할지, 거리를 둘지, 관계를 더 이어갈지처럼 감정과 타이밍이 함께 얽힌 질문에 맞는 경로예요.',
        summaryEn: 'Best for questions where emotion and timing are tangled together, like whether to reach out, wait, or keep building the relationship.',
        questionSuggestionsKo: [
            '지금 먼저 연락하는 게 맞을까, 조금 더 기다리는 게 맞을까?',
            '이 관계를 더 이어가면 안정될 가능성이 있을까?',
            '다시 만날 가능성이 있다면 내가 먼저 바꿔야 할 패턴은 뭘까?',
        ],
        questionSuggestionsEn: [
            'Should I reach out now, or would waiting create a better opening?',
            'If I keep investing in this relationship, does it look stable or draining?',
            'If reunion is possible, what pattern do I need to change first?',
        ],
    },
    {
        value: 'career',
        labelKo: '커리어 / 직업',
        labelEn: 'Career / Job',
        eyebrowKo: '역할 적합도와 전환 시기',
        eyebrowEn: 'Role fit and transition timing',
        summaryKo: '이직, 승진, 새 역할 제안처럼 방향을 바꿔야 할지 더 다져야 할지를 판단하는 질문에 맞아요.',
        summaryEn: 'Best for role changes, interviews, promotions, and the question of whether to move now or build deeper first.',
        questionSuggestionsKo: [
            '지금 이직을 밀어붙이는 게 맞을까, 조금 더 버티는 게 맞을까?',
            '새 제안을 받아들이면 성장에 도움이 될까, 아니면 방향이 어긋날까?',
            '올해 내 강점이 가장 잘 쓰이는 역할은 어떤 쪽일까?',
        ],
        questionSuggestionsEn: [
            'Should I push this job move now, or would staying longer build a stronger position?',
            'Will accepting this new role grow me, or pull me off-course?',
            'What kind of role is most aligned with my strengths this year?',
        ],
    },
    {
        value: 'money',
        labelKo: '재물 / 금전',
        labelEn: 'Wealth / Money',
        eyebrowKo: '돈의 흐름과 손실 리스크',
        eyebrowEn: 'Cash flow and downside risk',
        summaryKo: '투자, 지출, 현금 흐름처럼 흥분보다 안정성과 버티는 구조를 먼저 봐야 하는 질문에 맞는 경로입니다.',
        summaryEn: 'Designed for investment, spending, and cash flow questions where stability and downside matter more than excitement.',
        questionSuggestionsKo: [
            '지금 이 결정을 밀어붙이면 돈의 흐름이 좋아질까, 오히려 새는 구간이 커질까?',
            '이번 달엔 확장보다 방어가 우선일까?',
            '내 돈 관리에서 가장 먼저 손봐야 할 습관은 무엇일까?',
        ],
        questionSuggestionsEn: [
            'If I move on this now, does it improve my money flow or increase leakage?',
            'Is this month better for defense than expansion?',
            'What money habit should I fix first to stabilize my path?',
        ],
    },
    {
        value: 'health',
        labelKo: '건강 / 신체',
        labelEn: 'Health / Body',
        eyebrowKo: '리듬 회복과 컨디션 관리',
        eyebrowEn: 'Rhythm recovery and body management',
        summaryKo: '무리한 일정, 스트레스, 회복 타이밍처럼 몸과 생활 리듬을 다시 정렬해야 할 때 적합한 경로예요.',
        summaryEn: 'Useful when you need to rebalance stress, recovery, rest, and daily rhythm before pushing harder.',
        questionSuggestionsKo: [
            '지금은 더 밀어붙이는 시기일까, 회복에 집중해야 하는 시기일까?',
            '내 컨디션을 가장 크게 흔드는 생활 패턴은 무엇일까?',
            '이번 달 건강 흐름에서 특히 조심할 포인트가 있을까?',
        ],
        questionSuggestionsEn: [
            'Is this a season to push harder, or to recover and protect my energy?',
            'What daily pattern is destabilizing my condition the most right now?',
            'Is there a health rhythm I should be especially careful with this month?',
        ],
    },
    {
        value: 'general',
        labelKo: '종합 / 우선순위',
        labelEn: 'Overview / General',
        eyebrowKo: '전체 흐름과 우선순위 정렬',
        eyebrowEn: 'Overall direction and priority sorting',
        summaryKo: '분야를 아직 못 정했거나, 요즘 내 흐름에서 무엇을 먼저 잡아야 하는지 알고 싶을 때 여는 기본 경로예요.',
        summaryEn: 'Use this when you are not sure which domain matters most yet and want the reading to sort the main priority first.',
        questionSuggestionsKo: [
            '지금 내 흐름에서 가장 먼저 정리해야 할 선택은 무엇일까?',
            '이번 달엔 어디에 에너지를 집중하는 게 가장 효율적일까?',
            '지금 내가 멈춰야 할 것과 밀어야 할 것은 각각 무엇일까?',
        ],
        questionSuggestionsEn: [
            'What decision should I sort out first in my life right now?',
            'Where should I focus my energy this month for the clearest return?',
            'What should I stop forcing, and what should I move forward instead?',
        ],
    },
];
