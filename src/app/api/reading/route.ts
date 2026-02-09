/**
 * 3원 통합 리딩 API
 * POST /api/reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';
import { calculateSaju } from '@/lib/engines/saju';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { drawCards, TarotCard } from '@/lib/engines/tarot';
import { extractAllTags } from '@/lib/core/tag-engine';
import { generateInterpretationGuide, renderConfidenceStars } from '@/lib/core/conflict-resolver';
import {
    buildSystemPrompt,
    buildStructuredSystemPrompt,
    buildUserPrompt,
    buildDisclaimer,
    buildFallbackMessage,
    ReadingContext
} from '@/lib/ai/prompt-builder';
import { generateStructuredReport, ModelTier } from '@/lib/ai/llm-client';
import { generatePremiumReport, generateSinglePhase } from '@/lib/ai/premium-reading-service';

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
    phase: z.number().min(1).max(6).optional(), // for multi-step execution (5A/5B split)
    previousReport: z.object({}).passthrough().optional(), // previous phase data
    calendarType: z.enum(['solar', 'lunar']).default('solar'),
    unknownTime: z.boolean().default(false),
    isPaid: z.boolean().default(false),
    inviteCode: z.string().optional(),
    readingId: z.string().optional(),
});

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

        let {
            name,
            gender,
            birthDate,
            birthTime,
            context,
            question,
            tarotCards,
            tier,
            language,
            phase,
            previousReport,
            calendarType,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
            partnerName,
            unknownTime,
            isPaid,
            inviteCode,
            readingId
        } = validationResult.data;

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
                        } catch (err) {
                            console.error('[Viral] Failed to increment count:', err);
                        }
                    }
                } catch (e) {
                    console.error('[Viral] Failed to parse inviter data', e);
                }
            }
        }

        // 1. 사주/점성술용 날짜 파싱 (타임존 이슈 방지: YYYY, MM, DD 직접 추출)
        const [yearPart, monthPart, dayPart] = birthDate.split('-').map(Number);

        const [hours, minutes] = birthTime.split(':').map(Number);
        // 실제 생시 반영된 Date 객체
        const exactBirthDateTime = new Date(yearPart, monthPart - 1, dayPart, hours, minutes || 0, 0);

        // 사주 계산 (Solar Term 기반 + 30분 보정 및 조자시 반영)
        const saju = calculateSaju(exactBirthDateTime, hours, minutes || 0, calendarType === 'lunar', gender);

        // 상대방 사주 계산 (궁합/재회 분석용 - optional)
        let partnerSaju = null;
        if (partnerBirthDate) {
            const [pYear, pMonth, pDay] = partnerBirthDate.split('-').map(Number);
            const [pHours, pMinutes] = partnerBirthTime ? partnerBirthTime.split(':').map(Number) : [12, 0];
            const partnerDateTime = new Date(pYear, pMonth - 1, pDay, pHours, pMinutes || 0, 0);
            partnerSaju = calculateSaju(partnerDateTime, pHours, pMinutes || 0, false, partnerGender || 'male');
        }

        // 2. 점성술 계산
        const astrology = calculateAstrology(exactBirthDateTime, birthTime);

        // 3. 타로 카드 (전달받거나 자동 선택)
        const cards = (tarotCards || drawCards(1)) as TarotCard[];

        // 4. 태그 추출
        const tagResult = extractAllTags(saju, astrology, cards);

        // 5. 충돌 해결 및 신뢰도 계산
        const guide = generateInterpretationGuide(tagResult, question);

        // ===== Premium Mode: Multi-Turn API =====
        if (tier === 'premium') {
            // 🔒 결제 검증: Phase 2 이상은 DB에서 실제 결제 여부 확인
            const currentPhase = validationResult.data.phase || 1;

            if (currentPhase >= 2) {
                let isVerified = false;

                // 1. readingId로 DB 조회
                if (readingId) {
                    const reading = await import('@/lib/prisma').then(m => m.prisma.readingResult.findUnique({
                        where: { id: readingId }
                    }));

                    if (reading) {
                        try {
                            const meta = JSON.parse(reading.metadata || '{}');
                            // Webhook이나 Save API에서 결제 완료 시 isPremium: true로 설정함
                            if (meta.isPremium || meta.emailSent) {
                                isVerified = true;
                            }
                        } catch (e) {
                            console.error('Metadata parse failed during verification', e);
                        }
                    }
                }

                // 2. 초대 코드(Viral)로 인한 무료 업그레이드인 경우
                if (isPaid && inviteCode) {
                    // 이미 앞단 Viral Loop 로직에서 isPaid=true로 설정됨 (신뢰 가능: 서버 로직 내에서 설정됨)
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
                        report: phaseResult.data,
                        isPremium: true,
                        metadata: {
                            confidence: guide.confidence,
                            matching: guide.matching,
                            radarScores: guide.radarScores,
                            keyThemes: guide.keyThemes,
                            saju: {
                                yeonPillar: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}`,
                                dayMaster: saju.dayMaster,
                                fullSaju: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                            },
                            sajuResult: saju,
                            astrology: {
                                sunSign: astrology.sunSign,
                                moonSign: astrology.moonSign,
                                ascendant: astrology.ascendant,
                            },
                            tarot: cards.map(c => ({ name: c.name, isReversed: c.isReversed })),
                        }
                    });
                }

                // Default: Run all phases (Risk of Timeout on Vercel Hobby)
                const premiumResult = await generatePremiumReport(userData, apiKey as string);

                return NextResponse.json({
                    success: premiumResult.success,
                    report: premiumResult.report,
                    error: premiumResult.error, // 에러 메시지 포함
                    isPremium: true,
                    metadata: {
                        confidence: guide.confidence,
                        matching: guide.matching,
                        radarScores: guide.radarScores,
                        keyThemes: guide.keyThemes,
                        saju: {
                            yeonPillar: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}`,
                            dayMaster: saju.dayMaster,
                            fullSaju: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                        },
                        sajuResult: saju,
                        astrology: {
                            sunSign: astrology.sunSign,
                            moonSign: astrology.moonSign,
                            ascendant: astrology.ascendant,
                        },
                        tarot: cards.map(c => ({ name: c.name, isReversed: c.isReversed })),
                    }
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

        const systemPrompt = buildStructuredSystemPrompt(language as 'ko' | 'en');
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
            partnerName
        );

        try {
            const report = await generateStructuredReport(
                systemPrompt,
                userPrompt,
                tier as ModelTier
            );

            return NextResponse.json({
                success: true,
                report: report,
                isPremium: false,
                metadata: {
                    confidence: guide.confidence,
                    matching: guide.matching,
                    radarScores: guide.radarScores,
                    keyThemes: guide.keyThemes,
                    saju: {
                        yeonPillar: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}`,
                        dayMaster: saju.dayMaster,
                        fullSaju: `${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                    },
                    sajuResult: saju,
                    astrology: {
                        sunSign: astrology.sunSign,
                        moonSign: astrology.moonSign,
                    },
                    tarot: cards.map(c => ({ name: c.name, isReversed: c.isReversed })),
                }
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
