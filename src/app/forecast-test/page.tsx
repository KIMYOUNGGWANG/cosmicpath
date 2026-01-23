'use client';

import { CosmicForecastWidget } from '@/components/dashboard/cosmic-forecast-widget';

// Mock data for testing
const mockAstro = {
    sunSign: 9,       // Capricorn
    moonSign: 0,      // Aries
    ascendant: 4,     // Leo
    planets: [],
    aspects: []
};

const mockSaju = {
    yearPillar: { stem: '갑', branch: '자' },
    monthPillar: { stem: '병', branch: '인' },
    dayPillar: { stem: '경', branch: '신' },
    hourPillar: { stem: '임', branch: '자' },
    dayMaster: '경',
    fourPillars: '갑자 병인 경신 임자'
};

export default function ForecastTestPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #030308 0%, #0a0a1a 100%)',
            padding: '40px 20px',
            color: 'white',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    fontSize: '24px',
                    fontWeight: 700
                }}>
                    🧪 Cosmic Forecast Test
                </h1>

                <p style={{
                    textAlign: 'center',
                    color: '#94A3B8',
                    marginBottom: '24px',
                    fontSize: '14px'
                }}>
                    Mock User: 경금(庚金) 일간, Leo 상승궁
                </p>

                {/* The Widget */}
                <CosmicForecastWidget
                    userAstro={mockAstro as any}
                    userSaju={mockSaju as any}
                    language="ko"
                />

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            localStorage.removeItem(`cosmicpath_forecast_revealed_${today}`);
                            window.location.reload();
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Reset (봉인 상태로 되돌리기)
                    </button>
                </div>
            </div>
        </div>
    );
}
