import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CareerKeywordsReport } from '@/types/career';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const readingId = searchParams.get('readingId');
        const rankIdx = parseInt(searchParams.get('rank') || '1') - 1;

        if (!readingId) {
            return new Response('Missing readingId', { status: 400 });
        }

        // Fetch reading result from DB
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId }
        });

        if (!reading) {
            return new Response('Reading not found', { status: 404 });
        }

        let report: CareerKeywordsReport;
        try {
            const fullData = JSON.parse(reading.data);
            // If it's a multi-turn premium, it might be nested
            report = fullData.careerKeywords || fullData; 
        } catch (e) {
            return new Response('Failed to parse report data', { status: 500 });
        }

        const keywordObj = report.keywords?.[rankIdx] || report.keywords?.[0];
        if (!keywordObj) {
            return new Response('Keyword rank not found', { status: 404 });
        }

        // Theme colors based on aura
        const auraColors: Record<string, { primary: string, bg: string, glow: string }> = {
            violet: { primary: '#A78BFA', bg: '#1E1B4B', glow: 'rgba(139, 92, 246, 0.3)' },
            gold: { primary: '#FACC15', bg: '#422006', glow: 'rgba(234, 179, 8, 0.3)' },
            emerald: { primary: '#34D399', bg: '#064E3B', glow: 'rgba(16, 185, 129, 0.3)' },
            crimson: { primary: '#FB7185', bg: '#4C0519', glow: 'rgba(225, 29, 72, 0.3)' },
            azure: { primary: '#60A5FA', bg: '#1E3A8A', glow: 'rgba(59, 130, 246, 0.3)' },
        };

        const theme = auraColors[report.auraColor] || auraColors.violet;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.bg,
                        backgroundImage: `radial-gradient(circle at center, ${theme.glow} 0%, transparent 70%), linear-gradient(to bottom, ${theme.bg}, #000000)`,
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        padding: '80px',
                    }}
                >
                    {/* Glassmorphism Card */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '80%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '60px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '60px',
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                        }}
                    >
                        {/* Logo */}
                        <div style={{ display: 'flex', position: 'absolute', top: '120px', fontSize: '32px', fontWeight: 300, letterSpacing: '8px', color: theme.primary, opacity: 0.8 }}>
                            COSMIC PATH
                        </div>

                        {/* Rank Badge */}
                        <div style={{ 
                            display: 'flex', 
                            padding: '12px 32px', 
                            borderRadius: '100px', 
                            background: `rgba(255,255,255,0.1)`, 
                            border: `1px solid ${theme.primary}55`,
                            marginBottom: '40px',
                            fontSize: '28px',
                            fontWeight: 600,
                            color: theme.primary
                        }}>
                             MY CAREER SOUL #{rankIdx + 1}
                        </div>

                        {/* Keyword */}
                        <div style={{
                            fontSize: '96px',
                            fontWeight: 900,
                            textAlign: 'center',
                            marginBottom: '40px',
                            background: `linear-gradient(to bottom, #FFFFFF, ${theme.primary})`,
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1.1,
                        }}>
                            {keywordObj.keyword}
                        </div>

                        {/* Catchphrase */}
                        <div style={{
                            fontSize: '36px',
                            fontWeight: 300,
                            textAlign: 'center',
                            color: '#cbd5e1',
                            maxWidth: '100%',
                            marginBottom: '80px',
                            lineHeight: 1.4,
                        }}>
                            “{report.catchphrase}”
                        </div>

                        {/* Reason / Insight */}
                        <div style={{
                            display: 'flex',
                            padding: '40px',
                            borderRadius: '30px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '28px',
                            color: '#94a3b8',
                            textAlign: 'center',
                        }}>
                            {keywordObj.reason}
                        </div>
                    </div>

                    {/* Footer / URL */}
                    <div style={{
                        position: 'absolute',
                        bottom: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <div style={{ fontSize: '28px', color: 'white', opacity: 0.5, marginBottom: '8px' }}>나의 운명적 커리어가 궁금하다면?</div>
                        <div style={{ fontSize: '40px', fontWeight: 700, color: theme.primary }}>cosmicpath.ai</div>
                    </div>
                </div>
            ),
            {
                width: 1080,
                height: 1920,
            }
        );
    } catch (error: any) {
        console.error('[CareerSnapshot] Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
