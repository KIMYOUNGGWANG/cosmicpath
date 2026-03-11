import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { CHAT_CREDIT_SINGLE, CHAT_CREDIT_PACK } from '@/lib/payment/payment-config';
import { z } from 'zod';

const ChatCreditRequestSchema = z.object({
    readingId: z.string().min(1, 'Missing readingId'),
    returnUrl: z.string().optional(),
    creditType: z.enum(['single', 'pack']).optional().default('single'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = ChatCreditRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.message }, { status: 400 });
        }

        const { readingId, returnUrl, creditType } = parsed.data;
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Select product based on creditType
        const product = creditType === 'pack' ? CHAT_CREDIT_PACK : CHAT_CREDIT_SINGLE;

        // Determine success/cancel URLs
        const baseUrl = returnUrl || `${origin}/share/${readingId}`;
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
                credits: String(product.credits)
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Chat credit payment initialization failed:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

