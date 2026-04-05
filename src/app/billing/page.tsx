'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Crown,
    Gem,
    Loader2,
    Orbit,
    RefreshCw,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

type SubscriptionTier = 'free' | 'pro' | 'couple';
type SubscriptionPlan = 'pro_weekly' | 'pro_monthly' | 'pro_yearly' | 'couple_monthly' | null;

interface SubscriptionStatusPayload {
    status: SubscriptionTier;
    expiresAt: string | null;
    stripeCustomerId: string | null;
    plan: SubscriptionPlan;
}

interface SubscriptionCancelPayload {
    ok: boolean;
    subscriptionId: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
}

interface ErrorResponsePayload {
    error?: {
        code?: number;
        message?: string;
    };
}

interface MetricCardProps {
    label: string;
    value: string;
    caption: string;
}

interface ToneBannerProps {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    tone: 'positive' | 'warning';
}

interface JourneyMilestoneProps {
    title: string;
    description: string;
    state: 'done' | 'active' | 'pending';
}

const panelClassName =
    'relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl';

function getPlanLabel(plan: SubscriptionPlan): string {
    switch (plan) {
        case 'pro_weekly':
            return 'Legacy Pro Plan';
        case 'pro_monthly':
            return 'Pro Monthly';
        case 'pro_yearly':
            return 'Pro Annual';
        case 'couple_monthly':
            return 'Legacy Couple Plan';
        default:
            return 'Free Plan';
    }
}

function getTierLabel(status: SubscriptionTier): string {
    switch (status) {
        case 'pro':
            return 'Premium';
        case 'couple':
            return 'Premium';
        default:
            return 'Free';
    }
}

function getTierDescription(status: SubscriptionTier): string {
    switch (status) {
        case 'pro':
            return '개인 해석, 리텐션 플로우, Oracle 무제한 이용이 활성화된 상태입니다.';
        case 'couple':
            return '기존 관계형 멤버십이 유지 중이며, 현재는 프리미엄 혜택 범주로 안정적으로 관리됩니다.';
        default:
            return '현재는 무료 티어입니다. 프리미엄 기능은 결제 후 즉시 열립니다.';
    }
}

function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return '동기화 대기 중';

    return new Date(expiresAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function getErrorMessage(payload: unknown, fallback: string): string {
    if (!payload || typeof payload !== 'object' || !('error' in payload)) {
        return fallback;
    }

    const errorResponse = payload as ErrorResponsePayload;
    return errorResponse.error?.message?.trim() || fallback;
}

function MetricCard({ label, value, caption }: MetricCardProps) {
    return (
        <div className={`${panelClassName} min-h-[188px]`}>
            <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,211,138,0.82),transparent)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                {label}
            </p>
            <p className="mt-6 font-[var(--font-outfit)] text-[30px] font-semibold tracking-[-0.04em] text-white">
                {value}
            </p>
            <p className="mt-5 max-w-[24ch] text-sm leading-7 text-white/62">
                {caption}
            </p>
        </div>
    );
}

function ToneBanner({ icon: Icon, text, tone }: ToneBannerProps) {
    const toneClassName =
        tone === 'positive'
            ? 'border-[hsl(156_49%_34%_/0.42)] bg-[linear-gradient(135deg,rgba(74,222,128,0.16),rgba(16,185,129,0.08))] text-[hsl(151_67%_87%)]'
            : 'border-[hsl(22_73%_46%_/0.38)] bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(244,63,94,0.08))] text-[hsl(33_100%_88%)]';

    return (
        <div className={`rounded-[24px] border px-5 py-4 text-sm leading-7 shadow-[0_18px_60px_rgba(15,23,42,0.16)] ${toneClassName}`}>
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{text}</p>
            </div>
        </div>
    );
}

