'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { useDocumentScrollLock } from '@/hooks/useDocumentScrollLock';
import {
    SUBSCRIPTION_CHECKOUT_PRICE_IDS,
    formatUsdAmount,
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

interface PaywallCopy {
    badge: string;
    headline: string;
    body: string;
    insightLabel: string;
    insightBody: string;
    accessLabel: string;
    checkoutActionLabel: string;
    decisionUnlockBody: string;
    pathBody: string;
}

interface TrustSignal {
    title: string;
    description: string;
    Icon: typeof ShieldCheck;
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
        description: '가볍게 시작해서 한 달 동안 Grand Oracle Chat, daily premium guidance, 프리미엄 리딩 흐름을 함께 열 수 있습니다.',
        priceLabel: '최신 가격 확인',
        billingLabel: '결제 단계에서 표시',
        valueLabel: '가장 가볍게 premium membership을 여는 기본 경로',
        supportingLabel: '실시간 가격을 불러오면 월간 금액을 바로 보여주고, 실패해도 결제 단계에서 최신 금액을 다시 확인할 수 있습니다.',
        benefits: ['Grand Oracle Chat과 follow-up access', 'Daily tarot premium guidance', '프리미엄 리딩과 타이밍 가이드'],
        commitmentNote: '처음 전환하거나 이 루틴에 얼마나 자주 돌아오는지 가볍게 검증해보고 싶은 사용자에게 가장 자연스러운 시작점입니다.',
    },
    ANNUAL: {
        id: 'ANNUAL',
        eyebrow: 'Long Orbit',
        name: '연간 멤버십',
        description: '가장 낮은 월 환산 비용으로 Grand Oracle Chat, daily premium, 프리미엄 리딩 루틴을 길게 유지합니다.',
        priceLabel: '최신 가격 확인',
        billingLabel: '결제 단계에서 표시',
        valueLabel: '가장 큰 절약폭으로 premium membership을 오래 유지하는 경로',
        supportingLabel: '실시간 가격을 불러오면 연간 금액과 월 환산을 함께 보여주고, 실패해도 결제 단계에서 최신 금액을 다시 확인할 수 있습니다.',
        benefits: ['장기 구독 할인', 'Grand Oracle Chat과 daily premium 유지', '프리미엄 리딩과 follow-up 루틴'],
        commitmentNote: '이미 자주 돌아오고 있다면 연간이 가장 단순하고 비용 효율적인 선택입니다.',
    },
};

const ORACLE_CHAT_PLAN_OVERRIDES: Record<ConsumerPlanType, Partial<PlanOption>> = {
    MONTHLY: {
        description: '가볍게 시작해서 한 달 동안 Grand Oracle Chat과 결정 타이밍 질문을 충분히 이어갈 수 있습니다.',
        valueLabel: '가장 가볍게 Grand Oracle Chat 무제한을 여는 기본 경로',
        benefits: ['Grand Oracle Chat 무제한', '관계·커리어·재물 질문 확장', 'Daily Hook + Tarot premium guidance'],
        commitmentNote: '처음 전환하거나 오라클 상담 루틴이 나와 맞는지 짧게 검증해보고 싶은 사용자에게 가장 자연스러운 시작점입니다.',
    },
    ANNUAL: {
        description: '가장 낮은 월 환산 비용으로 Grand Oracle Chat과 daily oracle 루틴을 길게 유지합니다.',
        valueLabel: '가장 큰 절약폭으로 Grand Oracle 루틴을 이어가기 좋은 경로',
        benefits: ['장기 구독 할인', 'Grand Oracle Chat 무제한', '장기 결정 리딩과 daily oracle 유지'],
    },
};

const MY_PLAN_OVERRIDES: Record<ConsumerPlanType, Partial<PlanOption>> = {
    MONTHLY: {
        description: 'Grand Oracle Chat, daily premium guidance, 프리미엄 리딩 흐름을 열고, 인증된 번호에는 아침 SMS Daily Signal perk까지 함께 연결할 수 있습니다.',
        valueLabel: '핵심 오라클 access를 열고 Daily Signal perk까지 연결하는 가장 가벼운 경로',
        benefits: ['Grand Oracle Chat과 follow-up access', 'Daily tarot premium guidance', '인증된 번호에 한해 아침 SMS Daily Signal perk'],
        commitmentNote: '문자 자체가 주상품은 아니고, 핵심 오라클 루틴에 더해 아침에 먼저 도착하는 보조 신호를 받고 싶을 때 가장 자연스러운 시작점입니다.',
    },
    ANNUAL: {
        description: 'Grand Oracle Chat과 daily oracle 루틴을 길게 유지하면서, 인증된 번호에는 아침 SMS Daily Signal perk도 안정적으로 이어갈 수 있습니다.',
        valueLabel: '장기 오라클 루틴과 Daily Signal perk를 함께 유지하는 경로',
        benefits: ['장기 구독 할인', 'Grand Oracle Chat과 daily premium 유지', '인증된 번호에 한해 아침 SMS Daily Signal perk'],
        commitmentNote: '이미 자주 돌아오고 있고 아침 Daily Signal도 함께 쓰고 싶다면 가장 단순하고 비용 효율적인 선택입니다.',
    },
};

