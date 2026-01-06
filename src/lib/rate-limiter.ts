import { NextRequest, NextResponse } from 'next/server';
import { devLog } from './dev-logger';

interface RateLimitConfig {
    limit: number;      // Max requests
    windowMs: number;   // Time window in ms
}

const trackers = new Map<string, { count: number; expiresAt: number }>();

/**
 * Simple in-memory rate limiter for Next.js API Routes.
 * Note: In serverless environments (Vercel), this state is local to the lambda instance.
 * For distributed rate limiting, use Redis/Upstash.
 */
export async function rateLimit(req: NextRequest, config: RateLimitConfig = { limit: 20, windowMs: 60 * 1000 }) {
    if (process.env.NODE_ENV === 'development') return null; // No limit in dev

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const key = `${ip}`;

    const record = trackers.get(key);

    if (!record || now > record.expiresAt) {
        trackers.set(key, { count: 1, expiresAt: now + config.windowMs });
        return null;
    }

    if (record.count >= config.limit) {
        devLog.warn(`Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json(
            { error: 'Too many requests, please try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((record.expiresAt - now) / 1000)) } }
        );
    }

    record.count++;
    return null; // Proceed
}
