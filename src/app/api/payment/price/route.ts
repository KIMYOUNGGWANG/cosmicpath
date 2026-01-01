import { NextRequest, NextResponse } from 'next/server';
import { getProductPrice } from '@/lib/payment/stripe';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId') || READING_PRODUCT.productId;

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing product ID' },
                { status: 400 }
            );
        }

        const priceData = await getProductPrice(productId, READING_PRODUCT.currency);

        return NextResponse.json(priceData);
    } catch (error: any) {
        console.error('Failed to fetch price:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
