/**
 * 3원 통합 리딩 API
 * POST /api/reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
    buildFallbackMessage,
    ReadingContext
} from '@/lib/ai/prompt-builder';
import { generateStructuredReport, ModelTier } from '@/lib/ai/llm-client';
import { generatePremiumReport, generateSinglePhase } from '@/lib/ai/premium-reading-service';
import { consumeDailyQuota } from '@/lib/plan-limits';
import { trackGrowthEvent } from '@/lib/growth-events';

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
    phase: z.number().min(1).max(7).optional(), // for multi-step execution
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
});

type ReadingLanguage = 'ko' | 'en';

interface FreeFocusPayload {
    action_conclusion: string;
    evidence_summary: string;
    next_question: string;
}

function sanitizeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
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
        sajuProfile: OracleSajuProfile;
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
        precisionMetadata: params.sajuProfile.precisionMetadata,
        oracleCouncil: params.sajuProfile.oracleCouncil,
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
    guide: ReturnType<typeof generateInterpretationGuide>;
    saju: ReturnType<typeof mapToLegacySaju>;
    astrology: ReturnType<typeof calculateAstrology>;
    cards: TarotCard[];
    characterId: string;
    questionIntent: OracleQuestionIntent;
    selectionMode: OracleSelectionMode;
    advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
    advisorEvidenceSummary: string;
    sajuProfile: OracleSajuProfile;
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
        precisionMetadata: params.sajuProfile.precisionMetadata,
        precision: params.sajuProfile.precisionMetadata,
        oracleCouncil: params.sajuProfile.oracleCouncil,
    };
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
            isPaid,
        } = validationResult.data;
        const clientIp = getClientIp(request.headers);

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
                    isPaid = true;
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
        if (isFirstPhase && !isPaid && tier === 'free') {
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

        // 1. 사주/점성술용 날짜 파싱 (타임존 이슈 방지: YYYY, MM, DD 직접 추출)
        const [yearPart, monthPart, dayPart] = birthDate.split('-').map(Number);

        const [hours, minutes] = birthTime.split(':').map(Number);
        // 실제 생시 반영된 Date 객체
        const exactBirthDateTime = new Date(yearPart, monthPart - 1, dayPart, hours, minutes || 0, 0);

        // 2. Parallel Calculations (Saju Engine Core + Astrology)
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

        // Map new engine result to legacy format for tag engine compatibility
        const saju = mapToLegacySaju(sajuProfile);

        const [partnerSaju, astrology] = await Promise.all([
            partnerBirthDate
                ? (async () => {
                    const profile = await calculateOracleSajuProfile({
                        birthDate: partnerBirthDate,
                        birthTime: partnerBirthTime || '12:00',
                        gender: partnerGender || 'male',
                        unknownTime: !partnerBirthTime
                    });
                    return mapToLegacySaju(profile);
                })()
                : Promise.resolve(null),
            Promise.resolve(calculateAstrology(exactBirthDateTime, birthTime))
        ]);
        const resolvedQuestionIntent = requestedQuestionIntent ?? inferQuestionIntent({
            context,
            question,
            partnerBirthDate,
            partnerName,
        });
        const resolvedCharacterId = selectionMode === 'manual'
            ? resolveOracleCharacterId(characterId)
            : getRecommendedOracleCharacterId({
                context,
                question,
                partnerBirthDate,
                partnerName,
                questionIntent: resolvedQuestionIntent,
            });
        const advisorProfile = buildOracleAdvisorProfile(resolvedCharacterId, selectionMode);
        const advisorEvidenceSummary = buildOracleAdvisorEvidenceSummary({
            profile: sajuProfile,
            questionIntent: resolvedQuestionIntent,
            evidencePriority: advisorProfile.evidencePriority,
            language: language as 'ko' | 'en',
        });

        // 3. 타로 카드 (전달받거나 자동 선택)
        const cards = (tarotCards || drawCards(1)) as TarotCard[];

        // 4. 태그 추출
        const tagResult = extractAllTags(saju, astrology, cards);

        // 5. 충돌 해결 및 신뢰도 계산
        const guide = generateInterpretationGuide(tagResult, question);

        // ===== Premium Mode: Multi-Turn API =====
        if (tier === 'premium') {
            // Free users can access phase 1 only. Any deeper premium path must be verified server-side.
            const currentPhase = phase || 1;
            const requiresPremiumVerification = !phase || currentPhase > 1;

            if (requiresPremiumVerification) {
                let isVerified = false;

                if (readingId) {
                    const reading = await prisma.readingResult.findUnique({
                        where: { id: readingId },
                        select: { metadata: true },
                    });

                    if (reading?.metadata) {
                        try {
                            const meta = JSON.parse(reading.metadata) as Record<string, unknown>;
                            if (meta.isPremium === true) {
                                isVerified = true;
                            }
                        } catch (e) {
                            console.error('Metadata parse failed during verification', e);
                        }
                    }
                }

                if (inviteCode) {
                    isVerified = true;
                }

                if (!isVerified) {
                    return NextResponse.json(
                        { error: '결제 정보가 확인되지 않습니다.', code: 'PAYMENT_REQUIRED' },
                        { status: 402 }
                    );
                }
            }

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
                selectionMode,
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
                            selectionMode,
                            language: language as ReadingLanguage,
                            advisorProfile,
                            advisorEvidenceSummary,
                            sajuProfile,
                        }),
                        isPremium: true,
                        metadata: buildReadingMetadata({
                            guide,
                            saju,
                            astrology,
                            cards,
                            characterId: resolvedCharacterId,
                            questionIntent: resolvedQuestionIntent,
                            selectionMode,
                            advisorProfile,
                            advisorEvidenceSummary,
                            sajuProfile,
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
                        selectionMode,
                        language: language as ReadingLanguage,
                        advisorProfile,
                        advisorEvidenceSummary,
                        sajuProfile,
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
                        selectionMode,
                        advisorProfile,
                        advisorEvidenceSummary,
                        sajuProfile,
                    }),
                });
            } catch (premiumError) {
                console.error('Premium generation failed:', premiumError);
                // Fall through to standard mode
            }
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
                selectionMode,
                isPremium: false,
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
                selectionMode,
                advisorEvidenceSummary,
                isPremium: false,
            }
        );

        try {
            const report = await generateStructuredReport(
                systemPrompt,
                userPrompt,
                tier as ModelTier
            );

            return NextResponse.json({
                success: true,
                report: buildOracleReportEnrichment(report, {
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode,
                    language: language as ReadingLanguage,
                    advisorProfile,
                    advisorEvidenceSummary,
                    sajuProfile,
                }),
                isPremium: false,
                metadata: buildReadingMetadata({
                    guide,
                    saju,
                    astrology,
                    cards,
                    characterId: resolvedCharacterId,
                    questionIntent: resolvedQuestionIntent,
                    selectionMode,
                    advisorProfile,
                    advisorEvidenceSummary,
                    sajuProfile,
                }),
            });

        } catch (aiError) {
            console.error('AI generation failed:', aiError);

            const fallbackMessage = buildFallbackMessage(context as ReadingContext, language as 'ko' | 'en');

            return NextResponse.json({
                success: false,
                isFallback: true,
                error: 'AI 리포트 생성 실패',
                fallbackMessage: fallbackMessage,
            });
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
