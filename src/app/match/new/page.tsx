'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, Users, Heart, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

function MatchNewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const inviter = searchParams.get('inviter') || '';
    const dayMaster = searchParams.get('dayMaster') || '';

    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [unknownTime, setUnknownTime] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDateChange = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 4) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        }
        if (numbers.length > 6) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }
        setBirthDate(formatted);
    };

    const handleTimeChange = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 2) {
            formatted = `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }
        setBirthTime(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('이름 또는 닉네임을 입력해 주세요.');
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
            setError('생년월일 8자리를 올바르게 입력해 주세요 (예: 1996-08-20).');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch('/api/match/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hostName: name.trim(),
                    hostBirth: birthDate,
                    hostTimezone: 'Asia/Seoul',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '궁합 세션 생성에 실패했습니다.');
            }

            const data = await res.json();
            if (data.sessionId) {
                router.push(`/match/${data.sessionId}/join`);
            }
        } catch (err: unknown) {
            console.error(err);
            setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080e] px-4 py-16 text-starlight">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)]" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#c8a84d]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl space-y-7 rounded-[32px] border border-[#c8a84d]/30 bg-[radial-gradient(ellipse_at_top,rgba(200,168,77,0.08),transparent_60%),linear-gradient(180deg,rgba(18,17,14,0.95),rgba(10,9,8,0.98))] p-6 sm:p-10 text-center shadow-[0_32px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                {/* Header Badge */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 shadow-sm">
                        <Users className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{inviter ? '1:1 천을귀인(天乙貴人) 매칭 초대장' : '5대 엔진 1:1 융합 궁합'}</span>
                    </div>

                    <h1 className="font-cinzel text-2xl sm:text-3xl font-bold leading-snug text-white">
                        {inviter ? (
                            <span>
                                &ldquo;<span className="text-[#e8c86d]">{inviter}</span>&rdquo;님이 보낸
                                <br />
                                운명적 귀인 초대장
                            </span>
                        ) : (
                            <span>
                                나를 도와줄 천을귀인
                                <br />
                                1:1 운명 궁합 매칭
                            </span>
                        )}
                    </h1>

                    <p className="mx-auto max-w-md text-xs sm:text-sm leading-relaxed text-stone-300">
                        {inviter ? (
                            <span>
                                {inviter}님의 사주와 당신의 사주 4주 8자 × 점성술 행성을 0초 만에 교차 대조하여 천을귀인 시너지와 융합 점수를 확인합니다.
                            </span>
                        ) : (
                            <span>
                                내 생년월일시로 초대 링크를 만들고 친구에게 보내 0초 만에 5대 엔진 교차 궁합을 확인하세요.
                            </span>
                        )}
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 text-left shadow-inner">
                    {error && (
                        <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs font-semibold text-rose-300">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                            내 이름 / 닉네임
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 김지수"
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#e8c86d] focus:outline-none focus:ring-1 focus:ring-[#e8c86d] transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                            생년월일 8자리 (양력)
                        </label>
                        <input
                            type="text"
                            value={birthDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            placeholder="YYYY-MM-DD (예: 1996-08-20)"
                            maxLength={10}
                            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#e8c86d] focus:outline-none focus:ring-1 focus:ring-[#e8c86d] transition-all"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
                                태어난 시간
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-stone-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={unknownTime}
                                    onChange={(e) => setUnknownTime(e.target.checked)}
                                    className="rounded border-white/20 bg-white/5 text-[#e8c86d] focus:ring-0"
                                />
                                <span>시간 모름 (12:00 정오 기준)</span>
                            </label>
                        </div>
                        {!unknownTime && (
                            <input
                                type="text"
                                value={birthTime}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                placeholder="HH:MM (예: 14:30)"
                                maxLength={5}
                                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#e8c86d] focus:outline-none focus:ring-1 focus:ring-[#e8c86d] transition-all"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 py-3.5 text-sm font-black uppercase tracking-wider text-stone-950 shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span>5대 엔진으로 매칭 대조 중...</span>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 text-stone-950" />
                                <span>{inviter ? '천을귀인 궁합 결과 확인하기' : '내 1:1 궁합 초대 링크 만들기'}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Micro trust info */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-2 border-t border-white/5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>개인정보 저장 없는 100% 암호화 안전 궁합 연산</span>
                </div>
            </div>
        </main>
    );
}

export default function MatchNewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#06080e] flex items-center justify-center text-white">로딩 중...</div>}>
            <MatchNewContent />
        </Suspense>
    );
}
