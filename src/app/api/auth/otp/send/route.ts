import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email/sender';
import { z } from 'zod';
import { getClientIp, auditLog } from '@/lib/audit-logger';
import { consumeDailyQuota } from '@/lib/plan-limits';

const schema = z.object({
    email: z.string().email().max(150),
});

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request.headers);
        const body = await request.json().catch(() => null);
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: '올바른 이메일 주소를 입력해 주세요.' },
                { status: 400 }
            );
        }

        const { email } = parsed.data;

        // Rate Limit 1: IP per day (max 20)
        const ipQuota = await consumeDailyQuota({
            identifier: clientIp,
            action: 'otp_send_ip',
            limit: 20,
        });

        // Rate Limit 2: Email per day (max 10)
        const emailQuota = await consumeDailyQuota({
            identifier: email.toLowerCase(),
            action: 'otp_send_email',
            limit: 10,
        });

        if (!ipQuota.allowed || !emailQuota.allowed) {
            auditLog('RATE_LIMIT_EXCEEDED', {
                ip: clientIp,
                metadata: { endpoint: '/api/auth/otp/send', email },
                severity: 'warning',
            });
            return NextResponse.json(
                { error: '요청 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.' },
                { status: 429 }
            );
        }

        // Cryptographically secure 6-digit OTP
        const token = crypto.randomInt(100000, 1000000).toString();
        const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

        // Delete existing tokens for this identifier to prevent clutter
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // Create new token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        // Send email
        await sendVerificationEmail({ email, token });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('OTP Send Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
