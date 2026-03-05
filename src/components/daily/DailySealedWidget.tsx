'use client';

import { useState, useEffect } from 'react';
import { BirthDateInput } from '@/components/common/BirthDateInput';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';
import { Sparkles } from 'lucide-react';

interface DailyFortuneResponse {
    date: string;
    dayMaster: string;
    overallLuck: number;
    summary: string;
    luckyColor: string;
    luckyNumber: number;
    luckyDirection: string;
    areas: {
        love: number;
        money: number;
        career: number;
        health: number;
    };
    advice: string;
    cachedUntil: string;
    isPremium?: boolean;
}

interface StoredBirthData {
    birthDate: string;
    birthTime?: string;
}

const areaLabelMap = {
    love: '연애',
    money: '재물',
    career: '커리어',
    health: '건강',
} as const;

function getStrongestArea(areas: DailyFortuneResponse['areas']) {
    return Object.entries(areas).reduce((best, current) =>
        current[1] > best[1] ? current : best
    ) as [keyof DailyFortuneResponse['areas'], number];
}

function getWeakestArea(areas: DailyFortuneResponse['areas']) {
    return Object.entries(areas).reduce((worst, current) =>
        current[1] < worst[1] ? current : worst
    ) as [keyof DailyFortuneResponse['areas'], number];
}

export function DailySealedWidget() {
    const [forecast, setForecast] = useState<DailyFortuneResponse | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [userData, setUserData] = useState<StoredBirthData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Quick Input State
    const [inputDate, setInputDate] = useState('');
    const [inputTime, setInputTime] = useState('');
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    useEffect(() => {
        // 1. Check LocalStorage
        const storedData = localStorage.getItem('cosmic_user_data');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData) as { birthDate?: string; birthTime?: string };
                if (parsed.birthDate) {
                    const normalized = {
                        birthDate: parsed.birthDate,
                        birthTime: parsed.birthTime,
                    };
                    setUserData(normalized);
                    setInputDate(normalized.birthDate);
                    setInputTime(normalized.birthTime ?? '');
                    void fetchDailyFortune(normalized.birthDate, normalized.birthTime);
                }
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }
    }, []);

    const fetchDailyFortune = async (birthDate: string, birthTime?: string) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const params = new URLSearchParams({ birthday: birthDate });
            if (birthTime) {
                params.set('birthtime', birthTime);
            }

            const response = await fetch(`/api/daily/fortune?${params.toString()}`, {
                cache: 'no-store',
            });
            const payload = (await response.json()) as DailyFortuneResponse & {
                error?: { message?: string };
            };

            if (!response.ok) {
                throw new Error(payload?.error?.message || '오늘의 운세를 불러오지 못했습니다.');
            }

            setForecast(payload);
            setIsRevealed(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputDate) return;

        const newUserData = {
            birthDate: inputDate,
            birthTime: inputTime,
        };

        localStorage.setItem('cosmic_user_data', JSON.stringify(newUserData));
        setUserData(newUserData);
        void fetchDailyFortune(newUserData.birthDate, newUserData.birthTime);
    };

    if (!userData) {
        return (
            <div className="w-full max-w-sm mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl animate-fade-in-up">
                <h2 className="text-xl font-serif text-starlight mb-2 text-center">Unlock Your Daily Energy</h2>
                <p className="text-starlight/60 text-sm text-center mb-6">
                    Enter your birth date to reveal your personalized daily cosmic seal.
                </p>

                <BirthDateInput
                    date={inputDate}
                    time={inputTime}
                    onDateChange={setInputDate}
                    onTimeChange={setInputTime}
                    onSubmit={handleQuickSubmit}
                    isLoading={isLoading}
                    buttonText="Reveal Today's Fortune"
                />

                <p className="text-[10px] text-starlight/30 text-center mt-4">
                    * Your data is saved locally on your device.
                </p>
            </div>
        );
    }

    if (!forecast) {
        return (
            <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl text-center">
                {errorMessage ? (
                    <p className="text-red-300 text-sm">{errorMessage}</p>
                ) : (
                    <p className="text-starlight/70 text-sm">{isLoading ? 'Loading Cosmic Energy...' : '운세를 불러오는 중입니다.'}</p>
                )}
            </div>
        );
    }

    const strongestArea = getStrongestArea(forecast.areas);
    const weakestArea = getWeakestArea(forecast.areas);

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
                        <h2 className="text-3xl md:text-4xl font-gowun-batang text-white mb-3 text-glow-gold">
                            오늘의 운세 {forecast.overallLuck}점
                        </h2>

                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-starlight/70 font-medium">
                                일간 {forecast.dayMaster}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-acc-gold/10 border border-acc-gold/20 text-acc-gold font-bold">
                                Lucky #{forecast.luckyNumber}
                            </span>
                        </div>

                        <div className="bg-white/[0.03] p-6 rounded-xl border border-white/5 mb-6 text-center">
                            <p className="text-lg leading-relaxed text-starlight/90 font-medium font-gowun-batang break-keep">
                                &ldquo;{forecast.summary}&rdquo;
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
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">연애 운</span>
                                <span className="text-white font-medium">{forecast.areas.love}점</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">재물 운</span>
                                <span className="text-white font-medium">{forecast.areas.money}점</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">커리어 운</span>
                                <span className="text-white font-medium">{forecast.areas.career}점</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-starlight/40 text-xs mb-1">건강 운</span>
                                <span className="text-white font-medium">{forecast.areas.health}점</span>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 mb-8 text-left">
                            <p className="text-starlight/50 text-xs mb-2">오늘의 조언</p>
                            <p className="text-starlight/85 text-sm leading-relaxed break-keep">{forecast.advice}</p>
                        </div>

                        {forecast.isPremium ? (
                            <div className="pt-6 border-t border-acc-gold/30 text-left">
                                <p className="text-acc-gold text-xs font-bold tracking-[0.16em] uppercase mb-3">
                                    Premium Insight
                                </p>
                                <div className="rounded-xl border border-acc-gold/20 bg-acc-gold/5 p-4">
                                    <p className="text-starlight/90 text-sm leading-relaxed break-keep">
                                        오늘은 <span className="text-acc-gold font-semibold">{areaLabelMap[strongestArea[0]]}</span> 흐름({strongestArea[1]}점)을
                                        중심으로 움직이면 성과를 빠르게 만들 수 있습니다.
                                        {' '}반대로 <span className="text-red-300 font-semibold">{areaLabelMap[weakestArea[0]]}</span> 영역({weakestArea[1]}점)은
                                        에너지 소모가 크니 과한 결정은 내일로 미루는 편이 안전합니다.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-starlight/50 text-xs mb-3">매일 업데이트되는 맞춤형 운세가 필요하신가요?</p>
                                <button
                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                    className="w-full py-4 bg-gradient-to-r from-acc-gold to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-acc-gold/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>CosmicPath Pro 무제한 구독</span>
                                    <Sparkles className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />
        </div>
    );
}
