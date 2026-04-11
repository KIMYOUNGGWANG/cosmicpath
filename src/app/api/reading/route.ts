/**
 * 3원 통합 리딩 API
 * POST /api/reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getClientIp } from '@/lib/audit-logger';
import { rateLimit } from '@/lib/rate-limiter';
import { prisma } from '@/lib/prisma';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { drawCards, TarotCard } from '@/lib/engines/tarot';
import { extractAllTags } from '@/lib/core/tag-engine';
import { generateInterpretationGuide } from '@/lib/core/conflict-resolver';
import {
    buildOracleSajuPromptBlock,
    buildOracleAdvisorEvidenceSummary,
    calculateOracleSajuProfile,
    OracleSajuProfile
} from '@/lib/saju/saju-engine';
import {
    buildOracleAdvisorProfile,
    getRecommendedOracleCharacterId,
    inferQuestionIntent,
    ORACLE_QUESTION_INTENTS,
    resolveOracleCharacterId,
    type OracleQuestionIntent,
    type OracleSelectionMode,
} from '@/lib/ai/oracle-personas';
import {
    buildStructuredSystemPrompt,
    buildUserPrompt,
    ReadingContext
} from '@/lib/ai/prompt-builder';
import { generateStructuredReport, ModelTier, StructuredParseError } from '@/lib/ai/llm-client';
import { generatePremiumReport, generateSinglePhase } from '@/lib/ai/premium-reading-service';
import { consumeDailyQuota } from '@/lib/plan-limits';
import { trackGrowthEvent } from '@/lib/growth-events';
import { extractReadingAccessKey, hasReadingAccess } from '@/lib/reading-access';

export const maxDuration = 60; // Vercel Function Timeout (Increased for multi-turn)
export const dynamic = 'force-dynamic';

// 요청 스키마
const ReadingRequestSchema = z.object({
    name: z.string().optional().default(''), // 이름/닉네임
    gender: z.enum(['male', 'female']).default('male'), // 성별 (대운 계산용)
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식이 올바르지 않습니다'),
    birthTime: z.string().default('12:00'),
    context: z.enum(['career', 'love', 'money', 'health', 'general']).default('general'),
    question: z.string().max(500).optional().default(''),
    // 상대방 정보 (궁합/재회 분석용 - optional)
    partnerBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    partnerBirthTime: z.string().optional(),
    partnerGender: z.enum(['male', 'female']).optional(),
    partnerName: z.string().optional(),
    tarotCards: z.array(z.object({
        id: z.number(),
        name: z.string(),
        nameEn: z.string(),
        keywords: z.array(z.string()),
        interpretation: z.string(),
        isReversed: z.boolean(),
    })).optional(),
    tier: z.enum(['free', 'basic', 'premium']).default('free'),
    language: z.enum(['ko', 'en']).optional().default('ko'),
    phase: z.number().min(1).max(8).optional(), // for multi-step execution
    previousReport: z.object({}).passthrough().optional(), // previous phase data
    calendarType: z.enum(['solar', 'lunar']).default('solar'),
    unknownTime: z.boolean().default(false),
    cityName: z.string().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
    questionIntent: z.enum(ORACLE_QUESTION_INTENTS).optional(),
    selectionMode: z.enum(['auto', 'manual']).optional().default('auto'),
    characterId: z.string().optional(),
    isPaid: z.boolean().default(false),
    inviteCode: z.string().optional(),
    readingId: z.string().optional(),
    accessKey: z.string().optional(),
});

type ReadingLanguage = 'ko' | 'en';
type ReadingGuideSnapshot = ReturnType<typeof generateInterpretationGuide>;
type StoredLegacySajuResult = ReturnType<typeof mapToLegacySaju>;

interface StoredReadingRuntime {
    guide: ReadingGuideSnapshot;
    saju: StoredLegacySajuResult;
    astrology: ReturnType<typeof calculateAstrology>;
    cards: TarotCard[];
    characterId: ReturnType<typeof resolveOracleCharacterId>;
    questionIntent: OracleQuestionIntent;
    selectionMode: OracleSelectionMode;
    advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
    advisorEvidenceSummary: string;
    precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
    oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
    partnerSaju?: StoredLegacySajuResult | null;
}

interface FreeFocusPayload {
    action_conclusion: string;
    evidence_summary: string;
    next_question: string;
}

const FreeReadingTraitSchema = z.object({
    type: z.enum(['saju', 'astro', 'tarot']),
    name: z.string().min(1),
    description: z.string().min(1),
    grade: z.enum(['S', 'A', 'B']),
});

const FreeReadingReportSchema = z.object({
    free_focus: z.object({
        action_conclusion: z.string().min(1),
        evidence_summary: z.string().min(1),
        next_question: z.string().min(1),
    }),
    summary: z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        trust_score: z.coerce.number().int().min(1).max(5),
        trust_reason: z.string().min(1),
    }),
    traits: z.array(FreeReadingTraitSchema).min(1).max(4),
});

const FreeReadingCoreSchema = z.object({
    free_focus: z.object({
        action_conclusion: z.string().min(1),
        evidence_summary: z.string().min(1),
        next_question: z.string().min(1),
    }),
    summary: z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        trust_score: z.coerce.number().int().min(1).max(5),
        trust_reason: z.string().min(1),
    }),
});

type FreeReadingReport = z.infer<typeof FreeReadingReportSchema>;

const ZODIAC_SIGNS_EN = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const FREE_READING_TITLES: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
    general: {
        ko: '지금 흐름에서 먼저 볼 한 수',
        en: 'The next move to read first',
    },
    compatibility: {
        ko: '관계에서 먼저 조정할 신호',
        en: 'The first relationship signal to adjust',
    },
    reunion: {
        ko: '재회 전에 먼저 안정시킬 흐름',
        en: 'What to stabilize before reunion',
    },
    wealth: {
        ko: '지금 돈 흐름에서 먼저 잡을 기준',
        en: 'The money signal to anchor first',
    },
    timing: {
        ko: '지금은 움직일지 더 기다릴지',
        en: 'Whether to move now or wait longer',
    },
    career: {
        ko: '커리어에서 먼저 선명해질 포인트',
        en: 'The career move to clarify first',
    },
    business: {
        ko: '사업에서 먼저 검증할 병목',
        en: 'The business bottleneck to validate first',
    },
};

const CONFIDENCE_TEXT_EN = {
    very_high: {
        message: 'Saju, natal timing, and tarot are converging in the same direction.',
        recommendation: 'Act with conviction, but keep execution disciplined.',
    },
    high: {
        message: 'Most signals are aligned in one workable direction.',
        recommendation: 'Follow the main current and stay flexible on details.',
    },
    medium: {
        message: 'The reading has a clear center, but there are still competing angles.',
        recommendation: 'Use the main signal, but leave room for alternatives.',
    },
    low: {
        message: 'Different systems are showing different angles right now.',
        recommendation: 'Avoid forcing one answer too early and compare options.',
    },
    very_low: {
        message: 'The signals conflict too much to force a definitive answer now.',
        recommendation: 'Wait, observe, and gather one more concrete signal first.',
    },
} as const;

function sanitizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function extractEvidenceLine(summary: string, labels: string[]): string {
    const lines = summary.split('\n').map((line) => line.trim()).filter(Boolean);

    for (const line of lines) {
        for (const label of labels) {
            const prefix = `- [${label}]`;
            if (line.startsWith(prefix)) {
                return line.slice(prefix.length).trim();
            }
        }
    }

    return '';
}

function parseJsonRecord(value: string | null | undefined): Record<string, unknown> {
    if (!value) return {};

    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
    } catch {
        return {};
    }

    return {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTarotCard(value: unknown): value is TarotCard {
    if (!isRecord(value)) return false;

    return typeof value.id === 'number' &&
        typeof value.name === 'string' &&
        typeof value.nameEn === 'string' &&
        Array.isArray(value.keywords) &&
        value.keywords.every((keyword) => typeof keyword === 'string') &&
        typeof value.interpretation === 'string' &&
        typeof value.isReversed === 'boolean';
}

function isQuestionIntent(value: unknown): value is OracleQuestionIntent {
    return typeof value === 'string' &&
        ORACLE_QUESTION_INTENTS.includes(value as OracleQuestionIntent);
}

function isSelectionMode(value: unknown): value is OracleSelectionMode {
    return value === 'auto' || value === 'manual';
}

function isAstrologyResult(value: unknown): value is ReturnType<typeof calculateAstrology> {
    return isRecord(value) &&
        typeof value.sunSign === 'number' &&
        typeof value.moonSign === 'number' &&
        typeof value.ascendant === 'number';
}

function extractStoredReadingRuntime(metadata: Record<string, unknown>): StoredReadingRuntime | null {
    const confidence = isRecord(metadata.confidence) ? metadata.confidence : null;
    const matching = isRecord(metadata.matching) ? metadata.matching : null;
    const radarScores = isRecord(metadata.radarScores) ? metadata.radarScores : null;
    const keyThemes = Array.isArray(metadata.keyThemes) && metadata.keyThemes.every((item) => typeof item === 'string')
        ? metadata.keyThemes as string[]
        : null;
    const saju = isRecord(metadata.sajuResult) ? metadata.sajuResult as StoredLegacySajuResult : null;
    const astrology = isAstrologyResult(metadata.astrologyResult) ? metadata.astrologyResult : null;
    const questionIntent = isQuestionIntent(metadata.questionIntent) ? metadata.questionIntent : null;
    const selectionMode = isSelectionMode(metadata.selectionMode) ? metadata.selectionMode : null;
    const characterId = typeof metadata.characterId === 'string'
        ? resolveOracleCharacterId(metadata.characterId)
        : null;

    if (!confidence || !matching || !radarScores || !keyThemes || !saju || !astrology || !questionIntent || !selectionMode || !characterId) {
        return null;
    }

    const cards = Array.isArray(metadata.tarotCards) && metadata.tarotCards.every(isTarotCard)
        ? metadata.tarotCards as TarotCard[]
        : [];
    const advisorProfile = isRecord(metadata.advisorProfile)
        ? metadata.advisorProfile as unknown as ReturnType<typeof buildOracleAdvisorProfile>
        : buildOracleAdvisorProfile(characterId, selectionMode);
    const precisionMetadata = isRecord(metadata.precisionMetadata)
        ? metadata.precisionMetadata as unknown as OracleSajuProfile['precisionMetadata']
        : isRecord(metadata.precision)
            ? metadata.precision as unknown as OracleSajuProfile['precisionMetadata']
            : null;
    const oracleCouncil = isRecord(metadata.oracleCouncil)
        ? metadata.oracleCouncil as unknown as OracleSajuProfile['oracleCouncil']
        : null;
    const partnerSaju = isRecord(metadata.partnerSajuResult)
        ? metadata.partnerSajuResult as unknown as StoredLegacySajuResult
        : null;

    return {
        guide: {
            confidence: confidence as unknown as ReadingGuideSnapshot['confidence'],
            matching: matching as unknown as ReadingGuideSnapshot['matching'],
            radarScores: radarScores as unknown as ReadingGuideSnapshot['radarScores'],
            prioritySource: 'saju',
            tone: 'balanced',
            keyThemes,
            warnings: [],
        },
        saju,
        astrology,
        cards,
        characterId,
        questionIntent,
        selectionMode,
        advisorProfile,
        advisorEvidenceSummary: sanitizeText(metadata.advisorEvidenceSummary),
        precisionMetadata,
        oracleCouncil,
        partnerSaju,
    };
}

function takeLeadSentences(text: string, maxLength = 160): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const sentences = normalized
        .split(/(?<=[.!?。])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    if (sentences.length === 0) {
        return normalized.slice(0, maxLength).trim();
    }

    let collected = '';
    for (const sentence of sentences) {
        const candidate = collected ? `${collected} ${sentence}` : sentence;
        if (candidate.length > maxLength && collected) {
            break;
        }
        collected = candidate.slice(0, maxLength).trim();
        if (candidate.length >= maxLength) {
            break;
        }
    }

    return collected || normalized.slice(0, maxLength).trim();
}

function buildFallbackActionConclusion(
    questionIntent: OracleQuestionIntent,
    language: ReadingLanguage
): string {
    const fallbackMap: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
        general: {
            ko: '지금은 감정 반응보다 패턴을 먼저 읽고 다음 한 수를 정리하세요.',
            en: 'Read the pattern first instead of reacting emotionally, then decide your next move.',
        },
        compatibility: {
            ko: '상대를 바꾸려 하기보다 지금은 소통 방식부터 조정하는 쪽이 유리합니다.',
            en: 'Instead of trying to change the other person, adjust your communication pattern first.',
        },
        reunion: {
            ko: '재회를 서두르기보다 먼저 흐름을 안정시키고 반응 신호를 확인하세요.',
            en: 'Instead of rushing reunion, stabilize the flow first and confirm response signals.',
        },
        wealth: {
            ko: '확장보다 현금 흐름과 리스크 관리부터 먼저 정리하세요.',
            en: 'Prioritize cash flow and risk control before expansion.',
        },
        timing: {
            ko: '지금은 밀어붙이기보다 움직일 시점과 기다릴 시점을 분리해 판단하세요.',
            en: 'Separate move-now moments from wait-longer moments before pushing ahead.',
        },
        career: {
            ko: '결정을 서두르기보다 커리어 신호를 먼저 확인하고 준비를 정리하세요.',
            en: 'Before making the decision, confirm the career signals and tighten your preparation.',
        },
        business: {
            ko: '확장보다 병목과 수익 구조를 먼저 검증하는 쪽이 맞습니다.',
            en: 'Validate the bottleneck and revenue structure before trying to expand.',
        },
    };

    return fallbackMap[questionIntent][language];
}

function buildFallbackNextQuestion(
    questionIntent: OracleQuestionIntent,
    language: ReadingLanguage
): string {
    const questionMap: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
        general: {
            ko: '지금 흐름에서 먼저 멈춰야 할 것과 밀어야 할 것을 더 구체적으로 알려줘.',
            en: 'Tell me more specifically what I should stop forcing and what I should push forward now.',
        },
        compatibility: {
            ko: '이 관계에서 내가 먼저 조정해야 할 소통 패턴은 뭐야?',
            en: 'What communication pattern should I adjust first in this relationship?',
        },
        reunion: {
            ko: '재회를 원한다면 지금 내 쪽에서 먼저 바꿔야 할 행동은 뭐야?',
            en: 'If I want reunion, what should I change on my side first?',
        },
        wealth: {
            ko: '이번 달엔 확장과 방어 중 어디에 더 무게를 둬야 해?',
            en: 'This month, should I lean more toward expansion or protection?',
        },
        timing: {
            ko: '지금 움직여야 할 시기와 더 기다려야 할 시기를 나눠서 말해줘.',
            en: 'Break down when I should move now and when I should wait longer.',
        },
        career: {
            ko: '이직을 밀어붙이기 전에 확인해야 할 신호 한 가지는 뭐야?',
            en: 'What is the one signal I should confirm before pushing this career move?',
        },
        business: {
            ko: '이 사업에서 가장 먼저 검증해야 할 병목은 뭐야?',
            en: 'What bottleneck should I validate first in this business?',
        },
    };

    return questionMap[questionIntent][language];
}

function buildFreeFocusFallback(
    report: Record<string, unknown>,
    params: {
        questionIntent: OracleQuestionIntent;
        language: ReadingLanguage;
        advisorEvidenceSummary: string;
    }
): FreeFocusPayload {
    const summary = report.summary && typeof report.summary === 'object'
        ? report.summary as Record<string, unknown>
        : {};
    const finalVerdict = report.final_verdict && typeof report.final_verdict === 'object'
        ? report.final_verdict as Record<string, unknown>
        : {};

    const actionSource =
        sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.action_conclusion) ||
        takeLeadSentences(sanitizeText(finalVerdict.core_message), 120) ||
        buildFallbackActionConclusion(params.questionIntent, params.language);

    const evidenceSource = takeLeadSentences(
        sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.evidence_summary) ||
        params.advisorEvidenceSummary ||
        sanitizeText(summary.trust_reason) ||
        sanitizeText(summary.content),
        170
    );

    return {
        action_conclusion: actionSource,
        evidence_summary: evidenceSource || buildFallbackActionConclusion(params.questionIntent, params.language),
        next_question:
            sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.next_question) ||
            buildFallbackNextQuestion(params.questionIntent, params.language),
    };
}

function normalizeFreeFocus(
    report: Record<string, unknown>,
    params: {
        questionIntent: OracleQuestionIntent;
        language: ReadingLanguage;
        advisorEvidenceSummary: string;
    }
): FreeFocusPayload {
    const fallback = buildFreeFocusFallback(report, params);
    const existingFreeFocus =
        report.free_focus && typeof report.free_focus === 'object' && !Array.isArray(report.free_focus)
            ? report.free_focus as Record<string, unknown>
            : {};

    return {
        action_conclusion: sanitizeText(existingFreeFocus.action_conclusion) || fallback.action_conclusion,
        evidence_summary: sanitizeText(existingFreeFocus.evidence_summary) || fallback.evidence_summary,
        next_question: sanitizeText(existingFreeFocus.next_question) || fallback.next_question,
    };
}

function buildOracleReportEnrichment(
    report: unknown,
    params: {
        characterId: string;
        questionIntent: OracleQuestionIntent;
        selectionMode: OracleSelectionMode;
        language: ReadingLanguage;
        advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
        advisorEvidenceSummary: string;
        precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
        oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
    }
) {
    const baseReport =
        report && typeof report === 'object' && !Array.isArray(report)
            ? report as Record<string, unknown>
            : {};

    return {
        ...baseReport,
        free_focus: normalizeFreeFocus(baseReport, {
            questionIntent: params.questionIntent,
            language: params.language,
            advisorEvidenceSummary: params.advisorEvidenceSummary,
        }),
        characterId: params.characterId,
        questionIntent: params.questionIntent,
        selectionMode: params.selectionMode,
        precisionMetadata: params.precisionMetadata ?? null,
        oracleCouncil: params.oracleCouncil ?? null,
        advisorProfile: params.advisorProfile,
        advisorEvidenceSummary: params.advisorEvidenceSummary,
        oraclePersona: {
            id: params.advisorProfile.id,
            name: params.advisorProfile.name,
            title: params.advisorProfile.title,
        },
    };
}

function buildReadingMetadata(params: {
    guide: ReadingGuideSnapshot;
    saju: StoredLegacySajuResult;
    astrology: ReturnType<typeof calculateAstrology>;
    cards: TarotCard[];
    characterId: string;
    questionIntent: OracleQuestionIntent;
    selectionMode: OracleSelectionMode;
    advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
    advisorEvidenceSummary: string;
    precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
    oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
    partnerSaju?: StoredLegacySajuResult | null;
}) {
    return {
        confidence: params.guide.confidence,
        matching: params.guide.matching,
        radarScores: params.guide.radarScores,
        keyThemes: params.guide.keyThemes,
        saju: {
            yeonPillar: `${params.saju.yeonPillar.stem}${params.saju.yeonPillar.branch}`,
            dayMaster: params.saju.dayMaster,
            fullSaju: `${params.saju.yeonPillar.stem}${params.saju.yeonPillar.branch}년 ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch}월 ${params.saju.dayPillar.stem}${params.saju.dayPillar.branch}일 ${params.saju.hourPillar.stem}${params.saju.hourPillar.branch}시`,
        },
        sajuResult: params.saju,
        astrology: {
            sunSign: params.astrology.sunSign,
            moonSign: params.astrology.moonSign,
            ascendant: params.astrology.ascendant,
        },
        astrologyResult: params.astrology,
        tarot: params.cards.map((card) => ({ name: card.name, isReversed: card.isReversed })),
        tarotCards: params.cards,
        characterId: params.characterId,
        questionIntent: params.questionIntent,
        selectionMode: params.selectionMode,
        advisorProfile: params.advisorProfile,
        advisorEvidenceSummary: params.advisorEvidenceSummary,
        oraclePersona: {
            id: params.advisorProfile.id,
            name: params.advisorProfile.name,
            title: params.advisorProfile.title,
        },
        precisionMetadata: params.precisionMetadata ?? null,
        precision: params.precisionMetadata ?? null,
        oracleCouncil: params.oracleCouncil ?? null,
        partnerSajuResult: params.partnerSaju ?? null,
    };
}

function toTraitGrade(score: number): 'S' | 'A' | 'B' {
    if (score >= 88) return 'S';
    if (score >= 72) return 'A';
    return 'B';
}

function getLocalizedConfidenceCopy(
    guide: ReadingGuideSnapshot,
    language: ReadingLanguage
) {
    if (language === 'ko') {
        return {
            message: guide.confidence.message,
            recommendation: guide.confidence.recommendation,
        };
    }

    return CONFIDENCE_TEXT_EN[guide.confidence.level];
}

function getAstrologySignalName(index: number, language: ReadingLanguage): string {
    if (language === 'en') {
        return ZODIAC_SIGNS_EN[index] ?? 'Unknown';
    }

    return ZODIAC_SIGNS[index]?.name ?? '미상';
}

function buildDeterministicFreeReport(params: {
    guide: ReadingGuideSnapshot;
    saju: StoredLegacySajuResult;
    astrology: ReturnType<typeof calculateAstrology>;
    cards: TarotCard[];
    questionIntent: OracleQuestionIntent;
    advisorEvidenceSummary: string;
    language: ReadingLanguage;
}): FreeReadingReport {
    const confidenceCopy = getLocalizedConfidenceCopy(params.guide, params.language);
    const freeFocus = buildFreeFocusFallback({}, {
        questionIntent: params.questionIntent,
        language: params.language,
        advisorEvidenceSummary: params.advisorEvidenceSummary,
    });
    const sajuLine = extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Saju'] : ['사주']
    );
    const astroLine = extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Natal', 'Ziwei'] : ['점성', '자미']
    );
    const tarotLine = extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Tarot'] : ['타로']
    );
    const tarotCard = params.cards[0];
    const evidenceSummary = takeLeadSentences(
        [sajuLine, astroLine].filter(Boolean).join(' '),
        180
    ) || freeFocus.evidence_summary;
    const tarotDescription = tarotLine || (
        params.language === 'en'
            ? `${tarotCard?.nameEn || 'Tarot'}${tarotCard?.isReversed ? ' reversed' : ''} reflects the immediate emotional weather around this question.`
            : `${tarotCard?.name || '타로'}${tarotCard?.isReversed ? ' 역방향' : ''} 카드가 지금 질문의 즉각적인 심리 신호를 비춥니다. ${takeLeadSentences(tarotCard?.interpretation || '', 90)}`
    );

    return {
        free_focus: {
            ...freeFocus,
            evidence_summary: evidenceSummary,
        },
        summary: {
            title: FREE_READING_TITLES[params.questionIntent][params.language],
            content: takeLeadSentences(
                [
                    freeFocus.action_conclusion,
                    evidenceSummary,
                    confidenceCopy.recommendation,
                ].filter(Boolean).join(' '),
                360
            ),
            trust_score: params.guide.confidence.score,
            trust_reason: params.language === 'en'
                ? `${params.guide.matching.matchingTags.length} cross-checked themes overlap, and ${confidenceCopy.message.toLowerCase()}`
                : `공통 테마 ${params.guide.matching.matchingTags.length}개가 겹치고, ${confidenceCopy.message}`,
        },
        traits: buildDeterministicFreeTraits(params, {
            sajuLine,
            astroLine,
            tarotDescription,
        }),
    };
}

function extractPartialJsonStringValue(source: string, key: string): string | null {
    const keyIndex = source.indexOf(`"${key}"`);
    if (keyIndex === -1) return null;

    const colonIndex = source.indexOf(':', keyIndex);
    if (colonIndex === -1) return null;

    const quoteStart = source.indexOf('"', colonIndex + 1);
    if (quoteStart === -1) return null;

    let value = '';
    let escaped = false;

    for (let index = quoteStart + 1; index < source.length; index += 1) {
        const char = source[index];

        if (escaped) {
            value += char === 'n' ? '\n' : char;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            return value.trim() || null;
        }

        value += char;
    }

    return value.trim() || null;
}

function buildDeterministicFreeTraits(
    params: {
        guide: ReadingGuideSnapshot;
        saju: StoredLegacySajuResult;
        astrology: ReturnType<typeof calculateAstrology>;
        cards: TarotCard[];
        questionIntent: OracleQuestionIntent;
        advisorEvidenceSummary: string;
        language: ReadingLanguage;
    },
    overrides?: {
        sajuLine?: string;
        astroLine?: string;
        tarotDescription?: string;
    }
): FreeReadingReport['traits'] {
    const tarotCard = params.cards[0];
    const sajuLine = overrides?.sajuLine || extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Saju'] : ['사주']
    );
    const astroLine = overrides?.astroLine || extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Natal', 'Ziwei'] : ['점성', '자미']
    );
    const tarotDescription = overrides?.tarotDescription || extractEvidenceLine(
        params.advisorEvidenceSummary,
        params.language === 'en' ? ['Tarot'] : ['타로']
    ) || (
        params.language === 'en'
            ? `${tarotCard?.nameEn || 'Tarot'}${tarotCard?.isReversed ? ' reversed' : ''} reflects the immediate emotional weather around this question.`
            : `${tarotCard?.name || '타로'}${tarotCard?.isReversed ? ' 역방향' : ''} 카드가 지금 질문의 즉각적인 심리 신호를 비춥니다. ${takeLeadSentences(tarotCard?.interpretation || '', 90)}`
    );

    return [
        {
            type: 'saju',
            name: params.language === 'en' ? `Day Master ${params.saju.dayMaster}` : `일간 ${params.saju.dayMaster} 중심축`,
            description: takeLeadSentences(
                sajuLine || (
                    params.language === 'en'
                        ? `Your Day Master ${params.saju.dayMaster} and month pillar ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch} set the base pace of this decision.`
                        : `${params.saju.dayMaster} 일간과 ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch} 월주가 이번 선택의 기본 축을 잡습니다.`
                ),
                160
            ),
            grade: toTraitGrade(params.guide.radarScores.saju),
        },
        {
            type: 'astro',
            name: params.language === 'en' ? 'Natal timing signal' : '점성 타이밍 신호',
            description: takeLeadSentences(
                astroLine || (
                    params.language === 'en'
                        ? `Sun ${getAstrologySignalName(params.astrology.sunSign, 'en')}, Moon ${getAstrologySignalName(params.astrology.moonSign, 'en')}, and Ascendant ${getAstrologySignalName(params.astrology.ascendant, 'en')} show how your outer timing and inner mood are lining up.`
                        : `태양 ${getAstrologySignalName(params.astrology.sunSign, 'ko')}, 달 ${getAstrologySignalName(params.astrology.moonSign, 'ko')}, 상승궁 ${getAstrologySignalName(params.astrology.ascendant, 'ko')} 조합이 겉의 흐름과 속마음의 결을 함께 보여줍니다.`
                ),
                160
            ),
            grade: toTraitGrade(params.guide.radarScores.astrology),
        },
        {
            type: 'tarot',
            name: params.language === 'en'
                ? `${tarotCard?.nameEn || 'Tarot'} signal`
                : `${tarotCard?.name || '타로'} 카드 신호`,
            description: takeLeadSentences(tarotDescription, 160),
            grade: toTraitGrade(params.guide.radarScores.tarot),
        },
    ];
}

export async function POST(request: NextRequest) {
    // 0. Rate Limiting
    const limitResult = await rateLimit(request);
    if (limitResult) return limitResult;

    try {
        const body = await request.json();

        // 요청 검증
        const validationResult = ReadingRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: '입력 데이터가 올바르지 않습니다', details: validationResult.error.issues },
                { status: 400 }
            );
        }

        const {
            name,
            gender,
            birthDate,
            birthTime,
            question,
            tarotCards,
            language,
            phase,
            previousReport,
            calendarType,
            unknownTime,
            inviteCode,
            readingId,
            accessKey,
            cityName,
            longitude,
            latitude,
            characterId,
            questionIntent: requestedQuestionIntent,
            selectionMode,
        } = validationResult.data;
        let {
            context,
            tier,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
            partnerName,
        } = validationResult.data;
        const clientIp = getClientIp(request.headers);
        const session = await auth();
        const sessionUserId = session?.user?.id ?? null;
        let isInvitePremiumAccess = false;

        // === Viral Loop: Handle Invitation ===
        if (inviteCode) {
            // Find inviter's reading
            const inviterReading = await import('@/lib/prisma').then(m => m.prisma.readingResult.findUnique({
                where: { invitationCode: inviteCode }
            }));

            if (inviterReading) {
                try {
                    const parsedData = JSON.parse(inviterReading.data);
                    // Inject Inviter as Partner
                    partnerName = parsedData.personal?.name || parsedData.name || 'Inviter';
                    partnerBirthDate = parsedData.personal?.birthDate || parsedData.birthDate;
                    partnerBirthTime = parsedData.personal?.birthTime || parsedData.birthTime;
                    partnerGender = parsedData.personal?.gender || parsedData.gender || 'male'; // Default fallback

                    // Upgrade to Premium for Free
                    tier = 'premium';
                    isInvitePremiumAccess = true;
                    context = 'love'; // Force compatibility context

                    console.log(`[Viral] Link activated. Inviter: ${partnerName}, Invitee: ${name}`);

                    // Increment Invitation Count (Only on first phase/start)
                    // Note: We use updateMany/update with atomic increment
                    if (!phase || phase === 1) {
                        try {
                            await import('@/lib/prisma').then(m => m.prisma.readingResult.update({
                                where: { id: inviterReading.id },
                                data: { invitationCount: { increment: 1 } }
                            }));

                            await trackGrowthEvent({
                                event: 'invite_converted',
                                readingId: inviterReading.id,
                                referralCode: inviteCode,
                                channel: 'reading_api',
                                metadata: { inviteeName: name || 'unknown' },
                            });
                        } catch (err) {
                            console.error('[Viral] Failed to increment count:', err);
                        }
                    }
                } catch (e) {
                    console.error('[Viral] Failed to parse inviter data', e);
                }
            }
        }

        // === Plan Limits: Free tier daily quota (phase 1 only) ===
        const isFirstPhase = !phase || phase === 1;
        const isPremiumRequest = tier === 'premium';
        const effectiveModelTier: ModelTier = isPremiumRequest ? 'premium' : 'free';

        if (isFirstPhase && effectiveModelTier === 'free') {
            const quota = await consumeDailyQuota({
                identifier: clientIp,
                action: 'daily_free_reading',
            });

            if (!quota.allowed) {
                await trackGrowthEvent({
                    event: 'soft_paywall_shown',
                    channel: 'reading_api_quota',
                    metadata: {
                        identifier: clientIp,
                        used: quota.used,
                        limit: quota.limit,
                    },
                });

                return NextResponse.json(
                    {
                        error: '무료 플랜 사용량을 초과했습니다. 결제 후 계속 이용해주세요.',
                        code: 'QUOTA_EXCEEDED',
                        quota,
                    },
                    { status: 402 }
                );
            }
        }

        const currentPhase = phase || 1;
        let storedReadingMetadata: Record<string, unknown> = {};
        let storedReading:
            | {
                id: string;
                metadata: string | null;
                userId: string | null;
            }
            | null = null;
        let hasVerifiedPremiumAccess = isInvitePremiumAccess;

        if (isPremiumRequest) {
            if (!readingId && !isInvitePremiumAccess) {
                return NextResponse.json(
                    { error: '결제 정보가 확인되지 않습니다.', code: 'PAYMENT_REQUIRED' },
                    { status: 402 }
                );
            }

            if (readingId) {
                storedReading = await prisma.readingResult.findUnique({
                    where: { id: readingId },
                    select: { id: true, metadata: true, userId: true },
                });

                if (!storedReading) {
                    return NextResponse.json(
                        { error: '리딩을 찾을 수 없습니다.', code: 'READING_NOT_FOUND' },
                        { status: 404 }
                    );
                }

                const canAccessReading = hasReadingAccess({
                    readingUserId: storedReading.userId,
                    sessionUserId,
                    storedAccessKey: extractReadingAccessKey(storedReading.metadata),
                    providedAccessKey: accessKey,
                });

                if (!canAccessReading) {
                    return NextResponse.json(
                        { error: '이 리딩에 접근할 권한이 없습니다.', code: 'READING_ACCESS_DENIED' },
                        { status: 403 }
                    );
                }

                storedReadingMetadata = parseJsonRecord(storedReading.metadata);
                hasVerifiedPremiumAccess = storedReadingMetadata.isPremium === true;

                if (!hasVerifiedPremiumAccess) {
                    const paymentRecord = await prisma.payment.findFirst({
                        where: {
                            readingId,
                            status: 'DONE',
                        },
                        select: {
                            orderId: true,
                            metadata: true,
                        },
                        orderBy: { createdAt: 'desc' },
                    });

                    if (paymentRecord) {
                        const paymentMetadata = parseJsonRecord(paymentRecord.metadata);
                        const paymentType = typeof paymentMetadata.type === 'string'
                            ? paymentMetadata.type
                            : 'premium_reading';

                        if (paymentType === 'premium_reading') {
                            hasVerifiedPremiumAccess = true;

                            if (storedReadingMetadata.isPremium !== true) {
                                const syncedMetadata = {
                                    ...storedReadingMetadata,
                                    isPremium: true,
                                    paymentVerifiedAt: new Date().toISOString(),
                                    paymentSource: 'payment_record',
                                    paymentOrderId: paymentRecord.orderId,
                                };

                                storedReadingMetadata = syncedMetadata;

                                await prisma.readingResult.update({
                                    where: { id: storedReading.id },
                                    data: {
                                        metadata: JSON.stringify(syncedMetadata),
                                    },
                                }).catch((updateError) => {
                                    console.error('Failed to sync premium status from payment record', updateError);
                                });
                            }
                        }
                    }
                }
            }

            if (!hasVerifiedPremiumAccess) {
                return NextResponse.json(
                    { error: '결제 정보가 확인되지 않습니다.', code: 'PAYMENT_REQUIRED' },
                    { status: 402 }
                );
            }
        }

        // 1. 사주/점성술용 날짜 파싱 (타임존 이슈 방지: YYYY, MM, DD 직접 추출)
        const [yearPart, monthPart, dayPart] = birthDate.split('-').map(Number);

        const [hours, minutes] = birthTime.split(':').map(Number);
        // 실제 생시 반영된 Date 객체
        const exactBirthDateTime = new Date(yearPart, monthPart - 1, dayPart, hours, minutes || 0, 0);
        const storedRuntime = isPremiumRequest
            ? extractStoredReadingRuntime(storedReadingMetadata)
            : null;

        let guide: ReadingGuideSnapshot;
        let saju: StoredLegacySajuResult;
        let partnerSaju: StoredLegacySajuResult | null;
        let astrology: ReturnType<typeof calculateAstrology>;
        let resolvedQuestionIntent: OracleQuestionIntent;
        let resolvedCharacterId: ReturnType<typeof resolveOracleCharacterId>;
        let effectiveSelectionMode: OracleSelectionMode;
        let advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
        let advisorEvidenceSummary: string;
        let cards: TarotCard[];
        let precisionMetadata: OracleSajuProfile['precisionMetadata'] | null | undefined;
        let oracleCouncil: OracleSajuProfile['oracleCouncil'] | null | undefined;

        if (storedRuntime) {
            saju = storedRuntime.saju;
            astrology = storedRuntime.astrology;
            resolvedQuestionIntent = storedRuntime.questionIntent;
            resolvedCharacterId = storedRuntime.characterId;
            effectiveSelectionMode = storedRuntime.selectionMode;
            advisorProfile = storedRuntime.advisorProfile;
            advisorEvidenceSummary = storedRuntime.advisorEvidenceSummary;
            cards = storedRuntime.cards.length > 0
                ? storedRuntime.cards
                : (tarotCards || drawCards(1)) as TarotCard[];
            guide = storedRuntime.guide;
            precisionMetadata = storedRuntime.precisionMetadata;
            oracleCouncil = storedRuntime.oracleCouncil;

            if (storedRuntime.partnerSaju) {
                partnerSaju = storedRuntime.partnerSaju;
            } else if (partnerBirthDate) {
                const partnerProfile = await calculateOracleSajuProfile({
                    birthDate: partnerBirthDate,
                    birthTime: partnerBirthTime || '12:00',
                    gender: partnerGender || 'male',
                    unknownTime: !partnerBirthTime
                });
                partnerSaju = mapToLegacySaju(partnerProfile);
            } else {
                partnerSaju = null;
            }

            console.log('[Reading API] Reused stored oracle runtime context', {
                readingId,
                phase: currentPhase,
            });
        } else {
            // Using the new Dr.Saju engine for improved accuracy and true solar time correction
            const sajuProfile = await calculateOracleSajuProfile({
                birthDate,
                birthTime,
                gender,
                cityName,
                longitude,
                latitude,
                isLunar: calendarType === 'lunar',
                unknownTime: unknownTime || false
            });

            saju = mapToLegacySaju(sajuProfile);
            precisionMetadata = sajuProfile.precisionMetadata;
            oracleCouncil = sajuProfile.oracleCouncil;

            const [partnerSajuProfile, calculatedAstrology] = await Promise.all([
                partnerBirthDate
                    ? calculateOracleSajuProfile({
                        birthDate: partnerBirthDate,
                        birthTime: partnerBirthTime || '12:00',
                        gender: partnerGender || 'male',
                        unknownTime: !partnerBirthTime
                    })
                    : Promise.resolve(null),
                Promise.resolve(calculateAstrology(exactBirthDateTime, birthTime))
            ]);

            partnerSaju = partnerSajuProfile ? mapToLegacySaju(partnerSajuProfile) : null;
            astrology = calculatedAstrology;
            resolvedQuestionIntent = requestedQuestionIntent ?? inferQuestionIntent({
                context,
                question,
                partnerBirthDate,
                partnerName,
            });
            effectiveSelectionMode = selectionMode;
            resolvedCharacterId = effectiveSelectionMode === 'manual'
                ? resolveOracleCharacterId(characterId)
                : getRecommendedOracleCharacterId({
                    context,
                    question,
                    partnerBirthDate,
                    partnerName,
                    questionIntent: resolvedQuestionIntent,
                });
            advisorProfile = buildOracleAdvisorProfile(resolvedCharacterId, effectiveSelectionMode);
            advisorEvidenceSummary = buildOracleAdvisorEvidenceSummary({
                profile: sajuProfile,
                questionIntent: resolvedQuestionIntent,
                evidencePriority: advisorProfile.evidencePriority,
                language: language as 'ko' | 'en',
            });
            cards = (tarotCards || drawCards(1)) as TarotCard[];

            const tagResult = extractAllTags(saju, astrology, cards);
            guide = generateInterpretationGuide(tagResult, question);
        }

        // ===== Premium Mode: Multi-Turn API =====
        if (tier === 'premium') {
            const apiKey = process.env.GOOGLE_AI_API_KEY;
            const currentDate = new Date().toLocaleDateString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\. /g, '-').replace(/\./g, '');

            const userData = {
                name,
                gender,
                birthDate,
                birthTime,
                characterId: resolvedCharacterId,
                selectionMode: effectiveSelectionMode,
                questionIntent: resolvedQuestionIntent,
                advisorProfile,
                advisorEvidenceSummary,
                context,
                question,
                sajuData: saju,
                astroData: {
                    sunSign: ZODIAC_SIGNS[astrology.sunSign].name,
                    moonSign: ZODIAC_SIGNS[astrology.moonSign].name,
                    ascendant: ZODIAC_SIGNS[astrology.ascendant].name,
                },
                tarotCards: cards,
                language: language as 'ko' | 'en',
                currentDate,
                // 상대방 정보 (궁합/재회 분석용)
                partnerName: partnerName || undefined,
                partnerBirthDate: partnerBirthDate || undefined,
                partnerBirthTime: partnerBirthTime || undefined,
                partnerSajuData: partnerSaju || undefined,
            };

            try {
                // Check if this is a single phase request
                if (phase) {
                    console.log(`Executing Phase ${phase} for Premium Reading`);
                    const phaseResult = await generateSinglePhase(phase, userData, previousReport || null, apiKey as string);

                    if (!phaseResult.success) {
                        return NextResponse.json(
                            { error: phaseResult.error || 'Phase execution failed' },
                            { status: 500 }
                        );
                    }

                    return NextResponse.json({
                        success: true,
                        phase: phase,
                        report: buildOracleReportEnrichment(phaseResult.data, {
                            characterId: resolvedCharacterId,
                            questionIntent: resolvedQuestionIntent,
                            selectionMode: effectiveSelectionMode,
                            language: language as ReadingLanguage,
                            advisorProfile,
                            advisorEvidenceSummary,
                            precisionMetadata,
                            oracleCouncil,
                        }),
                        isPremium: true,
                        metadata: buildReadingMetadata({
                            guide,
                            saju,
                            astrology,
                            cards,
                            characterId: resolvedCharacterId,
                            questionIntent: resolvedQuestionIntent,
                            selectionMode: effectiveSelectionMode,
                            advisorProfile,
                            advisorEvidenceSummary,
                            precisionMetadata,
                            oracleCouncil,
                            partnerSaju,
                        }),
                    });
                }

                // Default: Run all phases (Risk of Timeout on Vercel Hobby)
                const premiumResult = await generatePremiumReport(userData, apiKey as string);

                return NextResponse.json({
                    success: premiumResult.success,
                    report: buildOracleReportEnrichment(premiumResult.report, {
                        characterId: resolvedCharacterId,
                        questionIntent: resolvedQuestionIntent,
                        selectionMode: effectiveSelectionMode,
                        language: language as ReadingLanguage,
                        advisorProfile,
                        advisorEvidenceSummary,
                        precisionMetadata,
                        oracleCouncil,
                    }),
                    error: premiumResult.error, // 에러 메시지 포함
                    isPremium: true,
                    metadata: buildReadingMetadata({
                        guide,
                        saju,
                        astrology,
                        cards,
                        characterId: resolvedCharacterId,
                        questionIntent: resolvedQuestionIntent,
                        selectionMode: effectiveSelectionMode,
                        advisorProfile,
                        advisorEvidenceSummary,
                        precisionMetadata,
                        oracleCouncil,
                        partnerSaju,
                    }),
                });
            } catch (premiumError) {
                console.error('Premium generation failed:', premiumError);
                return NextResponse.json(
                    {
                        error: '프리미엄 리포트를 불러오는 중 오류가 발생했습니다.',
                        code: 'PREMIUM_GENERATION_FAILED',
                    },
                    { status: 500 }
                );
            }
        }

        if (!isPremiumRequest && currentPhase > 1) {
            const deterministicFallback = buildDeterministicFreeReport({
                guide,
                saju,
                astrology,
                cards,
                questionIntent: resolvedQuestionIntent,
                advisorEvidenceSummary,
                language: language as ReadingLanguage,
            });
            const previousFreeReport = isRecord(previousReport) ? previousReport : {};
            const previousFreeFocus = isRecord(previousFreeReport.free_focus) ? previousFreeReport.free_focus : {};
            const previousSummary = isRecord(previousFreeReport.summary) ? previousFreeReport.summary : {};

            const finalizedReport = FreeReadingReportSchema.parse({
                free_focus: {
                    action_conclusion: sanitizeText(previousFreeFocus.action_conclusion) || deterministicFallback.free_focus.action_conclusion,
                    evidence_summary: sanitizeText(previousFreeFocus.evidence_summary) || deterministicFallback.free_focus.evidence_summary,
                    next_question: sanitizeText(previousFreeFocus.next_question) || deterministicFallback.free_focus.next_question,
                },
                summary: {
                    title: sanitizeText(previousSummary.title) || deterministicFallback.summary.title,
                    content: sanitizeText(previousSummary.content) || deterministicFallback.summary.content,
                    trust_score: typeof previousSummary.trust_score === 'number'
                        ? previousSummary.trust_score
                        : deterministicFallback.summary.trust_score,
                    trust_reason: sanitizeText(previousSummary.trust_reason) || deterministicFallback.summary.trust_reason,
                },
                traits: buildDeterministicFreeTraits({
                    guide,
                    saju,
                    astrology,
                    cards,
                    questionIntent: resolvedQuestionIntent,
                    advisorEvidenceSummary,
                    language: language as ReadingLanguage,
                }),
            });

            return NextResponse.json({
                success: true,
                phase: currentPhase,
                report: buildOracleReportEnrichment(finalizedReport, {
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode: effectiveSelectionMode,
                    language: language as ReadingLanguage,
                    advisorProfile,
                    advisorEvidenceSummary,
                    precisionMetadata,
                    oracleCouncil,
                }),
                isPremium: false,
                metadata: buildReadingMetadata({
                    guide,
                    saju,
                    astrology,
                    cards,
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode: effectiveSelectionMode,
                    advisorProfile,
                    advisorEvidenceSummary,
                    precisionMetadata,
                    oracleCouncil,
                    partnerSaju,
                }),
            });
        }

        const currentDate = new Date().toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '-').replace(/\./g, '');

        const systemPrompt = buildStructuredSystemPrompt(
            language as 'ko' | 'en',
            currentDate,
            {
                characterId: resolvedCharacterId,
                questionIntent: resolvedQuestionIntent,
                selectionMode: effectiveSelectionMode,
                isPremium: false,
                freeOutputMode: 'core',
            }
        );
        const userPrompt = buildUserPrompt(
            guide,
            saju,
            astrology,
            cards,
            context as ReadingContext,
            question,
            language as 'ko' | 'en',
            currentDate,
            partnerSaju,
            partnerName,
            resolvedCharacterId,
            {
                questionIntent: resolvedQuestionIntent,
                selectionMode: effectiveSelectionMode,
                advisorEvidenceSummary,
                isPremium: false,
            }
        );

        try {
            const report = await generateStructuredReport(
                systemPrompt,
                userPrompt,
                effectiveModelTier,
                FreeReadingCoreSchema
            );

            return NextResponse.json({
                success: true,
                report: buildOracleReportEnrichment(report, {
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode: effectiveSelectionMode,
                    language: language as ReadingLanguage,
                    advisorProfile,
                    advisorEvidenceSummary,
                    precisionMetadata,
                    oracleCouncil,
                }),
                isPremium: false,
                metadata: buildReadingMetadata({
                    guide,
                    saju,
                    astrology,
                    cards,
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode: effectiveSelectionMode,
                    advisorProfile,
                    advisorEvidenceSummary,
                    precisionMetadata,
                    oracleCouncil,
                    partnerSaju,
                }),
            });

        } catch (aiError) {
            const aiErrorMessage = aiError instanceof Error ? aiError.message : String(aiError);
            const isProviderPressure =
                aiErrorMessage.includes('503:') ||
                aiErrorMessage.includes('429:') ||
                aiErrorMessage.includes('API timeout after');
            const isStructuredParseFailure = aiError instanceof StructuredParseError;

            if (isProviderPressure) {
                console.warn('[Reading API] Free structured generation unavailable on primary model:', aiErrorMessage);
            } else if (isStructuredParseFailure) {
                console.warn('[Reading API] Free structured generation returned malformed JSON. Recovering with partial parse fallback.');
            } else {
                console.error('AI generation failed:', aiError);
            }

            if (isStructuredParseFailure) {
                const deterministicFallback = buildDeterministicFreeReport({
                    guide,
                    saju,
                    astrology,
                    cards,
                    questionIntent: resolvedQuestionIntent,
                    advisorEvidenceSummary,
                    language: language as ReadingLanguage,
                });

                const recoveredReport = {
                    ...deterministicFallback,
                    free_focus: {
                        action_conclusion:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'action_conclusion')) ||
                            deterministicFallback.free_focus.action_conclusion,
                        evidence_summary:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'evidence_summary')) ||
                            deterministicFallback.free_focus.evidence_summary,
                        next_question:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'next_question')) ||
                            deterministicFallback.free_focus.next_question,
                    },
                    summary: {
                        title:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'title')) ||
                            deterministicFallback.summary.title,
                        content:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'content')) ||
                            deterministicFallback.summary.content,
                        trust_score: deterministicFallback.summary.trust_score,
                        trust_reason:
                            sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'trust_reason')) ||
                            deterministicFallback.summary.trust_reason,
                    },
                } satisfies FreeReadingReport;

                return NextResponse.json({
                    success: true,
                    report: buildOracleReportEnrichment(recoveredReport, {
                        characterId: resolvedCharacterId,
                        questionIntent: resolvedQuestionIntent,
                        selectionMode: effectiveSelectionMode,
                        language: language as ReadingLanguage,
                        advisorProfile,
                        advisorEvidenceSummary,
                        precisionMetadata,
                        oracleCouncil,
                    }),
                    isPremium: false,
                    metadata: {
                        ...buildReadingMetadata({
                            guide,
                            saju,
                            astrology,
                            cards,
                            characterId: resolvedCharacterId,
                            questionIntent: resolvedQuestionIntent,
                            selectionMode: effectiveSelectionMode,
                            advisorProfile,
                            advisorEvidenceSummary,
                            precisionMetadata,
                            oracleCouncil,
                            partnerSaju,
                        }),
                        fallbackMode: 'partial_json_recovery',
                    },
                });
            }

            return NextResponse.json(
                {
                    success: false,
                    error: language === 'en'
                        ? (isProviderPressure
                            ? 'The oracle is crowded right now. Please wait a bit and try again.'
                            : 'We could not complete your reading right now. Please try again.')
                        : (isProviderPressure
                            ? '지금 오라클 리딩이 혼잡합니다. 잠시 후 다시 시도해주세요.'
                            : '지금은 리딩을 끝까지 생성하지 못했습니다. 다시 시도해주세요.'),
                    code: isProviderPressure ? 'AI_TEMPORARILY_UNAVAILABLE' : 'AI_GENERATION_FAILED',
                },
                { status: isProviderPressure ? 503 : 500 }
            );
        }

    } catch (error) {
        console.error('Reading API error:', error);
        return NextResponse.json(
            { error: '리딩 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 500 }
        );
    }
}

// GET - 상태 확인용
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'CosmicPath Reading API',
        version: '2.0.0',
        features: ['saju', 'astrology', 'tarot', 'ai-interpretation', 'premium-multi-turn'],
    });
}
/**
 * Adapter to map the new OracleSajuProfile to legacy SajuResult format 
 * used by the Tag Engine and existing reporting logic.
 */
