'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock3,
    Crown,
    MessageCircle,
    Palette,
    ShieldCheck,
    Sparkles,
    Stars,
    X,
} from 'lucide-react';
import type { SubscriptionPlanType } from '@/lib/payment/payment-config';

export type PaywallSource = 'default' | 'landing' | 'daily' | 'oracle_chat' | 'my';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlanType?: SubscriptionPlanType;
    source?: PaywallSource;
    onCheckoutStart?: (planType: SubscriptionPlanType) => void;
}

interface PlanOption {
    id: SubscriptionPlanType;
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

interface PaywallSegmentConfig {
    key: 'ritual' | 'conversation' | 'activation' | 'retention' | 'return_offer';
    badge: string;
    headline: string;
    body: string;
    recommendedPlan: SubscriptionPlanType;
    planOrder: SubscriptionPlanType[];
    insightLabel: string;
    insightBody: string;
}

const RETURN_OFFER_STORAGE_KEY = 'cosmicpath.subscription.return-offer-expiry';
const RETURN_OFFER_WINDOW_MS = 24 * 60 * 60 * 1000;

const PLAN_OPTIONS: Record<SubscriptionPlanType, PlanOption> = {
    WEEKLY: {
        id: 'WEEKLY',
        eyebrow: 'Starter Entry',
        name: '주간 스타터',
        description: '가장 낮은 진입 가격으로 7일 동안 집중 체험하고 흐름을 확인할 수 있습니다.',
        priceLabel: '$3.99 / week',
        billingLabel: 'Lowest entry price',
        valueLabel: '첫 결제 부담이 가장 낮은 스타터 플랜',
        supportingLabel: '닫았다가 돌아온 사용자를 위한 24시간 리턴 오퍼와 가장 잘 맞습니다.',
        benefits: ['7일 무제한 Oracle Chat', 'Daily Tarot premium advice', '가볍게 시작 후 월간/연간 전환 검토'],
        commitmentNote: '특가성 진입 카드로 가장 낮은 비용에서 리추얼 루틴을 붙여볼 수 있습니다.',
    },
    MONTHLY: {
        id: 'MONTHLY',
        eyebrow: 'Flexible Start',
        name: '월간 멤버십',
        description: '한 달 단위로 유연하게 유지하면서 프리미엄 기능을 바로 열어보세요.',
        priceLabel: '$9.99 / month',
        billingLabel: 'Cancel anytime',
        valueLabel: '짧은 검증과 루틴 형성에 가장 무난한 옵션',
        supportingLabel: '주간보다 긴 호흡으로 유지하고 싶은 사용자에게 적합',
        benefits: ['무제한 Oracle Chat', '프리미엄 테마', '월간 인사이트 업데이트'],
        commitmentNote: '이번 달 바로 시작하고, 흐름이 맞는지 유연하게 확인할 수 있습니다.',
    },
    ANNUAL: {
        id: 'ANNUAL',
        eyebrow: 'Best Value',
        name: '연간 멤버십',
        description: '가장 높은 절약폭으로 프리미엄 루틴을 1년 내내 유지합니다.',
        priceLabel: '$49.99 / year',
        billingLabel: 'About $4.17 / month',
        valueLabel: '월간 대비 $69.89 절약, 연간 기준 월 환산 약 $4.17',
        supportingLabel: '1주 비용으로 비교해도 약 $0.96 수준의 장기 효율',
        benefits: ['월간 대비 $69.89 절약', '무제한 Oracle Chat', '프리미엄 테마 + 월간 리포트'],
        commitmentNote: '가장 낮은 총비용으로 핵심 기능을 오래 유지하려면 연간이 가장 유리합니다.',
    },
};

const SEGMENT_CONFIGS: Record<Exclude<PaywallSource, 'default'> | 'default', PaywallSegmentConfig> = {
    default: {
        key: 'activation',
        badge: 'Core Membership',
        headline: 'CosmicPath의 흐름을 끊기지 않게 유지하세요',
        body: '무료 사용량 이후에도 무제한 Oracle Chat, 프리미엄 테마, Daily Tarot premium advice를 계속 사용할 수 있습니다. 연간은 가장 큰 절약폭을, 월간은 가장 빠른 정착을 제공합니다.',
        recommendedPlan: 'ANNUAL',
        planOrder: ['ANNUAL', 'MONTHLY', 'WEEKLY'],
        insightLabel: 'Value Frame',
        insightBody: '연간은 월 환산 약 $4.17로 월간 대비 절반 이하 비용입니다. 루틴이 붙을수록 가장 큰 효율을 만듭니다.',
    },
    landing: {
        key: 'activation',
        badge: 'Acquisition Segment',
        headline: '첫 프리미엄 루틴을 가장 자연스럽게 시작하세요',
        body: '랜딩에서 바로 구독을 여는 사용자는 보통 리포트 이후 다음 행동을 원합니다. 월간은 진입 장벽을 낮추면서도 충분한 사용 기간을 제공합니다.',
        recommendedPlan: 'MONTHLY',
        planOrder: ['MONTHLY', 'ANNUAL', 'WEEKLY'],
        insightLabel: 'Landing Fit',
        insightBody: '처음 방문한 사용자는 너무 긴 commitment보다 30일 체험이 더 설득력 있습니다. 이후 retained cohort에 연간 전환을 걸 수 있습니다.',
    },
    daily: {
        key: 'ritual',
        badge: 'Daily Ritual Segment',
        headline: '매일 돌아오게 만드는 리추얼 레이어를 잠금 해제하세요',
        body: 'Daily Fortune과 Tarot은 하루치로 끝나지 않습니다. 자정 리셋과 premium advice를 계속 붙이는 사용자는 장기 유지 구조가 더 잘 맞습니다.',
        recommendedPlan: 'ANNUAL',
        planOrder: ['ANNUAL', 'MONTHLY', 'WEEKLY'],
        insightLabel: 'Ritual Fit',
        insightBody: '데일리 루틴형 사용자는 반복 접속 빈도가 높아 연간 플랜의 월 환산 효율과 가장 잘 맞습니다.',
    },
    oracle_chat: {
        key: 'conversation',
        badge: 'Oracle Intent Segment',
        headline: '대화 흐름이 끊기기 전에 Oracle을 계속 이어가세요',
        body: '질문 의도가 이미 높은 상태입니다. 즉시 무제한 Oracle Chat을 여는 것이 가장 직접적인 전환 포인트이며, 월간이 가장 자연스러운 선택지입니다.',
        recommendedPlan: 'MONTHLY',
        planOrder: ['MONTHLY', 'ANNUAL', 'WEEKLY'],
        insightLabel: 'Chat Conversion Fit',
        insightBody: '오라클 챗 진입자는 즉시성 가치가 높습니다. 월간을 전면에 두고, 장기 사용 의도가 강한 경우에만 연간을 업셀하는 구성이 유리합니다.',
    },
    my: {
        key: 'retention',
        badge: 'Retention Segment',
        headline: '이미 쌓은 리포트와 루틴을 더 길게 유지하세요',
        body: '내 계정에서 구독을 여는 사용자는 재방문 의도가 높습니다. 연간 플랜을 먼저 보여 주면 저장된 리포트와 데일리 루틴 유지 가치를 더 강하게 전달할 수 있습니다.',
        recommendedPlan: 'ANNUAL',
        planOrder: ['ANNUAL', 'MONTHLY', 'WEEKLY'],
        insightLabel: 'Retention Fit',
        insightBody: '기존 계정 사용자는 장기 유지 가능성이 높아 annual framing의 효율이 더 잘 작동합니다.',
    },
};

const RETURN_SEGMENT: PaywallSegmentConfig = {
    key: 'return_offer',
    badge: '24h Return Offer',
    headline: '가장 가볍게 다시 시작할 수 있는 창이 아직 열려 있습니다',
    body: '모달을 닫았다가 돌아온 사용자를 위해 주간 스타터를 우선 노출했습니다. 가장 낮은 시작 비용에서 다시 흐름을 붙일 수 있는 24시간 재진입 창입니다.',
    recommendedPlan: 'WEEKLY',
    planOrder: ['WEEKLY', 'MONTHLY', 'ANNUAL'],
    insightLabel: 'Return Offer Logic',
    insightBody: '이 구간은 장기 설득보다 재진입 마찰을 낮추는 것이 핵심입니다. 주간 플랜을 전면에 두고 checkout 재개를 유도합니다.',
};

const BENEFIT_ICONS = [MessageCircle, Palette, CalendarDays] as const;

const PLAN_ICONS = {
    WEEKLY: Clock3,
    MONTHLY: Sparkles,
    ANNUAL: Crown,
} as const satisfies Record<SubscriptionPlanType, typeof Sparkles>;

const TRUST_SIGNALS = [
    {
        title: 'Stripe-secured',
        description: '결제 정보는 Stripe Checkout에서 안전하게 처리됩니다.',
        Icon: ShieldCheck,
    },
    {
        title: 'Instant unlock',
        description: '결제 직후 Oracle Chat과 프리미엄 테마가 바로 열립니다.',
        Icon: Sparkles,
    },
    {
        title: 'Premium routine',
        description: '세그먼트에 맞는 진입 구조로 주간, 월간, 연간을 다르게 제안합니다.',
        Icon: Crown,
    },
] as const;

function readReturnOfferExpiry(): number | null {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(RETURN_OFFER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= Date.now()) {
        window.localStorage.removeItem(RETURN_OFFER_STORAGE_KEY);
        return null;
    }

    return parsed;
}

function writeReturnOfferExpiry(expiresAt: number): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RETURN_OFFER_STORAGE_KEY, String(expiresAt));
}

