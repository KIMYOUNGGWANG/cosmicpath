import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const DEFAULT_COLORS = ['#0F8A5F', '#2D7FF9'] as const;
const DEFAULT_KEYWORDS = ['magnetic', 'lucid', 'iconic'] as const;

function parseColors(rawValue: string | null): [string, string] {
    const values = (rawValue ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter((value) => /^#[0-9a-fA-F]{6}$/.test(value));

    return [
        values[0] ?? DEFAULT_COLORS[0],
        values[1] ?? values[0] ?? DEFAULT_COLORS[1],
    ];
}

function parseKeywords(rawValue: string | null): [string, string, string] {
    const values = (rawValue ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    return [
        values[0] ?? DEFAULT_KEYWORDS[0],
        values[1] ?? DEFAULT_KEYWORDS[1],
        values[2] ?? DEFAULT_KEYWORDS[2],
    ];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const [primaryColor, secondaryColor] = parseColors(searchParams.get('colors'));
        const keywords = parseKeywords(searchParams.get('keywords'));
        const name = searchParams.get('name')?.trim() || 'Cosmic Aura';
        const catchphrase =
            searchParams.get('catchphrase')?.trim() ||
            'Share your K-Astrology identity, distilled by CosmicPath.';

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
                            'linear-gradient(135deg, #050816 0%, #101727 45%, #161f31 100%)',
                        color: 'white',
                        fontFamily: 'Georgia, serif',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `radial-gradient(circle at 18% 22%, ${primaryColor}55 0%, transparent 38%), radial-gradient(circle at 82% 20%, ${secondaryColor}55 0%, transparent 34%), radial-gradient(circle at 62% 85%, ${primaryColor}33 0%, transparent 30%)`,
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '48px 56px',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 999,
                                        background: primaryColor,
                                        boxShadow: `0 0 30px ${primaryColor}`,
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: 24,
                                        letterSpacing: '0.28em',
                                        textTransform: 'uppercase',
                                        opacity: 0.8,
                                        fontFamily: 'Helvetica Neue, Arial, sans-serif',
                                    }}
                                >
                                    CosmicPath Aura
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                }}
                            >
                                {keywords.map((keyword) => (
                                    <div
                                        key={keyword}
                                        style={{
                                            display: 'flex',
                                            padding: '10px 16px',
                                            borderRadius: 999,
                                            border: '1px solid rgba(255,255,255,0.14)',
                                            background: 'rgba(255,255,255,0.08)',
                                            fontSize: 18,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            fontFamily: 'Helvetica Neue, Arial, sans-serif',
                                        }}
                                    >
                                        {keyword}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 18,
                                maxWidth: 860,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 22,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    opacity: 0.68,
                                    fontFamily: 'Helvetica Neue, Arial, sans-serif',
                                }}
                            >
                                K-Astrology Aura Card
                            </div>
                            <div
                                style={{
                                    fontSize: 82,
                                    lineHeight: 0.95,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {name}
                            </div>
                            <div
                                style={{
                                    fontSize: 34,
                                    lineHeight: 1.35,
                                    maxWidth: 920,
                                    color: 'rgba(255,255,255,0.88)',
                                }}
                            >
                                {catchphrase}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 20,
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        opacity: 0.62,
                                        fontFamily: 'Helvetica Neue, Arial, sans-serif',
                                    }}
                                >
                                    Aura Spectrum
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 14,
                                    }}
                                >
                                    {[primaryColor, secondaryColor].map((color) => (
                                        <div
                                            key={color}
                                            style={{
                                                width: 148,
                                                height: 28,
                                                borderRadius: 999,
                                                background: color,
                                                boxShadow: `0 0 40px ${color}66`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontSize: 20,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    opacity: 0.7,
                                    fontFamily: 'Helvetica Neue, Arial, sans-serif',
                                }}
                            >
                                cosmicpath.ai
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
    } catch (error) {
        console.error('[Aura OG] Failed to render image:', error);
        return new Response('Failed to generate aura image', { status: 500 });
    }
}
