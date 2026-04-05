import Link from 'next/link';
import { LockKeyhole, ShieldAlert, Sparkles } from 'lucide-react';

interface OpsAccessStateProps {
    eyebrow: string;
    title: string;
    description: string;
    currentRole?: string;
}

export function OpsAccessState({
    eyebrow,
    title,
    description,
    currentRole,
}: OpsAccessStateProps) {
    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                    <section className="rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(42_79%_74%/0.28)] bg-[hsl(42_79%_74%/0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                            <Sparkles className="h-4 w-4" />
                            {eyebrow}
                        </div>

                        <h1 className="mt-5 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
                            {description}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className="rounded-full border border-white/12 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                            >
                                홈으로 가기
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-full border border-[hsl(42_79%_74%/0.34)] bg-[hsl(42_79%_74%/0.12)] px-5 py-2.5 text-sm font-medium text-[hsl(42_79%_74%)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[hsl(42_79%_74%/0.18)]"
                            >
                                로그인하기
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.3)] backdrop-blur-xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/10 text-amber-200">
                            <LockKeyhole className="h-7 w-7" />
                        </div>

                        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
                            Access Policy
                        </p>
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-4 py-4">
                                <span className="text-sm text-white/70">Required Role</span>
                                <strong className="font-[var(--font-outfit)] text-lg tracking-[-0.04em] text-white">ADMIN</strong>
                            </div>
                            <div className="flex items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-4 py-4">
                                <span className="text-sm text-white/70">Current Role</span>
                                <strong className="font-[var(--font-outfit)] text-lg tracking-[-0.04em] text-white">{currentRole ?? 'Guest'}</strong>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_44%),rgba(255,255,255,0.02)] p-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/74">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">운영 보호 표면</p>
                                    <p className="mt-2 text-sm leading-7 text-white/56">
                                        이 페이지는 운영 데이터와 조작 액션을 포함하므로, 로그인과 역할 검증이 모두 통과해야만 열립니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
