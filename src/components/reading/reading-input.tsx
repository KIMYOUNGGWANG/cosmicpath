'use client';

/**
 * 리딩 입력 컴포넌트 - Ethereal Brutalism Style
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ReadingContext } from '@/lib/ai/prompt-builder';
import {
    getOracleIntentLabel,
    ORACLE_CHARACTER_IDS,
    getOraclePersona,
    getRecommendedOracleCharacterId,
    inferQuestionIntent,
    type OracleCharacterId,
    type OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';

interface ReadingInputProps {
    onSubmit: (data: ReadingData) => void;
    isLoading?: boolean;
    inviterName?: string;
    inviteCode?: string;
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
    'relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl md:p-8';

export function ReadingInput({ onSubmit, isLoading = false, inviterName, inviteCode }: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
    const [unknownTime, setUnknownTime] = useState(false);
    const [characterId, setCharacterId] = useState<OracleCharacterId>('general_orion');
    const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
    const [showDetailedAdvisors, setShowDetailedAdvisors] = useState(false);
    const [context, setContext] = useState<ReadingContext>(inviteCode ? 'love' : 'general');
    const [question, setQuestion] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    // 상대방 정보 state (궁합/재회 분석용)
    const [showPartnerInfo, setShowPartnerInfo] = useState(Boolean(inviteCode));
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirthDate, setPartnerBirthDate] = useState('');
    const [partnerBirthTime, setPartnerBirthTime] = useState('12:00');
    const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('male');

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
    const activePersona = getOraclePersona(characterId);
    const recommendedPersona = getOraclePersona(recommendedCharacterId);
    const activeContext = contexts.find((item) => item.value === context) ?? contexts[contexts.length - 1];
    const activeContextLabel = isEn ? activeContext.labelEn : activeContext.labelKo;
    const activeContextEyebrow = isEn ? activeContext.eyebrowEn : activeContext.eyebrowKo;
    const activeContextSummary = isEn ? activeContext.summaryEn : activeContext.summaryKo;
    const activeQuestionSuggestions = isEn
        ? activeContext.questionSuggestionsEn
        : activeContext.questionSuggestionsKo;
    const routePersona = selectionMode === 'manual' ? activePersona : recommendedPersona;

    useEffect(() => {
        if (selectionMode !== 'auto') return;
        setCharacterId(recommendedCharacterId);
    }, [recommendedCharacterId, selectionMode]);

    useEffect(() => {
        if (!inviteCode || question.trim()) return;
        const loveContext = contexts.find((item) => item.value === 'love');
        if (!loveContext) return;

        setQuestion(
            isEn ? loveContext.questionSuggestionsEn[0] : loveContext.questionSuggestionsKo[0]
        );
    }, [inviteCode, isEn, question]);

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

    const handleContextSelect = (nextContext: ReadingContext) => {
        const nextContextOption = contexts.find((item) => item.value === nextContext);

        setContext(nextContext);
        if (nextContext === 'love') {
            setShowPartnerInfo(true);
        }

        if (!nextContextOption || question.trim()) return;
        setQuestion(
            isEn ? nextContextOption.questionSuggestionsEn[0] : nextContextOption.questionSuggestionsKo[0]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name, gender, birthDate, birthTime, characterId, questionIntent: inferredQuestionIntent, selectionMode, context, question, language, calendarType, unknownTime,
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

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto space-y-12"
        >
            {/* Header / Language */}
            <div className="border-b border-white/5 pb-6">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-dim tracking-widest uppercase">
                        {isEn ? 'Oracle Intake Protocol' : 'Oracle Intake Protocol'}
                    </span>
                    <div className="flex gap-4 text-xs font-mono">
                        <button
                            type="button"
                            onClick={() => setLanguage('ko')}
                            className={`transition-colors ${language === 'ko' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                        >
                            KR
                        </button>
                        <span className="text-dim">/</span>
                        <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`transition-colors ${language === 'en' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                <div className="mt-6 rounded-[26px] border border-white/10 bg-black/20 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                            {isEn ? 'First Reading Free' : '첫 리딩 무료'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Decision Timing Oracle' : '결정과 타이밍 오라클'}
                        </span>
                    </div>
                    <h2 className="mt-4 font-cinzel text-2xl text-starlight md:text-3xl">
                        {isEn ? 'Choose the domain first, then give the oracle one real question.' : '먼저 고민 영역을 고르고, 그다음 진짜 질문 하나를 넘겨주세요.'}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                        {isEn
                            ? 'Start from the decision itself. Once the oracle knows the domain and the question, your birth timing can sharpen the route across relationship, career, wealth, or daily flow.'
                            : '결정 그 자체에서 시작합니다. 고민 영역과 질문을 먼저 정하면, 생년월일시는 그 리딩을 더 정교하게 벼리는 좌표가 됩니다.'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '1. Pick Domain' : '1. 영역 선택'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '2. Write Question' : '2. 질문 입력'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '3. Add Coordinates' : '3. 좌표 입력'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Input Grid */}
            <div className="space-y-12">

                {/* 1. Inquiry Vector */}
                <div className={sectionShellClass}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {isEn ? '01. Decision Domain' : '01. Decision Domain (고민 영역)'}
                            </label>
                            <p className="mt-3 text-sm leading-7 text-white/58">
                                {isEn
                                    ? 'Start with the question before the coordinates. Once the oracle knows what you are trying to decide, your birth timing can sharpen the route.'
                                    : '좌표보다 질문부터 정합니다. 무엇을 결정하려는지 먼저 알려주면, 생년월일시는 그 질문을 더 정밀하게 읽는 기준이 됩니다.'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Question-First Intake' : '질문 중심 진입'}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {contexts.map((ctx) => {
                            const isSelected = context === ctx.value;
                            return (
                                <button
                                    key={ctx.value}
                                    type="button"
                                    onClick={() => handleContextSelect(ctx.value)}
                                    className={`rounded-[24px] border p-5 text-left transition-all duration-300 ${isSelected
                                        ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                                        }`}
                                >
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">
                                        {isEn ? ctx.eyebrowEn : ctx.eyebrowKo}
                                    </p>
                                    <h3 className={`mt-3 font-cinzel text-lg ${isSelected ? 'text-acc-gold' : 'text-starlight'}`}>
                                        {isEn ? ctx.labelEn : ctx.labelKo}
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-white/62">
                                        {isEn ? ctx.summaryEn : ctx.summaryKo}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                    {activeContextEyebrow}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-white/62">
                                    {activeContextSummary}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 md:min-w-[230px]">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                    {isEn ? 'Aligned Route' : '정렬된 오라클 경로'}
                                </p>
                                <div className="mt-2 text-base font-cinzel text-starlight">
                                    {routePersona.name}
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">
                                    {isEn ? getOracleIntentLabel(inferredQuestionIntent, 'en') : getOracleIntentLabel(inferredQuestionIntent, 'ko')}
                                </div>
                                <p className="mt-2 text-xs leading-5 text-white/45">
                                    {activeContextLabel}
                                </p>
                            </div>
                        </div>

                        <label className="mt-6 block text-xs uppercase tracking-[0.24em] text-white/38">
                            {isEn ? 'Your Real Question' : '지금 가장 궁금한 질문'}
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={activeQuestionSuggestions[0]}
                            required
                            className="mt-3 h-32 w-full resize-none border border-white/20 bg-white/5 p-4 text-base leading-relaxed text-starlight transition-colors placeholder:text-white/30 focus:border-acc-gold/80 focus:bg-white/10 focus:outline-none md:text-sm"
                        />
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activeQuestionSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setQuestion(suggestion)}
                                    className="min-h-[40px] rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-left text-[11px] leading-5 text-white/68 transition-all hover:border-white/28 hover:text-white"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-[11px] leading-6 text-white/38">
                            {isEn
                                ? 'A concrete question makes the action window, follow-up guidance, and premium upgrade feel much sharper from the first reading.'
                                : '질문이 구체적일수록 첫 리딩부터 행동 결론, follow-up 질문, 프리미엄 심화 가이드가 더 선명해집니다.'}
                        </p>
                    </div>
                </div>

                {/* 2. Oracle Guide Selection */}
                <div className={sectionShellClass}>
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {isEn ? '02. Oracle Guide' : '02. 오라클 가이드'}
                    </label>
                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-acc-gold/25 bg-acc-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                            {selectionMode === 'auto'
                                                ? (isEn ? 'Auto Matched' : '자동 매칭')
                                                : (isEn ? 'Manual Pick' : '직접 선택')}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                            {isEn ? getOracleIntentLabel(inferredQuestionIntent, 'en') : getOracleIntentLabel(inferredQuestionIntent, 'ko')}
                                        </span>
                                        {selectionMode === 'manual' && (
                                            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                                                {isEn ? `Auto Match: ${recommendedPersona.name}` : `자동 매칭: ${recommendedPersona.name}`}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg text-starlight md:text-xl">
                                            {selectionMode === 'auto'
                                                ? (isEn ? 'We aligned the oracle guide that best matches this question.' : '질문 흐름에 맞춰 가장 잘 맞는 오라클 가이드를 먼저 정렬해두었어요.')
                                                : (isEn ? 'Your reading will follow the oracle guide you chose.' : '직접 고른 오라클 가이드의 시선으로 리딩을 진행할게요.')}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                                            {selectionMode === 'auto'
                                                ? (isEn
                                                    ? `${recommendedPersona.name} is matched to ${recommendedPersona.specialty} questions and reads through ${recommendedPersona.archetype}.`
                                                    : `${recommendedPersona.description}`)
                                                : (isEn
                                                    ? `${activePersona.name} will read this through a ${activePersona.specialty} framework.`
                                                    : `${activePersona.description}`)}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 md:min-w-[220px]">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                                        {isEn ? 'Current Guide' : '현재 가이드'}
                                    </p>
                                    <div className="mt-2 text-base font-cinzel text-starlight">
                                        {activePersona.name}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                                        {isEn ? getOracleIntentLabel(activePersona.specialty, 'en') : getOracleIntentLabel(activePersona.specialty, 'ko')}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectionMode('auto');
                                        setCharacterId(recommendedCharacterId);
                                    }}
                                    className={`min-h-[44px] rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition-all ${selectionMode === 'auto'
                                        ? 'border-acc-gold bg-acc-gold text-bg-void'
                                        : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {isEn ? 'Use Auto Match' : '오라클 자동 매칭'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDetailedAdvisors((value) => !value)}
                                    className="min-h-[44px] rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition-all hover:border-white/30 hover:text-white"
                                >
                                    {showDetailedAdvisors
                                        ? (isEn ? 'Hide Detailed Options' : '상세 선택 닫기')
                                        : (isEn ? 'Browse Other Guides' : '다른 가이드 보기')}
                                </button>
                            </div>
                        </div>

                        {showDetailedAdvisors && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {ORACLE_CHARACTER_IDS.map((id) => {
                                    const persona = getOraclePersona(id);
                                    const isSelected = characterId === id;
                                    const isRecommended = recommendedCharacterId === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => {
                                                setCharacterId(id);
                                                setSelectionMode('manual');
                                            }}
                                            className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${isSelected
                                                ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                                                : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className={`font-cinzel text-base tracking-[0.12em] uppercase ${isSelected ? 'text-acc-gold' : 'text-starlight'}`}>
                                                            {persona.name}
                                                        </p>
                                                        {isRecommended && (
                                                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                                                                {isEn ? 'Auto Match' : '자동 매칭'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/40">
                                                        {persona.title}
                                                    </p>
                                                </div>
                                                <div className={`mt-1 h-2.5 w-2.5 rounded-full transition-colors ${isSelected ? 'bg-acc-gold' : 'bg-white/20 group-hover:bg-white/40'}`} />
                                            </div>
                                            <p className="mt-3 text-sm leading-relaxed text-white/70">
                                                {persona.description}
                                            </p>
                                            <p className="mt-2 text-xs leading-relaxed text-white/45">
                                                {isEn
                                                    ? `Priority: ${persona.evidencePriority.join(' > ')}`
                                                    : `근거 우선순위: ${persona.evidencePriority.join(' > ')}`}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Identity */}
                <div className={sectionShellClass}>
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {inviterName
                            ? (isEn ? `03. Your Identity (${inviterName} invited you)` : `03. Your Identity (${inviterName}님의 초대)`)
                            : (isEn ? '03. Subject Identity' : '03. Subject Identity (신원 정보)')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={isEn ? 'NAME (OPTIONAL)' : '이름 / 닉네임 (선택)'}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-base md:text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors placeholder:text-white/10 font-cinzel"
                            />
                            <p className="mt-2 text-[11px] leading-6 text-white/38">
                                {isEn
                                    ? 'A name helps the oracle personalize the reading tone, but you can leave this empty.'
                                    : '이름은 리딩 어조를 더 개인화하는 데만 쓰이므로 비워도 됩니다.'}
                            </p>
                        </div>
                        <div className="flex gap-8 items-end pb-3">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`text-sm tracking-widest uppercase transition-colors ${gender === 'male' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                            >
                                {isEn ? 'Male' : '남성'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`text-sm tracking-widest uppercase transition-colors ${gender === 'female' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                            >
                                {isEn ? 'Female' : '여성'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Temporal Coordinates */}
                <div className={sectionShellClass}>
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {isEn ? '04. Temporal Coordinates' : '04. Temporal Coordinates (생년월일시)'}
                    </label>
                    <p className="mb-6 text-sm leading-7 text-white/58">
                        {isEn
                            ? 'Now add the coordinates that let the oracle refine the question into timing, structure, and evidence.'
                            : '이제 질문을 더 정밀하게 읽을 좌표를 넣습니다. 이 단계에서 행동 시기와 근거 구조가 더 선명해집니다.'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex gap-6 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('solar')}
                                    className={`text-xs tracking-widest uppercase transition-colors pb-1 ${calendarType === 'solar' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                >
                                    {isEn ? 'Solar' : '양력'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('lunar')}
                                    className={`text-xs tracking-widest uppercase transition-colors pb-1 ${calendarType === 'lunar' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                >
                                    {isEn ? 'Lunar' : '음력'}
                                </button>
                            </div>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={birthDate}
                                onChange={(e) => handleDateChange(e.target.value, setBirthDate)}
                                placeholder="YYYY-MM-DD"
                                maxLength={10}
                                className="w-full bg-transparent border-b border-white/20 py-4 text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono uppercase min-h-[50px] block"
                                required
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">YYYY-MM-DD</p>
                        </div>
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={birthTime}
                                onChange={(e) => handleTimeChange(e.target.value, setBirthTime)}
                                placeholder="HH:MM"
                                maxLength={5}
                                disabled={unknownTime}
                                className={`w-full bg-transparent border-b border-white/20 py-4 text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono min-h-[50px] block ${unknownTime ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono tracking-widest mb-4">{isEn ? 'HH:MM (LOCAL TIME)' : 'HH:MM (태어난 시간)'}</p>

                            <div
                                className="flex items-start gap-3 cursor-pointer group/check"
                                onClick={() => {
                                    const newState = !unknownTime;
                                    setUnknownTime(newState);
                                    if (newState) setBirthTime('12:00');
                                }}
                            >
                                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center border transition-colors ${unknownTime ? 'border-acc-gold bg-acc-gold/10' : 'border-white/20 group-hover/check:border-white/40'}`}>
                                    {unknownTime && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                        </svg>
                                    )}
                                </div>
                                <label className="cursor-pointer select-none pt-0.5 text-[10px] leading-tight text-dim transition-colors group-hover/check:text-moonlight">
                                    {isEn
                                        ? 'Unknown Time (Assume 12:00 PM - Accuracy may decrease)'
                                        : '시간 모름 (낮 12:00 기준으로 분석하며, 정확도가 다소 떨어질 수 있습니다)'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Partner Info (Love/Relationship Only) */}
                {context === 'love' && (
                    <div className={sectionShellClass}>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {isEn ? '05. Partner Information (Optional)' : '05. 상대방 정보 (선택사항)'}
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPartnerInfo(!showPartnerInfo)}
                                className={`text-xs tracking-widest uppercase transition-colors ${showPartnerInfo ? 'text-acc-gold' : 'text-dim hover:text-moonlight'}`}
                            >
                                {showPartnerInfo ? (isEn ? 'HIDE' : '접기') : (isEn ? 'EXPAND' : '펼치기')}
                            </button>
                        </div>

                        {showPartnerInfo && (
                            <div className="space-y-6 p-4 border border-white/10 bg-white/5">
                                <p className="text-xs text-dim mb-4">
                                    {isEn
                                        ? "Enter partner's birth info for accurate compatibility analysis. Without this, AI cannot calculate partner's Saju accurately."
                                        : "상대방 생년월일을 입력하면 정확한 궁합/재회 분석이 가능합니다. 미입력 시 AI가 상대방 사주를 정확히 계산할 수 없습니다."}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Partner Name */}
                                    <div>
                                        <input
                                            type="text"
                                            value={partnerName}
                                            onChange={(e) => setPartnerName(e.target.value)}
                                            placeholder={isEn ? "Partner's Name (Optional)" : "상대방 이름 (선택)"}
                                            className="w-full bg-transparent border-b border-white/10 py-3 text-base md:text-sm text-starlight focus:outline-none focus:border-acc-gold transition-colors placeholder:text-white/20"
                                        />
                                    </div>

                                    {/* Partner Gender */}
                                    <div className="flex gap-6 items-end pb-3">
                                        <button
                                            type="button"
                                            onClick={() => setPartnerGender('male')}
                                            className={`text-xs tracking-widest uppercase transition-colors ${partnerGender === 'male' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                        >
                                            {isEn ? 'Male' : '남성'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPartnerGender('female')}
                                            className={`text-xs tracking-widest uppercase transition-colors ${partnerGender === 'female' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                        >
                                            {isEn ? 'Female' : '여성'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Partner Birth Date */}
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={partnerBirthDate}
                                            onChange={(e) => handleDateChange(e.target.value, setPartnerBirthDate)}
                                            placeholder="YYYY-MM-DD"
                                            maxLength={10}
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono"
                                        />
                                        <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">
                                            {isEn ? "PARTNER'S BIRTH DATE" : "상대방 생년월일"}
                                        </p>
                                    </div>

                                    {/* Partner Birth Time */}
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={partnerBirthTime}
                                            onChange={(e) => handleTimeChange(e.target.value, setPartnerBirthTime)}
                                            placeholder="HH:MM"
                                            maxLength={5}
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono"
                                        />
                                        <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">
                                            {isEn ? "PARTNER'S BIRTH TIME (Optional)" : "상대방 생시 (선택)"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Action */}
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
                <button
                    type="submit"
                    disabled={!birthDate || !question.trim() || isLoading}
                    className={`group relative overflow-hidden rounded-full border border-acc-gold/30 bg-gradient-to-r from-acc-gold via-[#f1cf74] to-[#c98d2d] px-12 py-4 text-deep-navy shadow-[0_18px_36px_rgba(212,175,55,0.18)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_22px_46px_rgba(212,175,55,0.24)] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <span className="relative z-10 font-cinzel text-sm font-bold uppercase tracking-[0.3em]">
                        {isLoading
                            ? (isEn ? 'CALCULATING...' : 'CALCULATING...')
                            : (inviteCode
                                ? (isEn ? 'SEE COMPATIBILITY (FREE)' : '무료로 궁합 확인하기')
                                : (isEn ? 'INITIATE SEQUENCE' : '운명 분석 시작')
                            )
                        }
                    </span>
                    <div className="absolute inset-0 bg-white/12 translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0" />
                </button>
                <p className="text-center text-xs tracking-[0.18em] text-white/38 uppercase">
                    {isEn
                        ? 'Your first oracle path opens as soon as the question and coordinates are set.'
                        : '질문과 좌표가 정리되면 첫 오라클 리딩이 바로 열립니다.'}
                </p>
            </div>

        </motion.form>
    );
}
