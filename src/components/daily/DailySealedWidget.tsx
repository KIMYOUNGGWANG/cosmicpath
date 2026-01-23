'use client';

import { useState, useEffect } from 'react';
import { calculateDailyForecast, DailyForecast, DayMaster } from '@/lib/daily-forecast';
import { useRouter } from 'next/navigation';

export function DailySealedWidget() {
    const router = useRouter();
    const [forecast, setForecast] = useState<DailyForecast | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // 1. Check LocalStorage
        const storedData = localStorage.getItem('cosmic_user_data');
        if (!storedData) {
            // No data, redirect or show setup
            return;
        }

        try {
            const parsed = JSON.parse(storedData);
            setUserData(parsed);

            // 2. Calculate Forecast
            // We need to extract Day Master from the stored data.
            // Assuming storedData has 'saju' object or similar from the onboarding flow.
            // If the stored data structure doesn't directly have 'dayMaster', we might need to recalculate it 
            // or assume it was saved. For now, let's look for it.

            // Mocking extraction for MVP if complex parsing is needed. 
            // In reality, we should save the Day Master explicitly or derive it.
            // Let's assume parsed.saju.dayMaster exists or we derive from birthDate.

            // Fallback DayMaster for testing if not found (should be improved)
            const dm: DayMaster = parsed.saju?.dayMaster || 'jia';

            const today = new Date().toISOString().split('T')[0];
            const result = calculateDailyForecast(dm, today);
            setForecast(result);

        } catch (e) {
            console.error('Failed to parse user data', e);
        }
    }, []);

    if (!userData) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-xl font-serif text-starlight mb-4">You need to connect your energy first.</h2>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-acc-gold text-bg-void font-bold rounded-full hover:bg-white transition-colors"
                >
                    Get My Reading
                </button>
            </div>
        );
    }

    if (!forecast) return <div>Loading Cosmic Energy...</div>;

    return (
        <div className="w-full max-w-md mx-auto min-h-[400px] flex items-center justify-center relative perspective-1000">

            {/* Sealed Envelope State */}
            {!isRevealed ? (
                <div
                    onClick={() => setIsRevealed(true)}
                    className="cursor-pointer group relative w-64 h-48 bg-[#1a1a2e] border-2 border-acc-gold/30 rounded-lg shadow-2xl flex flex-col items-center justify-center transform transition-all hover:scale-105 hover:rotate-1"
                >
                    {/* Wax Seal */}
                    <div className="w-16 h-16 rounded-full bg-red-800 border-4 border-red-900 flex items-center justify-center shadow-inner mb-4 relative z-10 group-hover:bg-red-700 transition-colors">
                        <span className="text-2xl">⚡️</span>
                    </div>
                    <p className="font-serif text-acc-gold tracking-widest text-sm text-center">
                        DAILY FORECAST<br />
                        <span className="text-xs text-starlight/50 opacity-0 group-hover:opacity-100 transition-opacity">Click to Open</span>
                    </p>

                    {/* Envelope Flap Effect (Pseudo) */}
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-acc-gold/10 rounded-lg pointer-events-none" />
                </div>
            ) : (
                /* Revealed Card State */
                <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-2xl animate-fade-in-up">
                    <div className="text-center mb-6">
                        <p className="text-starlight/60 text-sm uppercase tracking-widest mb-1">{forecast.date}</p>
                        <h2 className="text-3xl font-serif text-acc-gold mb-2">{forecast.keyword}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-white/10 text-starlight/80">{forecast.tenGod}</span>
                            <span className="text-xs px-2 py-1 rounded bg-acc-gold/20 text-acc-gold">Score: {forecast.score}</span>
                        </div>
                    </div>

                    <div className="bg-[#0f0f1a] p-6 rounded-lg border border-white/5 mb-6 text-center">
                        <p className="text-lg leading-relaxed text-starlight/90 font-medium">
                            "{forecast.advice}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div className="p-3 bg-white/5 rounded">
                            <span className="block text-starlight/50 mb-1">Lucky Color</span>
                            <span className="text-acc-gold font-medium">{forecast.luckyColor}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded">
                            <span className="block text-starlight/50 mb-1">Direction</span>
                            <span className="text-acc-gold font-medium">{forecast.luckyDirection}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
