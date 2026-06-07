/**
 * 3원 통합 리딩 API
 * POST /api/reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getClientIp } from '@/lib/audit-logger';
import { rateLimit } from '@/lib/rate-limiter';
import {
    type ReadingContext,
} from '@/lib/ai/prompt-builder';
import type { ModelTier } from '@/lib/ai/llm-client';
import { consumeDailyQuota } from '@/lib/plan-limits';
import { trackGrowthEvent } from '@/lib/growth-events';
import {
    ReadingRequestSchema,
} from './route-helpers';
import { runFreeReading, runPremiumReading } from './reading-generation-service';
import {
    resolveInvitationReadingRequest,
    verifyPremiumReadingAccess,
} from './reading-request-service';
import { assembleReadingRuntime } from './reading-runtime-service';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

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
        let sessionUserId: string | null = null;
        const invitationResolution = await resolveInvitationReadingRequest({
            inviteCode,
            phase,
            name,
            tier,
            context: context as ReadingContext,
            partnerName,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
        });
        tier = invitationResolution.tier;
        context = invitationResolution.context;
        partnerName = invitationResolution.partnerName;
        partnerBirthDate = invitationResolution.partnerBirthDate;
        partnerBirthTime = invitationResolution.partnerBirthTime;
        partnerGender = invitationResolution.partnerGender;
        const isInvitePremiumAccess = invitationResolution.isInvitePremiumAccess;

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
        if (isPremiumRequest) {
            const session = await auth();
            sessionUserId = session?.user?.id ?? null;
        }
        let storedReadingMetadata: Record<string, unknown> = {};
        const premiumAccess = await verifyPremiumReadingAccess({
            isPremiumRequest,
            readingId,
            accessKey,
            sessionUserId,
            isInvitePremiumAccess,
        });

        if (!premiumAccess.ok) {
            return premiumAccess.response;
        }

        storedReadingMetadata = premiumAccess.storedReadingMetadata;

        const runtime = await assembleReadingRuntime({
            birthDate,
            birthTime,
            gender,
            cityName,
            longitude,
            latitude,
            calendarType,
            unknownTime,
            partnerBirthDate,
            partnerBirthTime,
            partnerGender,
            partnerName,
            context: context as ReadingContext,
            question,
            language,
            tarotCards,
            storedReadingMetadata,
            useStoredRuntime: isPremiumRequest,
            requestedQuestionIntent,
            selectionMode,
            characterId,
            readingId,
            currentPhase,
        });

        if (tier === 'premium') {
            return runPremiumReading({
                runtime,
                name,
                gender,
                birthDate,
                birthTime,
                context: context as ReadingContext,
                question,
                language,
                phase,
                previousReport,
                partnerName,
                partnerBirthDate,
                partnerBirthTime,
            });
        }

        return runFreeReading({
            runtime,
            context: context as ReadingContext,
            question,
            language,
            currentPhase,
            effectiveModelTier,
            previousReport,
            partnerName,
        });

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
