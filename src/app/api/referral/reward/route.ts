import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { trackGrowthEvent } from '@/lib/growth-events';
import { claimReferralReward, ReferralRewardError } from '@/lib/referral-rewards';

const referralRewardSchema = z.object({
    referralCode: z.string().trim().min(8).max(32),
    inviteeUserId: z.string().trim().min(1),
});

function errorResponse(code: number, message: string, details?: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
        },
        { status: code }
    );
}

export async function POST(request: NextRequest) {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId) {
        return errorResponse(401, '로그인이 필요합니다.');
    }

    const body = await request.json().catch(() => null);
    const parsed = referralRewardSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(400, '유효하지 않은 요청입니다.', parsed.error.message);
    }

    if (parsed.data.inviteeUserId !== sessionUserId) {
        return errorResponse(401, '로그인 사용자 정보와 요청 값이 일치하지 않습니다.');
    }

    try {
        const result = await claimReferralReward(parsed.data);

        await trackGrowthEvent({
            event: 'referral_reward_granted',
            referralCode: parsed.data.referralCode.trim().toUpperCase(),
            channel: 'api_referral_reward',
            metadata: {
                inviteeUserId: sessionUserId,
                inviterUserId: result.inviterUserId,
                creditsAdded: result.creditsAdded,
            },
        });

        return NextResponse.json({
            ok: true,
            inviterUserId: result.inviterUserId,
            creditsAdded: result.creditsAdded,
        });
    } catch (error) {
        if (error instanceof ReferralRewardError) {
            return errorResponse(error.code, error.message);
        }

        const details = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(500, '서버 오류가 발생했습니다.', details);
    }
}
