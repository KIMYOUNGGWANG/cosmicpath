import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { CHAT_CREDIT_SINGLE, CHAT_CREDIT_PACK } from '@/lib/payment/payment-config';
import { getSafeReturnUrl, resolveSafeAppOrigin } from '@/lib/security-url';
import { z } from 'zod';

const ChatCreditRequestSchema = z.object({
    readingId: z.string().min(1, 'Missing readingId'),
    returnUrl: z.string().optional(),
    creditType: z.enum(['single', 'pack']).optional().default('single'),
    postId: z.string().max(128).optional(),
    pid: z.string().max(128).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = ChatCreditRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.message }, { status: 400 });
        }

        const { readingId, returnUrl, creditType, postId, pid } = parsed.data;
        const normalizedPostId = (postId?.trim() || pid?.trim() || '').slice(0, 128);
        const origin = resolveSafeAppOrigin(request);

        // Select product based on creditType
        const product = creditType === 'pack' ? CHAT_CREDIT_PACK : CHAT_CREDIT_SINGLE;

        // Determine success/cancel URLs with open-redirect protection
        const defaultPath = `/share/${encodeURIComponent(readingId)}`;
        const safePath = getSafeReturnUrl(returnUrl, defaultPath);
        const baseUrl = safePath.startsWith('/') ? `${origin}${safePath}` : safePath;
        const separator = baseUrl.includes('?') ? '&' : '?';

        const successUrl = `${baseUrl}${separator}payment=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}${separator}payment=cancelled`;

        const session = await createCheckoutSession({
            productId: product.productId,
            successUrl,
            cancelUrl,
            metadata: {
                type: 'chat_credit',
                readingId: readingId,
                credits: String(product.credits),
                postId: normalizedPostId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Chat credit payment initialization failed:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
