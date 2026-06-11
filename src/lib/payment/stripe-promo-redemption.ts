import Stripe from 'stripe';
import { redeemPromotionCode } from '@/lib/promo-codes';

export async function redeemCheckoutPromo(session: Stripe.Checkout.Session): Promise<{
    readonly skipped: boolean;
    readonly alreadyRedeemed?: boolean;
    readonly redemptionId?: string;
}> {
    const promoCodeId = session.metadata?.promoCodeId?.trim();
    const discount = Number(session.metadata?.discount || '0');

    if (!promoCodeId || !(discount > 0 && discount < 100)) {
        return { skipped: true };
    }

    const customerEmail =
        session.metadata?.email?.trim() ||
        session.customer_details?.email?.trim() ||
        session.customer_email?.trim();

    if (!customerEmail) {
        throw new Error('Promo checkout completed without customer email');
    }

    const result = await redeemPromotionCode({
        codeId: promoCodeId,
        email: customerEmail,
        readingId: session.metadata?.readingId || undefined,
        userAgent: 'stripe_webhook',
    });

    return {
        skipped: false,
        alreadyRedeemed: result.alreadyRedeemed,
        redemptionId: result.redemptionId,
    };
}
