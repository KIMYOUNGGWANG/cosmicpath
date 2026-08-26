'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { ReadingContext } from '@/lib/ai/prompt-builder';
import {
    getOracleIntentLabel,
    getOraclePersona,
    getRecommendedOracleCharacterId,
    inferQuestionIntent,
    type OracleCharacterId,
} from '@/lib/ai/oracle-personas';
import { getGuideFitCopy } from '@/components/reading/intake/guide-fit-copy';
import { INTAKE_SECTION_COPY } from '@/components/reading/intake/reception-copy';
import { READING_CONTEXTS } from '@/components/reading/intake/reading-context-options';
import { hasExactBirthDate } from '@/lib/birth-date';
import { buildCoreSignals } from './core-signals';
import { buildAlternativeGuideOptions } from './guide-options';
import { buildReadingSubmission } from './submission';
import type {
    ReadingCalendarType,
    ReadingGender,
    ReadingInputProps,
    ReadingLanguage,
    ReadingSelectionMode,
} from './types';

type UseReadingInputControllerInput = {
    readonly onSubmit: ReadingInputProps['onSubmit'];
    readonly isLoading: boolean;
    readonly inviteCode?: string;
    readonly initialLanguage: ReadingLanguage;
    readonly onLanguageChange?: ReadingInputProps['onLanguageChange'];
    readonly initialContext?: ReadingContext;
    readonly initialQuestion?: string;
    readonly initialData?: ReadingInputProps['initialData'];
    readonly isNextMoveReportEntry: boolean;
    readonly isRelationshipContactEntry: boolean;
};

