
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

const createReviewSchema = z.object({
    readingId: z.string().optional(),
    nickname: z.string().min(1).max(20),
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10).max(500),
    isPromoUser: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
    try {
        const rawReviews = await prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // 서버 사이드 마스킹 (개인정보 보호)
        const reviews = rawReviews.map(review => ({
            ...review,
            nickname: maskNickname(review.nickname)
        }));

        return NextResponse.json({ reviews });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

function maskNickname(name: string) {
    if (!name) return 'Anonymous';
    if (name.length <= 2) return name[0] + '*';
    if (name.includes(' ')) return name.split(' ')[0] + ' **';
    return name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
}

export async function POST(request: NextRequest) {
    // Rate limit: IP당 1분에 3회 제한 (스팸 리뷰 방지)
    const rateLimitResponse = await rateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const data = createReviewSchema.parse(body);

        const review = await prisma.review.create({
            data: {
                ...data,
                isApproved: false // Requires admin approval
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create review' }, { status: 400 });
    }
}
