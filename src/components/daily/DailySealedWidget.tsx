
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
