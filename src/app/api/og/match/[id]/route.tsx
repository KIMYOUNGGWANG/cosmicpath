import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getMatchShareSummary } from '@/lib/match-share';

export const runtime = 'nodejs';

function getScorePalette(score: number | null) {
    if (score === null) {
        return {
            primary: '#8B5CF6',
            secondary: '#EC4899',
            glow: 'rgba(139, 92, 246, 0.32)',
        };
    }

    if (score >= 85) {
        return {
            primary: '#F59E0B',
            secondary: '#EF4444',
            glow: 'rgba(245, 158, 11, 0.34)',
        };
    }

    if (score >= 70) {
        return {
            primary: '#10B981',
            secondary: '#06B6D4',
            glow: 'rgba(16, 185, 129, 0.30)',
        };
    }

    if (score >= 55) {
        return {
            primary: '#60A5FA',
            secondary: '#8B5CF6',
            glow: 'rgba(96, 165, 250, 0.28)',
        };
    }

    return {
        primary: '#F97316',
        secondary: '#EC4899',
        glow: 'rgba(249, 115, 22, 0.28)',
    };
}

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const session = await prisma.matchSession.findUnique({
        where: { id },
        select: {
            hostName: true,
            guestName: true,
            score: true,
            metadata: true,
        },
    });

    if (!session) {
        return new Response('Match session not found', { status: 404 });
    }

    const share = getMatchShareSummary(session);
    const palette = getScorePalette(share.score);
    const detailChips = [
        share.hostSign && share.guestSign ? `${share.hostSign} × ${share.guestSign}` : null,
        share.hostElement && share.guestElement ? `${share.hostElement} × ${share.guestElement}` : null,
        share.status === 'invite' ? 'Invitation' : 'Compatibility Report',
    ].filter(Boolean) as string[];

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                        'radial-gradient(circle at 16% 18%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(135deg, #050816 0%, #101426 44%, #1A1036 100%)',
                    color: '#F8FAFC',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 15% 24%, ${palette.glow} 0%, transparent 32%), radial-gradient(circle at 84% 18%, rgba(236,72,153,0.14) 0%, transparent 28%), radial-gradient(circle at 72% 88%, rgba(255,255,255,0.08) 0%, transparent 22%)`,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 32,
                        borderRadius: 36,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        width: '100%',
                        padding: '54px 60px',
                        gap: 28,
                    }}
                >
                    <div
                        style={{
                            width: '68%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderRadius: 30,
                            padding: '24px 10px 24px 8px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 22,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    fontSize: 22,
                                    letterSpacing: '0.28em',
                                    textTransform: 'uppercase',
                                    color: '#F5C451',
                                }}
                            >
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 999,
                                        background: '#F5C451',
                                    }}
                                />
                                CosmicPath Match
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        fontSize: 28,
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(226,232,240,0.62)',
                                    }}
                                >
                                    {share.tierLabel}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        fontSize: 76,
                                        lineHeight: 0.95,
                                        fontWeight: 800,
                                        letterSpacing: '-0.05em',
                                        maxWidth: '95%',
                                    }}
                                >
                                    {share.title}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 30,
                                    lineHeight: 1.35,
                                    color: 'rgba(226,232,240,0.86)',
                                    maxWidth: '92%',
                                }}
                            >
                                {share.description}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 18,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {detailChips.map((chip) => (
                                    <div
                                        key={chip}
                                        style={{
                                            display: 'flex',
                                            padding: '10px 18px',
                                            borderRadius: 999,
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            background: 'rgba(255,255,255,0.05)',
                                            fontSize: 18,
                                            color: 'rgba(248,250,252,0.88)',
                                        }}
                                    >
                                        {chip}
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 22,
                                    letterSpacing: '0.04em',
                                    color: 'rgba(248,250,252,0.74)',
                                }}
                            >
                                {share.cta}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            width: '32%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '28px',
                                borderRadius: 32,
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.05)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        fontSize: 18,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.18em',
                                        color: 'rgba(226,232,240,0.54)',
                                    }}
                                >
                                    Compatibility
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            fontSize: 92,
                                            lineHeight: 0.9,
                                            fontWeight: 800,
                                            color: palette.primary,
                                        }}
                                    >
                                        {share.score ?? '??'}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            fontSize: 26,
                                            color: 'rgba(226,232,240,0.54)',
                                        }}
                                    >
                                        {share.score === null ? '' : '%'}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    height: 14,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${share.score ?? 48}%`,
                                        background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                                    }}
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                                padding: '26px 28px',
                                borderRadius: 28,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(9,12,24,0.62)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 18,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.16em',
                                    color: 'rgba(226,232,240,0.54)',
                                }}
                            >
                                Social Hook
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 28,
                                    lineHeight: 1.3,
                                    color: '#F8FAFC',
                                }}
                            >
                                Share the score. Reveal the orbit.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
