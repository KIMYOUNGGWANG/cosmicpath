'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ScrollText, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getReadingFallbackPriceLabel, normalizePriceLabel, READING_PRODUCT } from '@/lib/payment/payment-config';
import { PromoCodeInput } from './PromoCodeInput';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentStart?: () => void;
    readingData?: Record<string, unknown>;
    currentReport?: unknown; // To persist Phase 1-2 results
    metadata?: {
        language?: 'ko' | 'en';
        inviteCode?: string;
        readingId?: string;
        [key: string]: unknown;
    };
    isDecisionAccepted?: boolean;
    price?: string;
    trackingSource?: string;
    autoReferralCode?: string;
}

const modalSpring = {
    type: 'spring',
    stiffness: 260,
    damping: 24,
} as const;

export function PaymentModal({
    isOpen,
    onClose,
    onPaymentStart,
    readingData,
    currentReport,
    metadata,
    isDecisionAccepted,
    price,
    trackingSource = 'payment_modal',
    autoReferralCode,
}: PaymentModalProps) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
    const isEnglish = metadata?.language === 'en' || readingData?.language === 'en';
    const getStoredReadingAccessKey = () => {
        if (typeof window === 'undefined') return null;
        return (
            sessionStorage.getItem('pending_reading_access_key') ||
            localStorage.getItem('pending_reading_access_key')
        );
    };

    const fallbackPriceLabel = getReadingFallbackPriceLabel();
    const resolvedPriceProp = normalizePriceLabel(price);
    const [fetchedPrice, setFetchedPrice] = useState<string | null>(null);
    const [isPriceLoading, setIsPriceLoading] = useState(false);
    const [hasPriceFetchError, setHasPriceFetchError] = useState(false);
    const dynamicPrice = resolvedPriceProp || normalizePriceLabel(fetchedPrice) || fallbackPriceLabel;
    const numericDynamicPrice = Number.parseFloat(dynamicPrice.replace(/[^0-9.]/g, ''));
    const discountedPriceLabel =
        discount > 0 && discount < 100 && Number.isFinite(numericDynamicPrice)
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(numericDynamicPrice * ((100 - discount) / 100))
            : null;
    const effectivePriceLabel =
        discount === 100 ? 'FREE' : discountedPriceLabel || dynamicPrice;

    // Fetch live price when the modal opens, but keep a stable fallback label.
    useEffect(() => {
        if (!isOpen) return;
        if (resolvedPriceProp) {
            setFetchedPrice(null);
            setIsPriceLoading(false);
            setHasPriceFetchError(false);
            return;
        }

        let isMounted = true;
        setIsPriceLoading(true);
        setHasPriceFetchError(false);

        fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`, { cache: 'no-store' })
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok || !normalizePriceLabel(data.formattedPrice)) {
                    throw new Error('Failed to load reading price');
                }

                if (isMounted) {
                    setFetchedPrice(data.formattedPrice);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setHasPriceFetchError(true);
                }
                console.error('Failed to fetch price:', error);
            })
            .finally(() => {
                if (isMounted) {
                    setIsPriceLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, resolvedPriceProp]);

    const resolvedAutoReferralCode = (() => {
        if (autoReferralCode?.trim()) return autoReferralCode.trim().toUpperCase();
        if (typeof window === 'undefined') return null;

        const params = new URLSearchParams(window.location.search);
        const candidate =
            params.get('referralCode') ||
            params.get('ref') ||
            params.get('promo');

        return candidate?.trim() ? candidate.trim().toUpperCase() : null;
    })();

    const trackPaywallClose = useCallback(
        (sourceSuffix?: string) =>
            trackClientGrowthEvent({
                event: 'paywall_close',
                source: sourceSuffix ? `${trackingSource}_${sourceSuffix}` : trackingSource,
                step: 'payment_modal',
                language: metadata?.language,
                context: readingData?.context as string | undefined,
                invitationMode: Boolean(metadata?.inviteCode),
                referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                price: effectivePriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: READING_PRODUCT.id,
            }),
        [appliedReferralCode, effectivePriceLabel, metadata, readingData, resolvedAutoReferralCode, trackingSource]
    );

    useEffect(() => {
        if (!isOpen) return;

        void trackClientGrowthEvent({
            event: 'paywall_open',
            source: trackingSource,
            step: 'payment_modal',
            language: metadata?.language,
            context: readingData?.context as string | undefined,
            invitationMode: Boolean(metadata?.inviteCode),
            referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
            price: effectivePriceLabel,
            readingId:
                sessionStorage.getItem('pending_reading_id') ||
                (typeof metadata?.readingId === 'string' ? metadata.readingId : undefined),
            plan: READING_PRODUCT.id,
        });
    }, [appliedReferralCode, effectivePriceLabel, isOpen, metadata, readingData, resolvedAutoReferralCode, trackingSource]);

    // Handle browser back button - close modal instead of navigating away
    useEffect(() => {
        if (!isOpen) return;

        const modalState = { modalType: 'payment', modalOpen: true };
        window.history.pushState(modalState, '');

        const handlePopState = () => {
            if (isOpen) {
                void trackPaywallClose('back');
                onClose();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, onClose, trackPaywallClose]);

    // Handle close with history cleanup
    const handleClose = useCallback(() => {
        if (window.history.state?.modalType === 'payment') {
            window.history.back();
        } else {
            void trackPaywallClose();
            onClose();
        }
    }, [onClose, trackPaywallClose]);

    const handlePayment = async () => {
        // 이메일 유효성 검사 (프로모션 100% 할인이 아닐 때만 필수)
        const isFreePromo = discount === 100 && promoCodeId;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (isFreePromo) {
            if (!email) {
                setEmailError('무료 쿠폰 사용 시 이메일 주소가 필요합니다.');
                return;
            }
            if (!emailRegex.test(email)) {
                setEmailError('올바른 이메일 형식이 아닙니다.');
                return;
            }
        } else if (email && !emailRegex.test(email)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        setIsLoading(true);
        try {
            // 1. 사전 처리 (데이터 저장)
            if (readingData) {
                sessionStorage.setItem('pending_reading_data', JSON.stringify(readingData));
            }
            if (currentReport) {
                sessionStorage.setItem('pending_report_data', JSON.stringify(currentReport));
            }
            if (metadata) {
                sessionStorage.setItem('pending_metadata', JSON.stringify(metadata));
            }
            if (isDecisionAccepted) {
                sessionStorage.setItem('decision_accepted', 'true');
            }
            sessionStorage.setItem('is_session_active', 'true');
            if (email) {
                localStorage.setItem('user_email', email);
            }

            onPaymentStart?.();

            let readingId = sessionStorage.getItem('pending_reading_id');

            await trackClientGrowthEvent({
                event: 'checkout_start',
                source: trackingSource,
                step: 'payment_modal',
                language: metadata?.language,
                context: readingData?.context as string | undefined,
                invitationMode: Boolean(metadata?.inviteCode),
                referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                price: effectivePriceLabel,
                readingId: readingId || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    emailProvided: Boolean(email),
                    discount,
                    promoCodeId,
                },
            });

            // [CRITICAL FIX] If readingId is missing (users who jump to payment early),
            // we MUST save to DB first to generate an ID. Otherwise, the webhook has nothing to link to.
            if (!readingId && currentReport) {
                try {
                    console.log('PaymentModal: No readingId found, saving pre-payment state to DB...');
                    const saveRes = await fetch('/api/reading/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            data: currentReport,
                            accessKey: getStoredReadingAccessKey() || undefined,
                            metadata: {
                                ...metadata,
                                readingData,
                                isPremium: false, // Not premium yet
                                email: email, // Capture email early
                                paymentSource: 'stripe_pending'
                            }
                        })
                    });

                    if (saveRes.ok) {
                        const saved = await saveRes.json();
                        if (saved.accessKey) {
                            sessionStorage.setItem('pending_reading_access_key', saved.accessKey);
                            localStorage.setItem('pending_reading_access_key', saved.accessKey);
                        }
                        if (saved.id) {
                            readingId = saved.id;
                            sessionStorage.setItem('pending_reading_id', saved.id);
                            localStorage.setItem('pending_reading_id', saved.id);
                            console.log('PaymentModal: Generated new readingId:', saved.id);
                        }
                    }
                } catch (saveErr) {
                    console.error('PaymentModal: Failed to save pre-payment state', saveErr);
                }
            }

            // 2. 프로모션 코드 (무료) 처리
            if (discount === 100 && promoCodeId) {
                const redeemResponse = await fetch('/api/promo/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        codeId: promoCodeId,
                        email: email || localStorage.getItem('user_email') || '',
                        readingId: readingId || undefined,
                        userAgent: navigator.userAgent
                    }),
                });

                if (!redeemResponse.ok) {
                    const errorData = await redeemResponse.json();
                    throw new Error(errorData.message || '쿠폰 사용에 실패했습니다.');
                }

                // 성공 처리
                sessionStorage.setItem('payment_completed', 'true');
                sessionStorage.setItem('promo_user', 'true');
                sessionStorage.setItem('is_premium_user', 'true');

                await trackClientGrowthEvent({
                    event: 'checkout_success',
                    source: trackingSource,
                    step: 'payment_modal',
                    language: metadata?.language,
                    context: readingData?.context as string | undefined,
                    invitationMode: Boolean(metadata?.inviteCode),
                    referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                    price: 'FREE',
                    readingId: readingId || undefined,
                    plan: 'promo_free_unlock',
                });

                // 모달 닫고 페이지 이동
                onClose();
                window.location.href = `/start?paid=true${readingId ? `&reading_id=${readingId}` : ''}`;
                return;
            }

            // 3. Stripe 결제 세션 생성 요청
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: READING_PRODUCT.productId,
                    email,
                    readingId: readingId || undefined,
                    referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                    promoCodeId: promoCodeId || undefined,
                    discount: discount || undefined,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create payment session');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.';
            console.error('Payment error:', error);
            await trackClientGrowthEvent({
                event: 'checkout_failure',
                source: trackingSource,
                step: 'payment_modal',
                language: metadata?.language,
                context: readingData?.context as string | undefined,
                invitationMode: Boolean(metadata?.inviteCode),
                referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                price: effectivePriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    message,
                },
            });
            alert(`결제 오류: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isFreePromo = discount === 100 && promoCodeId;
    const showPriceLoadingState = !resolvedPriceProp && isPriceLoading;
    const showPriceFallbackCopy = !resolvedPriceProp && hasPriceFetchError;
    const unlockBenefits = isEnglish
        ? [
            {
                title: 'Decision Deep Reading',
                description: 'Unlock the full interpretation across timing, pressure points, and your next action.',
                Icon: ScrollText,
            },
            {
                title: 'Saved Return Path',
                description: 'Your reading stays connected when you come back after checkout.',
                Icon: Sparkles,
            },
            {
                title: 'Stripe-secured',
                description: 'Checkout and card data are handled safely through Stripe.',
                Icon: ShieldCheck,
            },
        ]
        : [
            {
                title: '심화 결정 리딩',
                description: '타이밍, 핵심 압력, 다음 행동까지 이어지는 전체 해석을 엽니다.',
                Icon: ScrollText,
            },
            {
                title: '리딩 경로 보관',
                description: '결제 후 돌아와도 지금 질문의 리딩 경로가 그대로 이어집니다.',
                Icon: Sparkles,
            },
            {
                title: 'Stripe 안전 결제',
                description: '결제와 카드 정보는 Stripe Checkout에서 안전하게 처리됩니다.',
                Icon: ShieldCheck,
            },
        ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={modalSpring}
                        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f23] shadow-[0_0_50px_rgba(161,132,255,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(161,132,255,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%)]" />

                        {/* Close button */}
                        <motion.button
                            onClick={handleClose}
                            whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.12)' }}
                            whileTap={{ scale: 0.97 }}
                            className="absolute right-6 top-6 z-10 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A184FF]/70"
                        >
                            <X size={20} className="text-white/40" />
                        </motion.button>

                        <div className="relative p-8 md:p-12">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className="text-center mb-10"
                            >
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A184FF]/20 bg-[#A184FF]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#cbb5ff]">
                                    <Lock className="h-4 w-4" />
                                    {isEnglish ? 'Next Move Unlock' : '다음 행동 열기'}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {isEnglish ? 'Open Your Full Decision Reading' : '전체 결정 리딩 열기'}
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {isEnglish ? (
                                        <>
                                            The free summary ends here.<br />
                                            Your guide opens the deeper decision reading below.
                                        </>
                                    ) : (
                                        <>
                                            무료 요약은 여기까지입니다.<br />
                                            이제부터 오라클 가이드가 읽은 깊은 결정 리딩이 열립니다.
                                        </>
                                    )}
                                </p>
                                <div className="mt-6 inline-block rounded-full border border-[#A184FF]/20 bg-[#A184FF]/10 px-4 py-2 shadow-[0_0_24px_rgba(161,132,255,0.14)]">
                                    {discountedPriceLabel ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-white/35 line-through">{dynamicPrice}</span>
                                            <span className="text-[#A184FF] font-bold text-xl">{discountedPriceLabel}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#A184FF] font-bold text-xl">{effectivePriceLabel}</span>
                                    )}
                                </div>
                                <div className="mt-3 min-h-10 space-y-2">
                                    {showPriceLoadingState ? (
                                        <div className="flex items-center justify-center gap-2 text-xs text-white/45">
                                            <Skeleton className="h-2 w-14 rounded-full bg-white/10" />
                                            <span>
                                                {isEnglish
                                                    ? 'Syncing live Stripe price...'
                                                    : 'Stripe 실시간 가격을 확인하는 중입니다.'}
                                            </span>
                                        </div>
                                    ) : null}
                                    {showPriceFallbackCopy ? (
                                        <p className="text-xs text-white/45">
                                            {isEnglish
                                                ? 'Live pricing is delayed, so the base launch price is shown for now.'
                                                : '실시간 가격 확인이 지연되어 기본 런치 가격으로 먼저 표시합니다.'}
                                        </p>
                                    ) : null}
                                    {discountedPriceLabel ? (
                                        <p className="text-xs font-medium text-emerald-300">
                                            {discount}% 할인 코드가 적용되었습니다.
                                        </p>
                                    ) : null}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
                            >
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A184FF]">
                                    {isEnglish ? 'What Opens Next' : '결제 후 열리는 판단 흐름'}
                                </p>
                                <ul className="space-y-2 text-sm text-white/75">
                                    <li>{isEnglish ? 'The strongest action window behind your current question' : '현재 질문 뒤에서 가장 강하게 열리는 행동의 창'}</li>
                                    <li>{isEnglish ? 'A cross-domain reading spanning relationship, career, money, and daily flow' : '관계, 커리어, 재물, 일상 흐름을 함께 읽는 교차 리딩'}</li>
                                    <li>{isEnglish ? 'A next-move guide where saju, astrology, and tarot converge' : '사주, 점성술, 타로가 겹치는 지점에서 도출한 다음 행동 가이드'}</li>
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.12 }}
                                className="mb-6 grid gap-3 sm:grid-cols-3"
                            >
                                {unlockBenefits.map(({ title, description, Icon }) => (
                                    <div
                                        key={title}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
                                    >
                                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A184FF]/20 bg-[#A184FF]/10 text-[#cbb5ff]">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <p className="text-sm font-semibold text-white">{title}</p>
                                        <p className="mt-2 text-xs leading-6 text-white/56">{description}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.14 }}
                                className="mb-6"
                            >
                                <label className="block text-xs font-semibold text-[#A184FF] mb-3 ml-1 uppercase tracking-widest">
                                    {isEnglish ? 'Email for your oracle link' : '오라클 링크를 받아볼 이메일'}
                                    {isFreePromo ? <span className="text-red-400 ml-1">*</span> : <span className="text-white/30 ml-2 normal-case">(optional)</span>}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError(null);
                                    }}
                                    placeholder={isFreePromo
                                        ? 'name@example.com'
                                        : (isEnglish
                                            ? 'Optional: receive your oracle link by email'
                                            : '선택: 결제 후 오라클 링크를 이메일로 받기')}
                                    className={`w-full rounded-2xl border bg-white/5 px-5 py-4 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow,background-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A184FF]/40 ${emailError
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-white/10 focus:border-[#A184FF]/50 hover:border-white/15 hover:bg-white/[0.06]'
                                        }`}
                                />
                                {emailError && (
                                    <p className="text-red-400 text-xs mt-2 ml-1 animate-pulse">
                                        {emailError}
                                    </p>
                                )}
                            </motion.div>

                            {/* Promo Code Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.18 }}
                                className="mb-8"
                            >
                                <PromoCodeInput
                                    email={email}
                                    initialCode={resolvedAutoReferralCode || undefined}
                                    autoApply={isOpen}
                                    onApply={(id, discount, code) => {
                                        setPromoCodeId(id);
                                        setDiscount(discount);
                                        setAppliedReferralCode(code);
                                        // 무료 쿠폰 적용 시 에러 클리어
                                        if (discount === 100) setEmailError(null);
                                    }}
                                    disabled={isLoading}
                                />
                            </motion.div>

                            <motion.button
                                onClick={handlePayment}
                                disabled={isLoading}
                                whileHover={isLoading ? undefined : { y: -2, boxShadow: Number(discount) === 100 ? '0 18px 44px rgba(16,185,129,0.28)' : '0 18px 44px rgba(139,92,246,0.28)' }}
                                whileTap={isLoading ? undefined : { scale: 0.985 }}
                                className={`w-full py-4 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg
                                    ${Number(discount) === 100
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] shadow-[#8B5CF6]/30'
                                    } text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#A184FF]/60`}
                            >
                                {isLoading
                                    ? (isEnglish ? 'Processing...' : '처리 중...')
                                    : (Number(discount) === 100
                                        ? (isEnglish ? 'Open for Free' : '무료로 오라클 열기')
                                        : (isEnglish ? 'Open Full Decision Reading' : '전체 결정 리딩 열기'))}
                            </motion.button>

                            <p className="mt-4 text-center text-xs text-white/35">
                                {isEnglish
                                    ? 'Checkout is handled by Stripe. Your reading stays saved, so your decision path is still here when you return.'
                                    : '결제는 Stripe에서 안전하게 처리되며, 나중에 다시 와도 현재 질문의 리딩 경로는 그대로 유지됩니다.'}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
