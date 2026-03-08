import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { rateLimit } from '@/lib/rate-limiter';
import { trackGrowthEvent } from '@/lib/growth-events';

const growthEventSchema = z.object({
    event: z.string().min(1).max(64),
    sessionId: z.string().min(1).max(128).optional(),
    readingId: z.string().max(128).optional(),
    referralCode: z.string().max(64).optional(),
    source: z.string().max(64).optional(),
    step: z.string().max(32).optional(),
    language: z.enum(['ko', 'en']).optional(),
    context: z.string().max(32).optional(),
    invitationMode: z.boolean().optional(),
    price: z.string().max(32).optional(),
    plan: z.string().max(64).optional(),
    path: z.string().max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
    const rateLimitResponse = await rateLimit(request, { limit: 120, windowMs: 60 * 1000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const parsed = growthEventSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid growth event payload' },
                { status: 400 }
            );
        }

        const {
            event,
            readingId,
            referralCode,
            source,
            sessionId,
            step,
            language,
            context,
            invitationMode,
            price,
            plan,
            path,
            metadata,
        } = parsed.data;

        await trackGrowthEvent({
            event,
            readingId,
            referralCode,
            channel: source || path || 'client',
            metadata: {
                sessionId,
                step,
                language,
                context,
                invitationMode,
                price,
                plan,
                path,
                ...metadata,
            },
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Failed to track growth event' }, { status: 500 });
    }
}
