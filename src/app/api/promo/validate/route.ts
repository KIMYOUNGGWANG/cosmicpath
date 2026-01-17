
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

const validateSchema = z.object({
    code: z.string().min(1),
    email: z.string().email().optional(), // Optional for initial check, required for redemption
});

export async function POST(request: NextRequest) {
    // Rate limit: IP당 1분에 5회 제한 (무차별 대입 공격 방지)
    const rateLimitResponse = await rateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) {
        return rateLimitResponse; // 429 응답 반환
    }

    try {
        const body = await request.json();
        const { code, email } = validateSchema.parse(body);

        const promoCode = await prisma.promotionCode.findUnique({
            where: { code },
            include: {
                _count: {
                    select: { redemptions: true }
                }
            }
        });

        if (!promoCode) {
            return NextResponse.json({ valid: false, message: '유효하지 않은 코드입니다.' });
        }

        if (!promoCode.isActive) {
            return NextResponse.json({ valid: false, message: '비활성화된 코드입니다.' });
        }

        if (new Date() > new Date(promoCode.expiresAt)) {
            return NextResponse.json({ valid: false, message: '만료된 코드입니다.' });
        }

        if (promoCode.usedCount >= promoCode.maxUses) {
            return NextResponse.json({ valid: false, message: '선착순 마감된 코드입니다.' });
        }

        // Check if this email already used this promo code
        if (email) {
            const existingRedemption = await prisma.promoRedemption.findUnique({
                where: {
                    promoCodeId_email: {
                        promoCodeId: promoCode.id,
                        email: email
                    }
                }
            });

            if (existingRedemption) {
                return NextResponse.json({
                    valid: false,
                    message: '이미 이 프로모션 코드를 사용하셨습니다.',
                    alreadyUsed: true
                });
            }
        }

        return NextResponse.json({
            valid: true,
            discount: promoCode.discount,
            remaining: promoCode.maxUses - promoCode.usedCount,
            id: promoCode.id
        });

    } catch (error) {
        console.error('Promo validate error:', error);
        return NextResponse.json({ valid: false, message: '오류가 발생했습니다.' }, { status: 400 });
    }
}
