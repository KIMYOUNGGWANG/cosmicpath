import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/match/[id] - Get match session details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await prisma.matchSession.findUnique({
            where: { id },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Match session not found' },
                { status: 404 }
            );
        }

        const isExpired = session.expiresAt < new Date();
        const hasGuest = !!session.guestName;

        // Parse metadata if exists
        let details = null;
        if (session.metadata) {
            try {
                details = JSON.parse(session.metadata);
            } catch {
                details = null;
            }
        }

        return NextResponse.json({
            id: session.id,
            hostName: session.hostName,
            guestName: session.guestName,
            score: session.score,
            isUnlocked: session.isUnlocked,
            isExpired,
            hasGuest,
            summary: details?.summary,
            // Only return full details if unlocked
            details: session.isUnlocked ? details : {
                hostSign: details?.hostSign,
                guestSign: details?.guestSign,
                hostElement: details?.hostElement,
                guestElement: details?.guestElement,
            },
            expiresAt: session.expiresAt,
        });
    } catch (error: any) {
        console.error('[Match Get] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match session' },
            { status: 500 }
        );
    }
}
