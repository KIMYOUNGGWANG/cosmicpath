
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
    readingId: z.string().optional(),
    nickname: z.string().min(1).max(20),
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10).max(500),
    isPromoUser: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
    try {
        const reviews = await prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
