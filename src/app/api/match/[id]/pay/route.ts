'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { MATCH_PRODUCT } from '@/lib/payment/payment-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/match/[id]/pay - Create Stripe checkout session for Match unlock
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify match session exists
        const matchSession = await prisma.matchSession.findUnique({
            where: { id },
        });

        if (!matchSession) {
            return NextResponse.json(
                { error: 'Match session not found' },
                { status: 404 }
            );
        }

        if (matchSession.isUnlocked) {
            return NextResponse.json(
                { error: 'Already unlocked', redirectUrl: `/match/${id}/result` },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await createCheckoutSession({
            productId: MATCH_PRODUCT.productId,
            successUrl: `${origin}/match/${id}/result?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}/match/${id}/result?canceled=true`,
            metadata: {
                matchSessionId: id,
                productType: 'match',
            },
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session');
        }

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error('Match payment initialization failed:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
