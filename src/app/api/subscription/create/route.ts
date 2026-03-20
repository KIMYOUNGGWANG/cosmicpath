import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import {
    SUBSCRIPTION_CHECKOUT_PLAN_MAP,
    SUBSCRIPTION_PLAN_TYPES,
    getSubscriptionPriceIdForPlanType,
} from '@/lib/payment/payment-config';

const createSubscriptionRequestSchema = z.object({
    planType: z.enum(SUBSCRIPTION_PLAN_TYPES),
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

function resolveAppOrigin(request: NextRequest): string {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    if (forwardedHost && forwardedProto) {
        return `${forwardedProto}://${forwardedHost}`;
    }

    return request.headers.get('origin') || request.nextUrl.origin;
}

function getTestPriceEnvKey(planType: z.infer<typeof createSubscriptionRequestSchema>['planType']): string {
    switch (planType) {
        case 'WEEKLY':
            return 'NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY_TEST';
        case 'MONTHLY':
            return 'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY_TEST';
        case 'ANNUAL':
            return 'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY_TEST';
    }
}

function getStripeConfigHint(planType: z.infer<typeof createSubscriptionRequestSchema>['planType']): string | null {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? '';
    const isTestSecret = secretKey.startsWith('sk_test_');

    if (!isTestSecret) {
        return null;
    }

    const envKey = getTestPriceEnvKey(planType);
    if (process.env[envKey]?.trim()) {
        return null;
    }

    return `Using a Stripe test secret without ${envKey}. Add the matching test-mode recurring price ID to .env.local.`;
}

export async function POST(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, '로그인이 필요합니다.');
    }

    let parsedBody: z.infer<typeof createSubscriptionRequestSchema>;
    try {
        parsedBody = createSubscriptionRequestSchema.parse(await request.json());
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(400, '유효하지 않은 입력입니다.', error.message);
        }
        return errorResponse(400, '잘못된 요청입니다.');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
    });

    if (!user) {
        return errorResponse(404, '사용자를 찾을 수 없습니다.');
    }

    const priceId = getSubscriptionPriceIdForPlanType(parsedBody.planType);
    if (!priceId || priceId.endsWith('_TBD')) {
        return errorResponse(500, '구독 가격 설정이 누락되었습니다.');
    }

    try {
        const stripe = getStripe();
        const origin = resolveAppOrigin(request);
        const planId = SUBSCRIPTION_CHECKOUT_PLAN_MAP[parsedBody.planType];
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: new URL('/billing/success', origin).toString(),
            cancel_url: new URL('/billing/cancel', origin).toString(),
            client_reference_id: user.id,
            customer_email: user.email ?? undefined,
            metadata: {
                userId: user.id,
                planId,
                planType: parsedBody.planType,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    planId,
                    planType: parsedBody.planType,
                },
            },
            allow_promotion_codes: true,
        });

        if (!checkoutSession.url) {
            return errorResponse(500, '구독 결제 세션 생성에 실패했습니다.');
        }

        return NextResponse.json({
            checkoutUrl: checkoutSession.url,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        const configHint = getStripeConfigHint(parsedBody.planType);
        const mergedDetails = configHint ? `${details} ${configHint}` : details;
        return errorResponse(500, '서버 오류가 발생했습니다.', mergedDetails);
    }
}
