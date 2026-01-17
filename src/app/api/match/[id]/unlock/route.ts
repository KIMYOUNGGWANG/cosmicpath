import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateCompatibility } from '@/lib/match/match-calculator';

/**
 * POST /api/match/[id]/unlock - Manually unlock a match session and regenerate analysis
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the existing session first
        const session = await prisma.matchSession.findUnique({
            where: { id },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Regenerate the match analysis with premium content
        let newMetadata = session.metadata;
        if (session.guestName && session.guestBirth) {
            const result = calculateCompatibility(
                {
                    name: session.hostName,
                    birthDate: new Date(session.hostBirth),
                    timezone: session.hostTimezone,
                },
                {
                    name: session.guestName,
                    birthDate: new Date(session.guestBirth),
                    timezone: session.guestTimezone || 'Asia/Seoul',
                }
            );
            newMetadata = JSON.stringify(result);
        }

        const updatedSession = await prisma.matchSession.update({
            where: { id },
            data: {
                isUnlocked: true,
                unlockedAt: new Date(),
                paymentId: `manual_unlock_${Date.now()}`,
                metadata: newMetadata,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Session unlocked with premium content regenerated',
            session: {
                id: updatedSession.id,
                isUnlocked: updatedSession.isUnlocked,
                unlockedAt: updatedSession.unlockedAt,
            },
        });
    } catch (error: any) {
        console.error('[Match Unlock] Error:', error);
        return NextResponse.json(
            { error: 'Failed to unlock session' },
            { status: 500 }
        );
    }
}
