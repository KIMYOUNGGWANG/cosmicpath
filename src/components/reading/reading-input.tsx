'use client';

/**
 * 리딩 입력 컴포넌트 - Ethereal Brutalism Style
 */

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ReadingContext } from '@/lib/ai/prompt-builder';
import { ENGLISH_GUIDES } from '@/lib/english-guides';
import {
    getOracleIntentLabel,
    ORACLE_CHARACTER_IDS,
    getOraclePersona,
    getRecommendedOracleCharacterId,
    inferQuestionIntent,
    type OracleCharacterId,
    type OraclePersonaProfile,
    type OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';
import { OracleSelectCard } from '@/components/reading/OracleSelectCard';

interface ReadingInputProps {
    onSubmit: (data: ReadingData) => void;
    isLoading?: boolean;
    inviterName?: string;
    inviteCode?: string;
    initialLanguage?: 'ko' | 'en';
    onLanguageChange?: (lang: 'ko' | 'en') => void;
    initialContext?: ReadingContext;
    initialQuestion?: string;
}

export interface ReadingData {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    characterId: OracleCharacterId;
    questionIntent?: OracleQuestionIntent;
    selectionMode?: 'auto' | 'manual';
    context: ReadingContext;
    question: string;
    language: 'ko' | 'en';
    calendarType: 'solar' | 'lunar';
    unknownTime: boolean;
    cityName?: string;
    longitude?: number;
    // 상대방 정보 (궁합/재회 분석용 - optional)
    partnerName?: string;
    partnerBirthDate?: string;
    partnerBirthTime?: string;
    partnerGender?: 'male' | 'female';
    inviteCode?: string;
}

interface ContextOption {
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

const contexts: ContextOption[] = [
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
        labelKo: '운세 / 종합',
        labelEn: 'Destiny / General',
        eyebrowKo: '전체 흐름과 우선순위 정렬',
        eyebrowEn: 'Overall direction and priority sorting',
        summaryKo: '분야를 아직 못 정했거나, 요즘 내 흐름에서 무엇을 먼저 잡아야 하는지 알고 싶을 때 여는 기본 경로예요.',
        summaryEn: 'Use this when you are not sure which domain matters most yet and want the oracle to sort the main priority first.',
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

const sectionShellClass =
    'relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl md:rounded-[26px] md:p-6';

const getGuideFitCopy = (
    specialty: OracleQuestionIntent,
    guideName: string,
    language: 'ko' | 'en'
) => {
    const copy = {
        general: {
            ko: `${guideName}는 질문 전체 흐름을 한 번에 정리하고, 지금 먼저 잡아야 할 한 가지를 또렷하게 보여줍니다.`,
            en: `${guideName} helps sort the whole picture first and shows the one move that matters most right now.`,
        },
        compatibility: {
            ko: `${guideName}는 두 사람의 감정 온도와 맞는 리듬을 같이 봐서, 관계가 실제로 잘 굴러갈지를 더 자세히 읽습니다.`,
            en: `${guideName} looks at emotional chemistry and daily rhythm together, so the relationship fit reads more clearly.`,
        },
        reunion: {
            ko: `${guideName}는 다시 이어질 가능성과, 다시 만나도 반복될 문제를 같이 봐서 재회 질문에 특히 강합니다.`,
            en: `${guideName} is strong when you need to read reconnection odds and the pattern that could repeat after reunion.`,
        },
        wealth: {
            ko: `${guideName}는 기대감보다 돈의 흐름과 손실 위험을 먼저 봐서, 금전 질문을 더 차분하게 정리합니다.`,
            en: `${guideName} checks money flow and downside first, so financial questions stay grounded instead of hype-driven.`,
        },
        timing: {
            ko: `${guideName}는 지금 밀어붙일 때인지 기다릴 때인지에 집중해서, 행동 타이밍을 더 선명하게 보여줍니다.`,
            en: `${guideName} focuses on whether this is the moment to move or wait, which makes the timing feel much clearer.`,
        },
        career: {
            ko: `${guideName}는 지금 역할이 맞는지, 옮길지 버틸지를 현실적으로 봐서 커리어 질문에 잘 맞습니다.`,
            en: `${guideName} is strong for career questions because it stays practical about role fit, moving, or holding your ground.`,
        },
        business: {
            ko: `${guideName}는 확장 욕심보다 구조와 검증 순서를 먼저 봐서, 사업과 부업 질문에 특히 잘 맞습니다.`,
            en: `${guideName} is especially useful for business questions because it looks at structure and validation before expansion.`,
        },
    } satisfies Record<OracleQuestionIntent, { ko: string; en: string }>;

    return language === 'en' ? copy[specialty].en : copy[specialty].ko;
};

const getGuideAlternativeScore = (
    persona: OraclePersonaProfile,
    context: ReadingContext,
    intent: OracleQuestionIntent,
    recommendedId: OracleCharacterId
) => {
    let score = 0;

    if (persona.id === recommendedId) score += 6;
    if (persona.specialty === intent) score += 4;
    if (persona.recommendedContexts.includes(context)) score += 3;

    return score;
};

export function ReadingInput({
    onSubmit,
    isLoading = false,
    inviterName,
    inviteCode,
    initialLanguage = 'ko',
    onLanguageChange,
    initialContext,
    initialQuestion,
}: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
    const [unknownTime, setUnknownTime] = useState(false);
    const [characterId, setCharacterId] = useState<OracleCharacterId>('general_orion');
    const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
    const [showPrecisionFields, setShowPrecisionFields] = useState(Boolean(inviteCode));
    const [context, setContext] = useState<ReadingContext>(inviteCode ? 'love' : initialContext ?? 'general');
    const [question, setQuestion] = useState(initialQuestion ?? '');
    const [languageOverride, setLanguageOverride] = useState<'ko' | 'en' | null>(null);

    // 상대방 정보 state (궁합/재회 분석용)
    const [showPartnerInfo, setShowPartnerInfo] = useState(Boolean(inviteCode));
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirthDate, setPartnerBirthDate] = useState('');
    const [partnerBirthTime, setPartnerBirthTime] = useState('12:00');
    const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('male');
    const [showAllGuides, setShowAllGuides] = useState(false);
    const questionFieldRef = useRef<HTMLTextAreaElement | null>(null);

    const language = languageOverride ?? initialLanguage;
    const isEn = language === 'en';
    const inferredQuestionIntent = inferQuestionIntent({
        context,
        question,
        partnerBirthDate,
        partnerName,
    });
    const recommendedCharacterId = getRecommendedOracleCharacterId({
        context,
        question,
        partnerBirthDate,
        partnerName,
        questionIntent: inferredQuestionIntent,
    });
    const selectedCharacterId = selectionMode === 'auto' ? recommendedCharacterId : characterId;
    const activePersona = getOraclePersona(selectedCharacterId);
    const activeContext = contexts.find((item) => item.value === context) ?? contexts[contexts.length - 1];
    const activeContextLabel = isEn ? activeContext.labelEn : activeContext.labelKo;
    const activeQuestionSuggestions = isEn
        ? activeContext.questionSuggestionsEn
        : activeContext.questionSuggestionsKo;
    const visibleQuestionSuggestions = activeQuestionSuggestions.slice(0, 2);
    const routePersona = activePersona;
    const guideStrengths = isEn ? activePersona.strengthsEn : activePersona.strengthsKo;
    const isUsingRecommendedGuide = selectedCharacterId === recommendedCharacterId;
    const guideFitCopy = getGuideFitCopy(routePersona.specialty, routePersona.name, language);
    const alternativeGuides = ORACLE_CHARACTER_IDS
        .map((id, order) => {
            const persona = getOraclePersona(id);
            return {
                id,
                order,
                persona,
                strength: isEn ? persona.strengthsEn[0] : persona.strengthsKo[0],
                score: getGuideAlternativeScore(persona, context, inferredQuestionIntent, recommendedCharacterId),
            };
        })
        .filter((item) => item.id !== selectedCharacterId)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            return left.order - right.order;
        })
        .slice(0, 2);
    const coreFieldsComplete = Boolean(birthDate && (unknownTime || birthTime) && question.trim());
    const coreSignals = [
        calendarType === 'solar'
            ? (isEn ? 'Solar Calendar' : '양력')
            : (isEn ? 'Lunar Calendar' : '음력'),
        unknownTime
            ? (isEn ? 'Time Unknown' : '시간 모름')
            : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
    ];

    // 포맷팅 헬퍼 함수
    const handleDateChange = (val: string, setter: (v: string) => void) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 4) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        }
        if (numbers.length > 6) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }
        setter(formatted);
    };

    const handleTimeChange = (val: string, setter: (v: string) => void) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 2) {
            formatted = `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }
        setter(formatted);
    };

    const focusQuestionField = () => {
        requestAnimationFrame(() => {
            const field = questionFieldRef.current;
            if (!field) return;

            const nextCaret = field.value.length;
            field.focus();
            field.setSelectionRange(nextCaret, nextCaret);
        });
    };

    const applyQuestionSuggestion = (suggestion: string) => {
        setQuestion(suggestion);
        focusQuestionField();
    };

    const handleContextSelect = (nextContext: ReadingContext) => {
        const nextContextOption = contexts.find((item) => item.value === nextContext);

        setContext(nextContext);
        if (nextContext === 'love') {
            setShowPartnerInfo(true);
        }

        if (!nextContextOption || question.trim()) return;
        applyQuestionSuggestion(
            isEn ? nextContextOption.questionSuggestionsEn[0] : nextContextOption.questionSuggestionsKo[0]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name.trim(), gender, birthDate, birthTime, characterId: selectedCharacterId, questionIntent: inferredQuestionIntent, selectionMode, context, question: question.trim(), language, calendarType, unknownTime,
            // 상대방 정보 (입력된 경우에만 포함)
            ...(showPartnerInfo && partnerBirthDate ? {
                partnerName: partnerName || undefined,
                partnerBirthDate,
                partnerBirthTime,
                partnerGender
            } : {}),
            inviteCode
        });
    };

    const openGuideSelection = () => {
        setShowAllGuides(true);
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-2xl space-y-6 md:space-y-8"
        >
            {/* Header / Language */}
            <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-dim tracking-widest uppercase">
                        {isEn ? 'Reading Intake' : '질문 입력 순서'}
                    </span>
                    <div className="flex gap-4 text-xs font-mono">
                         <button
                            type="button"
                            onClick={() => {
                                setLanguageOverride('ko');
                                onLanguageChange?.('ko');
                            }}
                            className={`transition-colors ${language === 'ko' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                        >
                            KR
                        </button>
                        <span className="text-dim">/</span>
                        <button
                            type="button"
                            onClick={() => {
                                setLanguageOverride('en');
                                onLanguageChange?.('en');
                            }}
                            className={`transition-colors ${language === 'en' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-black/20 p-4 md:mt-5 md:flex-row md:items-end md:justify-between md:rounded-[24px] md:p-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                                {isEn ? 'First Reading Free' : '첫 리딩 무료'}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                {isEn ? 'Question + Birth Data + Result' : '질문 + 생년월일 + 바로 결과'}
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/62">
                            {isEn
                                ? 'Keep the depth in the saju itself, not in extra steps. Ask one real question, add your birth details, and go straight to the first result.'
                                : '단계가 많다고 더 정확한 건 아니에요. 지금 고민 하나와 생년월일만 넣으면 첫 결과를 바로 볼 수 있어요.'}
                        </p>
                    </div>
                    {isEn ? (
                        <Link
                            href={ENGLISH_GUIDES[0] ? `/guides/${ENGLISH_GUIDES[0].slug}` : '/guides'}
                            className="text-[11px] uppercase tracking-[0.24em] text-white/58 transition-colors hover:text-white"
                        >
                            {isEn ? 'New here? Read the quick guide' : '빠른 가이드 보기'}
                        </Link>
                    ) : null}
                </div>
            </div>

            {/* Input Grid */}
            <div className="flex flex-col gap-6 md:gap-8">

                {/* 1. Inquiry Vector */}
                <div className={`${sectionShellClass} order-1`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {isEn ? '01. Decision Domain' : '01. Decision Domain (고민 영역)'}
                            </label>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'Start with the question before the coordinates. Once the oracle knows what you are trying to decide, your birth timing can sharpen the route.'
                                    : '질문부터 시작합니다. 뭘 결정해야 하는지 먼저 알아야, 생년월일도 그 질문을 더 정확하게 읽어줄 수 있어요.'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Question-First Intake' : '질문 중심 진입'}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:grid-cols-3">
                        {contexts.map((ctx) => {
                            const isSelected = context === ctx.value;
                            return (
                                <button
                                    key={ctx.value}
                                    type="button"
                                    onClick={() => handleContextSelect(ctx.value)}
                                    className={`rounded-[18px] border px-3 py-3 text-left transition-all duration-300 md:rounded-[20px] md:px-4 ${isSelected
                                        ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                                        }`}
                                >
                                    <p className="hidden text-[10px] uppercase tracking-[0.24em] text-white/38 md:block">
                                        {isEn ? ctx.eyebrowEn : ctx.eyebrowKo}
                                    </p>
                                    <h3 className={`font-cinzel text-[13px] leading-5 md:mt-2 md:text-base ${isSelected ? 'text-acc-gold' : 'text-starlight'}`}>
                                        {isEn ? ctx.labelEn : ctx.labelKo}
                                    </h3>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-acc-gold">
                                {activeContextLabel}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                {routePersona.name}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                {isEn ? getOracleIntentLabel(inferredQuestionIntent, 'en') : getOracleIntentLabel(inferredQuestionIntent, 'ko')}
                            </span>
                        </div>

                        <label className="mt-4 block text-xs uppercase tracking-[0.24em] text-white/38">
                            {isEn ? 'Your Real Question' : '지금 제일 걸리는 질문'}
                        </label>
                        <textarea
                            ref={questionFieldRef}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={activeQuestionSuggestions[0]}
                            required
                            className="mt-3 h-24 w-full resize-none rounded-[20px] border border-white/20 bg-white/5 p-4 text-base leading-relaxed text-starlight transition-colors placeholder:text-white/30 focus:border-acc-gold/80 focus:bg-white/10 focus:outline-none md:text-sm"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {visibleQuestionSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => applyQuestionSuggestion(suggestion)}
                                    className="min-h-[36px] rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] leading-5 text-white/68 transition-all hover:border-white/28 hover:text-white"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-white/38">
                            {isEn
                                ? 'A concrete question makes the action window, follow-up guidance, and premium upgrade feel much sharper from the first reading.'
                                : '질문이 구체적일수록 첫 결과가 더 바로 이해되고, 다음에 뭘 물어볼지도 선명해집니다.'}
                        </p>
                    </div>
                </div>

                <div className={sectionShellClass}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {isEn ? 'Recommended Guide' : '이번 질문의 추천 가이드'}
                            </label>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                                {isEn 
                                    ? "Reads the overall flow and points to the single most important path right now."
                                    : "질문 전체의 흐름을 읽고, 지금 당신의 궤도를 가장 크게 바꿀 한 수를 짚어주는 메인 오라클 가이드"}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {selectionMode === 'auto'
                                ? (isEn ? 'Best Match First' : '기본은 추천 가이드')
                                : (isEn ? 'Custom Guide On' : '직접 고른 가이드')}
                        </span>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                        <div className="flex flex-col gap-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-acc-gold/25 bg-acc-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                        {routePersona.name}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                        {isEn ? getOracleIntentLabel(inferredQuestionIntent, 'en') : getOracleIntentLabel(inferredQuestionIntent, 'ko')}
                                    </span>
                                </div>

                                <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">
                                    {isEn ? routePersona.titleEn : routePersona.titleKo}
                                </p>

                                <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] p-4 md:p-5">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                                        {isUsingRecommendedGuide
                                            ? (isEn ? 'Why this guide came first' : '왜 이 가이드가 먼저 나왔을까요')
                                            : (isEn ? 'What changes with this guide' : '이 가이드로 바꾸면')}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/72">
                                        {guideFitCopy}
                                    </p>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-white/68">
                                    {isEn ? routePersona.descriptionEn : routePersona.descriptionKo}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {guideStrengths.slice(0, 2).map((strength) => (
                                        <p
                                            key={strength}
                                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/55"
                                        >
                                            {strength}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-2 flex flex-col gap-4 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
                                <p className="text-[11px] leading-5 text-white/45 md:max-w-[65%]">
                                    {isEn
                                        ? 'Keep the best match, or open the full list below when you want another reading style.'
                                        : '추천 가이드를 그대로 써도 되고, 원하면 아래 전체 목록에서 다른 가이드로 바꿀 수 있습니다.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={openGuideSelection}
                                    className="min-h-[44px] whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/78 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                                >
                                    {isEn ? 'See All Guides' : '전체 가이드 보기'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {showAllGuides ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5"
                        >
                            <div className="mb-4">
                                <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                    {isEn ? 'All Guides' : '전체 가이드 목록'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/58">
                                    {isEn
                                        ? 'The guide changes how the question is read. Pick any guide you want.'
                                        : '가이드는 결과 말투가 아니라 질문을 읽는 관점을 바꿉니다. 원하는 시선으로 직접 골라보세요.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {ORACLE_CHARACTER_IDS.map((id) => {
                                    const persona = getOraclePersona(id);
                                    const isSelected = selectedCharacterId === id;
                                    const isRecommended = recommendedCharacterId === id;
                                    return (
                                        <OracleSelectCard
                                            key={id}
                                            language={language}
                                            persona={persona}
                                            selected={isSelected}
                                            recommended={isRecommended}
                                            onSelect={() => {
                                                setCharacterId(id);
                                                setSelectionMode('manual');
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAllGuides(false)}
                                className="mt-4 w-full rounded-full border border-white/15 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/62 hover:bg-white/[0.06] hover:text-white"
                            >
                                {isEn ? 'Show Less' : '목록 접기'}
                            </button>
                        </motion.div>
                    ) : alternativeGuides.length > 0 ? (
                        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                        {isEn ? 'Other guides you can try fast' : '다른 가이드도 바로 바꿔볼 수 있어요'}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/58">
                                        {isEn
                                            ? 'If the default guide feels slightly off, switch with one tap before you even open the full list.'
                                            : '기본 추천이 조금 다르게 느껴지면, 전체 목록을 열기 전에도 여기서 바로 바꿔볼 수 있습니다.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                {alternativeGuides.map(({ id, persona, strength }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => {
                                            setCharacterId(id);
                                            setSelectionMode('manual');
                                        }}
                                        className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-left transition-all hover:border-white/25 hover:bg-white/[0.04]"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
                                                {persona.name}
                                            </span>
                                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                                                {isEn
                                                    ? getOracleIntentLabel(persona.specialty, 'en')
                                                    : getOracleIntentLabel(persona.specialty, 'ko')}
                                            </span>
                                            {id === recommendedCharacterId ? (
                                                <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-acc-gold">
                                                    {isEn ? 'Default Pick' : '기본 추천'}
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">
                                            {isEn ? persona.titleEn : persona.titleKo}
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-white/64">
                                            {strength}
                                        </p>
                                        <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
                                            {isEn ? 'Tap to switch to this guide' : '누르면 이 가이드로 바로 바뀝니다'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* 2. Essential Coordinates */}
                <div className={`${sectionShellClass} order-2`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {inviterName
                                    ? (isEn ? `02. Saju Essentials (${inviterName} invited you)` : `02. 핵심 사주 입력 (${inviterName}님의 초대)`)
                                    : (isEn ? '02. Saju Essentials' : '02. 핵심 사주 입력')}
                            </label>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'These are the fields that actually affect the first saju read: birth date, birth time or time unknown, gender, and solar/lunar calendar.'
                                    : '첫 결과에 직접 필요한 값만 먼저 받습니다. 생년월일, 태어난 시간, 성별, 양력/음력까지가 핵심이에요.'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Quality First' : '퀄리티 우선'}
                        </span>
                    </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2">
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Birth Date' : '생년월일'}
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">YYYY-MM-DD</p>
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Birth Time' : '태어난 시간'}
                            </label>
                            <input
                                type="time"
                                step={60}
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                                disabled={unknownTime}
                                className={`mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none ${
                                    unknownTime ? 'cursor-not-allowed opacity-40' : ''
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const nextUnknown = !unknownTime;
                                    setUnknownTime(nextUnknown);
                                    if (nextUnknown) setBirthTime('12:00');
                                }}
                                className="mt-3 flex items-start gap-3 text-left"
                            >
                                <div
                                    className={`mt-0.5 flex h-4 w-4 items-center justify-center border transition-colors ${
                                        unknownTime ? 'border-acc-gold bg-acc-gold/10' : 'border-white/20'
                                    }`}
                                >
                                    {unknownTime && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                        </svg>
                                    )}
                                </div>
                                <span className="pt-0.5 text-[10px] leading-tight text-dim">
                                    {isEn
                                        ? 'I do not know the birth time. Use 12:00 as a midpoint.'
                                        : '태어난 시간을 모르겠어요. 이 경우 낮 12:00을 기준점으로 씁니다.'}
                                </span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Gender' : '성별'}
                            </label>
                            <div className="mt-3 flex min-h-[48px] gap-2">
                                <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                        gender === 'male'
                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {isEn ? 'Male' : '남성'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                        gender === 'female'
                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {isEn ? 'Female' : '여성'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Calendar Type' : '달력 기준'}
                            </label>
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('solar')}
                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                        calendarType === 'solar'
                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {isEn ? 'Solar' : '양력'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('lunar')}
                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                        calendarType === 'lunar'
                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                    }`}
                                >
                                    {isEn ? 'Lunar' : '음력'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={() => setShowPrecisionFields((value) => !value)}
                            className="min-h-[48px] w-full rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/30 hover:text-white md:w-auto"
                        >
                            {showPrecisionFields
                                ? (isEn ? 'Hide Extra Options' : '추가 입력 닫기')
                                : (isEn ? 'Open Extra Options' : '추가 입력 열기')}
                        </button>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-acc-gold">
                                {coreFieldsComplete
                                    ? (isEn ? 'Ready For First Result' : '무료 결과 준비됨')
                                    : (isEn ? 'Saju Essentials' : '핵심 사주 입력')}
                            </span>
                            {coreSignals.map((signal) => (
                                <span
                                    key={signal}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45"
                                >
                                    {signal}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <p className="max-w-2xl text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'The first result now uses the quality-critical saju fields first. Extra inputs are only for compatibility, manual guide choice, or a more custom path.'
                                    : '무료 결과는 필요한 정보만 먼저 받고 바로 엽니다. 추가 입력은 더 자세히 보고 싶을 때만 넣으면 됩니다.'}
                            </p>
                        </div>
                    </div>
                </div>

                {showPrecisionFields && (
                    <>
                        <div className={`${sectionShellClass} order-3`}>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                                {isEn ? '03. Extra Inputs' : '03. 추가 입력'}
                            </label>
                            <div>
                                <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                    {isEn ? 'Name (Optional)' : '이름 또는 닉네임 (선택)'}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isEn ? 'Only if you want it reflected in the reading' : '리딩에 이름을 반영하고 싶을 때만 적어주세요'}
                                    className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                                />
                                <p className="mt-2 text-[11px] leading-5 text-white/42">
                                    {isEn
                                        ? 'You can skip this. It is only used for a more personal tone in the result.'
                                        : '건너뛰어도 됩니다. 결과 문장을 조금 더 개인적으로 보여줄 때만 씁니다.'}
                                </p>
                            </div>
                        </div>

                        {/* 3. Partner Info (Love/Relationship Only) */}
                        {context === 'love' && (
                            <div className={`${sectionShellClass} order-4`}>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                        {isEn ? 'Partner Information (Optional)' : '상대 정보 (선택)'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPartnerInfo(!showPartnerInfo)}
                                        className={`text-xs tracking-widest uppercase transition-colors ${
                                            showPartnerInfo ? 'text-acc-gold' : 'text-dim hover:text-moonlight'
                                        }`}
                                    >
                                        {showPartnerInfo ? (isEn ? 'Hide' : '접기') : (isEn ? 'Expand' : '펼치기')}
                                    </button>
                                </div>

                                {showPartnerInfo && (
                                    <div className="space-y-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                                        <p className="text-xs leading-6 text-white/52">
                                            {isEn
                                                ? "Add your partner's birth info if you want the compatibility or reunion layer to be grounded in both charts."
                                                : '궁합이나 재회 가능성을 두 사람의 차트 기준으로 읽고 싶다면 상대방 정보까지 함께 넣어주세요.'}
                                        </p>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={partnerName}
                                                    onChange={(e) => setPartnerName(e.target.value)}
                                                    placeholder={isEn ? "Partner's name" : '상대방 이름'}
                                                    className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPartnerGender('male')}
                                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                                        partnerGender === 'male'
                                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                                    }`}
                                                >
                                                    {isEn ? 'Male' : '남성'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPartnerGender('female')}
                                                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                                        partnerGender === 'female'
                                                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                                    }`}
                                                >
                                                    {isEn ? 'Female' : '여성'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={partnerBirthDate}
                                                    onChange={(e) => handleDateChange(e.target.value, setPartnerBirthDate)}
                                                    placeholder="YYYY-MM-DD"
                                                    maxLength={10}
                                                    className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none font-mono"
                                                />
                                                <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">
                                                    {isEn ? "PARTNER'S BIRTH DATE" : '상대방 생년월일'}
                                                </p>
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={partnerBirthTime}
                                                    onChange={(e) => handleTimeChange(e.target.value, setPartnerBirthTime)}
                                                    placeholder="HH:MM"
                                                    maxLength={5}
                                                    className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none font-mono"
                                                />
                                                <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">
                                                    {isEn ? "PARTNER'S BIRTH TIME" : '상대방 생시'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </>
                )}

            </div>

            {/* Action */}
            <div className="flex flex-col items-center justify-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={!birthDate || !question.trim() || (!unknownTime && !birthTime) || isLoading}
                    className={`group relative w-full overflow-hidden rounded-full border border-acc-gold/30 bg-gradient-to-r from-acc-gold via-[#f1cf74] to-[#c98d2d] px-8 py-3.5 text-deep-navy shadow-[0_18px_36px_rgba(212,175,55,0.18)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_22px_46px_rgba(212,175,55,0.24)] md:w-auto md:px-10 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <span className="relative z-10 font-cinzel text-sm font-bold uppercase tracking-[0.3em]">
                        {isLoading
                            ? (isEn ? 'CALCULATING...' : 'CALCULATING...')
                            : (inviteCode
                                ? (isEn ? 'SEE FREE COMPATIBILITY' : '무료 궁합 결과 보기')
                                : (isEn ? 'SEE FREE RESULT' : '내 결과 먼저 보기')
                            )
                        }
                    </span>
                    <div className="absolute inset-0 bg-white/12 translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0" />
                </button>
                <p className="text-center text-[11px] tracking-[0.16em] text-white/38 uppercase">
                    {isEn
                        ? 'You answer once, then the first result opens right away.'
                        : '입력 한 번이면 첫 결과가 바로 열립니다.'}
                </p>
            </div>

        </motion.form>
    );
}
