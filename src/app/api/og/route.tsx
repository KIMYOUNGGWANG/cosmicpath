import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Dynamic Params
        const title = searchParams.get('title') || 'Cosmic Path';
        const description = searchParams.get('desc') || 'AI Driven Destiny Analysis';
        const cardName = searchParams.get('card') || 'The Universe';
        const trustScore = searchParams.get('score') || '98';

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
                        backgroundColor: '#030014',
                        backgroundImage: 'linear-gradient(to bottom, #030014, #1a1a2e)',
                        fontFamily: 'sans-serif',
                        color: 'white',
                        position: 'relative',
                    }}
                >
                    {/* Decorative Background Elements */}
                    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

                    {/* Card Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 32,
                            padding: '60px 80px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5)',
                            maxWidth: '900px',
                        }}
                    >
                        {/* Logo / Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 24, fontWeight: 400, letterSpacing: '0.2em', color: '#EAB308', opacity: 0.9 }}>COSMIC PATH</span>
                        </div>

                        {/* Trust Score Area */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 24px', borderRadius: 999, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', marginBottom: 30 }}>
                            <span style={{ fontSize: 24, marginRight: 8 }}>✨</span>
                            <span style={{ fontSize: 24, color: '#EAB308', fontWeight: 700 }}>Trust Score {trustScore}/5.0</span>
                        </div>

                        {/* Main Title */}
                        <div style={{
                            fontSize: 72,
                            fontWeight: 800,
                            marginBottom: 20,
                            textAlign: 'center',
                            background: 'linear-gradient(to right, #fff, #a5b4fc)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1.1,
                        }}>
                            {title}
                        </div>

                        {/* Subtitle / Card Name */}
                        <div style={{ fontSize: 32, fontWeight: 300, color: '#94a3b8', marginBottom: 20, textAlign: 'center', maxWidth: 700 }}>
                            {description}
                        </div>

                        {/* Selected Card Badge */}
                        <div style={{
                            marginTop: 20,
                            fontSize: 24,
                            color: '#e2e8f0',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ opacity: 0.5 }}>Your Card:</span>
                            <span style={{ borderBottom: '1px solid #EAB308', paddingBottom: '4px' }}>{cardName}</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.error(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
