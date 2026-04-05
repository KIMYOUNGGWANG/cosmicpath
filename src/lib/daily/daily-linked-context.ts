import type { ReadingContext } from '@/lib/ai/prompt-builder';
import type { OracleQuestionIntent } from '@/lib/ai/oracle-personas';

export interface DailyLinkedOracleContext {
    readingId?: string;
    createdAt?: string;
    question?: string;
    questionIntent?: OracleQuestionIntent;
    context?: ReadingContext;
    advisorName?: string;
    advisorTitle?: string;
    actionConclusion?: string;
    birthDate?: string;
    birthTime?: string;
}

export type DailyLinkedArea = 'love' | 'money' | 'career' | 'health';

const QUESTION_INTENTS = new Set<OracleQuestionIntent>([
    'general',
    'compatibility',
    'reunion',
    'wealth',
    'timing',
    'career',
    'business',
]);

const READING_CONTEXTS = new Set<ReadingContext>([
    'career',
    'love',
    'money',
    'health',
    'general',
]);

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function getString(record: Record<string, unknown> | null, key: string): string | undefined {
    const value = record?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseJsonRecord(input?: string | null): Record<string, unknown> | null {
    if (!input) return null;

    try {
        return asRecord(JSON.parse(input));
    } catch {
        return null;
    }
}

function getQuestionIntent(value?: string): OracleQuestionIntent | undefined {
    return value && QUESTION_INTENTS.has(value as OracleQuestionIntent)
        ? value as OracleQuestionIntent
        : undefined;
}

function getReadingContext(value?: string): ReadingContext | undefined {
    return value && READING_CONTEXTS.has(value as ReadingContext)
        ? value as ReadingContext
        : undefined;
}

export function parseDailyLinkedOracleContext(input: {
    readingId?: string;
    createdAt?: string | Date;
    metadata?: string | null;
    data?: string | null;
}): DailyLinkedOracleContext | null {
    const metadata = parseJsonRecord(input.metadata);
    const report = parseJsonRecord(input.data);
    const readingData = asRecord(metadata?.readingData);
    const advisorProfile = asRecord(metadata?.advisorProfile);
    const oraclePersona = asRecord(metadata?.oraclePersona);
    const freeFocus = asRecord(report?.free_focus);

    const question = getString(readingData, 'question') ?? getString(metadata, 'userContext');
    const questionIntent = getQuestionIntent(
        getString(metadata, 'questionIntent') ?? getString(readingData, 'questionIntent')
    );
    const context = getReadingContext(getString(readingData, 'context'));

    if (!input.readingId && !question && !questionIntent && !context) {
        return null;
    }

    return {
        readingId: input.readingId,
        createdAt:
            input.createdAt instanceof Date
                ? input.createdAt.toISOString()
                : input.createdAt,
        question,
        questionIntent,
        context,
        advisorName: getString(advisorProfile, 'name') ?? getString(oraclePersona, 'name'),
        advisorTitle: getString(advisorProfile, 'title') ?? getString(oraclePersona, 'title'),
        actionConclusion: getString(freeFocus, 'action_conclusion'),
        birthDate: getString(readingData, 'birthDate'),
        birthTime: getString(readingData, 'birthTime'),
    };
}

export function resolveDailyLinkedArea(
    linkedContext?: DailyLinkedOracleContext | null
): DailyLinkedArea | null {
    if (!linkedContext) {
        return null;
    }

    switch (linkedContext.questionIntent) {
        case 'compatibility':
        case 'reunion':
            return 'love';
        case 'wealth':
            return 'money';
        case 'career':
        case 'business':
            return 'career';
        case 'general':
        case 'timing':
        default:
            break;
    }

    switch (linkedContext.context) {
        case 'love':
            return 'love';
        case 'money':
            return 'money';
        case 'career':
            return 'career';
        case 'health':
            return 'health';
        default:
            return null;
    }
}

export function getDailyLinkedLabel(
    linkedContext: DailyLinkedOracleContext,
    language: 'ko' | 'en' = 'ko'
): string {
    const intentLabels: Record<OracleQuestionIntent, { ko: string; en: string }> = {
        general: { ko: '종합 흐름', en: 'General Flow' },
        compatibility: { ko: '관계 / 궁합', en: 'Compatibility' },
        reunion: { ko: '재회', en: 'Reunion' },
        wealth: { ko: '재물', en: 'Wealth' },
        timing: { ko: '타이밍', en: 'Timing' },
        career: { ko: '커리어', en: 'Career' },
        business: { ko: '비즈니스', en: 'Business' },
    };

    const contextLabels: Record<ReadingContext, { ko: string; en: string }> = {
        general: { ko: '종합', en: 'General' },
        love: { ko: '연애 / 관계', en: 'Love / Relationship' },
        career: { ko: '커리어 / 직업', en: 'Career / Job' },
        money: { ko: '재물 / 금전', en: 'Wealth / Money' },
        health: { ko: '건강 / 웰빙', en: 'Health / Wellness' },
    };

    if (linkedContext.questionIntent) {
        return intentLabels[linkedContext.questionIntent][language];
    }

    if (linkedContext.context) {
        return contextLabels[linkedContext.context][language];
    }

    return language === 'en' ? 'Recent Oracle Path' : '최근 오라클 경로';
}
