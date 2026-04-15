'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ScrollText, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getReadingFallbackPriceLabel, normalizePriceLabel, READING_PRODUCT } from '@/lib/payment/payment-config';
import { PromoCodeInput } from './PromoCodeInput';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { getLandingVariant } from '@/lib/language-preference';
import { useDocumentScrollLock } from '@/hooks/useDocumentScrollLock';

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
    const closeTriggeredByUiRef = useRef(false);
    const [isMounted, setIsMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
    const isEnglish = metadata?.language === 'en' || readingData?.language === 'en';
    const eventLanguage = isEnglish ? 'en' : 'ko';
    const landingVariant = getLandingVariant(eventLanguage);
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
    const dynamicPrice = resolvedPriceProp || normalizePriceLabel(fetchedPrice);
    const numericDynamicPrice = Number.parseFloat((dynamicPrice || '').replace(/[^0-9.]/g, ''));
    const discountedPriceLabel =
        dynamicPrice && discount > 0 && discount < 100 && Number.isFinite(numericDynamicPrice)
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(numericDynamicPrice * ((100 - discount) / 100))
            : null;
    const effectivePriceLabel =
        discount === 100 ? 'FREE' : discountedPriceLabel || dynamicPrice;
    const displayedPriceLabel =
        effectivePriceLabel ||
        (isEnglish ? 'Shown at checkout' : '결제 단계에서 확인');
    const hasConcreteDisplayedPrice = /\d/.test(displayedPriceLabel);
    const trackedPriceLabel = effectivePriceLabel || fallbackPriceLabel || 'checkout_visible';

    useDocumentScrollLock(isOpen);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

                if (
                    !response.ok ||
                    data?.metadata?.fallback === 'true' ||
                    !normalizePriceLabel(data.formattedPrice)
                ) {
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
                price: trackedPriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: READING_PRODUCT.id,
                metadata: {
                    landingVariant,
                },
            }),
        [appliedReferralCode, landingVariant, metadata, readingData, resolvedAutoReferralCode, trackedPriceLabel, trackingSource]
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
            price: trackedPriceLabel,
            readingId:
                sessionStorage.getItem('pending_reading_id') ||
                (typeof metadata?.readingId === 'string' ? metadata.readingId : undefined),
            plan: READING_PRODUCT.id,
            metadata: {
                landingVariant,
            },
        });
    }, [appliedReferralCode, isOpen, landingVariant, metadata, readingData, resolvedAutoReferralCode, trackedPriceLabel, trackingSource]);

    // Handle browser back button - close modal instead of navigating away
    useEffect(() => {
        if (!isOpen) return;

        const modalState = { modalType: 'payment', modalOpen: true };
        window.history.pushState(modalState, '');

        const handlePopState = () => {
            if (closeTriggeredByUiRef.current) {
                closeTriggeredByUiRef.current = false;
                return;
            }

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
        closeTriggeredByUiRef.current = true;
        void trackPaywallClose();
        onClose();

        if (window.history.state?.modalType === 'payment') {
            window.history.back();
            return;
        }
    }, [onClose, trackPaywallClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, isLoading, isOpen]);

    const handlePayment = async () => {
        // 이메일 유효성 검사 (프로모션 100% 할인이 아닐 때만 필수)
        const isFreePromo = discount === 100 && promoCodeId;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const requiredEmailMessage = isEnglish
            ? 'An email address is required to unlock a free promo.'
            : '무료 쿠폰 사용 시 이메일 주소가 필요합니다.';
        const invalidEmailMessage = isEnglish
            ? 'Please enter a valid email address.'
            : '올바른 이메일 형식이 아닙니다.';

        if (isFreePromo) {
            if (!email) {
                setEmailError(requiredEmailMessage);
                return;
            }
            if (!emailRegex.test(email)) {
                setEmailError(invalidEmailMessage);
                return;
            }
        } else if (email && !emailRegex.test(email)) {
            setEmailError(invalidEmailMessage);
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
                price: trackedPriceLabel,
                readingId: readingId || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    landingVariant,
                    emailProvided: Boolean(email),
                    discount,
                    promoCodeId,
                },
            });

            // [CRITICAL FIX] If readingId is missing (users who jump to payment early),
            // we MUST save to DB first to generate an ID. Otherwise, the webhook has nothing to link to.
            if (!readingId && currentReport) {
                try {
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
                    metadata: {
                        landingVariant,
                    },
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
                    accessKey: getStoredReadingAccessKey() || undefined,
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
                price: trackedPriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: {
                    landingVariant,
                    message,
                },
            });
            alert(isEnglish ? `Payment error: ${message}` : `결제 오류: ${message}`);
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
                title: 'Full reading',
                description: 'See the full interpretation behind your free result, including timing, reasons, and next steps.',
                Icon: ScrollText,
            },
            {
                title: 'Saved for later',
                description: 'Your reading stays saved, so you can come back and continue where you left off.',
                Icon: Sparkles,
            },
            {
                title: 'Safe checkout',
                description: 'Payment and card handling are safely processed through Stripe.',
                Icon: ShieldCheck,
            },
        ]
        : [
            {
                title: '전체 해석',
                description: '무료 결과 뒤에 있는 타이밍, 이유, 다음 행동까지 한 번에 봅니다.',
                Icon: ScrollText,
            },
            {
                title: '나중에 다시 보기',
                description: '결제 후 다시 와도 지금 보던 결과가 그대로 이어집니다.',
                Icon: Sparkles,
            },
            {
                title: 'Stripe 안전 결제',
                description: '결제와 카드 정보는 Stripe에서 안전하게 처리됩니다.',
                Icon: ShieldCheck,
            },
        ];

    if (!isMounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    data-lenis-prevent
                    className="fixed inset-0 z-[10010] overflow-y-auto overscroll-contain touch-pan-y bg-black/82 backdrop-blur-md"
                    onClick={handleClose}
                >
                    <div className="flex min-h-[100dvh] items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-6 md:pb-8 md:pt-8">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={modalSpring}
                            data-lenis-prevent
                            className="relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] w-full max-w-xl min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#f0d487]/12 bg-[#0b0d18] shadow-[0_28px_80px_rgba(0,0,0,0.58)] md:max-h-[calc(100dvh-4rem)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,216,138,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%)]" />

                            {/* Close button */}
                            <motion.button
                                onClick={handleClose}
                                whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.12)' }}
                                whileTap={{ scale: 0.97 }}
                                className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70 md:right-6 md:top-6"
                            >
                                <X size={20} className="text-white/40" />
                            </motion.button>

                            <div data-lenis-prevent className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 pb-6 pt-14 sm:px-6 md:px-10 md:pb-10 md:pt-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: 0.05 }}
                                    className="mb-8 text-center md:mb-10"
                                >
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-acc-gold/20 bg-acc-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-acc-gold">
                                        <Lock className="h-4 w-4" />
                                        {isEnglish ? 'Full Reading' : '전체 해석 보기'}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">
                                        {isEnglish ? 'See the full reading behind your free result' : '무료 결과 뒤에 있는 전체 해석 보기'}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/60">
                                        {isEnglish ? (
                                            <>
                                                The free result shows the direction first.<br />
                                                Payment opens the deeper reasons, timing, and next action.
                                            </>
                                        ) : (
                                            <>
                                                무료 결과는 방향까지 먼저 보여줍니다.<br />
                                                결제하면 왜 그렇게 읽혔는지와 다음 행동까지 더 자세히 볼 수 있습니다.
                                            </>
                                        )}
                                    </p>
                                    <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                                        <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">
                                            {isEnglish ? 'Current Unlock Price' : '현재 전체 해석 가격'}
                                        </p>
                                        {discountedPriceLabel ? (
                                            <div className="mt-2 flex items-center justify-center gap-3">
                                                <span className="text-sm text-white/35 line-through">{dynamicPrice}</span>
                                                <span className="text-xl font-bold text-acc-gold md:text-2xl">{discountedPriceLabel}</span>
                                            </div>
                                        ) : hasConcreteDisplayedPrice ? (
                                            <span className="mt-2 block text-xl font-bold text-acc-gold md:text-2xl">{displayedPriceLabel}</span>
                                        ) : (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm font-semibold text-white/78">{displayedPriceLabel}</p>
                                                <p className="text-xs text-white/42">
                                                    {isEnglish
                                                        ? 'We will confirm the final amount again in Stripe checkout.'
                                                        : '최종 금액은 Stripe 결제 단계에서 다시 정확히 보여드릴게요.'}
                                                </p>
                                            </div>
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
                                                    ? 'Live pricing is delayed, so the latest amount will be shown again in checkout.'
                                                    : '실시간 가격 확인이 지연되어 최신 금액은 결제 단계에서 다시 보여드립니다.'}
                                            </p>
                                        ) : null}
                                        {discountedPriceLabel ? (
                                            <p className="text-xs font-medium text-emerald-300">
                                                {isEnglish
                                                    ? `${discount}% discount applied.`
                                                    : `${discount}% 할인 코드가 적용되었습니다.`}
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
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-acc-gold">
                                        {isEnglish ? 'What You Get Next' : '결제하면 바로 보이는 것'}
                                    </p>
                                    <ul className="space-y-2 text-sm text-white/75">
                                        <li>{isEnglish ? 'A clearer reason for why this result showed up now' : '왜 지금 이 결과가 나왔는지 더 선명한 설명'}</li>
                                        <li>{isEnglish ? 'A more detailed timing read for when to move and when to wait' : '움직일 때와 기다릴 때를 나눠 보는 더 자세한 타이밍 해석'}</li>
                                        <li>{isEnglish ? 'A practical next-step guide you can act on right away' : '바로 써먹을 수 있는 다음 행동 가이드'}</li>
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
                                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-acc-gold/20 bg-acc-gold/10 text-acc-gold">
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
                                    <label className="mb-3 ml-1 block text-xs font-semibold uppercase tracking-widest text-acc-gold">
                                        {isEnglish ? 'Email for your result link' : '결과 링크를 받아볼 이메일'}
                                        {isFreePromo ? <span className="ml-1 text-red-400">*</span> : <span className="ml-2 text-white/30 normal-case">(optional)</span>}
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
                                                ? 'Optional: get your result link by email'
                                                : '선택: 결과 링크를 이메일로 받기')}
                                        className={`w-full rounded-2xl border bg-white/5 px-5 py-4 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow,background-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/40 ${emailError
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-white/10 focus:border-acc-gold/50 hover:border-white/15 hover:bg-white/[0.06]'
                                            }`}
                                    />
                                    {emailError && (
                                        <p className="ml-1 mt-2 animate-pulse text-xs text-red-400">
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
                                    whileHover={isLoading ? undefined : { y: -2, boxShadow: Number(discount) === 100 ? '0 18px 44px rgba(16,185,129,0.28)' : '0 18px 44px rgba(212,175,55,0.28)' }}
                                    whileTap={isLoading ? undefined : { scale: 0.985 }}
                                    className={`w-full rounded-2xl py-4 font-bold transition-all shadow-lg hover:opacity-90 disabled:opacity-50
                                        ${Number(discount) === 100
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30'
                                            : 'bg-gradient-to-r from-acc-gold via-[#f0c35c] to-[#d88b16] text-black shadow-acc-gold/30'
                                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-acc-gold/60`}
                                >
                                    {isLoading
                                        ? (isEnglish ? 'Processing...' : '처리 중...')
                                        : (Number(discount) === 100
                                            ? (isEnglish ? 'See Full Reading for Free' : '무료로 전체 해석 보기')
                                            : (isEnglish ? 'See Full Reading' : '전체 해석 보기'))}
                                </motion.button>

                                <p className="mt-4 text-center text-xs text-white/35">
                                    {isEnglish
                                        ? 'Stripe handles checkout safely. Your current result stays saved when you come back.'
                                        : '결제는 Stripe에서 안전하게 처리되고, 지금 결과는 그대로 저장되어 다시 와도 이어서 볼 수 있습니다.'}
                                </p>
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
