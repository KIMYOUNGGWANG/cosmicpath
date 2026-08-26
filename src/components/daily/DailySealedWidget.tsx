'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Sparkles, Star } from 'lucide-react';
import { BirthDateInput } from '@/components/common/BirthDateInput';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import {
    getDailyLinkedLabel,
    parseDailyLinkedOracleContext,
    resolveDailyLinkedArea,
    type DailyLinkedOracleContext,
} from '@/lib/daily/daily-linked-context';

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

interface DailyTarotResponse {
    date: string;
    cardIndex: number;
    cardName: string;
    cardNameKo: string;
    isReversed: boolean;
    keywordKo: string;
    meaning: string;
    advice: string;
    isPremium: boolean;
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

const areaOrder: Array<keyof DailyFortuneResponse['areas']> = ['love', 'money', 'career', 'health'];

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

function getLuckTierLabel(score: number) {
    if (score >= 85) return 'Golden Surge';
    if (score >= 70) return 'Stable Rise';
    if (score >= 55) return 'Balanced Day';
    return 'Slow Orbit';
}

function getAreaCardTone(area: keyof DailyFortuneResponse['areas']) {
    if (area === 'love') return 'from-rose-400/16 to-transparent text-rose-100';
    if (area === 'money') return 'from-amber-400/18 to-transparent text-amber-100';
    if (area === 'career') return 'from-cyan-400/16 to-transparent text-cyan-100';
    return 'from-emerald-400/16 to-transparent text-emerald-100';
}

function getStoredBirthData(): StoredBirthData | null {
    const storedData = localStorage.getItem('cosmic_user_data');
    if (!storedData) {
        return null;
    }

    try {
        const parsed = JSON.parse(storedData) as {
            birthDate?: string;
            birthTime?: string;
        };

        return parsed.birthDate
            ? {
                birthDate: parsed.birthDate,
                birthTime: parsed.birthTime,
            }
            : null;
    } catch (error) {
        console.error('Failed to parse user data', error);
        return null;
    }
}

function getStoredLinkedOracleContext(): DailyLinkedOracleContext | null {
    const metadata =
        sessionStorage.getItem('pending_metadata') ||
        localStorage.getItem('pending_metadata');
    const report =
        sessionStorage.getItem('pending_report_data') ||
        localStorage.getItem('pending_report_data');
    const readingId =
        sessionStorage.getItem('pending_reading_id') ||
        localStorage.getItem('pending_reading_id') ||
        undefined;

    return parseDailyLinkedOracleContext({
        readingId,
        metadata,
        data: report,
    });
}

function buildLinkedOrbitMessage(params: {
    linkedArea: keyof DailyFortuneResponse['areas'] | null;
    linkedAreaScore: number | null;
    strongestArea: [keyof DailyFortuneResponse['areas'], number];
}) {
    const strongestAreaLabel = areaLabelMap[params.strongestArea[0]];

    if (!params.linkedArea || params.linkedAreaScore === null) {
        return `${strongestAreaLabel} 흐름이 오늘 가장 강합니다. 지난 질문도 이 축에서 다시 보면 해석이 더 선명해집니다.`;
    }

    const linkedAreaLabel = areaLabelMap[params.linkedArea];

    if (params.linkedAreaScore >= 75) {
        return `${linkedAreaLabel} 흐름이 ${params.linkedAreaScore}점으로 강하게 열려 있습니다. 지난 질문을 오늘 다시 움직여볼 만한 타이밍입니다.`;
    }

    if (params.linkedAreaScore >= 55) {
        return `${linkedAreaLabel} 흐름이 ${params.linkedAreaScore}점으로 안정권입니다. 큰 결론보다 작은 확인 액션을 붙이기 좋은 날입니다.`;
    }

    return `${linkedAreaLabel} 흐름이 ${params.linkedAreaScore}점으로 낮게 깔려 있습니다. 오늘은 밀어붙이기보다 준비와 관찰을 우선하세요.`;
}

interface DailySealedWidgetProps {
    linkedOracleContext?: DailyLinkedOracleContext | null;
}

export function DailySealedWidget({ linkedOracleContext }: DailySealedWidgetProps) {
    const [forecast, setForecast] = useState<DailyFortuneResponse | null>(null);
    const [tarot, setTarot] = useState<DailyTarotResponse | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [userData, setUserData] = useState<StoredBirthData | null>(null);
    const [resolvedLinkedOracleContext, setResolvedLinkedOracleContext] = useState<DailyLinkedOracleContext | null>(linkedOracleContext ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [inputDate, setInputDate] = useState('');
    const [inputTime, setInputTime] = useState('');
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const trackedDailyReturnKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const storedLinkedContext = getStoredLinkedOracleContext();
        const activeLinkedContext = storedLinkedContext ?? linkedOracleContext ?? null;

        if (activeLinkedContext) {
            setResolvedLinkedOracleContext(activeLinkedContext);
        }

        const storedBirthData = getStoredBirthData();
        const nextUserData = storedBirthData ?? (
            activeLinkedContext?.birthDate
                ? {
                    birthDate: activeLinkedContext.birthDate,
                    birthTime: activeLinkedContext.birthTime,
                }
                : null
        );

        if (!nextUserData) {
            return;
        }

        if (!storedBirthData) {
            localStorage.setItem('cosmic_user_data', JSON.stringify(nextUserData));
        }

        setUserData(nextUserData);
        setInputDate(nextUserData.birthDate);
        setInputTime(nextUserData.birthTime ?? '');
        void fetchDailyReadings(nextUserData.birthDate, nextUserData.birthTime);
    }, [linkedOracleContext]);

