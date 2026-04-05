'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Crown,
    MessageCircle,
    Palette,
    ShieldCheck,
    Sparkles,
    X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
    SUBSCRIPTION_CHECKOUT_PRICE_IDS,
    SUBSCRIPTION_FALLBACK_AMOUNTS,
    formatUsdAmount,
    getSubscriptionFallbackPriceLabel,
    normalizePriceLabel,
    type ConsumerSubscriptionPlanType,
    type SubscriptionPlanType,
} from '@/lib/payment/payment-config';

export type PaywallSource = 'default' | 'landing' | 'daily' | 'oracle_chat' | 'my';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlanType?: SubscriptionPlanType;
    source?: PaywallSource;
    onCheckoutStart?: (planType: SubscriptionPlanType) => void;
}

type ConsumerPlanType = ConsumerSubscriptionPlanType;

interface PlanOption {
    id: ConsumerPlanType;
    eyebrow: string;
    name: string;
    description: string;
    priceLabel: string;
    billingLabel: string;
    valueLabel: string;
    supportingLabel: string;
    benefits: string[];
    commitmentNote: string;
}

interface LiveSubscriptionPrice {
    amount: number;
    formattedPrice: string;
}

const DISPLAYED_PLAN_ORDER: ConsumerPlanType[] = ['MONTHLY', 'ANNUAL'];
const RECOMMENDED_PLAN_TYPE: ConsumerPlanType = 'ANNUAL';

const PLAN_OPTIONS: Record<ConsumerPlanType, PlanOption> = {
    MONTHLY: {
        id: 'MONTHLY',
        eyebrow: 'Entry Orbit',
        name: '월간 멤버십',
        description: '가볍게 시작해서 한 달 동안 관계, 커리어, 재물, 타이밍 질문을 오라클 가이드와 충분히 이어갈 수 있습니다.',
        priceLabel: '$9.99 / month',
        billingLabel: 'Cancel anytime',
        valueLabel: '가장 가볍게 프리미엄 결정 리딩을 여는 기본 경로',
        supportingLabel: '지금 바로 열고, 한 달 단위로 내 질문 흐름과 가이드 경험을 확인하기 좋습니다.',
        benefits: ['무제한 Oracle Chat', '관계·커리어·재물 질문 확장', 'Daily Tarot premium guidance'],
        commitmentNote: '처음 전환하거나 짧게 루틴을 검증해보고 싶은 사용자에게 가장 자연스러운 시작점입니다.',
    },
    ANNUAL: {
        id: 'ANNUAL',
        eyebrow: 'Long Orbit',
        name: '연간 멤버십',
        description: '가장 낮은 월 환산 비용으로 multi-domain 오라클 리딩과 프리미엄 루틴을 길게 유지합니다.',
        priceLabel: '$49.99 / year',
        billingLabel: 'About $4.17 / month',
        valueLabel: '월간 대비 $69.89 절약, 연간 기준 월 환산 약 $4.17',
        supportingLabel: '재방문 빈도가 높거나 데일리 루틴이 이미 붙은 사용자에게 가장 효율적인 경로입니다.',
        benefits: ['월간 대비 $69.89 절약', '무제한 Oracle Chat', '장기 결정 리딩과 프리미엄 유지'],
        commitmentNote: '이미 자주 돌아오고 있다면 연간이 가장 단순하고 비용 효율적인 선택입니다.',
    },
};

const PAYWALL_COPY = {
    badge: 'Decision Timing Oracle',
    headline: '결정의 순간마다 오라클 리딩을 계속 이어가세요',
    body: '무료 사용량 이후에도 관계, 커리어, 재물, 타이밍 질문을 Oracle Chat, Daily Tarot premium guidance, 프리미엄 리딩 경험으로 끊기지 않게 이어갈 수 있습니다. 월간은 가장 가볍게 흐름을 열기 좋고, 연간은 가장 큰 절약폭으로 장기 루틴을 이어가기 좋습니다.',
    insightLabel: 'Decision Path',
    insightBody:
        '기본 결제 표면은 월간과 연간 두 가지 경로만 남겼습니다. 처음에는 월간으로 가볍게 열고, 결정 리딩 루틴이 붙었다면 연간으로 이어가는 구조가 가장 명확하고 안정적입니다.',
};

