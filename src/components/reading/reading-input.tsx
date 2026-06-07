'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ReadingContext } from '@/lib/ai/prompt-builder';
import { BIRTH_CITY_OPTIONS } from '@/lib/saju/city-options';
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
import { getGuideAlternativeScore, getGuideFitCopy } from '@/components/reading/intake/guide-fit-copy';
import { INTAKE_SECTION_COPY } from '@/components/reading/intake/reception-copy';
import { PRIMARY_ENGLISH_GUIDE_HREF, READING_CONTEXTS } from '@/components/reading/intake/reading-context-options';

interface ReadingInputProps {
    onSubmit: (data: ReadingData) => void;
    isLoading?: boolean;
    inviterName?: string;
    inviteCode?: string;
    initialLanguage?: 'ko' | 'en';
    onLanguageChange?: (lang: 'ko' | 'en') => void;
    initialContext?: ReadingContext;
    initialQuestion?: string;
    initialData?: Partial<ReadingData>;
    isNextMoveReportEntry?: boolean;
    isRelationshipContactEntry?: boolean;
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
    latitude?: number;
    longitude?: number;
    partnerName?: string;
    partnerBirthDate?: string;
    partnerBirthTime?: string;
    partnerGender?: 'male' | 'female';
    inviteCode?: string;
}

const sectionShellClass =
    'relative overflow-hidden rounded-[18px] border border-[#d7c59a]/20 bg-[#121416]/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] md:p-6';

