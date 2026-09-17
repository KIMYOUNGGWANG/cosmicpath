import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limiter';
import { extractReadingAccessKey, hasReadingAccess } from '@/lib/reading-access';
import { sendResultEmail } from '@/lib/email/sender';
import { devLog } from '@/lib/dev-logger';

const SendResultSchema = z.object({
    email: z.string().email(),
    resultId: z.string().min(1),
    accessKey: z.string().optional(),
    title: z.string().optional(),
    birthInfo: z.string().optional(),
    sajuSummary: z.string().optional(),
    userContext: z.string().optional(),
    executiveVerdict: z.string().optional(),
    goldenTiming: z.string().optional(),
    language: z.enum(['ko', 'en']).optional(),
});

export async function POST(request: NextRequest) {
    const rateLimitResponse = await rateLimit(request, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const parsed = SendResultSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input parameters', details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { resultId, accessKey, email, ...emailParams } = parsed.data;

        // Verify that the reading exists and the caller has valid access
        const reading = await prisma.readingResult.findUnique({
            where: { id: resultId },
            select: { id: true, userId: true, metadata: true },
        });

        if (!reading) {
            return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
        }

        const session = await auth();
        const allowed = hasReadingAccess({
            readingUserId: reading.userId,
            sessionUserId: session?.user?.id ?? null,
            storedAccessKey: extractReadingAccessKey(reading.metadata),
            providedAccessKey: accessKey,
        });

        if (!allowed) {
            return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
        }

        const data = await sendResultEmail({
            email,
            resultId,
            accessKey,
            ...emailParams,
        });

        return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
        devLog.error('[Email Send-Result] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
