import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getReadingShareSummary } from '@/lib/reading-share';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const reading = await prisma.readingResult.findUnique({
    where: { id },
    select: {
      data: true,
      metadata: true,
    },
  });

  if (!reading) {
    return new Response('Reading not found', { status: 404 });
  }

  const share = getReadingShareSummary(reading);
  const labels =
    share.language === 'en'
      ? ['Public snapshot', 'Private details locked', 'Decision stack']
      : ['공개 스냅샷', '비공개 정보 보호', 'Decision Note 구조'];

  try {
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
              'radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.18), transparent 28%), linear-gradient(135deg, #050816 0%, #0b1023 45%, #140f2d 100%)',
            color: '#F8FAFC',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            }}
          />

          <div
            style={{
              display: 'flex',
              width: '100%',
              padding: '64px',
              gap: '36px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '70%',
                padding: '34px 38px',
                borderRadius: 36,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(8, 12, 26, 0.54)',
                boxShadow: '0 24px 80px rgba(3, 7, 18, 0.45)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: 24,
                    letterSpacing: '0.18em',
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
                  CosmicPath
                </div>

                <div
                  style={{
                    display: 'flex',
                    fontSize: 68,
                    lineHeight: 1.08,
                    fontWeight: 800,
                    letterSpacing: 0,
                  }}
                >
                  {share.title}
                </div>

                <div
                  style={{
                    display: 'flex',
                    fontSize: 28,
                    lineHeight: 1.45,
                    color: 'rgba(226, 232, 240, 0.84)',
                    maxWidth: '92%',
                  }}
                >
                  {share.description}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 20,
                  color: 'rgba(226, 232, 240, 0.7)',
                  width: 'fit-content',
                }}
              >
                Saju structure
                <span style={{ color: '#8B5CF6' }}>•</span>
                Astrology timing
                <span style={{ color: '#8B5CF6' }}>•</span>
                Tarot signal
              </div>
            </div>

            <div
              style={{
                width: '30%',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {labels.map((label) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 32,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '28px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    fontSize: 26,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
