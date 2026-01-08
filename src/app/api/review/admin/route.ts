import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET - Fetch all reviews (admin)
export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ reviews });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// PATCH - Update review approval status
const updateSchema = z.object({
    id: z.string(),
    isApproved: z.boolean()
});

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, isApproved } = updateSchema.parse(body);

        await prisma.review.update({
            where: { id },
            data: { isApproved }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update review' }, { status: 400 });
    }
}

// DELETE - Delete a review
const deleteSchema = z.object({
    id: z.string()
});

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = deleteSchema.parse(body);

        await prisma.review.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 400 });
    }
}