    useEffect(() => {
        const readingId = resolvedLinkedOracleContext?.readingId;
        if (!readingId) {
            return;
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const storageKey = `cosmicpath.daily_return_after_reading:${readingId}:${todayKey}`;

        if (trackedDailyReturnKeyRef.current === storageKey) {
            return;
        }

        trackedDailyReturnKeyRef.current = storageKey;

        try {
            if (localStorage.getItem(storageKey) === 'true') {
                return;
            }

            localStorage.setItem(storageKey, 'true');
        } catch {
            // Ignore storage access issues and continue with a best-effort track call.
        }

        const linkedArea = resolveDailyLinkedArea(resolvedLinkedOracleContext);

        void trackClientGrowthEvent({
            event: 'daily_return_after_reading',
            source: 'daily_linked_loop',
            readingId,
            context: resolvedLinkedOracleContext.context,
            metadata: {
                linkedArea,
                linkedLabel: getDailyLinkedLabel(resolvedLinkedOracleContext),
                questionIntent: resolvedLinkedOracleContext.questionIntent,
            },
        });
    }, [resolvedLinkedOracleContext]);

    const fetchDailyReadings = async (birthDate: string, birthTime?: string) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const fortuneParams = new URLSearchParams({ birthday: birthDate });
            if (birthTime) {
                fortuneParams.set('birthtime', birthTime);
            }

            const tarotParams = new URLSearchParams({ birthday: birthDate });

            const [fortuneResponse, tarotResponse] = await Promise.all([
                fetch(`/api/daily/fortune?${fortuneParams.toString()}`, {
                    cache: 'no-store',
                }),
                fetch(`/api/daily/tarot?${tarotParams.toString()}`, {
                    cache: 'no-store',
                }),
            ]);

            const fortunePayload = (await fortuneResponse.json()) as DailyFortuneResponse & {
                error?: { message?: string };
            };
            const tarotPayload = (await tarotResponse.json()) as DailyTarotResponse & {
                error?: { message?: string };
            };

            if (!fortuneResponse.ok) {
                throw new Error(fortunePayload?.error?.message || '오늘의 운세를 불러오지 못했습니다.');
            }

            if (!tarotResponse.ok) {
                throw new Error(tarotPayload?.error?.message || '오늘의 타로를 불러오지 못했습니다.');
            }

            setForecast(fortunePayload);
            setTarot(tarotPayload);
            setIsRevealed(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setErrorMessage(message);
            setForecast(null);
            setTarot(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!inputDate) {
            return;
        }

        const nextUserData = {
            birthDate: inputDate,
            birthTime: inputTime,
        };

        localStorage.setItem('cosmic_user_data', JSON.stringify(nextUserData));
        setUserData(nextUserData);
        void fetchDailyReadings(nextUserData.birthDate, nextUserData.birthTime);
    };

    if (!userData) {
        return (
            <div className="mx-auto w-full max-w-5xl animate-fade-in-up overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(95,156,201,0.14),transparent_22%),rgba(255,255,255,0.03)] shadow-[0_30px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative overflow-hidden border-b border-white/8 p-7 lg:border-b-0 lg:border-r lg:p-9">
                        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-acc-gold/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

                        <div className="relative">
                            <span className="inline-flex items-center rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-acc-gold">
                                Daily Ritual
                            </span>
                            <h2 className="mt-5 max-w-lg font-cinzel text-3xl leading-tight text-white md:text-4xl">
                                오늘 하루를 여는
                                <span className="block bg-gradient-to-r from-[#fff2c9] via-[#f4d88a] to-[#c6f0ff] bg-clip-text text-transparent">
                                    운세와 한 장의 타로
                                </span>
                            </h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-starlight/68 md:text-base">
                                생년월일을 입력하면 자정까지 고정되는 개인 운세와 타로 카드를 함께 확인할 수 있습니다.
                                무료 해석으로 오늘의 흐름을 읽고, Pro에서는 행동 가이드까지 열립니다.
                            </p>

                            <div className="mt-7 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-starlight/42">Reset</p>
                                    <p className="mt-2 text-lg font-semibold text-white">매일 자정</p>
                                    <p className="mt-1 text-xs leading-5 text-starlight/56">하루 단위로 새로운 해석이 갱신됩니다.</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-starlight/42">Dual Read</p>
                                    <p className="mt-2 text-lg font-semibold text-white">Fortune + Energy</p>
                                    <p className="mt-1 text-xs leading-5 text-starlight/56">운의 흐름과 에너지 신호를 동시에 봅니다.</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-starlight/42">Pro Layer</p>
                                    <p className="mt-2 text-lg font-semibold text-white">Action Advice</p>
                                    <p className="mt-1 text-xs leading-5 text-starlight/56">구독자는 오늘의 행동 가이드까지 확인합니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-7 lg:p-9">
                        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                            <p className="text-[11px] uppercase tracking-[0.26em] text-starlight/45">
                                Unlock Your Daily Seal
                            </p>

                            <div className="my-6 flex items-center justify-center">
                                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-acc-gold/20 bg-acc-gold/10">
                                    <div className="absolute inset-2 rounded-full border border-dashed border-acc-gold/20" />
                                    <div className="absolute -inset-3 rounded-full border border-cyan-300/10" />
                                    <Star className="h-9 w-9 text-acc-gold" />
                                </div>
                            </div>

                            <BirthDateInput
                                date={inputDate}
                                time={inputTime}
                                onDateChange={setInputDate}
                                onTimeChange={setInputTime}
                                onSubmit={handleQuickSubmit}
                                isLoading={isLoading}
                                buttonText="Reveal Daily Reading"
                            />

                            <p className="mt-4 text-center text-[10px] leading-5 text-starlight/32">
                                * 입력 정보는 기기 로컬에만 저장됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!forecast || !tarot) {
        return (
            <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                {errorMessage ? (
                    <p className="text-sm text-red-300">{errorMessage}</p>
                ) : (
                    <p className="text-sm text-starlight/70">
                        {isLoading ? 'Loading Fortune & Tarot...' : '데일리 리딩을 불러오는 중입니다.'}
                    </p>
                )}
            </div>
        );
    }

    const strongestArea = getStrongestArea(forecast.areas);
    const weakestArea = getWeakestArea(forecast.areas);
    const isPremiumTheme = forecast.isPremium === true;
    const linkedLabel = resolvedLinkedOracleContext
        ? getDailyLinkedLabel(resolvedLinkedOracleContext, 'ko')
        : null;
    const linkedArea = resolveDailyLinkedArea(resolvedLinkedOracleContext);
    const linkedAreaScore = linkedArea ? forecast.areas[linkedArea] : null;
    const linkedOrbitMessage = buildLinkedOrbitMessage({
        linkedArea,
        linkedAreaScore,
        strongestArea,
    });

    return (
        <div className="w-full min-h-[620px] flex items-center justify-center relative perspective-1000">
            {!isRevealed ? (
                <div className="w-full max-w-5xl">
                    {resolvedLinkedOracleContext ? (
                        <div className="mb-6 rounded-[28px] border border-emerald-300/14 bg-[linear-gradient(180deg,rgba(52,211,153,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                                    Linked Oracle Loop
                                </span>
                                {linkedLabel ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/72">
                                        {linkedLabel}
                                    </span>
                                ) : null}
                                {resolvedLinkedOracleContext.advisorName ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/60">
                                        {resolvedLinkedOracleContext.advisorName}
                                    </span>
                                ) : null}
                            </div>

                            <h3 className="mt-4 text-xl font-semibold text-white">
                                최근 오라클 질문에서 오늘의 리추얼로 바로 이어집니다.
                            </h3>
                            {resolvedLinkedOracleContext.question ? (
                                <p className="mt-2 text-sm leading-7 text-starlight/72 break-keep">
                                    최근 질문: &ldquo;{resolvedLinkedOracleContext.question}&rdquo;
                                </p>
                            ) : null}
                            {resolvedLinkedOracleContext.actionConclusion ? (
                                <p className="mt-3 text-sm leading-7 text-starlight/62 break-keep">
                                    마지막 결론: {resolvedLinkedOracleContext.actionConclusion}
                                </p>
                            ) : null}

                            {resolvedLinkedOracleContext.readingId ? (
                                <Link
                                    href={`/start?reading_id=${resolvedLinkedOracleContext.readingId}`}
                                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                >
                                    마지막 오라클 다시 보기
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : null}
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setIsRevealed(true)}
                        className={`group relative mx-auto flex h-[296px] w-[min(100%,25rem)] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[30px] border shadow-2xl transition-[transform,box-shadow,border-color] duration-300 hover:scale-[1.02] hover:-rotate-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70 ${
                            isPremiumTheme
                                ? 'border-acc-gold/30 bg-[#171117]'
                                : 'border-white/10 bg-[#121624]'
                        }`}
                        style={{
                            backgroundImage: isPremiumTheme
                                ? 'radial-gradient(circle at top, rgba(212,175,55,0.24) 0%, #171117 62%)'
                                : 'radial-gradient(circle at top, rgba(90,124,155,0.24) 0%, #121624 62%)',
                            boxShadow: '0 24px 60px -16px rgba(0, 0, 0, 0.55)',
                        }}
                    >
                        <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-acc-gold/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-5 rounded-[24px] border border-white/6" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_38%)] opacity-60" />
                        <div
                            className={`relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                                isPremiumTheme
                                    ? 'border-amber-950/40 bg-gradient-to-br from-acc-gold to-amber-700'
                                    : 'border-cyan-950/40 bg-gradient-to-br from-cyan-500 to-slate-800'
                            }`}
                        >
                            <Star className="h-8 w-8 fill-white text-white" />
                        </div>

                        <p className="text-center font-cinzel text-sm font-bold tracking-[0.28em] text-acc-gold">
                            DAILY SEAL
                        </p>
                        <p className="mt-2 text-center text-xs text-starlight/55">
                            오늘의 운세와 타로가 함께 봉인되어 있습니다
                        </p>
                        <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-starlight/40">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Fortune</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tarot</span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-emerald-100">
                                    {linkedLabel}
                                </span>
                            ) : null}
                        </div>
                        <span className="mt-4 text-[10px] uppercase tracking-[0.24em] text-starlight/35 opacity-0 transition-opacity group-hover:opacity-100">
                            Touch To Reveal
                        </span>

                        {isPremiumTheme ? (
                            <span className="mt-4 rounded-full border border-acc-gold/25 bg-acc-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-acc-gold">
                                Pro Theme
                            </span>
                        ) : null}
                    </button>
                </div>
            ) : (
                <div
                    className={`w-full max-w-5xl overflow-hidden rounded-[32px] border p-5 shadow-2xl animate-fade-in-up md:p-8 ${
                        isPremiumTheme
                            ? 'border-acc-gold/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_28%),rgba(10,10,12,0.94)]'
                            : 'border-white/10 bg-[radial-gradient(circle_at_top,rgba(78,121,167,0.14),transparent_24%),rgba(10,10,12,0.9)]'
                    }`}
                >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-starlight/45">Daily Orbit Summary</p>
                            <p className="mt-1 text-sm text-starlight/72">
                                {forecast.date} 기준 운세 흐름과 오늘의 카드가 함께 고정되었습니다.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[11px] font-semibold text-acc-gold">
                                {getLuckTierLabel(forecast.overallLuck)}
                            </span>
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                                Tarot #{tarot.cardIndex}
                            </span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                                    Linked to {linkedLabel}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {resolvedLinkedOracleContext ? (
                        <div className="mb-6 rounded-[28px] border border-emerald-300/12 bg-[linear-gradient(180deg,rgba(52,211,153,0.07),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                                    Question-Linked Orbit
                                </span>
                                {linkedLabel ? (
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/70">
                                        {linkedLabel}
                                    </span>
                                ) : null}
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/60">
                                    오늘 연결 영역: {linkedArea ? areaLabelMap[linkedArea] : areaLabelMap[strongestArea[0]]}
                                    {linkedAreaScore !== null ? ` ${linkedAreaScore}점` : ` ${strongestArea[1]}점`}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-starlight/42">
                                        Recent Oracle Thread
                                    </p>
                                    <p className="mt-3 text-base leading-7 text-white break-keep">
                                        {resolvedLinkedOracleContext.question
                                            ? `“${resolvedLinkedOracleContext.question}”`
                                            : '최근 오라클 질문 흐름을 기준으로 오늘의 데일리 리딩을 연결했습니다.'}
                                    </p>
                                    {resolvedLinkedOracleContext.actionConclusion ? (
                                        <p className="mt-3 text-sm leading-7 text-starlight/66 break-keep">
                                            마지막 결론: {resolvedLinkedOracleContext.actionConclusion}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-starlight/42">
                                        Today&apos;s Linked Signal
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-starlight/85 break-keep">
                                        {linkedOrbitMessage}
                                    </p>
                                    {resolvedLinkedOracleContext.readingId ? (
                                        <Link
                                            href={`/start?reading_id=${resolvedLinkedOracleContext.readingId}`}
                                            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                        >
                                            이 질문으로 다시 돌아가기
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
                        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:p-6">
                            <div className="mb-6 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-starlight/60">
                                    {forecast.date}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/70">
                                    일간 {forecast.dayMaster}
                                </span>
                                <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[11px] font-semibold text-acc-gold">
                                    Lucky #{forecast.luckyNumber}
                                </span>
                            </div>

                            <h2 className="mb-3 text-3xl font-gowun-batang text-white text-glow-gold md:text-4xl">
                                오늘의 운세 {forecast.overallLuck}점
                            </h2>

                            <div className="mb-6 rounded-2xl border border-white/6 bg-black/20 p-5 text-center">
                                <p className="text-lg leading-relaxed text-starlight/90 font-gowun-batang break-keep">
                                    &ldquo;{forecast.summary}&rdquo;
                                </p>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">행운의 컬러</span>
                                    <span className="font-medium text-white">{forecast.luckyColor}</span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">길한 방향</span>
                                    <span className="font-medium text-white">{forecast.luckyDirection}</span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3 md:col-span-1 col-span-2">
                                    <span className="mb-1 block text-xs text-starlight/40">오늘의 핵심 흐름</span>
                                    <span className="font-medium text-white">
                                        {areaLabelMap[strongestArea[0]]} {strongestArea[1]}점
                                    </span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">연애 운</span>
                                    <span className="font-medium text-white">{forecast.areas.love}점</span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">재물 운</span>
                                    <span className="font-medium text-white">{forecast.areas.money}점</span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">커리어 운</span>
                                    <span className="font-medium text-white">{forecast.areas.career}점</span>
                                </div>
                                <div className="rounded-xl border border-white/6 bg-white/5 p-3">
                                    <span className="mb-1 block text-xs text-starlight/40">건강 운</span>
                                    <span className="font-medium text-white">{forecast.areas.health}점</span>
                                </div>
                            </div>

                            <div className="mb-6 grid gap-3">
                                {areaOrder.map((area) => (
                                    <div
                                        key={area}
                                        className={`rounded-2xl border border-white/8 bg-gradient-to-r ${getAreaCardTone(area)} p-4`}
                                    >
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-medium text-white">{areaLabelMap[area]}</span>
                                            <span className="text-starlight/70">{forecast.areas[area]}점</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/8">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-acc-gold via-[#f4d88a] to-cyan-200"
                                                style={{ width: `${forecast.areas[area]}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-starlight/45">
                                    Fortune Advice
                                </p>
                                <p className="text-sm leading-relaxed text-starlight/85 break-keep">
                                    {forecast.advice}
                                </p>
                            </div>

                            {forecast.isPremium ? (
                                <div className="mt-6 rounded-2xl border border-acc-gold/20 bg-acc-gold/5 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-acc-gold">
                                        Premium Insight
                                    </p>
                                    <p className="text-sm leading-relaxed text-starlight/90 break-keep">
                                        오늘은 <span className="font-semibold text-acc-gold">{areaLabelMap[strongestArea[0]]}</span> 흐름({strongestArea[1]}점)을
                                        중심으로 움직이면 성과 전환이 빨라집니다. 반대로{' '}
                                        <span className="font-semibold text-red-300">{areaLabelMap[weakestArea[0]]}</span> 영역({weakestArea[1]}점)은
                                        에너지 소모가 크니 큰 결정은 한 템포 늦추는 편이 안전합니다.
                                    </p>
                                </div>
                            ) : null}
                        </section>

                        <section className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 md:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-starlight/45">
                                        Daily Energy Signal
                                    </p>
                                    <h3 className="mt-2 text-2xl font-gowun-batang text-white">
                                        {tarot.cardNameKo}
                                    </h3>
                                    <p className="text-sm text-starlight/55">{tarot.cardName}</p>
                                </div>

                                <div className="rounded-2xl border border-acc-gold/20 bg-acc-gold/10 px-3 py-2 text-right">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-starlight/45">
                                        Signal
                                    </p>
                                    <p className="text-sm font-semibold text-acc-gold">#{tarot.cardIndex}</p>
                                </div>
                            </div>

                            <div className="relative mb-5 rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_46%),rgba(7,9,15,0.92)] p-6 text-center">
                                <div className="pointer-events-none absolute inset-x-8 top-5 h-px bg-gradient-to-r from-transparent via-acc-gold/40 to-transparent" />
                                <div className="mx-auto flex h-48 w-36 items-center justify-center rounded-[24px] border border-acc-gold/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_18px_40px_-20px_rgba(212,175,55,0.65)]">
                                    <div className="space-y-3">
                                        <Star className="mx-auto h-8 w-8 text-acc-gold" />
                                        <p className="px-4 text-sm font-semibold leading-snug text-white break-keep">
                                            {tarot.cardNameKo}
                                        </p>
                                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-starlight/55">
                                            {tarot.keywordKo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2">
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-100">
                                    {tarot.keywordKo}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/62">
                                    Seed locked until midnight
                                </span>
                            </div>

                            <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-starlight/45">
                                    Energy Insight
                                </p>
                                <p className="text-sm leading-relaxed text-starlight/90 break-keep">
                                    {tarot.meaning}
                                </p>
                            </div>

                            {tarot.isPremium ? (
                                <div className="mt-4 rounded-2xl border border-acc-gold/20 bg-acc-gold/5 p-4">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-acc-gold">
                                        Action Advice
                                    </p>
                                    <p className="text-sm leading-relaxed text-starlight/90 break-keep">
                                        {tarot.advice}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="mb-3 text-xs uppercase tracking-[0.16em] text-starlight/45">
                                        Premium Action Advice
                                    </p>
                                    <p className="mb-4 text-sm leading-relaxed text-starlight/65 break-keep">
                                        행동 가이드는 Pro 구독자에게만 열립니다. 오늘의 에너지를 실제 선택으로 연결하려면 프리미엄 조언을 확인하세요.
                                    </p>
                                    <button
                                        onClick={() => setIsSubscriptionModalOpen(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-acc-gold to-amber-600 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-acc-gold/20"
                                    >
                                        <span>CosmicPath Pro로 해제</span>
                                        <Sparkles className="h-4 w-4 fill-current" />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                source="daily"
            />
        </div>
    );
}
