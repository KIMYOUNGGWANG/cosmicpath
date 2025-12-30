/**
 * 3원 통합 리딩 API
 * POST /api/reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
    phase: z.number().min(1).max(5).optional(), // for multi-step execution
    previousReport: z.object({}).passthrough().optional(), // previous phase data
});

export async function POST(request: NextRequest) {
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

        const { name, gender, birthDate, birthTime, context, question, tarotCards, tier, language, phase, previousReport } = validationResult.data;

        // 1. 사주 계산
        const birthDateTime = new Date(birthDate);
        const [hours] = birthTime.split(':').map(Number);
        const saju = calculateSaju(birthDateTime, hours);

        // 2. 점성술 계산
        const astrology = calculateAstrology(birthDateTime, birthTime);

        // 3. 타로 카드 (전달받거나 자동 선택)
        const cards = (tarotCards || drawCards(1)) as TarotCard[];

        // 4. 태그 추출
        const tagResult = extractAllTags(saju, astrology, cards);

        // 5. 충돌 해결 및 신뢰도 계산
        const guide = generateInterpretationGuide(tagResult, question);

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
                            keyThemes: guide.keyThemes,
                            saju: {
                                yearPillar: `${saju.yearPillar.stem}${saju.yearPillar.branch}`,
                                dayMaster: saju.dayMaster,
                                fullSaju: `${saju.yearPillar.stem}${saju.yearPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                            },
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
                        keyThemes: guide.keyThemes,
                        saju: {
                            yearPillar: `${saju.yearPillar.stem}${saju.yearPillar.branch}`,
                            dayMaster: saju.dayMaster,
                            fullSaju: `${saju.yearPillar.stem}${saju.yearPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                        },
                        astrology: {
                            sunSign: astrology.sunSign,
                            moonSign: astrology.moonSign,
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
            currentDate
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
                    keyThemes: guide.keyThemes,
                    saju: {
                        yearPillar: `${saju.yearPillar.stem}${saju.yearPillar.branch}`,
                        dayMaster: saju.dayMaster,
                        fullSaju: `${saju.yearPillar.stem}${saju.yearPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`,
                    },
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

