import { NextResponse } from 'next/server';
import { sendResultEmail } from '@/lib/email/sender';
import { devLog } from '@/lib/dev-logger';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Use shared library function
        const data = await sendResultEmail(body);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        // Error handling is already detailed in sender.ts wrapper if needed, 
        // but here we catch bubbles errors.
        const status = error.message === 'Invalid email format' ? 400 : 500;
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status }
        );
    }
}
