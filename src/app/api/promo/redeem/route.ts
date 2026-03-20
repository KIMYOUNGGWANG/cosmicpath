
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';
import { redeemPromotionCode } from '@/lib/promo-codes';

const redeemSchema = z.object({
    codeId: z.string(),
    email: z.string().email(), // Required for duplicate prevention
    readingId: z.string().optional(),
    userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
    // Rate limit: IP당 1분에 5회 제한
    const rateLimitResponse = await rateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const { codeId, email, readingId, userAgent } = redeemSchema.parse(body);
        const result = await redeemPromotionCode({
            codeId,
            email,
            readingId,
            userAgent,
        });

        return NextResponse.json({
            success: true,
            redemptionId: result.redemptionId,
            alreadyRedeemed: result.alreadyRedeemed,
        });
    } catch (error: unknown) {
        console.error('Redemption error:', error);
        const message = error instanceof Error ? error.message : '프로모션 코드 사용에 실패했습니다.';
        return NextResponse.json(
            { success: false, message },
            { status: 400 }
        );
    }
}
