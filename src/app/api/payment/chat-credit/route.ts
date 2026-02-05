import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/stripe';
import { CHAT_CREDIT_SINGLE, CHAT_CREDIT_PACK } from '@/lib/payment/payment-config';

export async function POST(request: NextRequest) {
    try {
        const { readingId, returnUrl, creditType = 'single' } = await request.json();
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        if (!readingId) {
            return NextResponse.json({ error: 'Missing readingId' }, { status: 400 });
        }

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

