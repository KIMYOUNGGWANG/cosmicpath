import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { requireAuthSecret } from '@/lib/auth/auth-secret';

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
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        if (verificationToken.expires < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        // Delete used token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token,
                }
            }
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
