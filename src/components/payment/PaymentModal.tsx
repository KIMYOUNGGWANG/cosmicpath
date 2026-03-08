'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import { PromoCodeInput } from './PromoCodeInput';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentStart?: () => void;
    readingData?: Record<string, unknown>;
    currentReport?: any; // To persist Phase 1-2 results
    metadata?: any;
    isDecisionAccepted?: boolean;
    price?: string;
    trackingSource?: string;
}

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
}: PaymentModalProps) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isEnglish = metadata?.language === 'en' || readingData?.language === 'en';

    // Dynamic price from prop or fetched from API
    const [fetchedPrice, setFetchedPrice] = useState<string>('');
    const dynamicPrice = price || fetchedPrice || '...';

    // Fetch price from Stripe when modal opens (if not provided via prop)
    useEffect(() => {
        if (isOpen && !price) {
            fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.formattedPrice) {
                        setFetchedPrice(data.formattedPrice);
                    }
                })
                .catch(err => console.error('Failed to fetch price:', err));
        }
    }, [isOpen, price]);

    // Promo Code State
    const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
    const [discount, setDiscount] = useState<number>(0);

    const trackPaywallClose = useCallback(
        (sourceSuffix?: string) =>
            trackClientGrowthEvent({
                event: 'paywall_close',
                source: sourceSuffix ? `${trackingSource}_${sourceSuffix}` : trackingSource,
                step: 'payment_modal',
                language: metadata?.language,
                context: readingData?.context as string | undefined,
                invitationMode: Boolean(metadata?.inviteCode),
                price: dynamicPrice !== '...' ? dynamicPrice : undefined,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: READING_PRODUCT.id,
            }),
        [dynamicPrice, metadata, readingData, trackingSource]
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
            price: dynamicPrice !== '...' ? dynamicPrice : undefined,
            readingId:
                sessionStorage.getItem('pending_reading_id') ||
                (typeof metadata?.readingId === 'string' ? metadata.readingId : undefined),
            plan: READING_PRODUCT.id,
        });
    }, [dynamicPrice, isOpen, metadata, readingData, trackingSource]);

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
                price: dynamicPrice !== '...' ? dynamicPrice : undefined,
                readingId: readingId || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    emailProvided: Boolean(email),
                    discount,
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
                    readingId: readingId || undefined
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create payment session');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            await trackClientGrowthEvent({
                event: 'checkout_failure',
                source: trackingSource,
                step: 'payment_modal',
                language: metadata?.language,
                context: readingData?.context as string | undefined,
                invitationMode: Boolean(metadata?.inviteCode),
                price: dynamicPrice !== '...' ? dynamicPrice : undefined,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    message: error?.message || 'unknown_payment_error',
                },
            });
            alert(`결제 오류: ${error.message || '잠시 후 다시 시도해 주세요.'}`);
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-[#0f0f23] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(161,132,255,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute right-6 top-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-white/40" />
                        </button>

                        <div className="p-8 md:p-12">
                            <div className="text-center mb-10">
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
                                <div className="mt-6 inline-block px-4 py-2 bg-[#A184FF]/10 rounded-full border border-[#A184FF]/20">
                                    <span className="text-[#A184FF] font-bold text-xl">{dynamicPrice}</span>
                                </div>
                            </div>

                            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A184FF]">
                                    {isEnglish ? 'What Opens After Payment' : '결제 후 열리는 내용'}
                                </p>
                                <ul className="space-y-2 text-sm text-white/75">
                                    <li>{isEnglish ? '2026 overall flow and timing' : '2026 전체 운의 흐름과 타이밍'}</li>
                                    <li>{isEnglish ? 'Career, love, money, and health deep dive' : '커리어, 연애, 재물, 건강 상세 분석'}</li>
                                    <li>{isEnglish ? 'Action guide from Saju, astrology, and tarot overlap' : '사주, 점성술, 타로가 겹치는 지점 기반 액션 가이드'}</li>
                                </ul>
                            </div>

                            {/* Email Input */}
                            <div className="mb-6">
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
                                    className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none transition-all font-light ${emailError
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-white/10 focus:border-[#A184FF]/50'
                                        }`}
                                />
                                {emailError && (
                                    <p className="text-red-400 text-xs mt-2 ml-1 animate-pulse">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            {/* Promo Code Input */}
                            <div className="mb-8">
                                <PromoCodeInput
                                    email={email}
                                    onApply={(id, discount) => {
                                        setPromoCodeId(id);
                                        setDiscount(discount);
                                        // 무료 쿠폰 적용 시 에러 클리어
                                        if (discount === 100) setEmailError(null);
                                    }}
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className={`w-full py-4 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg
                                    ${Number(discount) === 100
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] shadow-[#8B5CF6]/30'
                                    } text-white`}
                            >
                                {isLoading
                                    ? (isEnglish ? 'Processing...' : '처리 중...')
                                    : (Number(discount) === 100
                                        ? (isEnglish ? 'Unlock for Free' : '무료로 결과 확인하기')
                                        : (isEnglish ? 'Unlock Full Report' : '전체 리포트 열기'))}
                            </button>

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
