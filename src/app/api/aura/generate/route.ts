import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateAuraProfile } from '@/lib/engines/aura';
import { rateLimit } from '@/lib/rate-limiter';
import { isValidTimeZone } from '@/lib/utils/timezone';

const auraRequestSchema = z.object({
    name: z.string().trim().min(1).max(80),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    timezone: z.string().min(1).max(100).refine(isValidTimeZone, 'Invalid timezone'),
    language: z.enum(['en', 'ko']).default('en'),
});

type ApiErrorCode = 'INVALID_REQUEST' | 'RATE_LIMITED' | 'INTERNAL_ERROR';

function errorResponse(
    status: number,
    code: ApiErrorCode,
    message: string,
    headers?: HeadersInit
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
            },
        },
        { status, headers }
    );
}

function buildAuraOgImageUrl(
    request: NextRequest,
    payload: {
        name: string;
        colors: [string, string];
        keywords: [string, string, string];
        catchphrase: string;
    }
): string {
    const url = new URL('/api/og/aura', request.url);
    url.searchParams.set('name', payload.name);
    url.searchParams.set('colors', payload.colors.join(','));
    url.searchParams.set('keywords', payload.keywords.join(','));
    url.searchParams.set('catchphrase', payload.catchphrase);

    return url.toString();
}

async function generateAuraSummary(input: {
    language: 'en' | 'ko';
    promptFacts: string;
    fallbackSummary: string;
}): Promise<string> {
    return input.fallbackSummary;
}

export async function POST(request: NextRequest) {
    const rateLimitResponse = await rateLimit(request, { limit: 15, windowMs: 60 * 1000 });
    if (rateLimitResponse) {
        return errorResponse(
            429,
            'RATE_LIMITED',
            'Too many requests, please try again later.',
            { 'Retry-After': rateLimitResponse.headers.get('Retry-After') ?? '60' }
        );
    }

    let parsedBody: z.infer<typeof auraRequestSchema>;
    try {
        parsedBody = auraRequestSchema.parse(await request.json());
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse(400, 'INVALID_REQUEST', error.message);
        }

        return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body.');
    }

    try {
        const profile = generateAuraProfile({
            name: parsedBody.name,
            birthDate: parsedBody.birthDate,
            birthTime: parsedBody.birthTime,
            timezone: parsedBody.timezone,
            language: parsedBody.language,
        });

        const summary = await generateAuraSummary({
            language: parsedBody.language,
            promptFacts: profile.promptFacts,
            fallbackSummary: profile.summary,
        });

        const ogImageUrl = buildAuraOgImageUrl(request, {
            name: parsedBody.name,
            colors: profile.auraColorHex,
            keywords: profile.keywords,
            catchphrase: profile.catchphrase,
        });

        return NextResponse.json({
            auraColorHex: profile.auraColorHex,
            keywords: profile.keywords,
            catchphrase: profile.catchphrase,
            summary,
            ogImageUrl,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to generate aura profile.';

        return errorResponse(500, 'INTERNAL_ERROR', message);
    }
}
