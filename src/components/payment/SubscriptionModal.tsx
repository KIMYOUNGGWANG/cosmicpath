'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { SubscriptionPlanId } from '@/lib/payment/payment-config';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlanId?: SubscriptionPlanId;
    successPath?: string;
    cancelPath?: string;
    onCheckoutStart?: (planId: SubscriptionPlanId) => void;
}

interface PlanOption {
    id: SubscriptionPlanId;
    name: string;
    description: string;
    priceLabel: string;
    badge?: string;
    benefits: string[];
}

const PLAN_OPTIONS: PlanOption[] = [
    {
        id: 'pro_monthly',
        name: 'CosmicPath Pro 월간',
        description: '매일 업데이트되는 개인 맞춤 운세 + Oracle 혜택',
        priceLabel: '$7.99 / month',
        benefits: ['Daily Fortune', '프리미엄 전용 인사이트', 'Oracle 혜택'],
    },
    {
        id: 'pro_yearly',
        name: 'CosmicPath Pro 연간',
        description: '연간 구독 할인으로 가장 높은 가성비',
        priceLabel: '$49.99 / year',
        badge: '40% OFF',
        benefits: ['월 대비 40%+ 절약', 'Daily Fortune', '프리미엄 전용 인사이트'],
    },
    {
        id: 'couple_monthly',
        name: 'Couple 월간',
        description: '연애/궁합 중심 실시간 커플 리포트',
        priceLabel: '$10.99 / month',
        benefits: ['커플 전용 리포트', '관계 변화 추적', '공유 가능한 커플 인사이트'],
    },
];

function buildAbsoluteUrl(path: string, origin: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function SubscriptionModal({
    isOpen,
    onClose,
    defaultPlanId = 'pro_yearly',
    successPath = '/billing/success',
    cancelPath = '/billing/cancel',
    onCheckoutStart,
}: SubscriptionModalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(defaultPlanId);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedPlanId(defaultPlanId);
            setErrorMessage(null);
            setIsLoading(false);
        }
    }, [defaultPlanId, isOpen]);

    const selectedPlan = useMemo(
        () => PLAN_OPTIONS.find((plan) => plan.id === selectedPlanId) ?? PLAN_OPTIONS[0],
        [selectedPlanId]
    );

    const handleStartCheckout = async () => {
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const origin = window.location.origin;
            onCheckoutStart?.(selectedPlanId);

            const response = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: selectedPlanId,
                    successUrl: buildAbsoluteUrl(successPath, origin),
                    cancelUrl: buildAbsoluteUrl(cancelPath, origin),
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error?.message || '구독 결제 세션 생성에 실패했습니다.');
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
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0f0f23] shadow-[0_0_40px_rgba(139,92,246,0.2)] overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-5 top-5 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
                            aria-label="Close subscription modal"
                        >
                            <X size={18} className="text-white/60" />
                        </button>

                        <div className="p-7 md:p-10">
                            <div className="mb-6 md:mb-8">
                                <p className="text-xs uppercase tracking-[0.22em] text-[#A184FF] font-semibold mb-3">
                                    Cosmic+ Membership
                                </p>
                                <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">
                                    구독 플랜을 선택하세요
                                </h2>
                                <p className="text-white/65 text-sm md:text-base">
                                    언제든 취소 가능하며, 결제는 Stripe Checkout에서 안전하게 진행됩니다.
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3 mb-8">
                                {PLAN_OPTIONS.map((plan) => {
                                    const isSelected = selectedPlanId === plan.id;
                                    return (
                                        <button
                                            type="button"
                                            key={plan.id}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                            className={`text-left rounded-2xl border p-4 transition-all ${isSelected
                                                ? 'border-[#A184FF] bg-[#A184FF]/10 shadow-[0_10px_30px_rgba(161,132,255,0.18)]'
                                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-semibold text-sm">{plan.name}</span>
                                                {plan.badge && (
                                                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold">
                                                        {plan.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#A184FF] font-bold text-base mb-2">{plan.priceLabel}</p>
                                            <p className="text-white/60 text-xs">{plan.description}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">
                                <p className="text-white font-semibold mb-3">포함 혜택</p>
                                <ul className="space-y-2">
                                    {selectedPlan.benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-center gap-2 text-sm text-white/75">
                                            <Check size={14} className="text-emerald-300" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {errorMessage && (
                                <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleStartCheckout}
                                disabled={isLoading}
                                className="w-full rounded-2xl py-4 font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] disabled:opacity-60 transition-opacity"
                            >
                                {isLoading ? 'Stripe Checkout 준비 중...' : `${selectedPlan.priceLabel} 시작하기`}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