function mapToLegacySaju(profile: OracleSajuProfile) {
    const raw = profile.raw;
    const pillars = raw.pillars; // [hour, day, month, year]

    // Convert new pillars structure to legacy format
    const legacyPillars = {
        hour: { stem: pillars[0].pillar.fullStem, branch: pillars[0].pillar.fullBranch },
        day: { stem: pillars[1].pillar.fullStem, branch: pillars[1].pillar.fullBranch },
        month: { stem: pillars[2].pillar.fullStem, branch: pillars[2].pillar.fullBranch },
        year: { stem: pillars[3].pillar.fullStem, branch: pillars[3].pillar.fullBranch },
    };

    return {
        ...legacyPillars,
        yeonPillar: legacyPillars.year,
        monthPillar: legacyPillars.month,
        dayPillar: legacyPillars.day,
        hourPillar: legacyPillars.hour,
        dayMaster: pillars[1].pillar.fullStem,
        elements: pillars.map((pillarEntry: typeof pillars[number]) => ({
            stem: pillarEntry.pillar.stemElement,
            branch: pillarEntry.pillar.branchElement,
        })).reverse(), // Back to [year, month, day, hour] order for legacy
        tenGods: {
            yeonStem: pillars[3].stemSipsin,
            monthStem: pillars[2].stemSipsin,
            dayStem: pillars[1].stemSipsin, 
            hourStem: pillars[0].stemSipsin,
            yeonBranch: pillars[3].branchSipsin,
            monthBranch: pillars[2].branchSipsin,
            dayBranch: pillars[1].branchSipsin,
            hourBranch: pillars[0].branchSipsin,
        },
        // Injection block for LLM prompt
        oraclePromptBlock: profile.raw.pillars ? buildOracleSajuPromptBlock(profile) : '',
        precisionMetadata: profile.precisionMetadata,
        oracleCouncil: profile.oracleCouncil,
        raw: profile 
    };
}
