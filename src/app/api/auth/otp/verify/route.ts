import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { requireAuthSecret } from '@/lib/auth/auth-secret';
import { consumeDailyQuota } from '@/lib/plan-limits';

export async function POST(request: Request) {
    try {
        const secret = requireAuthSecret('OTP verification');
        const body = await request.json();
        const { email, token } = z.object({
            email: z.string().email(),
            token: z.string().length(6)
        }).parse(body);

        // Verify token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token,
            },
        });

        if (!verificationToken) {
            // Track failed attempt
            const failQuota = await consumeDailyQuota({
                identifier: email.toLowerCase(),
                action: 'otp_verify_failed_count',
                limit: 5,
            });

            if (!failQuota.allowed) {
                // Invalidate all tokens for this email after 5 consecutive failures
                await prisma.verificationToken.deleteMany({
                    where: { identifier: email },
                });

                return NextResponse.json({
                    error: '인증번호를 5회 잘못 입력하셨습니다. 보안을 위해 코드가 만료되었으니 새 인증번호를 발송해 주세요.'
                }, { status: 400 });
            }

            return NextResponse.json({
                error: `인증번호가 올바르지 않습니다. (남은 시도: ${failQuota.remaining}회)`
            }, { status: 400 });
        }

        if (verificationToken.expires < new Date()) {
            return NextResponse.json({ error: '인증번호 유효 시간이 만료되었습니다. 다시 발송해 주세요.' }, { status: 400 });
        }

        // Delete used token
        await prisma.verificationToken.deleteMany({
            where: { identifier: email }
        });

        // Create JWT
        const alg = 'HS256';
        const jwt = await new SignJWT({ email })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime('30d') // Long-lived session for convenience
            .sign(secret);

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        console.error('OTP Verify Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
