import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { requireAuthSecret } from '@/lib/auth/auth-secret';

export async function GET() {
    try {
        const secret = requireAuthSecret('Order lookup');
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

    } catch (error: unknown) {
        console.error('Orders Fetch Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
