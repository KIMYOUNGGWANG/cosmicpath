
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

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

        const result = await prisma.$transaction(async (tx) => {
            const promoCode = await tx.promotionCode.findUnique({
                where: { id: codeId }
            });

            if (!promoCode || !promoCode.isActive) {
                throw new Error('유효하지 않은 코드입니다.');
            }

            if (promoCode.usedCount >= promoCode.maxUses) {
                throw new Error('선착순 마감된 코드입니다.');
            }

            // Check if email already used this code
            const existingRedemption = await tx.promoRedemption.findFirst({
                where: {
                    promoCodeId: codeId,
                    email: email
                }
            });

            if (existingRedemption) {
                throw new Error('이미 이 프로모션 코드를 사용하셨습니다.');
            }

            // Increment usage
            await tx.promotionCode.update({
                where: { id: codeId },
                data: { usedCount: { increment: 1 } }
            });

            // Record redemption with email
            const redemption = await tx.promoRedemption.create({
                data: {
                    promoCodeId: codeId,
                    email,
                    readingId,
                    userAgent
                }
            });

            return redemption;
        });

        return NextResponse.json({ success: true, redemptionId: result.id });

    } catch (error: any) {
        console.error('Redemption error:', error);
        return NextResponse.json(
            { success: false, message: error.message || '프로모션 코드 사용에 실패했습니다.' },
            { status: 400 }
        );
    }
}
