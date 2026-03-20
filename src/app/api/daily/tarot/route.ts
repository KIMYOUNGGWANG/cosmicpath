import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDailyTarotReading, type DailyTarotResponse } from '@/lib/daily-tarot';
import { prisma } from '@/lib/prisma';
import { isSubscriptionActive } from '@/lib/subscription';

const querySchema = z.object({
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const dailyTarotCache = new Map<string, { expiresAt: number; data: DailyTarotResponse }>();

function toYmd(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getNextMidnight(date: Date): Date {
    const next = new Date(date);
    next.setHours(24, 0, 0, 0);
    return next;
}

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

async function resolvePremiumStatusForRequest(): Promise<boolean> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
        },
    });

    if (!user) {
        return false;
    }

    return isSubscriptionActive(user.subscriptionStatus, user.subscriptionExpiresAt);
}

export async function GET(request: NextRequest) {
    const parsed = querySchema.safeParse({
        birthday: request.nextUrl.searchParams.get('birthday') ?? '',
    });

    if (!parsed.success) {
        return errorResponse(400, '유효하지 않은 입력입니다.', parsed.error.message);
    }

    const now = new Date();
    const today = toYmd(now);
    const midnight = getNextMidnight(now);
    const isPremium = await resolvePremiumStatusForRequest();
    const cacheKey = `${today}|${parsed.data.birthday}|${isPremium ? 'premium' : 'free'}`;

    const cached = dailyTarotCache.get(cacheKey);
    if (cached && cached.expiresAt > now.getTime()) {
        return NextResponse.json(cached.data, {
            headers: {
                'Cache-Control': `public, s-maxage=${Math.max(
                    1,
                    Math.floor((cached.expiresAt - now.getTime()) / 1000)
                )}, stale-while-revalidate=60`,
            },
        });
    }

    const response = getDailyTarotReading(parsed.data.birthday, today, isPremium);

    dailyTarotCache.set(cacheKey, {
        data: response,
        expiresAt: midnight.getTime(),
    });

    return NextResponse.json(response, {
        headers: {
            'Cache-Control': `public, s-maxage=${Math.max(
                1,
                Math.floor((midnight.getTime() - now.getTime()) / 1000)
            )}, stale-while-revalidate=60`,
        },
    });
}
