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
            '지금 먼저 연락해야 할까, 조금 더 기다려야 할까?',
            '이 사람을 믿고 계속 가도 될까, 정리해야 할까?',
            '재회 가능성이 있다면 내가 먼저 바꿔야 할 패턴은 뭘까?',
        ],
        questionSuggestionsEn: [
            'Should I reach out now, or would waiting create a better opening?',
            'Should I keep investing in this relationship or set a clear boundary?',
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
            '지금 이직을 밀어붙여야 할까, 더 버티고 준비해야 할까?',
            '새 제안을 수락하는 게 맞을까, 잔류하는 게 맞을까?',
            '올해 하반기 내 강점이 가장 폭발하는 커리어 방향은?',
        ],
        questionSuggestionsEn: [
            'Should I push this job move now, or would staying build a stronger position?',
            'Will accepting this new role accelerate me, or pull me off-course?',
            'What career direction unlocks my highest leverage this year?',
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
            '지금 공격적으로 확장할 때인가, 손실 리스크를 방어할 때인가?',
            '새로운 투자나 사업을 시작하기에 지금 시기가 적절할까?',
            '내 재물운에서 가장 크게 새어나가는 현금 누수 구멍은?',
        ],
        questionSuggestionsEn: [
            'Is now the time to aggressively expand, or strictly defend cash flow?',
            'Is this timing right to launch a new investment or venture?',
            'What is the single biggest financial leak I must fix first?',
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
            '지금은 더 밀어붙이는 시기일까, 회복과 충전에 집중해야 할까?',
            '내 멘탈과 에너지를 가장 갉아먹는 생활 패턴은 무엇일까?',
            '올해 건강과 에너지 흐름에서 특히 조심해야 할 시기는?',
        ],
        questionSuggestionsEn: [
            'Is this a season to push harder, or strictly recover and recharge?',
            'What daily pattern is draining my physical energy the most?',
            'What months require the highest health and burnout vigilance?',
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
            '올해 남은 하반기 나의 골든타임과 피해야 할 치명적 함정은?',
            '여러 가지 일 중 지금 당장 무엇 하나에 집중해야 운이 풀릴까?',
            '지금 내가 즉시 멈춰야 할 것과 밀어붙여야 할 것은 무엇일까?',
        ],
        questionSuggestionsEn: [
            'What is my biggest golden window and critical trap for this year?',
            'Which single core priority should I focus on to trigger a breakthrough?',
            'What should I immediately stop forcing, and what should I push instead?',
        ],
    },
];