export function ReadingInput({
    onSubmit,
    isLoading = false,
    inviterName,
    inviteCode,
    initialLanguage = 'ko',
    onLanguageChange,
    initialContext,
    initialQuestion,
    initialData,
    isNextMoveReportEntry = false,
    isRelationshipContactEntry = false,
}: ReadingInputProps) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [gender, setGender] = useState<'male' | 'female'>(initialData?.gender ?? 'male');
    const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? '');
    const [birthTime, setBirthTime] = useState(initialData?.birthTime ?? '12:00');
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(initialData?.calendarType ?? 'solar');
    const [unknownTime, setUnknownTime] = useState(initialData?.unknownTime ?? false);
    const [cityName, setCityName] = useState(initialData?.cityName ?? '');
    const [characterId, setCharacterId] = useState<OracleCharacterId>(initialData?.characterId ?? 'general_orion');
    const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>(initialData?.selectionMode ?? 'auto');
    const [showPrecisionFields, setShowPrecisionFields] = useState(
        Boolean(
            inviteCode ||
            initialData?.partnerName ||
            initialData?.partnerBirthDate
        )
    );
    const [context, setContext] = useState<ReadingContext>(
        initialData?.context ?? (inviteCode ? 'love' : initialContext ?? 'general')
    );
    const [question, setQuestion] = useState(initialData?.question ?? initialQuestion ?? '');
    const [languageOverride, setLanguageOverride] = useState<'ko' | 'en' | null>(null);

    const [showPartnerInfo, setShowPartnerInfo] = useState(
        Boolean(inviteCode || initialData?.partnerBirthDate || initialData?.partnerName)
    );
    const [partnerName, setPartnerName] = useState(initialData?.partnerName ?? '');
    const [partnerBirthDate, setPartnerBirthDate] = useState(initialData?.partnerBirthDate ?? '');
    const [partnerBirthTime, setPartnerBirthTime] = useState(initialData?.partnerBirthTime ?? '12:00');
    const [partnerGender, setPartnerGender] = useState<'male' | 'female'>(initialData?.partnerGender ?? 'male');
    const [showAllGuides, setShowAllGuides] = useState(false);
    const questionFieldRef = useRef<HTMLTextAreaElement | null>(null);

    const language = languageOverride ?? initialLanguage;
    const isEn = language === 'en';
    const intakeCopy = INTAKE_SECTION_COPY[language];
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
    const activeContext = READING_CONTEXTS.find((item) => item.value === context) ?? READING_CONTEXTS[READING_CONTEXTS.length - 1];
    const activeContextLabel = isEn ? activeContext.labelEn : activeContext.labelKo;
    const activeQuestionSuggestions = isEn
        ? activeContext.questionSuggestionsEn
        : activeContext.questionSuggestionsKo;
    const visibleQuestionSuggestions = activeQuestionSuggestions.slice(0, 2);
    const routePersona = activePersona;
    const guideStrengths = isEn ? activePersona.strengthsEn : activePersona.strengthsKo;
    const isUsingRecommendedGuide = selectedCharacterId === recommendedCharacterId;
    const guideFitCopy = getGuideFitCopy(routePersona.specialty, routePersona.name, language, question);
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
    const coreFieldsComplete = isNextMoveReportEntry
        ? Boolean(question.trim())
        : Boolean(name.trim() && birthDate && (unknownTime || birthTime) && question.trim());
    const coreSignals = isNextMoveReportEntry
        ? [
            name.trim()
                ? (isEn ? `Name ${name.trim()}` : `이름 ${name.trim()}`)
                : (isEn ? 'Name Optional' : '이름 선택'),
            birthDate
                ? (isEn ? `Birth Date ${birthDate}` : `생년월일 ${birthDate}`)
                : (isEn ? 'Birth Data Optional' : '생년월일 선택'),
            unknownTime || !birthTime
                ? (isEn ? 'Unknown Time OK' : '생시 몰라도 진행')
                : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
            isEn ? 'Tarot Prep Ready' : '타로 준비 가능',
        ]
        : [
            name.trim()
                ? (isEn ? `Name ${name.trim()}` : `이름 ${name.trim()}`)
                : (isEn ? 'Name Needed' : '이름 필요'),
            calendarType === 'solar'
                ? (isEn ? 'Solar Calendar' : '양력')
                : (isEn ? 'Lunar Calendar' : '음력'),
            cityName.trim()
                ? (isEn ? `Birth City ${cityName.trim()}` : `출생지 ${cityName.trim()}`)
                : (isEn ? 'Birth City Recommended' : '출생지 권장'),
            unknownTime
                ? (isEn ? 'Time Unknown' : '시간 모름')
                : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
        ];

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
        const nextContextOption = READING_CONTEXTS.find((item) => item.value === nextContext);

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
        const resolvedName = name.trim() || (isNextMoveReportEntry ? (isEn ? 'Decision Reader' : '익명') : '');
        const resolvedBirthDate = birthDate || (isNextMoveReportEntry ? '1990-01-01' : '');
        const resolvedBirthTime = birthTime || '12:00';
        const resolvedUnknownTime = isNextMoveReportEntry ? (unknownTime || !birthTime) : unknownTime;

        onSubmit({
            name: resolvedName,
            gender,
            birthDate: resolvedBirthDate,
            birthTime: resolvedBirthTime,
            characterId: selectedCharacterId,
            questionIntent: inferredQuestionIntent,
            selectionMode,
            context,
            question: question.trim(),
            language,
            calendarType,
            unknownTime: resolvedUnknownTime,
            cityName: cityName.trim() || undefined,
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
                        {intakeCopy.sequenceLabel}
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
                <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[#d7c59a]/18 bg-[#0f1113] p-4 md:mt-5 md:flex-row md:items-end md:justify-between md:p-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="border border-[#d7c59a]/25 bg-[#d7c59a]/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d7c59a]">
                                {isEn ? 'First verdict free' : '첫 판정 무료'}
                            </span>
                            <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                {intakeCopy.sequenceSummary}
                            </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/62">
                            {isRelationshipContactEntry
                                ? (isEn
                                    ? 'Ask the contact-or-wait decision first. Birth details and tarot are optional layers that sharpen why this direction was chosen.'
                                    : '연락할까, 기다릴까 질문을 먼저 적어주세요. 생년월일과 타로는 왜 이 방향인지 선명하게 만드는 선택 근거입니다.')
                                : (isEn
                                    ? 'Ask one real question. Birth details and tarot sharpen the answer without turning it into a generic reading.'
                                    : '지금 풀고 싶은 질문 하나를 적어주세요. 생년월일과 타로 선택은 결과의 근거를 더 선명하게 만드는 데만 씁니다.')}
                        </p>
                    </div>
                    {isEn ? (
                        <Link
                            href={PRIMARY_ENGLISH_GUIDE_HREF}
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
                                {intakeCopy.questionLabel}
                            </label>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isRelationshipContactEntry
                                    ? (isEn
                                        ? 'Write the DM or relationship move you are considering. The first verdict separates contact, wait, narrow, or hold.'
                                        : '고민 중인 DM이나 관계 행동을 적어주세요. 첫 판정은 연락, 대기, 축소, 보류 중 어디에 가까운지부터 분리합니다.')
                                : (isEn
                                    ? 'Choose the area, then write the question. The first verdict turns it into move, wait, narrow, or stop.'
                                    : '영역을 고르고 질문을 적어주세요. 첫 판정은 움직일지, 기다릴지, 좁힐지, 멈출지부터 답합니다.')}
                            </p>
                        </div>
                        <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {intakeCopy.questionEyebrow}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:grid-cols-3">
                        {READING_CONTEXTS.map((ctx) => {
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
                            {isRelationshipContactEntry
                                ? (isEn
                                    ? 'Concrete context produces a sharper contact direction, cleaner evidence, and a safer message boundary.'
                                    : '상황이 구체적일수록 연락 방향, 근거 요약, 다음 연락 행동이 더 안전하고 선명해집니다.')
                                : (isEn
                                    ? 'Concrete questions produce sharper notes, cleaner evidence, and a more useful action window.'
                                    : '질문이 구체적일수록 방향, 근거, 행동 시점이 훨씬 선명해집니다.')}
                        </p>
                    </div>
                </div>

                <div className={sectionShellClass}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <label className="block text-xs text-acc-gold tracking-widest uppercase">
                                {isEn ? 'Recommended Lens' : '이번 질문의 정리 관점'}
                            </label>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                                {isEn 
                                    ? "Reads the overall flow and points to the single most important path right now."
                                    : "질문 전체의 흐름을 읽고, 지금 가장 먼저 정리해야 할 기준을 잡아줍니다."}
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
                                {intakeCopy.birthLabel}
                            </label>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isNextMoveReportEntry
                                    ? (isRelationshipContactEntry
                                        ? (isEn
                                        ? 'Add birth details only when you want saju, astrology, or numerology to sharpen the rationale. The contact verdict can start from the question alone.'
                                        : '사주, 점성술, 수비학 근거를 더 선명하게 보고 싶을 때만 생년월일 정보를 더하세요. 연락 판정은 질문 하나로도 시작할 수 있습니다.')
                                        : (isEn
                                            ? 'Add birth details only when you want the saju and astrology layers to sharpen why this decision leaned move, wait, narrow, or stop.'
                                            : '왜 움직임/대기/축소/보류 판정이 나왔는지 더 선명하게 보고 싶을 때만 생년월일 정보를 더하세요.'))
                                    : (isEn
                                        ? 'For saju, astrology timing, numerology, and true-solar-time calibration, the first result can use your name, birth date, birth city, birth time, gender, and calendar.'
                                        : '사주, 점성 타이밍, 수비학과 진태양시 보정을 함께 쓰기 때문에 이름, 생년월일, 출생 도시, 태어난 시간, 성별, 양력/음력을 함께 받을 수 있습니다.')}
                            </p>
                        </div>
                        <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {intakeCopy.birthEyebrow}
                        </span>
                    </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2">
                        <div>
                            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Name' : '이름'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={isEn ? 'Name used for numerology' : '수비학에 반영할 이름'}
                                required={!isNextMoveReportEntry}
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                            />
                            <p className="mt-2 text-[11px] leading-5 text-white/42">
                                {isEn
                                    ? 'We use your name for the numerology layer and a more grounded reading voice.'
                                    : '이름은 수비학 레이어와 결과 호칭에 함께 반영됩니다.'}
                            </p>
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
                                pattern="\d{4}-\d{2}-\d{2}"
                                required={!isNextMoveReportEntry}
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
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
                                {isEn ? 'Birth City' : '출생 도시'}
                            </label>
                            <input
                                type="text"
                                list="birth-city-options"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                placeholder={isEn ? 'Seoul, Busan, Jeju...' : '서울, 부산, 제주...'}
                                className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                            />
                            <datalist id="birth-city-options">
                                {BIRTH_CITY_OPTIONS.map((city) => (
                                    <option
                                        key={city.value}
                                        value={isEn ? city.labelEn : city.labelKo}
                                    />
                                ))}
                            </datalist>
                            <p className="mt-2 text-[11px] leading-5 text-white/42">
                                {isEn
                                    ? 'Recommended for true-solar-time correction. If omitted, the reading falls back to Seoul.'
                                    : '진태양시 보정용 권장 입력입니다. 비워두면 서울 기준으로 계산됩니다.'}
                            </p>
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
                                {isNextMoveReportEntry
                                    ? (isRelationshipContactEntry
                                        ? (isEn
                                        ? 'The free contact verdict starts from your question. If you skip birth data, the system uses neutral defaults and labels those layers as optional evidence, not the product promise.'
                                        : '무료 연락 판정은 질문에서 먼저 시작합니다. 생년월일을 비우면 중립 기본값으로 진행하고, 해당 레이어는 상품명이 아닌 선택 근거로만 표시합니다.')
                                        : (isEn
                                            ? 'The free decision brief starts from your question. Empty birth fields use neutral defaults and stay labeled as optional evidence layers.'
                                            : '무료 결정 브리프는 질문에서 먼저 시작합니다. 생년월일을 비우면 중립 기본값으로 진행하고, 해당 레이어는 선택 근거로만 표시합니다.'))
                                    : (isEn
                                        ? 'The first result now uses the quality-critical inputs up front: name for numerology, birth city for calibration, and the core saju fields for the initial read.'
                                        : '무료 결과도 이제 이름, 출생 도시, 핵심 사주 입력을 먼저 반영합니다. 수비학과 보정 정확도를 초반부터 같이 잡는 구조입니다.')}
                            </p>
                        </div>
                    </div>
                </div>

                {context === 'love' && (
                    <>
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => setShowPrecisionFields((value) => !value)}
                                className="min-h-[48px] w-full rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/30 hover:text-white md:w-auto"
                            >
                                {showPrecisionFields
                                    ? (isEn ? 'Hide Relationship Inputs' : '상대 정보 닫기')
                                    : (isEn ? 'Open Relationship Inputs' : '상대 정보 열기')}
                            </button>
                        </div>

                        {showPrecisionFields && (
                            <div className={`${sectionShellClass} order-3`}>
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
                <div className="w-full rounded-[18px] border border-[#d7c59a]/20 bg-[#0f1113] p-4 text-left md:max-w-2xl md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-acc-gold">
                                {intakeCopy.tarotLabel}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {intakeCopy.tarotSummary}
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 border border-[#d7c59a]/18 bg-[#d7c59a]/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d7c59a]/70">
                            <span className="h-px w-4 bg-[#d7c59a]/35" />
                            {isEn ? 'Final layer' : '마지막 근거'}
                        </span>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isNextMoveReportEntry ? (!question.trim() || isLoading) : (!name.trim() || !birthDate || !question.trim() || (!unknownTime && !birthTime) || isLoading)}
                    className={`group relative grid w-full max-w-[380px] grid-cols-[72px_1fr_58px] overflow-hidden border border-[#d7c59a]/42 bg-[#0c0d0b] text-left text-starlight shadow-[0_22px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7c59a]/72 hover:bg-[#11110e] md:w-[380px] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <span className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#d7c59a]/28 bg-[#080806]" />
                    <span className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#d7c59a]/28 bg-[#080806]" />
                    <span className="pointer-events-none absolute inset-x-4 top-2 h-px bg-[#d7c59a]/12 transition-colors group-hover:bg-[#d7c59a]/24" />
                    <span className="relative flex min-h-[72px] flex-col items-center justify-center border-r border-[#d7c59a]/24 bg-[#d7c59a]/[0.08]">
                        <span className="font-cinzel text-[17px] leading-none text-[#d7c59a]">
                            {isLoading ? '…' : '01'}
                        </span>
                        <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-[#d7c59a]/62">
                            {isEn ? 'Free' : '무료'}
                        </span>
                    </span>
                    <span className="relative flex min-h-[72px] flex-col justify-center px-5 py-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#d7c59a]/58">
                            {isEn ? 'First verdict' : '첫 판정'}
                        </span>
                        <span className="mt-1 font-cinzel text-base font-semibold tracking-[0.18em] text-starlight">
                            {isLoading
                                ? (isEn ? 'CALCULATING...' : 'CALCULATING...')
                                : (inviteCode
                                    ? (isEn ? 'OPEN COMPATIBILITY' : '궁합 판정 열기')
                                    : (isEn ? 'OPEN FIRST VERDICT' : '첫 판정 열기')
                                )
                            }
                        </span>
                    </span>
                    <span className="relative flex min-h-[72px] items-center justify-center border-l border-[#d7c59a]/24 bg-[#d7c59a]/[0.05] text-2xl text-[#d7c59a] transition-colors group-hover:bg-[#d7c59a]/[0.1]">
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                </button>
                <p className="text-center text-[11px] tracking-[0.16em] text-white/38 uppercase">
                    {isEn
                        ? 'One intake opens the first verdict, evidence, and next action.'
                        : '한 번 입력하면 판정, 근거, 다음 행동이 먼저 열립니다.'}
                </p>
            </div>

        </motion.form>
    );
}
