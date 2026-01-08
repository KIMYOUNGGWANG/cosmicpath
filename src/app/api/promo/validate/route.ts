
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateSchema = z.object({
    code: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code } = validateSchema.parse(body);

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

        return NextResponse.json({
            valid: true,
            discount: promoCode.discount,
            remaining: promoCode.maxUses - promoCode.usedCount,
            id: promoCode.id
        });

    } catch (error) {
        return NextResponse.json({ valid: false, message: '오류가 발생했습니다.' }, { status: 400 });
    }
}
