'use client';

import { useEffect, useMemo, useState } from 'react';
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
import type { SubscriptionPlanType } from '@/lib/payment/payment-config';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlanType?: SubscriptionPlanType;
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
    badge?: string;
    benefits: string[];
    commitmentNote: string;
}

const PLAN_OPTIONS: PlanOption[] = [
    {
        id: 'MONTHLY',
        eyebrow: 'Flexible Start',
        name: '월간 멤버십',
        description: '가볍게 시작하고 바로 프리미엄 기능을 열어보세요.',
        priceLabel: '$9.99 / month',
        billingLabel: 'Cancel anytime',
        valueLabel: '가장 빠르게 프리미엄을 시작하는 옵션',
        supportingLabel: '짧게 경험해보고 싶은 사용자에게 적합',
        benefits: ['무제한 Oracle Chat', '프리미엄 테마', '월간 인사이트 업데이트'],
        commitmentNote: '이번 달 바로 시작하고, 흐름이 맞는지 유연하게 확인할 수 있습니다.',
    },
    {
        id: 'ANNUAL',
        eyebrow: 'Best Value',
        name: '연간 멤버십',
        description: '장기 이용자에게 가장 유리한 할인율로 프리미엄 기능을 계속 유지합니다.',
        priceLabel: '$49.99 / year',
        billingLabel: 'About $0.14 / day',
        valueLabel: '월간 대비 $69.89 절약',
        supportingLabel: '연간 기준 월 환산 약 $4.17',
        badge: '추천',
        benefits: ['월간 대비 $69.89 절약', '무제한 Oracle Chat', '프리미엄 테마 + 월간 리포트'],
        commitmentNote: '1년 동안 가장 낮은 총비용으로 핵심 기능을 계속 유지할 수 있습니다.',
    },
];

const BENEFIT_ICONS = [MessageCircle, Palette, CalendarDays] as const;

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
        title: 'Designed to keep',
        description: '월간은 가볍게, 연간은 가장 큰 절약으로 계속 유지할 수 있습니다.',
        Icon: Crown,
    },
] as const;

