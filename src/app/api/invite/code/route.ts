import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REFERRAL_CODE_LENGTH = 8;
const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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

function createReferralCode(): string {
    let result = '';
    for (let index = 0; index < REFERRAL_CODE_LENGTH; index += 1) {
        const randomIndex = Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length);
        result += REFERRAL_CODE_ALPHABET[randomIndex];
    }
    return result;
}

async function getOrCreateReferralCode(userId: string, currentCode: string | null): Promise<string> {
    if (currentCode) return currentCode;

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = createReferralCode();
        const existing = await prisma.user.findUnique({
            where: { referralCode: candidate },
            select: { id: true },
        });
        if (existing) continue;

        await prisma.user.update({
            where: { id: userId },
            data: { referralCode: candidate },
        });
        return candidate;
    }

    throw new Error('Failed to generate unique referral code');
}

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, 'Unauthorized');
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, referralCode: true },
        });

        if (!user) {
            return errorResponse(404, 'User not found');
        }

        const referralCode = await getOrCreateReferralCode(user.id, user.referralCode);
        const totalInvited = await prisma.referral.count({
            where: { inviterUserId: user.id },
        });

        return NextResponse.json({
            referralCode,
            totalInvited,
            rewardEarned: totalInvited * 7,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(500, 'Server Error', details);
    }
}