function clearReturnOfferExpiry(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(RETURN_OFFER_STORAGE_KEY);
}

function formatOfferCountdown(expiresAt: number, now: number): string {
    const remainingMs = Math.max(0, expiresAt - now);
    const totalMinutes = Math.ceil(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
        return `${Math.max(1, minutes)}분`;
    }

    return `${hours}시간 ${minutes}분`;
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
    context: PaywallSegmentConfig['key'];
    userId?: string;
    hasReturnOffer?: boolean;
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
                    hasReturnOffer: input.hasReturnOffer,
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
    const [selectedPlanType, setSelectedPlanType] = useState<SubscriptionPlanType>('ANNUAL');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [returnOfferExpiry, setReturnOfferExpiry] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const shouldReduceMotion = useReducedMotion();
    const displayName = getDisplayName(session?.user?.name);
    const baseSegment = SEGMENT_CONFIGS[source];
    const hasReturnOffer = returnOfferExpiry !== null && returnOfferExpiry > currentTime;
    const activeSegment = hasReturnOffer ? RETURN_SEGMENT : baseSegment;
    const resolvedDefaultPlanType = defaultPlanType ?? baseSegment.recommendedPlan;

    useEffect(() => {
        if (!isOpen) return;

        const activeOffer = readReturnOfferExpiry();
        setReturnOfferExpiry(activeOffer);
        setSelectedPlanType(activeOffer ? RETURN_SEGMENT.recommendedPlan : resolvedDefaultPlanType);
        setErrorMessage(null);
        setIsLoading(false);
        setCurrentTime(Date.now());
    }, [isOpen, resolvedDefaultPlanType]);

    useEffect(() => {
        if (!isOpen || !hasReturnOffer) return undefined;

        const timer = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 60000);

        return () => {
            window.clearInterval(timer);
        };
    }, [hasReturnOffer, isOpen]);

    const handleDismiss = useCallback(() => {
        if (isLoading) return;

        const expiresAt = Date.now() + RETURN_OFFER_WINDOW_MS;
        writeReturnOfferExpiry(expiresAt);
        setReturnOfferExpiry(expiresAt);
        onClose();
    }, [isLoading, onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const previousBodyPosition = document.body.style.position;
        const previousBodyTop = document.body.style.top;
        const previousBodyWidth = document.body.style.width;
        const previousBodyLeft = document.body.style.left;
        const previousBodyRight = document.body.style.right;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;
        const scrollY = window.scrollY;
        const lenis = window.__lenis;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                handleDismiss();
            }
        };

        lenis?.stop();
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.overscrollBehavior = 'none';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            lenis?.start();
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
            document.body.style.overflow = previousOverflow;
            document.body.style.position = previousBodyPosition;
            document.body.style.top = previousBodyTop;
            document.body.style.width = previousBodyWidth;
            document.body.style.left = previousBodyLeft;
            document.body.style.right = previousBodyRight;
            window.scrollTo(0, scrollY);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDismiss, isLoading, isOpen]);

    const orderedPlans = useMemo(
        () => activeSegment.planOrder.map((planType) => PLAN_OPTIONS[planType]),
        [activeSegment]
    );

    const selectedPlan = useMemo(
        () => PLAN_OPTIONS[selectedPlanType] ?? orderedPlans[0],
        [orderedPlans, selectedPlanType]
    );

    const offerCountdownLabel = useMemo(() => {
        if (!hasReturnOffer || !returnOfferExpiry) return null;
        return formatOfferCountdown(returnOfferExpiry, currentTime);
    }, [currentTime, hasReturnOffer, returnOfferExpiry]);

    const trackOpenEvent = useCallback(async () => {
        const viewSignature = `${source}:${activeSegment.key}:${pathname}:${hasReturnOffer ? 'return' : 'base'}`;
        if (viewSignatureRef.current === viewSignature) {
            return;
        }

        viewSignatureRef.current = viewSignature;
        await postGrowthEvent({
            event: 'paywall_open',
            source,
            path: pathname,
            plan: activeSegment.recommendedPlan,
            context: activeSegment.key,
            userId: session?.user?.id,
            hasReturnOffer,
        });
    }, [activeSegment.key, activeSegment.recommendedPlan, hasReturnOffer, pathname, session?.user?.id, source]);

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
                context: activeSegment.key,
                userId: session?.user?.id,
                hasReturnOffer,
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

            clearReturnOfferExpiry();
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
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(2,6,23,0.82)] p-3 backdrop-blur-md sm:items-center sm:p-4"
                    data-lenis-prevent=""
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
                        className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#f0d487]/20 bg-[radial-gradient(circle_at_top_left,rgba(244,216,138,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.22),transparent_26%),linear-gradient(155deg,#060914,#0d1322_48%,#0a0f1d)] shadow-[0_32px_120px_rgba(0,0,0,0.52)] overscroll-contain sm:max-h-[calc(100dvh-2rem)]"
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

                        <div
                            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-7 md:p-8 lg:p-10"
                            data-lenis-prevent=""
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,0.78fr)] xl:gap-8 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
                                <div>
                                    <div className="mb-6 max-w-4xl">
                                        <div className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#f0d487]/25 bg-[#f0d487]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                            <Sparkles size={14} />
                                            {activeSegment.badge}
                                        </div>

                                        {hasReturnOffer && offerCountdownLabel && (
                                            <motion.div
                                                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                                className="mb-5 rounded-[24px] border border-[#f4d88a]/30 bg-[linear-gradient(135deg,rgba(244,216,138,0.18),rgba(99,102,241,0.14))] px-4 py-4 shadow-[0_18px_50px_rgba(212,175,55,0.14)]"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f4d88a]/25 bg-[#f4d88a]/12 text-[#f4d88a]">
                                                            <Stars size={18} />
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">24시간 리턴 오퍼가 열려 있습니다</p>
                                                            <p className="mt-1 text-xs leading-6 text-white/68">
                                                                가장 낮은 진입 가격의 주간 스타터를 우선 노출했습니다. 부담 없이 다시 시작할 수 있는 창이 아직 남아 있습니다.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-[#fff1bf]">
                                                        남은 시간 {offerCountdownLabel}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <h2
                                            id="subscription-modal-title"
                                            className="font-cinzel text-3xl leading-tight text-white sm:text-4xl"
                                        >
                                            {displayName ? `${displayName}님,` : '지금'}
                                            <span className="block bg-gradient-to-r from-[#fff4cf] via-[#f4d88a] to-[#c7a243] bg-clip-text text-transparent">
                                                {activeSegment.headline}
                                            </span>
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                                            {activeSegment.body}
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

                                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                        {orderedPlans.map((plan, index) => {
                                            const isSelected = selectedPlanType === plan.id;
                                            const Icon = PLAN_ICONS[plan.id];
                                            const isRecommended = plan.id === activeSegment.recommendedPlan;

                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanType(plan.id)}
                                                    aria-pressed={isSelected}
                                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                                    transition={{ delay: shouldReduceMotion ? 0 : index * 0.05, duration: 0.25 }}
                                                    className={`group relative flex min-h-[320px] h-full cursor-pointer flex-col overflow-hidden rounded-[30px] border p-5 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/70 ${
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
                                                        <div className="flex min-w-0 items-center gap-3">
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
                                                                <p className="mt-1 break-keep text-xl font-semibold leading-tight text-white">
                                                                    {plan.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {isRecommended && (
                                                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                                    {hasReturnOffer ? '24h 특가' : '지금 추천'}
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
                                                        <p className="text-[2.8rem] font-semibold leading-[1.02] tracking-tight text-[#f4d88a]">
                                                            {plan.priceLabel}
                                                        </p>
                                                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                                                            {plan.billingLabel}
                                                        </p>
                                                    </div>

                                                    <div className="mt-auto space-y-3">
                                                        <p className="break-keep text-sm leading-7 text-white/72">{plan.description}</p>
                                                        <div className="rounded-[22px] border border-white/10 bg-black/15 px-4 py-3">
                                                            <p className="break-keep text-sm font-semibold text-white">{plan.valueLabel}</p>
                                                            <p className="mt-1 break-keep text-xs leading-6 text-white/56">{plan.supportingLabel}</p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="xl:pt-10">
                                    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6 xl:sticky xl:top-0">
                                        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                                    Selected Plan
                                                </p>
                                                <h3 className="mt-2 break-keep font-cinzel text-2xl text-white">
                                                    {selectedPlan.name}
                                                </h3>
                                            </div>
                                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65">
                                                {selectedPlan.billingLabel}
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-[#f4d88a]/18 bg-[#f4d88a]/8 px-4 py-4">
                                            <p className="break-keep text-sm font-semibold text-white">{selectedPlan.valueLabel}</p>
                                            <p className="mt-2 break-keep text-xs leading-6 text-white/62">
                                                {selectedPlan.commitmentNote}
                                            </p>
                                        </div>

                                        <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                {activeSegment.insightLabel}
                                            </p>
                                            <p className="mt-2 break-keep text-sm leading-7 text-white/72">
                                                {activeSegment.insightBody}
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <p className="text-sm font-semibold text-white">이번 결제에서 바로 열리는 혜택</p>
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
                                                            <span className="break-keep leading-6">{benefit}</span>
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
                                            <span className="break-keep text-center">
                                                {isLoading ? 'Stripe Checkout 준비 중...' : `${selectedPlan.priceLabel}으로 시작하기`}
                                            </span>
                                            {!isLoading && <ArrowRight size={18} />}
                                        </motion.button>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Activation
                                                </p>
                                                <p className="mt-2 break-keep text-sm leading-6 text-white/68">
                                                    결제 직후 구독 상태가 반영되면 `/my`, `/daily`, Oracle Chat에서 바로 확인할 수 있습니다.
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Experiment Note
                                                </p>
                                                <p className="mt-2 break-keep text-sm leading-6 text-white/68">
                                                    현재 모달은 진입 위치에 따라 추천 플랜과 카피가 달라집니다. checkout start는 growth event로 함께 기록됩니다.
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-center text-xs leading-6 text-white/45">
                                            결제는 Stripe Checkout으로 이동해 진행됩니다. 선택한 플랜만 서버에 전송되며, 현재 계약은 USD 기준으로 유지됩니다.
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
