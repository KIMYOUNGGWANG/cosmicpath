'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

import { SubscriptionModal } from '@/components/payment/SubscriptionModal';
import {
    getDailyLinkedLabel,
    resolveDailyLinkedArea,
    type DailyLinkedOracleContext,
} from '@/lib/daily/daily-linked-context';

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

interface DailyTarotExperienceProps {
    linkedOracleContext?: DailyLinkedOracleContext | null;
}

const linkedAreaLabelMap = {
    love: '연애',
    money: '재물',
    career: '커리어',
    health: '건강',
} as const;

function readStoredBirthData(): StoredBirthData | null {
    const storedData = localStorage.getItem('cosmic_user_data');
    if (!storedData) return null;

    try {
        const parsed = JSON.parse(storedData) as StoredBirthData;
        return parsed.birthDate ? parsed : null;
    } catch {
        return null;
    }
}

function persistBirthDate(nextBirthDate: string) {
    const current = readStoredBirthData();
    localStorage.setItem(
        'cosmic_user_data',
        JSON.stringify({
            birthDate: nextBirthDate,
            birthTime: current?.birthTime,
        })
    );
}

async function fetchDailyTarot(birthDate: string): Promise<DailyTarotResponse> {
    const params = new URLSearchParams({ birthday: birthDate });
    const response = await fetch(`/api/daily/tarot?${params.toString()}`, {
        cache: 'no-store',
    });
    const payload = (await response.json()) as DailyTarotResponse & {
        error?: { message?: string };
    };

    if (!response.ok) {
        throw new Error(payload.error?.message || '오늘의 타로를 불러오지 못했습니다.');
    }

    return payload;
}

function getInitialBirthDate(linkedOracleContext?: DailyLinkedOracleContext | null) {
    return readStoredBirthData()?.birthDate ?? linkedOracleContext?.birthDate ?? '';
}

