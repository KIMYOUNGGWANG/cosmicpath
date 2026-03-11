'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';

type SubscriptionTier = 'free' | 'pro' | 'couple';

interface SubscriptionStatusPayload {
    status: SubscriptionTier;
    expiresAt: string | null;
    plan: 'pro_monthly' | 'pro_yearly' | 'couple_monthly' | null;
}

export default function BillingSuccessPage() {
    const [payload, setPayload] = useState<SubscriptionStatusPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadStatus() {
            try {
                const response = await fetch('/api/subscription/status', {
                    cache: 'no-store',
                });
                const result = await response.json();

                if (isMounted && response.ok) {
                    setPayload(result as SubscriptionStatusPayload);
                }
            } catch (error) {
                console.error('Failed to verify subscription status:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const planLabel =
        payload?.plan === 'pro_yearly'
            ? 'CosmicPath Pro Annual'
            : payload?.plan === 'pro_monthly'
                ? 'CosmicPath Pro Monthly'
                : payload?.plan === 'couple_monthly'
                    ? 'CosmicPath Couple Monthly'
                    : 'Subscription sync in progress';

    return (
        <main className="min-h-screen bg-[#04060d] px-6 pb-16 pt-28 text-white">
            <div className="mx-auto max-w-3xl rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_36%),linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                        <CheckCircle2 size={34} />
                    </div>
                    <h1 className="mt-6 text-3xl font-semibold md:text-4xl">
                        구독 결제가 완료되었습니다.
                    </h1>
                    <p className="mt-4 text-base leading-8 text-white/70">
                        Stripe Checkout은 끝났고, 이제 CosmicPath 계정에 구독 상태를 연결하는 단계입니다.
                        몇 초 내로 반영되며 Daily Fortune과 Oracle 혜택이 바로 열립니다.
                    </p>

                    <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-left">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                            Subscription Status
                        </p>
                        <div className="mt-4 space-y-3 text-sm text-white/75">
                            <p>
                                <span className="text-white">Plan:</span> {isLoading ? 'Checking…' : planLabel}
                            </p>
                            <p>
                                <span className="text-white">Tier:</span> {isLoading ? 'Checking…' : payload?.status ?? 'free'}
                            </p>
                            <p>
                                <span className="text-white">Expires:</span>{' '}
                                {payload?.expiresAt ? new Date(payload.expiresAt).toLocaleDateString() : 'Active / syncing'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            상태 새로고침
                        </button>
                        <Link
                            href="/daily"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                        >
                            오늘의 운세 열기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