export function SubscriptionModal({
    isOpen,
    onClose,
    defaultPlanType = 'ANNUAL',
    onCheckoutStart,
}: SubscriptionModalProps) {
    const [selectedPlanType, setSelectedPlanType] = useState<SubscriptionPlanType>(defaultPlanType);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (isOpen) {
            setSelectedPlanType(defaultPlanType);
            setErrorMessage(null);
            setIsLoading(false);
        }
    }, [defaultPlanType, isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isLoading, isOpen, onClose]);

    const selectedPlan = useMemo(
        () => PLAN_OPTIONS.find((plan) => plan.id === selectedPlanType) ?? PLAN_OPTIONS[0],
        [selectedPlanType]
    );

    const handleStartCheckout = async () => {
        setErrorMessage(null);
        setIsLoading(true);

        try {
            onCheckoutStart?.(selectedPlanType);

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
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,0.82)] p-3 backdrop-blur-md sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="subscription-modal-title"
                        className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#f0d487]/20 bg-[radial-gradient(circle_at_top_left,rgba(244,216,138,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.22),transparent_26%),linear-gradient(155deg,#060914,#0d1322_48%,#0a0f1d)] shadow-[0_32px_120px_rgba(0,0,0,0.52)] max-h-[92vh] overscroll-contain"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f4d88a]/70 to-transparent" />
                        <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-[#f4d88a]/10 blur-3xl" />
                        <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-[background-color,border-color,color,transform] duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/70"
                            aria-label="구독 모달 닫기"
                        >
                            <X size={18} />
                        </button>

                        <div className="max-h-[92vh] overflow-y-auto p-5 sm:p-7 md:p-8 lg:p-10">
                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] xl:gap-8">
                                <div>
                                    <div className="mb-6 max-w-3xl">
                                        <div className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-[#f0d487]/25 bg-[#f0d487]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                            <Sparkles size={14} />
                                            CosmicPath Membership
                                        </div>
                                        <h2
                                            id="subscription-modal-title"
                                            className="font-cinzel text-3xl leading-tight text-white sm:text-4xl"
                                        >
                                            구독으로 CosmicPath의 흐름을
                                            <span className="block bg-gradient-to-r from-[#fff4cf] via-[#f4d88a] to-[#c7a243] bg-clip-text text-transparent">
                                                끊기지 않게 유지하세요
                                            </span>
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                                            무료 사용량 이후에도 무제한 Oracle Chat, 프리미엄 테마, 월간 인사이트를 계속 사용할 수 있습니다.
                                            지금 가장 잘 맞는 멤버십을 선택하면 결제는 Stripe Checkout에서 안전하게 이어집니다.
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
                                        {PLAN_OPTIONS.map((plan) => {
                                            const isSelected = selectedPlanType === plan.id;
                                            return (
                                                <button
                                                    type="button"
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanType(plan.id)}
                                                    aria-pressed={isSelected}
                                                    className={`group relative min-h-[268px] cursor-pointer overflow-hidden rounded-[30px] border p-5 text-left transition-[transform,border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/70 ${isSelected
                                                        ? 'border-[#f4d88a]/60 bg-[linear-gradient(180deg,rgba(244,216,138,0.14),rgba(244,216,138,0.05))] shadow-[0_20px_45px_rgba(212,175,55,0.16)]'
                                                        : 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
                                                    <div className="mb-5 flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${isSelected
                                                                    ? 'border-[#f4d88a]/35 bg-[#f4d88a]/14 text-[#f4d88a]'
                                                                    : 'border-white/10 bg-white/5 text-white/65'
                                                                    }`}
                                                            >
                                                                {plan.id === 'ANNUAL' ? <Crown size={20} /> : <Sparkles size={20} />}
                                                            </span>
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#f4d88a]/80">
                                                                    {plan.eyebrow}
                                                                </p>
                                                                <p className="mt-1 text-lg font-semibold text-white">{plan.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {plan.badge && (
                                                                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                                    {plan.badge}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${isSelected
                                                                    ? 'border-[#f4d88a]/50 bg-[#f4d88a]/20 text-[#fef3c7]'
                                                                    : 'border-white/15 bg-transparent text-transparent'
                                                                    }`}
                                                            >
                                                                <Check size={12} />
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-5">
                                                        <p className="text-3xl font-semibold tracking-tight text-[#f4d88a]">
                                                            {plan.priceLabel}
                                                        </p>
                                                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                                                            {plan.billingLabel}
                                                        </p>
                                                    </div>

                                                    <p className="mb-3 text-sm leading-7 text-white/72">{plan.description}</p>
                                                    <div className="rounded-[22px] border border-white/10 bg-black/15 px-4 py-3">
                                                        <p className="text-sm font-semibold text-white">{plan.valueLabel}</p>
                                                        <p className="mt-1 text-xs leading-6 text-white/56">{plan.supportingLabel}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="xl:pt-10">
                                    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                                        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f4d88a]">
                                                    Selected Plan
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

                                        <button
                                            type="button"
                                            onClick={handleStartCheckout}
                                            disabled={isLoading}
                                            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f8e7aa] via-[#d4af37] to-[#b8902f] px-5 py-4 text-base font-bold text-[#111111] shadow-[0_18px_40px_rgba(212,175,55,0.2)] transition-[transform,box-shadow,filter,opacity] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(212,175,55,0.28)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d88a]/80"
                                        >
                                            <span>{isLoading ? 'Stripe Checkout 준비 중...' : `${selectedPlan.priceLabel}으로 시작하기`}</span>
                                            {!isLoading && <ArrowRight size={18} />}
                                        </button>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Activation
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-white/68">
                                                    결제 직후 구독 상태가 반영되면 `/my`와 Oracle Chat에서 바로 확인할 수 있습니다.
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4d88a]/80">
                                                    Billing Flow
                                                </p>
                                                <p className="mt-2 text-sm leading-6 text-white/68">
                                                    관리 페이지에서 상태를 다시 확인하고 이후 구독 관리 액션과도 연결됩니다.
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
