import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import {
    SUBSCRIPTION_PLAN_IDS,
    getSubscriptionPriceId,
} from '@/lib/payment/payment-config';

const createSubscriptionRequestSchema = z.object({
    planId: z.enum(SUBSCRIPTION_PLAN_IDS),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

function errorResponse(
    code: number,
    message: string,
    details?: string
) {
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

export async function POST(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, 'Unauthorized');
    }

    let parsedBody: z.infer<typeof createSubscriptionRequestSchema>;
    try {
        parsedBody = createSubscriptionRequestSchema.parse(await request.json());
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(400, 'Invalid request schema', error.message);
        }
        return errorResponse(400, 'Bad Request');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
    });

    if (!user) {
        return errorResponse(404, 'User not found');
    }

    const priceId = getSubscriptionPriceId(parsedBody.planId);
    if (!priceId || priceId.endsWith('_TBD')) {
        return errorResponse(500, 'Stripe price ID is not configured');
    }

    try {
        const stripe = getStripe();
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: parsedBody.successUrl,
            cancel_url: parsedBody.cancelUrl,
            client_reference_id: user.id,
            customer_email: user.email ?? undefined,
            metadata: {
                userId: user.id,
                planId: parsedBody.planId,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    planId: parsedBody.planId,
                },
            },
            allow_promotion_codes: true,
        });

        if (!checkoutSession.url) {
            return errorResponse(500, 'Failed to create checkout session');
        }

        return NextResponse.json({
            checkoutUrl: checkoutSession.url,
            sessionId: checkoutSession.id,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(500, 'Server Error', details);
    }
}
