import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const checkEnv = (key: string) => {
        const value = process.env[key];
        return {
            exists: !!value,
            length: value ? value.length : 0,
            prefix: value ? value.substring(0, 4) + '...' : 'N/A',
        };
    };

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        vercelRegion: process.env.VERCEL_REGION || 'unknown',
        env: {
            GOOGLE_AI: checkEnv('GOOGLE_AI_API_KEY'),
            OPENAI: checkEnv('OPENAI_API_KEY'),
            ANTHROPIC: checkEnv('ANTHROPIC_API_KEY'),
            NODE_ENV: process.env.NODE_ENV,
        }
    });
}
