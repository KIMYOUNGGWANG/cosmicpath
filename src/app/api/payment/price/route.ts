import { NextRequest, NextResponse } from 'next/server';
import { getPriceById, getProductPrice } from '@/lib/payment/stripe';
import {
    CHAT_CREDIT_PACK,
    CHAT_CREDIT_SINGLE,
    formatUsdAmount,
    formatUsdFromCents,
    MATCH_PRODUCT,
    READING_PRODUCT,
    SUBSCRIPTION_FALLBACK_AMOUNTS,
    SUBSCRIPTION_PRICE_CONFIGURED,
    SUBSCRIPTION_PRICE_IDS,
} from '@/lib/payment/payment-config';

export const dynamic = 'force-dynamic';

function buildFallbackPriceResponse(input: { productId?: string | null; priceId?: string | null }) {
    const requestedPriceId = input.priceId?.trim() || '';
    const requestedProductId = input.productId?.trim() || '';
    const fallbackProductId = requestedProductId || READING_PRODUCT.productId;
    const subscriptionFallbacks: Record<string, number> = {
        [SUBSCRIPTION_PRICE_IDS.pro_monthly]: SUBSCRIPTION_FALLBACK_AMOUNTS.MONTHLY,
        [SUBSCRIPTION_PRICE_IDS.pro_yearly]: SUBSCRIPTION_FALLBACK_AMOUNTS.ANNUAL,
    };
    const productFallbacks: Record<string, { amount: number; formattedPrice: string }> = {
        [READING_PRODUCT.productId]: {
            amount: READING_PRODUCT.price / 100,
            formattedPrice: formatUsdFromCents(READING_PRODUCT.price),
        },
        [MATCH_PRODUCT.productId]: {
            amount: MATCH_PRODUCT.price / 100,
            formattedPrice: formatUsdFromCents(MATCH_PRODUCT.price),
        },
        [CHAT_CREDIT_SINGLE.productId]: {
            amount: CHAT_CREDIT_SINGLE.price / 100,
            formattedPrice: formatUsdFromCents(CHAT_CREDIT_SINGLE.price),
        },
        [CHAT_CREDIT_PACK.productId]: {
            amount: CHAT_CREDIT_PACK.price / 100,
            formattedPrice: formatUsdFromCents(CHAT_CREDIT_PACK.price),
        },
    };
    const subscriptionAmount = requestedPriceId ? subscriptionFallbacks[requestedPriceId] : undefined;
    const productFallback = productFallbacks[fallbackProductId];
    const amount = subscriptionAmount ?? productFallback?.amount ?? READING_PRODUCT.price / 100;
    const formattedPrice = subscriptionAmount
        ? formatUsdAmount(subscriptionAmount)
        : productFallback?.formattedPrice ?? formatUsdFromCents(READING_PRODUCT.price);

    return {
        productId: fallbackProductId || READING_PRODUCT.id,
        priceId: requestedPriceId,
        amount,
        currency: READING_PRODUCT.currency,
        formattedPrice,
        metadata: {
            fallback: 'true',
            lookupTarget: requestedPriceId ? 'price' : 'product',
        },
    };
}

function shouldUseConfiguredProductLookup(productId: string | null) {
    if (!productId) return false;

    if (productId === READING_PRODUCT.productId) return READING_PRODUCT.stripeConfigured;
    if (productId === MATCH_PRODUCT.productId) return MATCH_PRODUCT.stripeConfigured;
    if (productId === CHAT_CREDIT_SINGLE.productId) return CHAT_CREDIT_SINGLE.stripeConfigured;
    if (productId === CHAT_CREDIT_PACK.productId) return CHAT_CREDIT_PACK.stripeConfigured;

    return true;
}

function shouldUseConfiguredPriceLookup(priceId: string | null) {
    if (!priceId) return false;

    const configByPriceId: Record<string, boolean> = {
        [SUBSCRIPTION_PRICE_IDS.pro_weekly]: SUBSCRIPTION_PRICE_CONFIGURED.pro_weekly,
        [SUBSCRIPTION_PRICE_IDS.pro_monthly]: SUBSCRIPTION_PRICE_CONFIGURED.pro_monthly,
        [SUBSCRIPTION_PRICE_IDS.pro_yearly]: SUBSCRIPTION_PRICE_CONFIGURED.pro_yearly,
        [SUBSCRIPTION_PRICE_IDS.couple_monthly]: SUBSCRIPTION_PRICE_CONFIGURED.couple_monthly,
    };

    return configByPriceId[priceId] ?? true;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const priceId = searchParams.get('priceId')?.trim() || null;
        const productId = searchParams.get('productId')?.trim() || READING_PRODUCT.productId;

        if (!priceId && !productId) {
            return NextResponse.json(buildFallbackPriceResponse({}), {
                headers: { 'x-price-fallback': 'true' },
            });
        }

        if (priceId && !shouldUseConfiguredPriceLookup(priceId)) {
            return NextResponse.json(buildFallbackPriceResponse({ priceId }), {
                headers: { 'x-price-fallback': 'true' },
            });
        }

        if (!priceId && !shouldUseConfiguredProductLookup(productId)) {
            return NextResponse.json(buildFallbackPriceResponse({ productId }), {
                headers: { 'x-price-fallback': 'true' },
            });
        }

        const priceData = priceId
            ? await getPriceById(priceId, READING_PRODUCT.currency)
            : await getProductPrice(productId, READING_PRODUCT.currency);

        return NextResponse.json(priceData);
    } catch {
        return NextResponse.json(
            buildFallbackPriceResponse({
                priceId: new URL(request.url).searchParams.get('priceId'),
                productId: new URL(request.url).searchParams.get('productId') || READING_PRODUCT.productId,
            }),
            {
                headers: { 'x-price-fallback': 'true' },
            }
        );
    }
}
