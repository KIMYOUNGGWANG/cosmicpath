
'use client';

import { useState, useEffect } from 'react';
import { calculateDailyForecast, calculateDayMaster, DailyForecast, DayMaster } from '@/lib/daily-forecast';
import { useRouter } from 'next/navigation';

export function DailySealedWidget() {
    const router = useRouter();
    const [forecast, setForecast] = useState<DailyForecast | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    // Quick Input State
    const [inputDate, setInputDate] = useState('');
    const [inputTime, setInputTime] = useState('');

    useEffect(() => {
        // 1. Check LocalStorage
        const storedData = localStorage.getItem('cosmic_user_data');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                setUserData(parsed);
                generateForecast(parsed);
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }
    }, []);

    const generateForecast = (data: any) => {
        // Fallback DayMaster logic
        let dm: DayMaster = 'jia';

        if (data.saju?.dayMaster) {
            dm = data.saju.dayMaster;
        } else if (data.birthDate) {
            // Calculate on the fly if only date exists
            dm = calculateDayMaster(data.birthDate);
        }

        const today = new Date().toISOString().split('T')[0];
        const result = calculateDailyForecast(dm, today);
        setForecast(result);
    };

    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputDate) return;

        // Calculate Day Master
        const dm = calculateDayMaster(inputDate);

        // Save to LocalStorage (Minimal)
        const newUserData = {
            birthDate: inputDate,
            birthTime: inputTime,
            saju: { dayMaster: dm } // Cache it
        };

        localStorage.setItem('cosmic_user_data', JSON.stringify(newUserData));
        setUserData(newUserData);
        generateForecast(newUserData);
    };

    if (!userData) {
        return (
            <div className="w-full max-w-sm mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl animate-fade-in-up">
                <h2 className="text-xl font-serif text-starlight mb-2 text-center">Unlock Your Daily Energy</h2>
                <p className="text-starlight/60 text-sm text-center mb-6">
                    Enter your birth date to reveal your personalized daily cosmic seal.
                </p>

                <form onSubmit={handleQuickSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-starlight/50 mb-1">Birth Date</label>
                        <input
                            type="date"
                            required
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-starlight focus:border-acc-gold outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-starlight/50 mb-1">Birth Time (Optional)</label>
                        <input
                            type="time"
                            value={inputTime}
                            onChange={(e) => setInputTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-starlight focus:border-acc-gold outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-acc-gold text-bg-void font-bold rounded hover:bg-white transition-colors mt-2"
                    >
                        Reveal My Day
                    </button>
                </form>

                <p className="text-[10px] text-starlight/30 text-center mt-4">
                    * Your data is saved locally on your device.
                </p>
            </div>
        );
    }

    if (!forecast) return <div>Loading Cosmic Energy...</div>;

    return (
        <div className="w-full max-w-md mx-auto min-h-[440px] flex items-center justify-center relative perspective-1000">

            {/* Sealed Envelope State */}
            {!isRevealed ? (
                <div
                    onClick={() => setIsRevealed(true)}
                    className="cursor-pointer group relative w-72 h-52 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-2xl flex flex-col items-center justify-center transform transition-all hover:scale-105 hover:rotate-1"
                    style={{
                        backgroundImage: 'radial-gradient(circle at center, #2d2d44 0%, #1a1a2e 100%)',
                        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Wax Seal */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-800 to-red-900 border-4 border-red-950/50 flex items-center justify-center shadow-lg mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl filter drop-shadow-md">⚡️</span>
                        <div className="absolute inset-0 rounded-full border border-white/10" />
                    </div>
                    <p className="font-cinzel text-acc-gold tracking-[0.2em] text-sm text-center font-bold">
                        DAILY SEAL<br />
                        <span className="text-[10px] text-starlight/40 font-sans tracking-normal opacity-0 group-hover:opacity-100 transition-opacity mt-1 block">터치하여 봉인 해제</span>
                    </p>

                    {/* Envelope Flap Effect (Pseudo) */}
                    <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-lg pointer-events-none" />
                </div>
            ) : (
                /* Revealed Card State */
                <div className="w-full bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up relative overflow-hidden">
                    {/* Background Noise/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-acc-gold/5 to-transparent pointer-events-none" />

                    <div className="text-center mb-8 relative z-10">
                        <p className="text-starlight/40 text-xs uppercase tracking-[0.2em] mb-2">{forecast.date}</p>
                        <h2 className="text-3xl md:text-4xl font-gowun-batang text-white mb-3 text-glow-gold">{forecast.keyword}</h2>

                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-starlight/70 font-medium">{forecast.tenGod}</span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-acc-gold/10 border border-acc-gold/20 text-acc-gold font-bold">에너지 {forecast.score}점</span>
                        </div>

                        <div className="bg-white/[0.03] p-6 rounded-xl border border-white/5 mb-6 text-center">
                            <p className="text-lg leading-relaxed text-starlight/90 font-medium font-gowun-batang break-keep">
                                "{forecast.advice}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center text-sm mb-8">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">행운의 컬러</span>
                                <span className="text-white font-medium">{forecast.luckyColor}</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">길한 방향</span>
                                <span className="text-white font-medium">{forecast.luckyDirection}</span>
                            </div>
                        </div>

                        {/* Upsell CTA */}
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-starlight/50 text-xs mb-3">더 깊은 운명의 흐름이 궁금하신가요?</p>
                            <button
                                onClick={() => router.push('/start')}
                                className="w-full py-4 bg-gradient-to-r from-acc-gold to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-acc-gold/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <span>프리미엄 정밀 분석 보기</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
