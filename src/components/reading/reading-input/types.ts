import type { ReadingContext } from '@/lib/ai/prompt-builder';
import type {
    OracleCharacterId,
    OraclePersonaProfile,
    OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';

export type ReadingLanguage = 'ko' | 'en';
export type ReadingGender = 'male' | 'female';
export type ReadingCalendarType = 'solar' | 'lunar';
export type ReadingSelectionMode = 'auto' | 'manual';

export type ReadingData = {
    readonly name: string;
    readonly gender: ReadingGender;
    readonly birthDate: string;
    readonly birthTime: string;
    readonly characterId: OracleCharacterId;
    readonly questionIntent?: OracleQuestionIntent;
    readonly selectionMode?: ReadingSelectionMode;
    readonly context: ReadingContext;
    readonly question: string;
    readonly language: ReadingLanguage;
    readonly calendarType: ReadingCalendarType;
    readonly unknownTime: boolean;
    readonly cityName?: string;
    readonly latitude?: number;
    readonly longitude?: number;
    readonly partnerName?: string;
    readonly partnerBirthDate?: string;
    readonly partnerBirthTime?: string;
    readonly partnerGender?: ReadingGender;
    readonly inviteCode?: string;
};

export type ReadingInputProps = {
    readonly onSubmit: (data: ReadingData) => void;
    readonly isLoading?: boolean;
    readonly inviterName?: string;
    readonly inviteCode?: string;
    readonly initialLanguage?: ReadingLanguage;
    readonly onLanguageChange?: (lang: ReadingLanguage) => void;
    readonly initialContext?: ReadingContext;
    readonly initialQuestion?: string;
    readonly initialData?: Partial<ReadingData>;
    readonly isNextMoveReportEntry?: boolean;
    readonly isRelationshipContactEntry?: boolean;
};

export type AlternativeGuideOption = {
    readonly id: OracleCharacterId;
    readonly order: number;
    readonly persona: OraclePersonaProfile;
    readonly strength: string;
    readonly score: number;
};
