import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        // Default values if no ID or fetch fails
        let title = 'CosmicPath';
        let subtitle = 'AI Driven Destiny Navigation';
        let type = 'Destiny Analysis';
        let score = '';

        if (id) {
            // Ideally we would fetch from DB here, but in Edge runtime we might need direct DB access or pass params via URL.
            // For V1, let's keep it simple or allow passing params directly for speed.
            // Or we can "simulate" dynamic content if we passed it in url like ?title=...
            const paramTitle = searchParams.get('title');
            const paramDesc = searchParams.get('desc');
            const paramScore = searchParams.get('score');

            if (paramTitle) title = paramTitle;
            if (paramDesc) subtitle = paramDesc;
            if (paramScore) score = paramScore;
        }


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
                        backgroundColor: '#0f172a',
                        backgroundImage: 'radial-gradient(circle at 25% 25%, #2a2a4a 0%, #0f172a 50%)',
                        color: 'white',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0.3,
                        backgroundImage: 'url(https://cosmicpath.app/noise-overlay.png)', // Texture
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, padding: '40px', textAlign: 'center' }}>
                        {/* Logo / Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: 60, marginRight: '10px' }}>✨</div>
                            <div style={{ fontSize: 40, fontWeight: 'bold', background: 'linear-gradient(to right, #fbbf24, #d97706)', backgroundClip: 'text', color: 'transparent' }}>CosmicPath</div>
                        </div>

                        {/* Main Title / Score */}
                        <div style={{ fontSize: 70, fontWeight: 900, marginBottom: '20px', lineHeight: 1.1, textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
                            {title}
                        </div>

                        {/* Subtitle / Description */}
                        <div style={{ fontSize: 30, color: '#94a3b8', maxWidth: '800px', lineHeight: 1.4 }}>
                            {subtitle}
                        </div>

                        {/* Call to Action Badge */}
                        <div style={{ marginTop: '40px', display: 'flex', padding: '10px 30px', background: 'rgba(255,255,255,0.1)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: 24, color: '#fbbf24' }}>Check Your Destiny ➔</div>
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
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