export function useReadingInputController({
    onSubmit,
    isLoading,
    inviteCode,
    initialLanguage,
    onLanguageChange,
    initialContext,
    initialQuestion,
    initialData,
    isNextMoveReportEntry,
    isRelationshipContactEntry,
}: UseReadingInputControllerInput) {
    const [name, setName] = useState(initialData?.name ?? '');
    const [gender, setGender] = useState<ReadingGender>(initialData?.gender ?? 'male');
    const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? '');
    const [birthTime, setBirthTime] = useState(initialData?.birthTime ?? '12:00');
    const [calendarType, setCalendarType] = useState<ReadingCalendarType>(initialData?.calendarType ?? 'solar');
    const [unknownTime, setUnknownTime] = useState(initialData?.unknownTime ?? false);
    const [cityName, setCityName] = useState(initialData?.cityName ?? '');
    const [characterId, setCharacterId] = useState<OracleCharacterId>(initialData?.characterId ?? 'general_orion');
    const [selectionMode, setSelectionMode] = useState<ReadingSelectionMode>(initialData?.selectionMode ?? 'auto');
    const [showPrecisionFields, setShowPrecisionFields] = useState(
        Boolean(inviteCode || initialData?.partnerName || initialData?.partnerBirthDate)
    );
    const [context, setContext] = useState<ReadingContext>(
        initialData?.context ?? (inviteCode ? 'love' : initialContext ?? 'general')
    );
    const [question, setQuestion] = useState(initialData?.question ?? initialQuestion ?? '');
    const [languageOverride, setLanguageOverride] = useState<ReadingLanguage | null>(null);
    const [showPartnerInfo, setShowPartnerInfo] = useState(
        Boolean(inviteCode || initialData?.partnerBirthDate || initialData?.partnerName)
    );
    const [partnerName, setPartnerName] = useState(initialData?.partnerName ?? '');
    const [partnerBirthDate, setPartnerBirthDate] = useState(initialData?.partnerBirthDate ?? '');
    const [partnerBirthTime, setPartnerBirthTime] = useState(initialData?.partnerBirthTime ?? '12:00');
    const [partnerGender, setPartnerGender] = useState<ReadingGender>(initialData?.partnerGender ?? 'male');
    const [showAllGuides, setShowAllGuides] = useState(false);
    const questionFieldRef = useRef<HTMLTextAreaElement | null>(null);

    const language = languageOverride ?? initialLanguage;
    const isEn = language === 'en';
    const intakeCopy = INTAKE_SECTION_COPY[language];
    const inferredQuestionIntent = inferQuestionIntent({ context, question, partnerBirthDate, partnerName });
    const recommendedCharacterId = getRecommendedOracleCharacterId({
        context,
        question,
        partnerBirthDate,
        partnerName,
        questionIntent: inferredQuestionIntent,
    });
    const selectedCharacterId = selectionMode === 'auto' ? recommendedCharacterId : characterId;
    const routePersona = getOraclePersona(selectedCharacterId);
    const activeContext = READING_CONTEXTS.find((item) => item.value === context) ?? READING_CONTEXTS[READING_CONTEXTS.length - 1];
    const activeQuestionSuggestions = isEn ? activeContext.questionSuggestionsEn : activeContext.questionSuggestionsKo;
    const normalizedBirthDate = birthDate.trim();
    const hasCompleteBirthDate = hasExactBirthDate(normalizedBirthDate);
    const coreFieldsComplete = isNextMoveReportEntry
        ? Boolean(question.trim() && hasCompleteBirthDate)
        : Boolean(name.trim() && hasCompleteBirthDate && (unknownTime || birthTime) && question.trim());

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
        if (nextContext === 'love') setShowPartnerInfo(true);
        if (!nextContextOption || question.trim()) return;

        const firstSuggestion = isEn
            ? nextContextOption.questionSuggestionsEn[0]
            : nextContextOption.questionSuggestionsKo[0];
        if (firstSuggestion) applyQuestionSuggestion(firstSuggestion);
    };

    const handleLanguageSelect = (nextLanguage: ReadingLanguage) => {
        setLanguageOverride(nextLanguage);
        onLanguageChange?.(nextLanguage);
    };

    const handleGuideSelect = (id: OracleCharacterId) => {
        setCharacterId(id);
        setSelectionMode('manual');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!coreFieldsComplete) return;

        onSubmit(buildReadingSubmission({
            name,
            gender,
            normalizedBirthDate,
            birthTime,
            selectedCharacterId,
            inferredQuestionIntent,
            selectionMode,
            context,
            question,
            language,
            calendarType,
            unknownTime,
            cityName,
            showPartnerInfo,
            partnerName,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
            inviteCode,
            isNextMoveReportEntry,
        }));
    };

    return {
        activeContextLabel: isEn ? activeContext.labelEn : activeContext.labelKo,
        alternativeGuides: buildAlternativeGuideOptions({
            language,
            context,
            questionIntent: inferredQuestionIntent,
            recommendedCharacterId,
            selectedCharacterId,
        }),
        birthDate,
        birthTime,
        calendarType,
        cityName,
        context,
        coreFieldsComplete,
        coreSignals: buildCoreSignals({
            isNextMoveReportEntry,
            isEn,
            name,
            normalizedBirthDate,
            birthDate,
            hasCompleteBirthDate,
            birthTime,
            unknownTime,
            calendarType,
            cityName,
        }),
        gender,
        guideFitCopy: getGuideFitCopy(routePersona.specialty, routePersona.name, language, question),
        guideStrengths: isEn ? routePersona.strengthsEn : routePersona.strengthsKo,
        applyQuestionSuggestion,
        handleContextSelect,
        handleGuideSelect,
        handleLanguageSelect,
        handleSubmit,
        inferredQuestionIntent,
        intakeCopy,
        inviteCode,
        isLoading,
        isNextMoveReportEntry,
        isRelationshipContactEntry,
        isSubmitDisabled: isNextMoveReportEntry
            ? !question.trim() || !hasCompleteBirthDate || isLoading
            : !name.trim() || !hasCompleteBirthDate || !question.trim() || (!unknownTime && !birthTime) || isLoading,
        language,
        name,
        partnerBirthDate,
        partnerBirthTime,
        partnerGender,
        partnerName,
        question,
        questionFieldRef,
        questionPlaceholder: activeQuestionSuggestions[0] ?? '',
        questionSuggestions: activeQuestionSuggestions.slice(0, 3),
        recommendedCharacterId,
        routePersona,
        selectedCharacterId,
        selectionMode,
        setBirthDate,
        setBirthTime,
        setCalendarType,
        setCityName,
        setGender,
        setName,
        setPartnerBirthDate,
        setPartnerBirthTime,
        setPartnerGender,
        setPartnerName,
        setQuestion,
        setShowAllGuides,
        setShowPartnerInfo,
        setShowPrecisionFields,
        showAllGuides,
        showPartnerInfo,
        showPrecisionFields,
        unknownTime,
        setUnknownTime,
        isUsingRecommendedGuide: selectedCharacterId === recommendedCharacterId,
        intentLabel: getOracleIntentLabel(inferredQuestionIntent, language),
    };
}
