'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Crown, Loader2, RefreshCw } from 'lucide-react';

type SubscriptionTier = 'free' | 'pro' | 'couple';
type SubscriptionPlan = 'pro_monthly' | 'pro_yearly' | 'couple_monthly' | null;

interface SubscriptionStatusPayload {
    status: SubscriptionTier;
    expiresAt: string | null;
    stripeCustomerId: string | null;
    plan: SubscriptionPlan;
}

function getPlanLabel(plan: SubscriptionPlan): string {
    switch (plan) {
        case 'pro_monthly':
            return 'Pro Monthly';
        case 'pro_yearly':
            return 'Pro Annual';
        case 'couple_monthly':
            return 'Couple Monthly';
        default:
            return 'Free Plan';
    }
}

function getTierLabel(status: SubscriptionTier): string {
    switch (status) {
        case 'pro':
            return 'Premium';
        case 'couple':
            return 'Couple';
        default:
            return 'Free';
    }
}

function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return 'Active / syncing';

    return new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function BillingPage() {
    const { status } = useSession();
    const router = useRouter();
    const [payload, setPayload] = useState<SubscriptionStatusPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            void loadStatus();
        }
    }, [status, router]);

    async function loadStatus() {
        setIsLoading(true);

        try {
            const response = await fetch('/api/subscription/status', {
                cache: 'no-store',
            });
            const result = await response.json();

            if (response.ok) {
                setPayload(result as SubscriptionStatusPayload);
            }
        } catch (error) {
            console.error('Failed to load subscription status:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#04060d]">
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#04060d] px-6 pb-16 pt-28 text-white">
            <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_36%),linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F4D88A]/20 bg-[#F4D88A]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A]">
                                <Crown size={14} />
                                Membership & Billing
                            </div>
                            <h1 className="text-3xl font-semibold md:text-4xl">
                                현재 구독 상태를 확인하세요
                            </h1>
                            <p className="mt-4 text-base leading-8 text-white/70">
                                `/my` 페이지에서 진입하는 관리 화면입니다. 결제 반영 여부와 현재 플랜을 여기서 빠르게 확인할 수 있습니다.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadStatus()}
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            상태 새로고침
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                                Plan
                            </p>
                            <p className="mt-4 text-2xl font-semibold text-white">
                                {getPlanLabel(payload?.plan ?? null)}
                            </p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                                Tier
                            </p>
                            <p className="mt-4 text-2xl font-semibold text-white">
                                {getTierLabel(payload?.status ?? 'free')}
                            </p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                                Renewal
                            </p>
                            <p className="mt-4 text-2xl font-semibold text-white">
                                {formatExpiry(payload?.expiresAt ?? null)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                            Billing Notes
                        </p>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-white/70">
                            <p>
                                Stripe 연결 상태: {payload?.stripeCustomerId ? 'Connected' : 'Not connected'}
                            </p>
                            <p>
                                활성 구독은 webhook 동기화 이후 `/api/subscription/status` 기준으로 반영됩니다.
                            </p>
                            <p>
                                구독 변경/해지 액션은 다음 단계에서 이 화면에 연결할 예정입니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/my"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                        >
                            My Journey로 돌아가기
                        </Link>
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
