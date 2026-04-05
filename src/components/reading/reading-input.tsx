'use client';

/**
 * 리딩 입력 컴포넌트 - Ethereal Brutalism Style
 */

import { useRef, useState } from 'react';
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
import { OracleSelectCard } from '@/components/reading/OracleSelectCard';

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
    'relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.22)] backdrop-blur-xl md:p-6';

export function ReadingInput({ onSubmit, isLoading = false, inviterName, inviteCode }: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
    const [unknownTime, setUnknownTime] = useState(false);
    const [characterId, setCharacterId] = useState<OracleCharacterId>('general_orion');
    const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
    const [showPrecisionFields, setShowPrecisionFields] = useState(Boolean(inviteCode));
    const [context, setContext] = useState<ReadingContext>(inviteCode ? 'love' : 'general');
    const [question, setQuestion] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    // 상대방 정보 state (궁합/재회 분석용)
    const [showPartnerInfo, setShowPartnerInfo] = useState(Boolean(inviteCode));
    const [partnerName, setPartnerName] = useState('');
    const [partnerBirthDate, setPartnerBirthDate] = useState('');
    const [partnerBirthTime, setPartnerBirthTime] = useState('12:00');
    const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('male');
    const questionFieldRef = useRef<HTMLTextAreaElement | null>(null);

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
    const essentialFieldsComplete = Boolean(name.trim() && birthDate);
    const precisionSignals = [
        calendarType === 'solar'
            ? (isEn ? 'Solar Calendar' : '양력')
            : (isEn ? 'Lunar Calendar' : '음력'),
        unknownTime
            ? (isEn ? 'Time Unknown' : '시간 모름')
            : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
        selectionMode === 'auto'
            ? `${isEn ? 'Auto Guide' : '자동 가이드'} ${activePersona.name}`
            : `${isEn ? 'Manual Guide' : '직접 선택'} ${activePersona.name}`,
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

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto space-y-8"
        >
            {/* Header / Language */}
            <div className="border-b border-white/5 pb-4">
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

                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                            {isEn ? 'First Reading Free' : '첫 리딩 무료'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Decision Timing Oracle' : '결정과 타이밍 오라클'}
                        </span>
                    </div>
                    <h2 className="mt-3 font-cinzel text-xl text-starlight md:text-2xl">
                        {isEn ? 'Choose the domain first, then give the oracle one real question.' : '먼저 고민 영역을 고르고, 그다음 진짜 질문 하나를 넘겨주세요.'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                        {isEn
                            ? 'Start from the decision itself. Once the oracle knows the domain and the question, three core fields are enough to open the first route. Precision controls can sharpen it later.'
                            : '결정 그 자체에서 시작합니다. 고민 영역과 질문을 먼저 정하면, 이름·생일·성별 3개만으로 첫 리딩을 열 수 있고, 더 정밀한 설정은 그다음에 더하면 됩니다.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '1. Pick Domain' : '1. 영역 선택'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '2. Write Question' : '2. 질문 입력'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '3. Core Fields' : '3. 기본 3필드'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            {isEn ? '4. Precision Optional' : '4. 정밀 설정 선택'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Input Grid */}
            <div className="flex flex-col gap-8">

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
                                    : '좌표보다 질문부터 정합니다. 무엇을 결정하려는지 먼저 알려주면, 생년월일시는 그 질문을 더 정밀하게 읽는 기준이 됩니다.'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? 'Question-First Intake' : '질문 중심 진입'}
                        </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
                        {contexts.map((ctx) => {
                            const isSelected = context === ctx.value;
                            return (
                                <button
                                    key={ctx.value}
                                    type="button"
                                    onClick={() => handleContextSelect(ctx.value)}
                                    className={`rounded-[20px] border px-4 py-3 text-left transition-all duration-300 ${isSelected
                                        ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                                        }`}
                                >
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">
                                        {isEn ? ctx.eyebrowEn : ctx.eyebrowKo}
                                    </p>
                                    <h3 className={`mt-2 font-cinzel text-sm md:text-base ${isSelected ? 'text-acc-gold' : 'text-starlight'}`}>
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
                            {isEn ? 'Your Real Question' : '지금 가장 궁금한 질문'}
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
                                : '질문이 구체적일수록 첫 리딩부터 행동 결론, follow-up 질문, 프리미엄 심화 가이드가 더 선명해집니다.'}
                        </p>
                    </div>
                </div>

                {/* 2. Essential Coordinates */}
                <div className={`${sectionShellClass} order-2`}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {inviterName
                                    ? (isEn ? `02. Core Profile (${inviterName} invited you)` : `02. Core Profile (${inviterName}님의 초대)`)
                                    : (isEn ? '02. Core Profile' : '02. 핵심 프로필')}
                            </label>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'Keep the first step light: name, birth date, and gender are enough to open the first route. Precision controls stay folded until you want them.'
                                    : '첫 진입은 가볍게 갑니다. 이름, 생일, 성별만으로도 첫 경로를 열 수 있고, 더 세밀한 설정은 필요할 때만 펼치면 됩니다.'}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {isEn ? '3 Core Fields First' : '기본 3필드 먼저'}
                        </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr_0.9fr]">
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Name' : '이름'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={isEn ? 'Your name or nickname' : '이름 또는 닉네임'}
                                required
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Birth Date' : '생년월일'}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={birthDate}
                                onChange={(e) => handleDateChange(e.target.value, setBirthDate)}
                                placeholder="YYYY-MM-DD"
                                maxLength={10}
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none font-mono uppercase"
                                required
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">YYYY-MM-DD</p>
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
                    </div>

                    <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-acc-gold">
                                {essentialFieldsComplete
                                    ? (isEn ? 'Core Fields Ready' : '기본 3필드 준비됨')
                                    : (isEn ? '3 Core Fields' : '기본 3필드')}
                            </span>
                            {precisionSignals.map((signal) => (
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
                                    ? 'Birth time, calendar type, partner data, and manual guide selection stay under one precision toggle so the first reading opens faster.'
                                    : '생시, 음양력, 상대 정보, 오라클 직접 선택은 모두 하나의 정밀 토글 안에 넣어 두었습니다. 그래서 첫 리딩은 더 빠르게 열리고, 필요할 때만 깊이를 더할 수 있습니다.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowPrecisionFields((value) => !value)}
                                className="min-h-[42px] rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/30 hover:text-white"
                            >
                                {showPrecisionFields
                                    ? (isEn ? 'Hide Precision Controls' : '기본 입력만 보기')
                                    : (isEn ? 'Open Precision Controls' : '더 정밀하게 읽기')}
                            </button>
                        </div>
                    </div>
                </div>

                {showPrecisionFields && (
                    <>
                        {/* 3. Precision Controls */}
                        <div className={`${sectionShellClass} order-3`}>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                                {isEn ? '03. Precision Controls' : '03. 더 정밀하게'}
                            </label>
                            <p className="mb-4 text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'Open the deeper layer only when you want tighter timing windows, alternate calendar input, or a more deliberate guide selection.'
                                    : '시기 창을 더 좁히거나, 음양력을 바꾸거나, 오라클 가이드를 직접 고르고 싶을 때만 펼치면 됩니다.'}
                            </p>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                        {isEn ? 'Birth Time' : '태어난 시간'}
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={birthTime}
                                        onChange={(e) => handleTimeChange(e.target.value, setBirthTime)}
                                        placeholder="HH:MM"
                                        maxLength={5}
                                        disabled={unknownTime}
                                        className={`mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none font-mono ${
                                            unknownTime ? 'cursor-not-allowed opacity-30' : ''
                                        }`}
                                    />
                                    <p className="mt-2 text-[10px] text-dim font-mono tracking-widest">
                                        {isEn ? 'HH:MM (LOCAL TIME)' : 'HH:MM (현지 시간)'}
                                    </p>
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

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newState = !unknownTime;
                                            setUnknownTime(newState);
                                            if (newState) setBirthTime('12:00');
                                        }}
                                        className="mt-4 flex items-start gap-3 text-left"
                                    >
                                        <div
                                            className={`mt-0.5 flex h-4 w-4 items-center justify-center border transition-colors ${
                                                unknownTime
                                                    ? 'border-acc-gold bg-acc-gold/10'
                                                    : 'border-white/20'
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
                                                ? 'Unknown time: use 12:00 PM as a safe midpoint.'
                                                : '시간을 모르면 낮 12:00을 안전한 기준점으로 사용합니다.'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Partner Info (Love/Relationship Only) */}
                        {context === 'love' && (
                            <div className={`${sectionShellClass} order-4`}>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                        {isEn ? '04. Partner Information (Optional)' : '04. 상대방 정보 (선택)'}
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

                        {/* 5. Oracle Guide */}
                        <div className={`${sectionShellClass} order-5`}>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                                {isEn ? '05. Oracle Guide' : '05. 오라클 가이드'}
                            </label>

                            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-acc-gold/25 bg-acc-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                        {selectionMode === 'auto'
                                            ? (isEn ? 'Auto Matched' : '자동 매칭')
                                            : (isEn ? 'Manual Pick' : '직접 선택')}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                        {activePersona.name}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                        {isEn
                                            ? getOracleIntentLabel(inferredQuestionIntent, 'en')
                                            : getOracleIntentLabel(inferredQuestionIntent, 'ko')}
                                    </span>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-white/58">
                                    {isEn
                                        ? 'Auto match stays as the default. If you want a different lens, pick one of the seven specialists below and the reading will switch to that advisor.'
                                        : '기본값은 자동 매칭입니다. 다른 시선으로 읽고 싶다면 아래 7인의 상담가 카드 중 하나를 직접 골라 리딩 렌즈를 바꿀 수 있습니다.'}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode('auto')}
                                        className={`min-h-[38px] rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition-all ${
                                            selectionMode === 'auto'
                                                ? 'border-acc-gold bg-acc-gold text-bg-void'
                                                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {isEn ? 'Use Auto Match' : '오라클 자동 매칭'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectionMode('manual')}
                                        className={`min-h-[38px] rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] transition-all ${
                                            selectionMode === 'manual'
                                                ? 'border-acc-gold bg-acc-gold text-bg-void'
                                                : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {isEn ? 'Pick Manually' : '직접 고르기'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                {ORACLE_CHARACTER_IDS.map((id) => {
                                    const persona = getOraclePersona(id);
                                    const isSelected = characterId === id;
                                    const isRecommended = recommendedCharacterId === id;

                                    return (
                                        <OracleSelectCard
                                            key={id}
                                            language={language}
                                            persona={persona}
                                            selected={selectionMode === 'auto' ? isRecommended : isSelected}
                                            recommended={isRecommended}
                                            onSelect={() => {
                                                setCharacterId(id);
                                                setSelectionMode('manual');
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* Action */}
            <div className="flex flex-col items-center justify-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={!name.trim() || !birthDate || !question.trim() || isLoading}
                    className={`group relative overflow-hidden rounded-full border border-acc-gold/30 bg-gradient-to-r from-acc-gold via-[#f1cf74] to-[#c98d2d] px-10 py-3.5 text-deep-navy shadow-[0_18px_36px_rgba(212,175,55,0.18)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_22px_46px_rgba(212,175,55,0.24)] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
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
                <p className="text-center text-[11px] tracking-[0.16em] text-white/38 uppercase">
                    {isEn
                        ? 'Your first oracle path opens as soon as the question and coordinates are set.'
                        : '질문과 좌표가 정리되면 첫 오라클 리딩이 바로 열립니다.'}
                </p>
            </div>

        </motion.form>
    );
}
