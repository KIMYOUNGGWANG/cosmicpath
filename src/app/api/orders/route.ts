import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('AUTH_SECRET environment variable is not defined');
    }
    console.warn('WARNING: AUTH_SECRET is not defined, using unsafe default for development only.');
}

const secret = new TextEncoder().encode(secretKey || 'default_secret_please_change');

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify JWT
        const { payload } = await jwtVerify(token, secret);
        const email = payload.email as string;

        if (!email) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch payments with readings
        const payments = await prisma.payment.findMany({
            where: {
                customerEmail: email,
                status: 'DONE',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        // Fetch promo redemptions
        const redemptions = await prisma.promoRedemption.findMany({
            where: {
                email: email,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        // Normalize and merge
        const paymentOrders = payments.map(p => ({
            id: p.id,
            readingId: p.readingId,
            amount: p.amount,
            status: p.status,
            createdAt: p.createdAt,
            type: 'PAYMENT'
        }));

        const promoOrders = redemptions.map(r => ({
            id: r.id,
            readingId: r.readingId,
            amount: 0,
            status: 'PROMO',
            createdAt: r.createdAt,
            type: 'PROMO'
        }));

        const allOrders = [...paymentOrders, ...promoOrders].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            user: { email },
            orders: allOrders
        });

    } catch (error: any) {
        console.error('Orders Fetch Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
