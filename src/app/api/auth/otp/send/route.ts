import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma client is exported from here
import { sendVerificationEmail } from '@/lib/email/sender';
import { z } from 'zod'; // Assuming zod is installed

// Simple in-memory rate limiting could be added, but for now rely on DB constraints or external/middleware rate limits
// actually I saw rate-limiter.ts in src/lib, I should check it later if needed.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = z.object({ email: z.string().email() }).parse(body);

        // Generate 6 digit OTP
        const token = Math.floor(100000 + Math.random() * 900000).toString();
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

    } catch (error: any) {
        console.error('OTP Send Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