const BENEFIT_ICONS = [MessageCircle, Palette, CalendarDays] as const;

const PLAN_ICONS = {
    MONTHLY: Sparkles,
    ANNUAL: Crown,
} as const satisfies Record<ConsumerPlanType, typeof Sparkles>;

const TRUST_SIGNALS = [
    {
        title: 'Stripe-secured',
        description: '결제 정보는 Stripe Checkout에서 안전하게 처리됩니다.',
        Icon: ShieldCheck,
    },
    {
        title: 'Decision unlock',
        description: '결제 직후 Oracle Chat과 관계·커리어·재물 리딩 흐름이 바로 열립니다.',
        Icon: Sparkles,
    },
    {
        title: 'Daily ritual',
        description: '월간으로 가볍게 시작하거나, 연간으로 가장 큰 절약폭의 리딩 루틴을 선택할 수 있습니다.',
        Icon: Crown,
    },
] as const;

function buildPlanOptions(
    livePrices: Partial<Record<ConsumerPlanType, LiveSubscriptionPrice>>
): Record<ConsumerPlanType, PlanOption> {
    const monthlyAmount = livePrices.MONTHLY?.amount ?? SUBSCRIPTION_FALLBACK_AMOUNTS.MONTHLY;
    const annualAmount = livePrices.ANNUAL?.amount ?? SUBSCRIPTION_FALLBACK_AMOUNTS.ANNUAL;
    const annualMonthlyEquivalent = annualAmount / 12;
    const annualSavings = Math.max((monthlyAmount * 12) - annualAmount, 0);
    const monthlyPriceLabel = livePrices.MONTHLY?.formattedPrice ?? getSubscriptionFallbackPriceLabel('MONTHLY');
    const annualPriceLabel = livePrices.ANNUAL?.formattedPrice ?? getSubscriptionFallbackPriceLabel('ANNUAL');

    return {
        MONTHLY: {
            ...PLAN_OPTIONS.MONTHLY,
            priceLabel: `${monthlyPriceLabel} / month`,
        },
        ANNUAL: {
            ...PLAN_OPTIONS.ANNUAL,
            priceLabel: `${annualPriceLabel} / year`,
            billingLabel: `About ${formatUsdAmount(annualMonthlyEquivalent)} / month`,
            valueLabel: `월간 대비 ${formatUsdAmount(annualSavings)} 절약, 연간 기준 월 환산 약 ${formatUsdAmount(annualMonthlyEquivalent)}`,
            benefits: [
                `월간 대비 ${formatUsdAmount(annualSavings)} 절약`,
                ...PLAN_OPTIONS.ANNUAL.benefits.slice(1),
            ],
        },
    };
}

function resolveInitialPlanType(defaultPlanType?: SubscriptionPlanType): ConsumerPlanType {
    if (defaultPlanType === 'ANNUAL') {
        return 'ANNUAL';
    }

    return 'MONTHLY';
}

function getDisplayName(name: string | null | undefined): string | null {
    const trimmed = name?.trim();
    if (!trimmed) return null;
    return trimmed.split(/\s+/)[0] ?? trimmed;
}

async function postGrowthEvent(input: {
    event: 'paywall_open' | 'checkout_start';
    source: PaywallSource;
    path: string;
    plan: SubscriptionPlanType;
    context: 'membership';
    userId?: string;
}): Promise<void> {
    try {
        await fetch('/api/growth/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: input.event,
                source: input.source,
                plan: input.plan,
                path: input.path,
                context: input.context,
                metadata: {
                    userId: input.userId,
                    paywallVersion: 'membership_v2',
                },
            }),
        });
    } catch {
        // Growth tracking failure must not block checkout UX.
    }
}