export function DailyTarotExperience({
    linkedOracleContext,
}: DailyTarotExperienceProps) {
    const [inputDate, setInputDate] = useState('');
    const [tarot, setTarot] = useState<DailyTarotResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const linkedLabel = linkedOracleContext
        ? getDailyLinkedLabel(linkedOracleContext, 'ko')
        : null;
    const linkedArea = resolveDailyLinkedArea(linkedOracleContext);

    const handleFetch = useCallback(async (birthDate: string) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const payload = await fetchDailyTarot(birthDate);
            setTarot(payload);
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setErrorMessage(message);
            setTarot(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const nextBirthDate = getInitialBirthDate(linkedOracleContext);
        if (!nextBirthDate) return;

        setInputDate(nextBirthDate);
        void handleFetch(nextBirthDate);
    }, [handleFetch, linkedOracleContext]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!inputDate) return;

        persistBirthDate(inputDate);
        await handleFetch(inputDate);
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(125,211,252,0.12),transparent_24%),rgba(255,255,255,0.03)] shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="border-b border-white/8 p-6 lg:border-b-0 lg:border-r lg:p-8">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                                Daily Tarot
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                One Card Ritual
                            </span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-100">
                                    Linked to {linkedLabel}
                                </span>
                            ) : null}
                        </div>

                        <h2 className="mt-4 font-cinzel text-3xl text-white md:text-4xl">
                            오늘의 카드가
                            <span className="block bg-gradient-to-r from-[#fff2c9] via-[#f4d88a] to-[#bfe8ff] bg-clip-text text-transparent">
                                지금의 흐름을 한 문장으로 압축합니다
                            </span>
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-starlight/68 md:text-base">
                            생년월일만으로 오늘의 타로 카드를 고정해 읽습니다. 무료 구간에서는 카드 의미를,
                            Pro에서는 행동 가이드까지 확인할 수 있습니다.
                        </p>

                        {linkedOracleContext?.question ? (
                            <div className="mt-5 rounded-[24px] border border-emerald-300/12 bg-emerald-300/8 p-4">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100/80">
                                    Recent Oracle Thread
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white break-keep">
                                    “{linkedOracleContext.question}”
                                </p>
                                <p className="mt-2 text-sm leading-6 text-starlight/62">
                                    {linkedArea
                                        ? `오늘의 타로를 ${linkedAreaLabelMap[linkedArea]} 흐름과 연결해 다시 읽어보세요.`
                                        : '오늘의 카드로 최근 오라클 질문의 결을 다시 확인해보세요.'}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="p-6 lg:p-8">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
                        >
                            <p className="text-[11px] uppercase tracking-[0.24em] text-starlight/45">
                                Reveal Today&apos;s Card
                            </p>

                            <div className="my-6 flex items-center justify-center">
                                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-acc-gold/20 bg-acc-gold/10">
                                    <div className="absolute inset-2 rounded-full border border-dashed border-acc-gold/20" />
                                    <Star className="h-10 w-10 text-acc-gold" />
                                </div>
                            </div>

                            <label className="block text-xs uppercase tracking-[0.18em] text-starlight/45">
                                Birth Date
                            </label>
                            <input
                                type="date"
                                required
                                value={inputDate}
                                onChange={(event) => setInputDate(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors focus:border-acc-gold"
                                disabled={isLoading}
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !inputDate}
                                className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-acc-gold to-[#f1cf74] px-5 py-3 text-sm font-semibold text-[#0A0D16] transition-transform hover:scale-[1.01] ${
                                    isLoading ? 'cursor-not-allowed opacity-60' : ''
                                }`}
                            >
                                <span>{isLoading ? '카드를 불러오는 중...' : '오늘의 타로 열기'}</span>
                                <Sparkles className="h-4 w-4" />
                            </button>

                            <Link
                                href="/daily"
                                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                운세 + 타로 전체 리추얼 보기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </form>
                    </div>
                </div>
            </section>

            {errorMessage ? (
                <div className="rounded-[24px] border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm text-red-100">
                    {errorMessage}
                </div>
            ) : null}

            {isLoading ? (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-starlight/62">
                    오늘의 타로 카드를 읽는 중입니다.
                </div>
            ) : tarot ? (
                <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                    <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_42%),rgba(8,10,18,0.92)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.26)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.22em] text-starlight/45">
                                    Daily Tarot Lock
                                </p>
                                <p className="mt-2 text-sm text-starlight/68">{tarot.date} 기준 고정 카드</p>
                            </div>
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[11px] font-semibold text-acc-gold">
                                Card #{tarot.cardIndex}
                            </span>
                        </div>

                        <div className="mt-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 py-8 text-center shadow-[0_18px_40px_-20px_rgba(212,175,55,0.55)]">
                            <Star className="mx-auto h-10 w-10 text-acc-gold" />
                            <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-starlight/42">
                                {tarot.isReversed ? 'Reversed' : 'Upright'}
                            </p>
                            <h3 className="mt-3 font-gowun-batang text-3xl text-white">
                                {tarot.cardNameKo}
                            </h3>
                            <p className="mt-2 text-sm text-starlight/58">{tarot.cardName}</p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-starlight/70">
                                    {tarot.isReversed ? '역방향' : '정방향'}
                                </span>
                                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] text-cyan-100">
                                    {tarot.keywordKo}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                Free Meaning
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                                Seed locked until midnight
                            </span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-100">
                                    {linkedLabel}
                                </span>
                            ) : null}
                        </div>

                        <h3 className="mt-4 font-cinzel text-2xl text-white">
                            오늘의 카드 메시지
                        </h3>
                        <p className="mt-3 text-base leading-8 text-starlight/84 break-keep">
                            {tarot.meaning}
                        </p>

                        <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-starlight/45">
                                Premium Tarot Advice
                            </p>

                            {tarot.isPremium ? (
                                <p className="mt-3 text-sm leading-7 text-starlight/90 break-keep">
                                    {tarot.advice}
                                </p>
                            ) : (
                                <>
                                    <p className="mt-3 text-sm leading-7 text-starlight/65 break-keep">
                                        행동 가이드는 Pro 구독자에게만 열립니다. 오늘의 카드 에너지를 실제 선택으로
                                        연결하려면 프리미엄 조언을 확인하세요.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsSubscriptionModalOpen(true)}
                                        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-acc-gold to-amber-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
                                    >
                                        CosmicPath Pro로 조언 해제
                                        <Sparkles className="h-4 w-4 fill-current" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/daily"
                                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                운세와 함께 다시 보기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {linkedOracleContext?.readingId ? (
                                <Link
                                    href={`/start?reading_id=${linkedOracleContext.readingId}`}
                                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition-colors hover:bg-emerald-300/15"
                                >
                                    최근 오라클로 돌아가기
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </section>
            ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-starlight/62">
                    생년월일을 입력하면 오늘의 타로 카드가 여기 표시됩니다.
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