const DEFAULT_PAYWALL_COPY: PaywallCopy = {
    badge: 'CosmicPath Membership',
    headline: '프리미엄 흐름을 계속 이어가세요',
    body: 'Grand Oracle Chat, daily premium guidance, 프리미엄 리딩과 follow-up 경험을 하나의 membership으로 이어갈 수 있습니다. 월간은 가장 가볍게 루틴을 열기 좋고, 연간은 가장 큰 절약폭으로 장기 사용에 유리합니다.',
    insightLabel: 'Membership Path',
    insightBody:
        '기본 결제 표면은 월간과 연간 두 가지 경로만 남겼습니다. 처음에는 월간으로 루틴을 열고, 반복적으로 돌아오게 되면 연간으로 이어가는 구조가 가장 명확하고 안정적입니다.',
    accessLabel: '지금 열리는 Premium Access',
    checkoutActionLabel: '프리미엄 멤버십 열기',
    decisionUnlockBody: '결제 직후 구독 상태가 반영되면 `/start` 결과, `/daily`, `/oracle-chat`, `/my`에서 프리미엄 흐름을 바로 이어갈 수 있습니다.',
    pathBody: '현재 기본 결제 표면은 월간/연간 두 가지 경로만 노출합니다. 어디서 들어오든 같은 membership 레일로 이어지고, source만 analytics에 남깁니다.',
};

const ORACLE_CHAT_PAYWALL_COPY: PaywallCopy = {
    badge: 'Grand Oracle Membership',
    headline: 'Grand Oracle Chat을 무제한으로 계속 이어가세요',
    body: '무료 사용량 이후에도 관계, 커리어, 재물, 타이밍 질문을 Grand Oracle Chat, Daily Hook, premium tarot guidance, 프리미엄 리딩 경험으로 끊기지 않게 이어갈 수 있습니다. 월간은 가장 가볍게 흐름을 열기 좋고, 연간은 가장 큰 절약폭으로 장기 루틴을 이어가기 좋습니다.',
    insightLabel: 'Oracle Path',
    insightBody:
        '기본 결제 표면은 월간과 연간 두 가지 경로만 남겼습니다. 처음에는 월간으로 Grand Oracle Chat 루틴을 열고, 반복적으로 돌아오게 되면 연간으로 이어가는 구조가 가장 명확하고 안정적입니다.',
    accessLabel: '지금 열리는 Grand Oracle Access',
    checkoutActionLabel: 'Grand Oracle Chat 열기',
    decisionUnlockBody: '결제 직후 구독 상태가 반영되면 `/oracle-chat`, `/daily`, `/my`에서 바로 이어서 사용할 수 있습니다.',
    pathBody: '현재 기본 결제 표면은 월간/연간 두 가지 경로만 노출합니다. 어디서 들어오든 같은 Grand Oracle membership 흐름으로 이어지고, source만 analytics에 남깁니다.',
};

const MY_PAYWALL_COPY: PaywallCopy = {
    badge: 'CosmicPath Membership',
    headline: '핵심 오라클 access를 열고 Daily Signal도 함께 연결하세요',
    body: '메인 가치는 Grand Oracle Chat, daily premium guidance, 프리미엄 리딩 흐름입니다. SMS Daily Signal은 여기에 덧붙는 보조 perk로, 구독 후 인증된 번호에만 하루 한 번 먼저 도착합니다.',
    insightLabel: 'Membership Path',
    insightBody:
        'Daily Signal을 위해 별도 상품을 만든 것이 아니라, 기존 membership 위에 아침 리텐션 perk를 얹었습니다. 핵심 가치는 오라클 경험이고, SMS는 그 흐름을 먼저 떠오르게 하는 보조 채널입니다.',
    accessLabel: '지금 열리는 Premium Access',
    checkoutActionLabel: '프리미엄 멤버십 열기',
    decisionUnlockBody: '결제 직후 구독 상태가 반영되면 `/oracle-chat`, `/daily`, `/start` 프리미엄 흐름이 열리고, `/my`에서 인증된 번호에는 Daily Signal perk도 연결할 수 있습니다.',
    pathBody: '현재 기본 결제 표면은 월간/연간 두 가지 경로만 노출합니다. Daily Signal도 같은 membership 레일 위에서 켜지며, 별도 SMS 전용 결제 SKU는 두지 않습니다.',
};

