import { prisma } from '@/lib/prisma';
import { grantCreditsToLatestUserSession } from '@/lib/chat-session-rewards';

const REFERRAL_REWARD_CREDITS = 1;

export interface ReferralRewardInput {
    referralCode: string;
    inviteeUserId: string;
}

export interface ReferralRewardResult {
    inviterUserId: string;
    creditsAdded: number;
    readingResultId: string;
    chatSessionId: string;
}

export class ReferralRewardError extends Error {
    code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

function normalizeReferralCode(referralCode: string): string {
    return referralCode.trim().toUpperCase();
}

export async function claimReferralReward(
    input: ReferralRewardInput
): Promise<ReferralRewardResult> {
    return prisma.$transaction(async (transaction) => {
        const normalizedCode = normalizeReferralCode(input.referralCode);
        const lockKey = `referral:${normalizedCode}:${input.inviteeUserId}`;

        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

        const invitee = await transaction.user.findUnique({
            where: { id: input.inviteeUserId },
            select: { id: true },
        });

        if (!invitee) {
            throw new ReferralRewardError(404, '가입한 사용자를 찾을 수 없습니다.');
        }

        const inviter = await transaction.user.findUnique({
            where: { referralCode: normalizedCode },
            select: { id: true },
        });

        if (!inviter) {
            throw new ReferralRewardError(404, '유효한 추천 코드를 찾을 수 없습니다.');
        }

        if (inviter.id === invitee.id) {
            throw new ReferralRewardError(409, '본인 코드는 등록할 수 없습니다.');
        }

        const existingReferral = await transaction.referral.findUnique({
            where: { inviteeUserId: invitee.id },
            select: { id: true },
        });

        if (existingReferral) {
            throw new ReferralRewardError(409, '이미 추천 보상이 처리되었습니다.');
        }

        const rewardResult = await grantCreditsToLatestUserSession(
            transaction,
            inviter.id,
            REFERRAL_REWARD_CREDITS
        );

        if (!rewardResult) {
            throw new ReferralRewardError(404, '초대자의 리딩 세션을 찾을 수 없습니다.');
        }

        await transaction.referral.create({
            data: {
                referralCode: normalizedCode,
                inviterUserId: inviter.id,
                inviteeUserId: invitee.id,
            },
        });

        return {
            inviterUserId: inviter.id,
            creditsAdded: REFERRAL_REWARD_CREDITS,
            readingResultId: rewardResult.readingResultId,
            chatSessionId: rewardResult.chatSessionId,
        };
    });
}
