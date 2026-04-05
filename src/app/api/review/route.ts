import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limiter';
import {
    extractReadingAccessKey,
    hasReadingAccess,
} from '@/lib/reading-access';

const createReviewSchema = z.object({
    readingId: z.string().optional(),
    accessKey: z.string().optional(),
    nickname: z.string().min(1).max(20),
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10).max(500),
    isPromoUser: z.boolean().default(false),
});

function maskNickname(name: string): string {
    if (!name) return 'Anonymous';
    if (name.length <= 2) return `${name[0]}*`;
    if (name.includes(' ')) return `${name.split(' ')[0]} **`;
    return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name[name.length - 1]}`;
}

export async function GET() {
    try {
        const rawReviews = await prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                nickname: true,
                rating: true,
                content: true,
                createdAt: true,
            },
        });

        const reviews = rawReviews.map((review) => ({
            ...review,
            nickname: maskNickname(review.nickname),
        }));

        return NextResponse.json({ reviews });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const rateLimitResponse = await rateLimit(request, { limit: 3, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const data = createReviewSchema.parse(body);
        const session = await auth();
        const sessionUserId = session?.user?.id ?? null;

        if (data.readingId) {
            const reading = await prisma.readingResult.findUnique({
                where: { id: data.readingId },
                select: {
                    id: true,
                    userId: true,
                    metadata: true,
                },
            });

            if (!reading) {
                return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
            }

            const canReview = hasReadingAccess({
                readingUserId: reading.userId,
                sessionUserId,
                storedAccessKey: extractReadingAccessKey(reading.metadata),
                providedAccessKey: data.accessKey,
            });

            if (!canReview) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const existingReview = await prisma.review.findFirst({
                where: { readingId: data.readingId },
                select: { id: true },
            });

            if (existingReview) {
                return NextResponse.json(
                    { error: 'Review already submitted for this reading' },
                    { status: 409 }
                );
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    readingId: data.readingId,
                    nickname: data.nickname,
                    rating: data.rating,
                    content: data.content,
                    isPromoUser: data.isPromoUser,
                    isApproved: false,
                },
            });

            let rewardGranted = false;
            if (data.readingId) {
                const updatedSession = await tx.chatSession.updateMany({
                    where: { readingResultId: data.readingId },
                    data: { credits: { increment: 1 } },
                });
                rewardGranted = updatedSession.count > 0;
            }

            return { review, rewardGranted };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create review' }, { status: 400 });
    }
}
