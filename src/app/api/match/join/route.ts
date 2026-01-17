import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculateCompatibility } from '@/lib/match/match-calculator';

const joinMatchSchema = z.object({
    sessionId: z.string().uuid(),
    guestName: z.string().min(1).max(50),
    guestBirth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    guestTimezone: z.string().default('Asia/Seoul'),
});

/**
 * POST /api/match/join - Guest joins a match session and triggers score calculation
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = joinMatchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { sessionId, guestName, guestBirth, guestTimezone } = parsed.data;

        // Find existing session
        const session = await prisma.matchSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Match session not found' },
                { status: 404 }
            );
        }

        if (session.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'Match session has expired' },
                { status: 410 }
            );
        }

        // Calculate compatibility score
        const hostBirthDate = new Date(session.hostBirth);
        const guestBirthDate = new Date(guestBirth);

        const result = calculateCompatibility(
            {
                name: session.hostName,
                birthDate: hostBirthDate,
                timezone: session.hostTimezone,
            },
            {
                name: guestName,
                birthDate: guestBirthDate,
                timezone: guestTimezone,
            }
        );

        // Update session with guest data and score
        const updatedSession = await prisma.matchSession.update({
            where: { id: sessionId },
            data: {
                guestName,
                guestBirth: guestBirthDate,
                guestTimezone,
                score: result.overallScore,
                metadata: JSON.stringify(result),
            },
        });

        return NextResponse.json({
            success: true,
            sessionId: updatedSession.id,
            score: result.overallScore,
            summary: result.summary,
            // Only reveal full details if unlocked
            details: updatedSession.isUnlocked ? result : undefined,
        });
    } catch (error: any) {
        console.error('[Match Join] Error:', error);
        return NextResponse.json(
            { error: 'Failed to join match session' },
            { status: 500 }
        );
    }
}
