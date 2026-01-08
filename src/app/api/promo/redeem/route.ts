
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const redeemSchema = z.object({
    codeId: z.string(),
    readingId: z.string().optional(),
    userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { codeId, readingId, userAgent } = redeemSchema.parse(body);

        const result = await prisma.$transaction(async (tx) => {
            const promoCode = await tx.promotionCode.findUnique({
                where: { id: codeId }
            });

            if (!promoCode || !promoCode.isActive) {
                throw new Error('Invalid code');
            }

            if (promoCode.usedCount >= promoCode.maxUses) {
                throw new Error('Limit exceeded');
            }

            // Increment usage
            await tx.promotionCode.update({
                where: { id: codeId },
                data: { usedCount: { increment: 1 } }
            });

            // Record redemption
            const redemption = await tx.promoRedemption.create({
                data: {
                    promoCodeId: codeId,
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
            { success: false, message: error.message || 'Failed to redeem' },
            { status: 400 }
        );
    }
}