const BENEFIT_ICONS = [MessageCircle, Palette, CalendarDays] as const;

const PLAN_ICONS = {
    MONTHLY: Sparkles,
    ANNUAL: Crown,
} as const satisfies Record<ConsumerPlanType, typeof Sparkles>;

const DEFAULT_TRUST_SIGNALS: TrustSignal[] = [
    {
        title: 'Stripe-secured',
        description: '결제 정보는 Stripe Checkout에서 안전하게 처리됩니다.',
        Icon: ShieldCheck,
    },
    {
        title: 'Decision unlock',
        description: '결제 직후 Grand Oracle Chat, daily premium, 프리미엄 리딩 흐름이 바로 열립니다.',
        Icon: Sparkles,
    },
    {
        title: 'Daily ritual',
        description: '월간으로 가볍게 시작하거나, 연간으로 가장 큰 절약폭의 premium 루틴을 선택할 수 있습니다.',
        Icon: Crown,
    },
] as const;

const ORACLE_CHAT_TRUST_SIGNALS: TrustSignal[] = [
    DEFAULT_TRUST_SIGNALS[0],
    {
        title: 'Decision unlock',
        description: '결제 직후 Grand Oracle Chat, daily oracle loop, 관계·커리어·재물 리딩 흐름이 바로 열립니다.',
        Icon: Sparkles,
    },
    {
        title: 'Daily ritual',
        description: '월간으로 가볍게 시작하거나, 연간으로 가장 큰 절약폭의 Grand Oracle 루틴을 선택할 수 있습니다.',
        Icon: Crown,
    },
];

const MY_TRUST_SIGNALS: TrustSignal[] = [
    DEFAULT_TRUST_SIGNALS[0],
    {
        title: 'Core value first',
        description: '핵심 가치는 Grand Oracle Chat, daily premium, 프리미엄 리딩 흐름이고 SMS Daily Signal은 번호 인증 후 붙는 보조 perk입니다.',
        Icon: Sparkles,
    },
    {
        title: 'One membership rail',
        description: '별도 SMS 상품 없이 기존 membership 하나로 오라클 access와 Daily Signal perk를 함께 관리합니다.',
        Icon: Crown,
    },
];

function buildPlanOptions(
    livePrices: Partial<Record<ConsumerPlanType, LiveSubscriptionPrice>>,
    source: PaywallSource
): Record<ConsumerPlanType, PlanOption> {
    const basePlanOptions: Record<ConsumerPlanType, PlanOption> = {
        MONTHLY: {
            ...PLAN_OPTIONS.MONTHLY,
            ...(source === 'oracle_chat'
                ? ORACLE_CHAT_PLAN_OVERRIDES.MONTHLY
                : source === 'my'
                  ? MY_PLAN_OVERRIDES.MONTHLY
                  : {}),
        },
        ANNUAL: {
            ...PLAN_OPTIONS.ANNUAL,
            ...(source === 'oracle_chat'
                ? ORACLE_CHAT_PLAN_OVERRIDES.ANNUAL
                : source === 'my'
                  ? MY_PLAN_OVERRIDES.ANNUAL
                  : {}),
        },
    };
    const monthlyLivePrice = livePrices.MONTHLY;
    const annualLivePrice = livePrices.ANNUAL;
    const annualMonthlyEquivalent = annualLivePrice ? annualLivePrice.amount / 12 : null;
    const annualSavings =
        monthlyLivePrice && annualLivePrice
            ? Math.max((monthlyLivePrice.amount * 12) - annualLivePrice.amount, 0)
            : null;

    return {
        MONTHLY: {
            ...basePlanOptions.MONTHLY,
            priceLabel: monthlyLivePrice
                ? `${monthlyLivePrice.formattedPrice} / month`
                : basePlanOptions.MONTHLY.priceLabel,
            billingLabel: monthlyLivePrice ? 'Cancel anytime' : basePlanOptions.MONTHLY.billingLabel,
        },
        ANNUAL: {
            ...basePlanOptions.ANNUAL,
            priceLabel: annualLivePrice
                ? `${annualLivePrice.formattedPrice} / year`
                : basePlanOptions.ANNUAL.priceLabel,
            billingLabel:
                annualMonthlyEquivalent !== null
                    ? `About ${formatUsdAmount(annualMonthlyEquivalent)} / month`
                    : basePlanOptions.ANNUAL.billingLabel,
            valueLabel:
                annualSavings !== null && annualMonthlyEquivalent !== null
                    ? `월간 대비 ${formatUsdAmount(annualSavings)} 절약, 연간 기준 월 환산 약 ${formatUsdAmount(annualMonthlyEquivalent)}`
                    : basePlanOptions.ANNUAL.valueLabel,
            benefits:
                annualSavings !== null
                    ? [
                        `월간 대비 ${formatUsdAmount(annualSavings)} 절약`,
                        ...basePlanOptions.ANNUAL.benefits.slice(1),
                    ]
                    : basePlanOptions.ANNUAL.benefits,
        },
    };
}

