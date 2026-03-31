import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/audit-logger';
import { rateLimit } from '@/lib/rate-limiter';
import { calculateSaju } from '@/lib/engines/saju';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { generateSinglePhase } from '@/lib/ai/premium-reading-service';
import { drawCards } from '@/lib/engines/tarot';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    // 0. Rate Limiting (Strict for Proxy)
    const clientIp = getClientIp(request.headers);
    const limitResult = await rateLimit(request); // Reuse existing or add custom
    if (limitResult) return limitResult;

    try {
        const body = await request.json();
        const { 
            originReadingId, 
            friendName, 
            friendBirthDate, 
            friendGender, 
            friendBirthTime = '12:00' 
        } = body;

        if (!originReadingId || !friendBirthDate || !friendGender) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Validate Origin Reading
        const originReading = await prisma.readingResult.findUnique({
            where: { id: originReadingId }
        });

        if (!originReading) {
            return NextResponse.json({ error: 'Origin reading not found', code: 'ORIGIN_NOT_FOUND' }, { status: 404 });
        }

        // 2. Check Premium Status & Proxy Limits
        const meta = originReading.metadata ? JSON.parse(originReading.metadata) : {};
        const isPremium = meta.isPremium || meta.paymentSource === 'promo';

        if (!isPremium) {
            return NextResponse.json({ error: 'Premium subscription required for proxy reading', code: 'PAYMENT_REQUIRED' }, { status: 402 });
        }

        if (originReading.proxyReadingCount >= originReading.maxProxyCount) {
            return NextResponse.json({ 
                error: 'Proxy reading limit reached (Max 3)', 
                code: 'PROXY_LIMIT_EXCEEDED',
                usedCount: originReading.proxyReadingCount,
                maxCount: originReading.maxProxyCount
            }, { status: 429 });
        }

        // 3. Atomically Increment Counter
        await prisma.readingResult.update({
            where: { id: originReadingId },
            data: { proxyReadingCount: { increment: 1 } }
        });

        // 4. Perform AI Reading for Friend
        const [year, month, day] = friendBirthDate.split('-').map(Number);
        const [hours, minutes] = friendBirthTime.split(':').map(Number);
        const birthDateTime = new Date(year, month - 1, day, hours, minutes || 0, 0);

        const saju = calculateSaju(birthDateTime, hours, minutes || 0, false, friendGender);
        const astrology = calculateAstrology(birthDateTime, friendBirthTime);
        const cards = drawCards(3); // Default for career keyword analysis

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        const currentDate = new Date().toISOString().split('T')[0];

        const userData = {
            name: friendName || '친구',
            gender: friendGender,
            birthDate: friendBirthDate,
            birthTime: friendBirthTime,
            context: 'career',
            question: '직업 진로 추천 (대리 조회)',
            sajuData: saju,
            astroData: {
                sunSign: ZODIAC_SIGNS[astrology.sunSign].name,
                moonSign: ZODIAC_SIGNS[astrology.moonSign].name,
                ascendant: ZODIAC_SIGNS[astrology.ascendant].name,
            },
            tarotCards: cards,
            language: 'ko' as const,
            currentDate,
        };

        const phaseResult = await generateSinglePhase(1, userData, null, apiKey as string);

        if (!phaseResult.success) {
            return NextResponse.json({ error: 'AI Generation failed', details: phaseResult.error }, { status: 500 });
        }

        // 5. Success - Return Report
        return NextResponse.json({
            success: true,
            proxySessionId: `${originReadingId}-p${originReading.proxyReadingCount + 1}`,
            usedCount: originReading.proxyReadingCount + 1,
            maxCount: originReading.maxProxyCount,
            report: phaseResult.data,
            metadata: {
                friendName,
                sajuResult: saju,
                astrology: {
                    sunSign: astrology.sunSign,
                    moonSign: astrology.moonSign,
                }
            }
        });

    } catch (error: any) {
        console.error('[ProxyAPI] Error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
