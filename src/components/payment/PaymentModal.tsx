'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
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
    checkoutConfig?: {
        productId?: string;
        paymentType?: 'premium_reading' | 'career_report';
        successPath?: string;
        cancelPath?: string;
        metadata?: Record<string, string>;
    };
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
    checkoutConfig,
}: PaymentModalProps) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
    const isEnglish = metadata?.language === 'en' || readingData?.language === 'en';
    const resolvedProductId = checkoutConfig?.productId || READING_PRODUCT.productId;

    // Dynamic price from prop or fetched from API
    const [fetchedPrice, setFetchedPrice] = useState<string>('');
    const dynamicPrice = price || fetchedPrice || '...';
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

    // Fetch price from Stripe when modal opens (if not provided via prop)
    useEffect(() => {
        if (isOpen && !price) {
            fetch(`/api/payment/price?productId=${resolvedProductId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.formattedPrice) {
                        setFetchedPrice(data.formattedPrice);
                    }
                })
                .catch(err => console.error('Failed to fetch price:', err));
        }
    }, [isOpen, price, resolvedProductId]);

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
                price: effectivePriceLabel !== '...' ? effectivePriceLabel : undefined,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: READING_PRODUCT.id,
            }),
        [appliedReferralCode, effectivePriceLabel, metadata, readingData, resolvedAutoReferralCode, trackingSource]
    );

    useBodyScrollLock(isOpen);

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
            price: effectivePriceLabel !== '...' ? effectivePriceLabel : undefined,
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
            const persistPendingValue = (key: string, value: string) => {
                sessionStorage.setItem(key, value);
                localStorage.setItem(key, value);
            };

            // 1. 사전 처리 (데이터 저장)
            if (readingData) {
                persistPendingValue('pending_reading_data', JSON.stringify(readingData));
            }
            if (currentReport) {
                persistPendingValue('pending_report_data', JSON.stringify(currentReport));
            }
            if (metadata) {
                persistPendingValue('pending_metadata', JSON.stringify(metadata));
            }
            if (isDecisionAccepted) {
                persistPendingValue('decision_accepted', 'true');
            }
            persistPendingValue('is_session_active', 'true');
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
                price: effectivePriceLabel !== '...' ? effectivePriceLabel : undefined,
                readingId: readingId || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : (checkoutConfig?.paymentType || READING_PRODUCT.id),
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
                            metadata: {
                                ...metadata,
                                isPremium: false, // Not premium yet
                                email: email, // Capture email early
                                paymentSource: 'stripe_pending'
                            }
                        })
                    });

                    if (saveRes.ok) {
                        const saved = await saveRes.json();
                        if (saved.id) {
                            readingId = saved.id;
                            sessionStorage.setItem('pending_reading_id', saved.id);
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
                    productId: resolvedProductId,
                    email,
                    readingId: readingId || undefined,
                    referralCode: appliedReferralCode || resolvedAutoReferralCode || undefined,
                    promoCodeId: promoCodeId || undefined,
                    discount: discount || undefined,
                    successPath: checkoutConfig?.successPath,
                    cancelPath: checkoutConfig?.cancelPath,
                    paymentType: checkoutConfig?.paymentType,
                    checkoutMetadata: checkoutConfig?.metadata,
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
                price: effectivePriceLabel !== '...' ? effectivePriceLabel : undefined,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : (checkoutConfig?.paymentType || READING_PRODUCT.id),
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
                        data-lenis-prevent
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
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {isEnglish ? 'Unlock Your Full Cosmic Report' : '전체 Cosmic Report 열기'}
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {isEnglish ? (
                                        <>
                                            The free summary ends here.<br />
                                            The detailed reading starts below.
                                        </>
                                    ) : (
                                        <>
                                            무료 요약은 여기까지입니다.<br />
                                            이제부터 실제로 도움이 되는 상세 리딩이 열립니다.
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
                                {discountedPriceLabel ? (
                                    <p className="mt-3 text-xs font-medium text-emerald-300">
                                        {discount}% 할인 코드가 적용되었습니다.
                                    </p>
                                ) : null}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
                            >
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A184FF]">
                                    {isEnglish ? 'What Opens After Payment' : '결제 후 열리는 내용'}
                                </p>
                                <ul className="space-y-2 text-sm text-white/75">
                                    <li>{isEnglish ? '2026 overall flow and timing' : '2026 전체 운의 흐름과 타이밍'}</li>
                                    <li>{isEnglish ? 'Career, love, money, and health deep dive' : '커리어, 연애, 재물, 건강 상세 분석'}</li>
                                    <li>{isEnglish ? 'Action guide from Saju, astrology, and tarot overlap' : '사주, 점성술, 타로가 겹치는 지점 기반 액션 가이드'}</li>
                                </ul>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.14 }}
                                className="mb-6"
                            >
                                <label className="block text-xs font-semibold text-[#A184FF] mb-3 ml-1 uppercase tracking-widest">
                                    {isEnglish ? 'Email for your result link' : '결과를 받아볼 이메일'}
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
                                            ? 'Optional: receive the result link by email'
                                            : '선택: 결제 후 결과 링크를 이메일로 받기')}
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
                                        ? (isEnglish ? 'Unlock for Free' : '무료로 결과 확인하기')
                                        : (isEnglish ? 'Unlock Full Report' : '전체 리포트 열기'))}
                            </motion.button>

                            <p className="mt-4 text-center text-xs text-white/35">
                                {isEnglish
                                    ? 'Checkout is handled by Stripe. Your reading stays saved even if you come back later.'
                                    : '결제는 Stripe에서 안전하게 처리되며, 나중에 다시 와도 현재 리딩 상태는 유지됩니다.'}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