function getPaywallCopy(source: PaywallSource): PaywallCopy {
    if (source === 'oracle_chat') {
        return ORACLE_CHAT_PAYWALL_COPY;
    }

    if (source === 'my') {
        return MY_PAYWALL_COPY;
    }

    return DEFAULT_PAYWALL_COPY;
}

function getTrustSignals(source: PaywallSource): TrustSignal[] {
    if (source === 'oracle_chat') {
        return ORACLE_CHAT_TRUST_SIGNALS;
    }

    if (source === 'my') {
        return MY_TRUST_SIGNALS;
    }

    return DEFAULT_TRUST_SIGNALS;
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
    const [isMounted, setIsMounted] = useState(false);
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
        setIsMounted(true);
    }, []);

    useDocumentScrollLock(isOpen);

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

            if (
                !response.ok ||
                payload?.metadata?.fallback === 'true' ||
                typeof payload.amount !== 'number' ||
                !normalizePriceLabel(payload.formattedPrice)
            ) {
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

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                handleDismiss();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDismiss, isLoading, isOpen]);

    const paywallCopy = useMemo(() => getPaywallCopy(source), [source]);
    const trustSignals = useMemo(() => getTrustSignals(source), [source]);
    const planOptions = useMemo(() => buildPlanOptions(livePrices, source), [livePrices, source]);

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
    const selectedPlanHasLivePrice = Boolean(livePrices[selectedPlanType]);
    const checkoutButtonLabel = selectedPlanHasLivePrice
        ? `${selectedPlan.priceLabel}으로 ${paywallCopy.checkoutActionLabel}`
        : `최신 가격 확인 후 ${paywallCopy.checkoutActionLabel}`;

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

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-lenis-prevent
                    className="fixed inset-0 z-[10010] overflow-y-auto overscroll-contain touch-pan-y bg-[rgba(2,6,23,0.82)] backdrop-blur-md"
                    onClick={handleDismiss}
                >
                    <div className="flex min-h-[100dvh] items-start justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] sm:items-center sm:px-4 sm:pb-6 sm:pt-6">
                        <motion.div
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="subscription-modal-title"
                            data-lenis-prevent
                            className="relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-[32px] border border-[#f0d487]/20 bg-[radial-gradient(circle_at_top_left,rgba(244,216,138,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.22),transparent_26%),linear-gradient(155deg,#060914,#0d1322_48%,#0a0f1d)] shadow-[0_32px_120px_rgba(0,0,0,0.52)] sm:max-h-[calc(100dvh-3rem)]"
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

                            <div data-lenis-prevent className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y p-5 sm:p-7 md:p-8 lg:p-10" onClick={(event) => event.stopPropagation()}>
                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)] xl:gap-8">
                                    <div>
                                    <div className="mb-6 max-w-4xl">
                                        <div className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#f0d487]/25 bg-[#f0d487]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                            <Sparkles size={14} />
                                            {paywallCopy.badge}
                                        </div>

                                        <h2
                                            id="subscription-modal-title"
                                            className="font-cinzel text-3xl leading-tight text-white sm:text-4xl"
                                        >
                                            {displayName ? `${displayName}님,` : '지금'}
                                            <span className="block bg-gradient-to-r from-[#fff4cf] via-[#f4d88a] to-[#c7a243] bg-clip-text text-transparent">
                                                {paywallCopy.headline}
                                            </span>
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                                            {paywallCopy.body}
                                        </p>
                                    </div>

                                    <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                        {trustSignals.map(({ title, description, Icon }) => (
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
                                                실시간 가격 확인이 지연되어 금액은 결제 단계에서 최신 값으로 다시 확인할 수 있습니다.
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
                                                    {paywallCopy.insightLabel}
                                                </p>
                                                <p className="mt-2 text-sm leading-7 text-white/72">
                                                    {paywallCopy.insightBody}
                                                </p>
                                            </div>

                                            <div className="mt-6">
                                                <p className="text-sm font-semibold text-white">{paywallCopy.accessLabel}</p>
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
                                                <span>{isLoading ? 'Stripe Checkout 준비 중...' : checkoutButtonLabel}</span>
                                                {!isLoading && <ArrowRight size={18} />}
                                            </motion.button>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                        Decision Unlock
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-white/68">
                                                        {paywallCopy.decisionUnlockBody}
                                                    </p>
                                                </div>
                                                <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                        {paywallCopy.insightLabel}
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-white/68">
                                                        {paywallCopy.pathBody}
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
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        ,
        document.body
    );
}
