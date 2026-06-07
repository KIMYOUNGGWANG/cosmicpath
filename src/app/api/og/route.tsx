import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

function getSearchText(searchParams: URLSearchParams, key: string, baseText: string): string {
    const value = searchParams.get(key)?.trim();
    return value || baseText;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const title = getSearchText(searchParams, 'title', 'CosmicPath 3단분석');
        const description = getSearchText(
            searchParams,
            'desc',
            '사주, 점성술, 타로 세 근거를 대조해 첫 판정과 다음 행동을 정리합니다.'
        );
        const cardName = getSearchText(searchParams, 'card', 'Saju · Astrology · Tarot');
        const trustScore = getSearchText(searchParams, 'score', '4.5');

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        backgroundColor: '#080705',
                        backgroundImage:
                            'radial-gradient(circle at 18% 12%, rgba(208,169,89,0.2), transparent 24%), radial-gradient(circle at 84% 74%, rgba(98,74,44,0.22), transparent 28%), linear-gradient(135deg, #0b0a07 0%, #15100a 52%, #050504 100%)',
                        color: '#f6ead2',
                        fontFamily: 'Georgia, serif',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 58,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 26,
                            border: '1px solid rgba(214,174,93,0.32)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            inset: 48,
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage:
                                'linear-gradient(rgba(214,174,93,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(214,174,93,0.06) 1px, transparent 1px)',
                            backgroundSize: '74px 74px',
                            opacity: 0.28,
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'stretch',
                            justifyContent: 'space-between',
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', width: 760, padding: '34px 0 28px 20px' }}>
                            <div style={{ display: 'flex', color: '#d7ad5f', fontSize: 22, letterSpacing: '0.24em' }}>
                                COSMICPATH
                            </div>
                            <div style={{ display: 'flex', marginTop: 34, color: '#d7ad5f', fontSize: 30, letterSpacing: '0.18em' }}>
                                사주 · 점성술 · 타로
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    marginTop: 18,
                                    color: '#f8edda',
                                    fontSize: 70,
                                    lineHeight: 0.96,
                                    letterSpacing: '-0.06em',
                                }}
                            >
                                {title}
                            </div>
                            <div style={{ display: 'flex', marginTop: 24, maxWidth: 690, color: 'rgba(248,237,218,0.74)', fontSize: 29, lineHeight: 1.32 }}>
                                {description}
                            </div>
                            <div style={{ display: 'flex', marginTop: 'auto', gap: 14 }}>
                                {['FIRST VERDICT', 'EVIDENCE', 'NEXT ACTION'].map((label) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: 'flex',
                                            border: '1px solid rgba(215,173,95,0.36)',
                                            color: '#d7ad5f',
                                            padding: '10px 14px',
                                            fontSize: 16,
                                            letterSpacing: '0.12em',
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: 286,
                                borderLeft: '1px solid rgba(215,173,95,0.28)',
                                padding: '34px 20px 28px 32px',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    ['命式', '사주 구조'],
                                    ['星盤', '점성술 타이밍'],
                                    ['牌', '타로 방향'],
                                ].map(([symbol, label]) => (
                                    <div
                                        key={label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            borderBottom: '1px solid rgba(215,173,95,0.2)',
                                            paddingBottom: 14,
                                        }}
                                    >
                                        <div style={{ display: 'flex', color: '#f8edda', fontSize: 38 }}>{symbol}</div>
                                        <div style={{ display: 'flex', color: 'rgba(248,237,218,0.62)', fontSize: 20 }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', color: 'rgba(248,237,218,0.5)', fontSize: 17, letterSpacing: '0.12em' }}>
                                    SELECTED CARD
                                </div>
                                <div style={{ display: 'flex', color: '#d7ad5f', fontSize: 31, lineHeight: 1.12 }}>
                                    {cardName}
                                </div>
                                <div style={{ display: 'flex', marginTop: 14, color: 'rgba(248,237,218,0.5)', fontSize: 17 }}>
                                    신뢰도 {trustScore}/5.0
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown OG image generation error';
        console.error(message);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
