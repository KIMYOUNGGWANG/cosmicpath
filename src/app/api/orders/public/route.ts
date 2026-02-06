import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, orderId } = body;

        if (!email || !orderId) {
            return NextResponse.json(
                { error: 'Email and Order ID are required' },
                { status: 400 }
            );
        }

        // Clean inputs
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
