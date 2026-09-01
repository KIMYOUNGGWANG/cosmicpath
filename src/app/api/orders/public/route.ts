import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getClientIp, auditLog } from '@/lib/audit-logger';
import { consumeDailyQuota } from '@/lib/plan-limits';

const lookupSchema = z.object({
    email: z.string().email().max(150),
    orderId: z.string().min(3).max(100),
});

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request.headers);

        // Rate limiting: Max 20 lookups per IP per day to prevent brute-forcing order IDs
        const quota = await consumeDailyQuota({
            identifier: clientIp,
            action: 'public_order_lookup',
            limit: 20,
        });

        if (!quota.allowed) {
            auditLog('RATE_LIMIT_EXCEEDED', {
                ip: clientIp,
                metadata: { endpoint: '/api/orders/public' },
                severity: 'warning',
            });
            return NextResponse.json(
                { error: 'Too many order lookup attempts. Please try again later or contact support.' },
                { status: 429 }
            );
        }

        const rawBody = await request.json().catch(() => null);
        const parsed = lookupSchema.safeParse(rawBody);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Valid Email and Order ID are required' },
                { status: 400 }
            );
        }

        const { email, orderId } = parsed.data;
        const cleanEmail = email.trim();
        const cleanOrderId = orderId.trim();

        // Find payment by Order ID (Session ID) OR Payment ID
        // AND ensure email matches
        const payment = await prisma.payment.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { orderId: cleanOrderId }, // Stripe Session ID
                            { id: cleanOrderId },      // Internal Payment ID
                        ]
                    },
                    { customerEmail: { equals: cleanEmail, mode: 'insensitive' } },
                    { status: 'DONE' }
                ]
            },
            // include: {} // Removed empty include
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Order not found or details do not match.' },
                { status: 404 }
            );
        }

        if (!payment.readingId) {
            return NextResponse.json(
                { error: 'Order found but reading is not generated yet. Please contact support.' },
                { status: 404 } // Using 404 to avoid leaking info, or maybe 422
            );
        }

        // Return the reading link
        return NextResponse.json({
            success: true,
            readingId: payment.readingId,
            redirectUrl: `/share/${payment.readingId}?view=full`
        });

    } catch (error: any) {
        console.error('Public Order Lookup Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