export function SubscriptionModal({
    isOpen,
    onClose,
    defaultPlanType,
    source = 'default',
    onCheckoutStart,
}: SubscriptionModalProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const viewSignatureRef = useRef<string | null>(null);
    const [selectedPlanType, setSelectedPlanType] = useState<ConsumerPlanType>('MONTHLY');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [livePrices, setLivePrices] = useState<Partial<Record<ConsumerPlanType, LiveSubscriptionPrice>>>({});
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [hasPriceFetchError, setHasPriceFetchError] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const displayName = getDisplayName(session?.user?.name);
    const resolvedDefaultPlanType = resolveInitialPlanType(defaultPlanType);

    useEffect(() => {
        if (!isOpen) return;

        setSelectedPlanType(resolvedDefaultPlanType);
        setErrorMessage(null);
        setIsLoading(false);
    }, [isOpen, resolvedDefaultPlanType]);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setIsPriceLoading(true);
        setHasPriceFetchError(false);

        const fetchPlanPrice = async (planType: ConsumerPlanType) => {
            const priceId = SUBSCRIPTION_CHECKOUT_PRICE_IDS[planType];
            const response = await fetch(`/api/payment/price?priceId=${encodeURIComponent(priceId)}`, {
                cache: 'no-store',
            });
            const payload = await response.json();

            if (!response.ok || typeof payload.amount !== 'number' || !normalizePriceLabel(payload.formattedPrice)) {
                throw new Error(`Failed to load ${planType} subscription price`);
            }

            return [
                planType,
                {
                    amount: payload.amount,
                    formattedPrice: payload.formattedPrice,
                },
            ] as const;
        };

        Promise.allSettled(DISPLAYED_PLAN_ORDER.map(fetchPlanPrice))
            .then((results) => {
                if (!isMounted) return;

                const nextPrices: Partial<Record<ConsumerPlanType, LiveSubscriptionPrice>> = {};
                let hasAnyError = false;

                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        const [planType, price] = result.value;
                        nextPrices[planType] = price;
                        return;
                    }

                    hasAnyError = true;
                });

                if (Object.keys(nextPrices).length > 0) {
                    setLivePrices((current) => ({ ...current, ...nextPrices }));
                }
                setHasPriceFetchError(hasAnyError);
            })
            .catch(() => {
                if (isMounted) {
                    setHasPriceFetchError(true);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsPriceLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    const handleDismiss = useCallback(() => {
        if (isLoading) return;
        onClose();
    }, [isLoading, onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                handleDismiss();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDismiss, isLoading, isOpen]);

    const planOptions = useMemo(() => buildPlanOptions(livePrices), [livePrices]);

    const orderedPlans = useMemo(
        () => DISPLAYED_PLAN_ORDER.map((planType) => planOptions[planType]),
        [planOptions]
    );

    const selectedPlan = useMemo(
        () => planOptions[selectedPlanType] ?? orderedPlans[0],
        [orderedPlans, planOptions, selectedPlanType]
    );
    const showPriceLoadingState = isPriceLoading && DISPLAYED_PLAN_ORDER.some((planType) => !livePrices[planType]);
    const showPriceFallbackCopy = hasPriceFetchError;

    const trackOpenEvent = useCallback(async () => {
        const viewSignature = `${source}:membership:${pathname}:${resolvedDefaultPlanType}`;
        if (viewSignatureRef.current === viewSignature) {
            return;
        }

        viewSignatureRef.current = viewSignature;
        await postGrowthEvent({
            event: 'paywall_open',
            source,
            path: pathname,
            plan: resolvedDefaultPlanType,
            context: 'membership',
            userId: session?.user?.id,
        });
    }, [pathname, resolvedDefaultPlanType, session?.user?.id, source]);

    useEffect(() => {
        if (!isOpen) {
            viewSignatureRef.current = null;
            return;
        }

        void trackOpenEvent();
    }, [isOpen, trackOpenEvent]);

    async function handleStartCheckout() {
        setErrorMessage(null);
        setIsLoading(true);

        try {
            onCheckoutStart?.(selectedPlanType);

            await postGrowthEvent({
                event: 'checkout_start',
                source,
                path: pathname,
                plan: selectedPlanType,
                context: 'membership',
                userId: session?.user?.id,
            });

            const response = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planType: selectedPlanType,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                const message = result?.error?.message || '구독 결제 세션 생성에 실패했습니다.';
                const details =
                    typeof result?.error?.details === 'string' && result.error.details.trim()
                        ? result.error.details.trim()
                        : null;
                throw new Error(details ? `${message}: ${details}` : message);
            }

            if (!result.checkoutUrl) {
                throw new Error('Stripe checkout URL이 비어 있습니다.');
            }

            window.location.href = result.checkoutUrl;
        } catch (error) {
            const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,0.82)] p-3 backdrop-blur-md sm:p-4"
                    onClick={handleDismiss}
                >
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="subscription-modal-title"
                        className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#f0d487]/20 bg-[radial-gradient(circle_at_top_left,rgba(244,216,138,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.22),transparent_26%),linear-gradient(155deg,#060914,#0d1322_48%,#0a0f1d)] shadow-[0_32px_120px_rgba(0,0,0,0.52)] overscroll-contain"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f4d88a]/70 to-transparent" />
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-[#f4d88a]/10 blur-3xl"
                            animate={shouldReduceMotion ? undefined : { opacity: [0.4, 0.75, 0.45], scale: [0.98, 1.05, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
                            animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.6, 0.35], scale: [1, 1.08, 1] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-[background-color,border-color,color,transform] duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/70"
                            aria-label="구독 모달 닫기"
                        >
                            <X size={18} />
                        </button>

                        <div className="max-h-[92vh] overflow-y-auto p-5 sm:p-7 md:p-8 lg:p-10">
                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)] xl:gap-8">
                                <div>
                                    <div className="mb-6 max-w-4xl">
                                        <div className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#f0d487]/25 bg-[#f0d487]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                            <Sparkles size={14} />
                                            {PAYWALL_COPY.badge}
                                        </div>

                                        <h2
                                            id="subscription-modal-title"
                                            className="font-cinzel text-3xl leading-tight text-white sm:text-4xl"
                                        >
                                            {displayName ? `${displayName}님,` : '지금'}
                                            <span className="block bg-gradient-to-r from-[#fff4cf] via-[#f4d88a] to-[#c7a243] bg-clip-text text-transparent">
                                                {PAYWALL_COPY.headline}
                                            </span>
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                                            {PAYWALL_COPY.body}
                                        </p>
                                    </div>

                                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                        {TRUST_SIGNALS.map(({ title, description, Icon }) => (
                                            <div
                                                key={title}
                                                className="rounded-[24px] border border-white/10 bg-white/[0.035] px-4 py-4 backdrop-blur-sm"
                                            >
                                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f4d88a]/20 bg-[#f4d88a]/10 text-[#f4d88a]">
                                                    <Icon size={18} />
                                                </div>
                                                <p className="text-sm font-semibold text-white">{title}</p>
                                                <p className="mt-2 text-xs leading-6 text-white/58">{description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {orderedPlans.map((plan, index) => {
                                            const isSelected = selectedPlanType === plan.id;
                                            const Icon = PLAN_ICONS[plan.id];
                                            const isRecommended = plan.id === RECOMMENDED_PLAN_TYPE;
                                            const isPlanPricePending = !livePrices[plan.id] && isPriceLoading;

                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanType(plan.id)}
                                                    aria-pressed={isSelected}
                                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                                    transition={{ delay: shouldReduceMotion ? 0 : index * 0.05, duration: 0.25 }}
                                                    className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-[30px] border p-5 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/70 ${
                                                        isSelected
                                                            ? 'border-[#f4d88a]/60 bg-[linear-gradient(180deg,rgba(244,216,138,0.14),rgba(244,216,138,0.05))] shadow-[0_20px_45px_rgba(212,175,55,0.16)]'
                                                            : 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]'
                                                    }`}
                                                >
                                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
                                                    {isSelected && !shouldReduceMotion && (
                                                        <motion.div
                                                            layoutId="subscription-selected-outline"
                                                            className="pointer-events-none absolute inset-0 rounded-[30px] border border-[#f4d88a]/45"
                                                        />
                                                    )}

                                                    <div className="mb-5 flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${
                                                                    isSelected
                                                                        ? 'border-[#f4d88a]/35 bg-[#f4d88a]/14 text-[#f4d88a]'
                                                                        : 'border-white/10 bg-white/5 text-white/65'
                                                                }`}
                                                            >
                                                                <Icon size={20} />
                                                            </span>
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#f4d88a]/80">
                                                                    {plan.eyebrow}
                                                                </p>
                                                                <p className="mt-1 text-lg font-semibold text-white">{plan.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {isRecommended && (
                                                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                                    가장 큰 절약
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                                                                    isSelected
                                                                        ? 'border-[#f4d88a]/50 bg-[#f4d88a]/20 text-[#fef3c7]'
                                                                        : 'border-white/15 bg-transparent text-transparent'
                                                                }`}
                                                            >
                                                                <Check size={12} />
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-5">
                                                        {isPlanPricePending ? (
                                                            <div className="space-y-3">
                                                                <Skeleton className="h-8 w-40 rounded-full bg-[#f4d88a]/15" />
                                                                <Skeleton className="h-3 w-28 rounded-full bg-white/10" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-3xl font-semibold tracking-tight text-[#f4d88a]">
                                                                    {plan.priceLabel}
                                                                </p>
                                                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                                                                    {plan.billingLabel}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>

                                                    <p className="mb-3 text-sm leading-7 text-white/72">{plan.description}</p>
                                                    <div className="rounded-[22px] border border-white/10 bg-black/15 px-4 py-3">
                                                        <p className="text-sm font-semibold text-white">{plan.valueLabel}</p>
                                                        <p className="mt-1 text-xs leading-6 text-white/56">{plan.supportingLabel}</p>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 min-h-10 space-y-2">
                                        {showPriceLoadingState ? (
                                            <div className="flex items-center gap-2 text-xs text-white/48">
                                                <Skeleton className="h-2 w-16 rounded-full bg-white/10" />
                                                <span>Stripe 실시간 가격을 확인하는 중입니다.</span>
                                            </div>
                                        ) : null}
                                        {showPriceFallbackCopy ? (
                                            <p className="text-xs text-white/48">
                                                실시간 가격 확인이 일부 지연되어 기본 구독 가격으로 먼저 표시합니다.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="xl:pt-10">
                                    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                                        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                                    Selected Path
                                                </p>
                                                <h3 className="mt-2 font-cinzel text-2xl text-white">
                                                    {selectedPlan.name}
                                                </h3>
                                            </div>
                                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65">
                                                {selectedPlan.billingLabel}
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-[#f4d88a]/18 bg-[#f4d88a]/8 px-4 py-4">
                                            <p className="text-sm font-semibold text-white">{selectedPlan.valueLabel}</p>
                                            <p className="mt-2 text-xs leading-6 text-white/62">
                                                {selectedPlan.commitmentNote}
                                            </p>
                                        </div>

                                        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                {PAYWALL_COPY.insightLabel}
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-white/72">
                                                {PAYWALL_COPY.insightBody}
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-white">지금 열리는 결정 리딩</p>
                                            <ul className="mt-4 space-y-3">
                                                {selectedPlan.benefits.map((benefit, index) => {
                                                    const Icon = BENEFIT_ICONS[index] ?? Check;
                                                    return (
                                                        <li
                                                            key={benefit}
                                                            className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/82"
                                                        >
                                                            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#f4d88a]/20 bg-[#f4d88a]/10 text-[#f4d88a]">
                                                                <Icon size={16} />
                                                            </span>
                                                            <span className="leading-6">{benefit}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        {errorMessage && (
                                            <p className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <motion.button
                                            type="button"
                                            onClick={handleStartCheckout}
                                            disabled={isLoading}
                                            whileHover={shouldReduceMotion || isLoading ? undefined : { y: -2, scale: 1.01 }}
                                            whileTap={shouldReduceMotion || isLoading ? undefined : { scale: 0.99 }}
                                            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f8e7aa] via-[#d4af37] to-[#b8902f] px-5 py-4 text-base font-bold text-[#111111] shadow-[0_18px_40px_rgba(212,175,55,0.2)] transition-[box-shadow,filter,opacity] duration-300 hover:shadow-[0_24px_46px_rgba(212,175,55,0.28)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/80"
                                        >
                                            <span>{isLoading ? 'Stripe Checkout 준비 중...' : `${selectedPlan.priceLabel}으로 결정 리딩 열기`}</span>
                                            {!isLoading && <ArrowRight size={18} />}
                                        </motion.button>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Decision Unlock
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-white/68">
                                                    결제 직후 구독 상태가 반영되면 `/my`, `/daily`, Oracle Chat에서 바로 이어서 사용할 수 있습니다.
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Decision Path
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-white/68">
                                                    현재 기본 결제 표면은 월간/연간 두 가지 경로만 노출합니다. 어디서 들어오든 같은 결정 리딩 흐름으로 이어지고, source만 analytics에 남깁니다.
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-center text-xs leading-6 text-white/45">
                                            결제는 Stripe Checkout으로 이동해 진행됩니다. 기본 노출은 월간/연간 두 가지이며, 선택한 경로만 서버에 전송됩니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
