import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const redeemInviteSchema = z.object({
    referralCode: z.string().trim().min(8).max(32),
});

class ApiError extends Error {
    code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

function errorResponse(code: number, message: string, details?: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
        },
        { status: code }
    );
}

function addDays(base: Date, days: number): Date {
    const date = new Date(base);
    date.setDate(date.getDate() + days);
    return date;
}

function nextRewardExpiry(currentStatus: string, currentExpiry: Date | null, now: Date): Date | null {
    if (currentStatus !== 'free' && currentExpiry === null) {
        return null;
    }

    const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
    return addDays(base, 7);
}

function nextStatus(currentStatus: string): 'free' | 'pro' | 'couple' {
    if (currentStatus === 'couple') return 'couple';
    if (currentStatus === 'pro') return 'pro';
    return 'pro';
}

export async function POST(request: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, 'Unauthorized');
    }

    const body = await request.json().catch(() => null);
    const parsed = redeemInviteSchema.safeParse(body);
    if (!parsed.success) {
        return errorResponse(400, 'Bad Request', parsed.error.message);
    }

    const normalizedCode = parsed.data.referralCode.toUpperCase();
    const now = new Date();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const invitee = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    subscriptionStatus: true,
                    subscriptionExpiresAt: true,
                },
            });

            if (!invitee) {
                throw new ApiError(404, 'User not found');
            }

            const inviter = await tx.user.findUnique({
                where: { referralCode: normalizedCode },
                select: {
                    id: true,
                    subscriptionStatus: true,
                    subscriptionExpiresAt: true,
                },
            });

            if (!inviter) {
                throw new ApiError(404, 'Referral code not found');
            }

            if (inviter.id === invitee.id) {
                throw new ApiError(409, 'You cannot redeem your own referral code');
            }

            const existing = await tx.referral.findUnique({
                where: { inviteeUserId: invitee.id },
                select: { id: true },
            });

            if (existing) {
                throw new ApiError(409, 'Referral code has already been redeemed');
            }

            await tx.referral.create({
                data: {
                    referralCode: normalizedCode,
                    inviterUserId: inviter.id,
                    inviteeUserId: invitee.id,
                    redeemedAt: now,
                },
            });

            const inviteeNextExpiry = nextRewardExpiry(
                invitee.subscriptionStatus,
                invitee.subscriptionExpiresAt,
                now
            );
            const inviterNextExpiry = nextRewardExpiry(
                inviter.subscriptionStatus,
                inviter.subscriptionExpiresAt,
                now
            );

            await tx.user.update({
                where: { id: invitee.id },
                data: {
                    subscriptionStatus: nextStatus(invitee.subscriptionStatus),
                    subscriptionExpiresAt: inviteeNextExpiry,
                },
            });

            await tx.user.update({
                where: { id: inviter.id },
                data: {
                    subscriptionStatus: nextStatus(inviter.subscriptionStatus),
                    subscriptionExpiresAt: inviterNextExpiry,
                },
            });

            return {
                inviteeNextExpiry: inviteeNextExpiry ?? addDays(now, 7),
            };
        });

        return NextResponse.json({
            success: true,
            message: '7일 CosmicPath Pro가 활성화되었습니다!',
            proExpiresAt: result.inviteeNextExpiry.toISOString(),
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return errorResponse(error.code, error.message);
        }
        const details = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(500, 'Server Error', details);
    }
}
