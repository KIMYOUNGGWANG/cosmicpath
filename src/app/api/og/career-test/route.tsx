import { ImageResponse } from 'next/og';
import { CAREER_RESULTS } from '@/lib/saju/careerMapping';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    const result = jobId ? CAREER_RESULTS[jobId] : null;

    if (!result) {
      // Return a default fallback OG image
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
              color: '#f8fafc',
            }}
          >
            <div style={{ fontSize: 40, color: '#d4af37', marginBottom: 20, letterSpacing: '0.1em' }}>CosmicPath</div>
            <div style={{ fontSize: 60, fontWeight: 'bold' }}>내 진짜 직장 생존 타입 확인하기</div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Dynamic OG Image based on result
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
            background: 'linear-gradient(to bottom right, #1e1b4b, #0f172a)',
            color: '#f8fafc',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 50,
              right: 60,
              fontSize: 30,
              color: '#cbd5e1',
              fontStyle: 'italic',
            }}
          >
            CosmicPath
          </div>
          
          <div style={{ color: '#d4af37', fontSize: 36, letterSpacing: '0.1em', marginBottom: 20 }}>
            사주로 본 내 리얼 직장 생존 타입
          </div>
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '30px',
              padding: '60px',
              width: '80%',
            }}
          >
            <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 40, color: '#ffffff', lineHeight: 1.2 }}>
              {result.title}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
              {result.traits.map(trait => (
                <div key={trait} style={{ 
                  padding: '10px 20px', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '40px',
                  fontSize: 28,
                  color: '#bfdbfe',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  #{trait}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate the image', { status: 500 });
  }
}