function JourneyMilestone({ title, description, state }: JourneyMilestoneProps) {
    const markerClassName =
        state === 'done'
            ? 'border-[hsl(48_90%_66%)] bg-[hsl(48_90%_66%)]'
            : state === 'active'
              ? 'border-[hsl(198_88%_68%)] bg-[radial-gradient(circle,rgba(125,211,252,0.95),rgba(96,165,250,0.42))]'
              : 'border-white/18 bg-white/6';

    return (
        <div className="grid grid-cols-[20px_1fr] gap-4">
            <div className="flex flex-col items-center">
                <div className={`mt-1 h-5 w-5 rounded-full border ${markerClassName}`} />
                {state !== 'pending' ? <div className="mt-2 h-full w-px bg-white/12" /> : null}
            </div>
            <div className="pb-6">
                <p className="font-[var(--font-outfit)] text-base font-semibold tracking-[-0.02em] text-white">
                    {title}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function BillingPage() {
    const { status } = useSession();
    const router = useRouter();
    const [payload, setPayload] = useState<SubscriptionStatusPayload | null>(null);
    const [cancelPayload, setCancelPayload] = useState<SubscriptionCancelPayload | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

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
        setErrorMessage(null);

        try {
            const response = await fetch('/api/subscription/status', {
                cache: 'no-store',
            });
            const result = (await response.json()) as SubscriptionStatusPayload | ErrorResponsePayload;

            if (!response.ok) {
                setErrorMessage(getErrorMessage(result, '구독 상태를 불러오지 못했습니다.'));
                return;
            }

            setPayload(result as SubscriptionStatusPayload);
        } catch (error) {
            console.error('Failed to load subscription status:', error);
            setErrorMessage('구독 상태를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCancelSubscription() {
        const confirmed = window.confirm('현재 구독을 만료 시점에 해지하시겠습니까?');
        if (!confirmed) return;

        setIsCancelling(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
            });
            const result = (await response.json()) as SubscriptionCancelPayload | ErrorResponsePayload;

            if (!response.ok) {
                setErrorMessage(getErrorMessage(result, '구독 해지에 실패했습니다.'));
                return;
            }

            const nextCancelPayload = result as SubscriptionCancelPayload;
            setCancelPayload(nextCancelPayload);
            setPayload((currentPayload) =>
                currentPayload
                    ? {
                          ...currentPayload,
                          expiresAt: nextCancelPayload.currentPeriodEnd,
                      }
                    : currentPayload
            );
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            setErrorMessage('구독 해지 요청 중 오류가 발생했습니다.');
        } finally {
            setIsCancelling(false);
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1b1731_0%,#06070c_58%,#03040a_100%)]">
                <div className="rounded-full border border-white/10 bg-white/5 p-5 shadow-[0_0_80px_rgba(245,211,138,0.18)] backdrop-blur-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(42_79%_74%)]" />
                </div>
            </div>
        );
    }

    const hasActivePlan = payload?.status === 'pro' || payload?.status === 'couple';
    const renewalLabel = cancelPayload ? 'Access Until' : 'Renewal';
    const connectionLabel = payload?.stripeCustomerId ? 'Connected' : 'Not connected';
    const membershipValue = getTierLabel(payload?.status ?? 'free');
    const planValue = getPlanLabel(payload?.plan ?? null);
    const renewalValue = formatExpiry(payload?.expiresAt ?? null);
    const accentText = cancelPayload ? 'Grace Period Locked' : hasActivePlan ? 'Premium Signal Online' : 'Free Orbit';

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#18142d_0%,#0b1020_30%,#05070d_72%,#03040a_100%)] px-5 pb-20 pt-24 text-white md:px-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(143,95,255,0.28),rgba(143,95,255,0))]" />
                <div className="absolute right-[-6%] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(90,208,255,0.22),rgba(90,208,255,0))]" />
                <div className="absolute bottom-[-10%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,211,138,0.16),rgba(245,211,138,0))]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(160deg,rgba(7,10,20,0.92),rgba(13,18,32,0.84))] px-6 py-7 shadow-[0_30px_140px_rgba(2,6,23,0.52)] backdrop-blur-2xl md:px-10 md:py-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,211,138,0.16),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(125,211,252,0.14),transparent_22%)]" />
                    <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(42_79%_74%_/0.22)] bg-[linear-gradient(135deg,rgba(245,211,138,0.16),rgba(245,211,138,0.05))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
                                <Crown size={14} />
                                Membership Control Deck
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                                    <Sparkles size={14} className="text-[hsl(42_79%_74%)]" />
                                    {accentText}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium text-white/58">
                                    <Orbit size={14} className="text-[hsl(198_88%_74%)]" />
                                    Stripe {connectionLabel}
                                </span>
                            </div>

                            <h1 className="mt-6 max-w-[12ch] font-[var(--font-outfit)] text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-6xl">
                                결제 상태를 읽고, 멤버십의 흐름을 설계하세요.
                            </h1>
                            <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/66 md:text-base">
                                단순한 상태 조회가 아니라, 현재 플랜의 가치와 종료 시점 이후의 사용자 경험까지 이 화면에서
                                한 번에 판단할 수 있도록 재구성했습니다.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
                            <div className={`${panelClassName} min-h-[122px]`}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                                    Membership
                                </p>
                                <p className="mt-4 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    {membershipValue}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-white/58">
                                    {getTierDescription(payload?.status ?? 'free')}
                                </p>
                            </div>

                            <div className={`${panelClassName} min-h-[122px]`}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                                    Current Plan
                                </p>
                                <p className="mt-4 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    {planValue}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-white/58">
                                    요금제 전환은 중복 구독 방지 로직이 준비된 뒤 안전하게 열 예정입니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <MetricCard
                        label="Tier Signal"
                        value={membershipValue}
                        caption="현재 계정이 어떤 멤버십 계층에 있는지 빠르게 읽을 수 있도록 가장 먼저 배치했습니다."
                    />
                    <MetricCard
                        label="Plan Profile"
                        value={planValue}
                        caption="연간/월간 구독 여부를 별도 이동 없이 확인하고, UX 혼선을 줄이도록 문구를 단순화했습니다."
                    />
                    <MetricCard
                        label={renewalLabel}
                        value={renewalValue}
                        caption="해지 예약 후에는 갱신일이 아니라 서비스 유지 종료일로 해석되도록 톤을 전환합니다."
                    />
                </section>

                <section className="mt-6 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className={`${panelClassName} min-h-[440px]`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    Membership Lifecycle
                                </p>
                                <h2 className="mt-4 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                                    해지 이후에도 사용자 경험은 끊기지 않습니다.
                                </h2>
                            </div>
                            <ShieldCheck className="mt-1 h-10 w-10 text-[hsl(198_88%_74%)]" />
                        </div>

                        <div className="mt-8">
                            <JourneyMilestone
                                title="현재 멤버십 상태 유지"
                                description="프리미엄 또는 커플 구독이 활성화된 동안 분석 리포트와 Oracle 접근은 그대로 유지됩니다."
                                state="done"
                            />
                            <JourneyMilestone
                                title="결제 주기 종료 시점에 해지 적용"
                                description="해지는 즉시 차단이 아니라 Stripe billing period 종료 시점에 맞춰 적용됩니다."
                                state={cancelPayload ? 'done' : 'active'}
                            />
                            <JourneyMilestone
                                title="만료 후 무료 티어로 자동 전환"
                                description="추가 결제가 없으면 이후에는 free 상태로 복귀하고, 재구독 시 같은 흐름으로 다시 진입합니다."
                                state={cancelPayload ? 'active' : 'pending'}
                            />
                        </div>

                        <div className="mt-3 rounded-[26px] border border-white/10 bg-black/20 p-5">
                            <p className="text-sm font-semibold text-white">Subscription Actions</p>
                            <div className="mt-3 space-y-3 text-sm leading-7 text-white/58">
                                <p>Stripe 연결 상태: {connectionLabel}</p>
                                <p>해지 후에도 현재 기간이 끝나기 전까지 Premium 기능은 유지됩니다.</p>
                                <p>구독 변경은 중복 결제를 막는 전용 변경 플로우가 준비된 후 열 계획입니다.</p>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 md:flex-row">
                                <button
                                    type="button"
                                    onClick={() => void handleCancelSubscription()}
                                    disabled={!hasActivePlan || isCancelling || !!cancelPayload}
                                    className="group inline-flex min-h-12 items-center justify-center rounded-full border border-[hsl(21_78%_45%_/0.24)] bg-[linear-gradient(135deg,rgba(251,146,60,0.18),rgba(244,63,94,0.12))] px-6 py-3 text-sm font-semibold text-[hsl(29_100%_91%)] shadow-[0_16px_50px_rgba(251,146,60,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(251,146,60,0.24)] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/36 disabled:shadow-none"
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            해지 처리 중
                                        </>
                                    ) : cancelPayload ? (
                                        '해지 예약됨'
                                    ) : (
                                        <>
                                            현재 구독 해지
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void loadStatus()}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-white/22 hover:bg-white/[0.08]"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    상태 새로고침
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {errorMessage ? (
                            <ToneBanner
                                icon={AlertTriangle}
                                text={errorMessage}
                                tone="warning"
                            />
                        ) : null}

                        {cancelPayload ? (
                            <ToneBanner
                                icon={CheckCircle2}
                                text={`구독 해지가 예약되었습니다. ${formatExpiry(cancelPayload.currentPeriodEnd)}까지 프리미엄 기능을 계속 사용할 수 있습니다.`}
                                tone="positive"
                            />
                        ) : null}

                        <div className={`${panelClassName} min-h-[220px]`}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                        Plan Change Review
                                    </p>
                                    <h2 className="mt-4 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.05em] text-white">
                                        왜 지금은 플랜 변경 버튼을 숨겼는가
                                    </h2>
                                </div>
                                <Gem className="h-9 w-9 text-[hsl(42_79%_74%)]" />
                            </div>

                            <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
                                <p>현재 구조에서 새 Checkout을 바로 열면 Stripe에 중복 subscription 이 생성될 가능성이 있습니다.</p>
                                <p>그래서 upgrade/downgrade CTA 는 잠시 막고, 정보 설계만 먼저 정돈했습니다.</p>
                                <p>안전한 다음 단계는 Stripe Billing Portal 또는 전용 `subscription update` API 입니다.</p>
                            </div>
                        </div>

                        <div className={`${panelClassName} min-h-[220px]`}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Next Paths
                            </p>
                            <div className="mt-5 space-y-3">
                                <Link
                                    href="/my"
                                    className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-black/20 px-5 py-4 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.05]"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">My Journey로 돌아가기</p>
                                        <p className="mt-1 text-sm text-white/54">프로필과 개인 리포트 흐름으로 복귀합니다.</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-white/48 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </Link>

                                <Link
                                    href="/daily"
                                    className="group flex items-center justify-between rounded-[22px] border border-[hsl(42_79%_74%_/0.18)] bg-[linear-gradient(135deg,rgba(245,211,138,0.18),rgba(245,211,138,0.06))] px-5 py-4 transition-all duration-300 hover:border-[hsl(42_79%_74%_/0.3)] hover:shadow-[0_18px_60px_rgba(245,211,138,0.12)]"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-[hsl(42_79%_87%)]">오늘의 운세 열기</p>
                                        <p className="mt-1 text-sm text-[hsl(42_52%_82%_/0.7)]">매일 재방문 흐름으로 바로 연결합니다.</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[hsl(42_79%_78%)] transition-transform duration-300 group-hover:translate-x-0.5" />
                                </Link>

                                <Link
                                    href="/"
                                    className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4 transition-all duration-300 hover:border-white/18 hover:bg-white/[0.05]"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">홈으로 이동</p>
                                        <p className="mt-1 text-sm text-white/54">랜딩 경험과 신규 전환 퍼널을 다시 확인합니다.</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-white/48 transition-transform duration-300 group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
