import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

const createMatchSchema = z.object({
    hostName: z.string().min(1).max(50),
    hostBirth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    hostTimezone: z.string().default('Asia/Seoul'),
});

/**
 * POST /api/match/create - Create a new match session (Host)
 */
export async function POST(request: NextRequest) {
    // Rate limit: IP당 1분에 5회 제한
    const rateLimitResponse = await rateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const parsed = createMatchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { hostName, hostBirth, hostTimezone } = parsed.data;

        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const session = await prisma.matchSession.create({
            data: {
                hostName,
                hostBirth: new Date(hostBirth),
                hostTimezone,
                expiresAt,
            },
        });

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app';
        const inviteUrl = `${origin}/match/${session.id}/join`;

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            inviteUrl,
            expiresAt: session.expiresAt,
        });
    } catch (error: any) {
        console.error('[Match Create] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create match session' },
            { status: 500 }
        );
    }
}
