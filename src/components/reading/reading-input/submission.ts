import type { ReadingContext } from '@/lib/ai/prompt-builder';
import type { OracleCharacterId, OracleQuestionIntent } from '@/lib/ai/oracle-personas';
import type {
    ReadingCalendarType,
    ReadingData,
    ReadingGender,
    ReadingLanguage,
    ReadingSelectionMode,
} from './types';

type BuildReadingSubmissionInput = {
    readonly name: string;
    readonly gender: ReadingGender;
    readonly normalizedBirthDate: string;
    readonly birthTime: string;
    readonly selectedCharacterId: OracleCharacterId;
    readonly inferredQuestionIntent: OracleQuestionIntent;
    readonly selectionMode: ReadingSelectionMode;
    readonly context: ReadingContext;
    readonly question: string;
    readonly language: ReadingLanguage;
    readonly calendarType: ReadingCalendarType;
    readonly unknownTime: boolean;
    readonly cityName: string;
    readonly showPartnerInfo: boolean;
    readonly partnerName: string;
    readonly partnerBirthDate: string;
    readonly partnerBirthTime?: string;
    readonly partnerGender?: ReadingGender;
    readonly inviteCode?: string;
    readonly isNextMoveReportEntry: boolean;
    readonly scenarioA?: string;
    readonly scenarioB?: string;
};

export function buildReadingSubmission({
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
    scenarioA,
    scenarioB,
}: BuildReadingSubmissionInput): ReadingData {
    const isEn = language === 'en';

    return {
        name: name.trim() || (isNextMoveReportEntry ? (isEn ? 'Decision Reader' : '익명') : ''),
        gender,
        birthDate: normalizedBirthDate,
        birthTime: birthTime || '12:00',
        characterId: selectedCharacterId,
        questionIntent: inferredQuestionIntent,
        selectionMode,
        context,
        question: question.trim(),
        language,
        calendarType,
        unknownTime: isNextMoveReportEntry ? (unknownTime || !birthTime) : unknownTime,
        cityName: cityName.trim() || undefined,
        scenarioA: scenarioA?.trim() || undefined,
        scenarioB: scenarioB?.trim() || undefined,
        ...(showPartnerInfo && partnerBirthDate ? {
            partnerName: partnerName || undefined,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
        } : {}),
        inviteCode,
    };
}
