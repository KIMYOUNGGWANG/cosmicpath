import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

function errorResponse(code: number, message: string) {
    return NextResponse.json({ error: message }, { status: code });
}

async function requireAdmin() {
    const session = await auth();

    if (!session?.user?.id) {
        return errorResponse(401, '로그인이 필요합니다.');
    }

    if (session.user.role !== 'ADMIN') {
        return errorResponse(403, '관리자만 접근할 수 있습니다.');
    }

    return null;
}

// GET - Fetch all reviews (admin)
export async function GET() {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ reviews });
    } catch {
        return NextResponse.json({ error: '리뷰 목록을 불러오지 못했습니다.' }, { status: 500 });
    }
}

// PATCH - Update review approval status
const updateSchema = z.object({
    id: z.string(),
    isApproved: z.boolean()
});

export async function PATCH(request: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const body = await request.json();
        const { id, isApproved } = updateSchema.parse(body);

        await prisma.review.update({
            where: { id },
            data: { isApproved }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: '리뷰 상태 변경 요청이 올바르지 않습니다.' }, { status: 400 });
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ error: '리뷰 상태를 변경하지 못했습니다.' }, { status: 400 });
    }
}

// DELETE - Delete a review
const deleteSchema = z.object({
    id: z.string()
});

export async function DELETE(request: NextRequest) {
    const authError = await requireAdmin();
    if (authError) return authError;

    try {
        const body = await request.json();
        const { id } = deleteSchema.parse(body);

        await prisma.review.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: '리뷰 삭제 요청이 올바르지 않습니다.' }, { status: 400 });
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({ error: '리뷰를 삭제하지 못했습니다.' }, { status: 400 });
    }
}
