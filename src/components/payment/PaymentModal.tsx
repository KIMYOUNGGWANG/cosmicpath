'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { getLandingVariant } from '@/lib/language-preference';
import { useDocumentScrollLock } from '@/hooks/useDocumentScrollLock';
import { PaymentModalContent } from './PaymentModalContent';
import { PaymentModalFrame } from './PaymentModalFrame';
import { useReadingCheckout } from './use-reading-checkout';
import { useReadingPrice } from './use-reading-price';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentStart?: () => void;
    readingData?: Record<string, unknown>;
    currentReport?: unknown;
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

function getReadingContext(readingData?: Record<string, unknown>): string | undefined {
    return typeof readingData?.context === 'string' ? readingData.context : undefined;
}

function resolveAutoReferralCode(autoReferralCode?: string): string | null {
    if (autoReferralCode?.trim()) return autoReferralCode.trim().toUpperCase();
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const candidate = params.get('referralCode') || params.get('ref') || params.get('promo');

    return candidate?.trim() ? candidate.trim().toUpperCase() : null;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    autoReferralCode,
}: PaymentModalProps) {
    const closeTriggeredByUiRef = useRef(false);
    const [isMounted, setIsMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [promoCodeId, setPromoCodeId] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);
    const [appliedReferralCode, setAppliedReferralCode] = useState<string | null>(null);
    const isEnglish = metadata?.language === 'en' || readingData?.language === 'en';
    const eventLanguage = isEnglish ? 'en' : 'ko';
    const isRelationshipContactTiming =
        trackingSource === 'next_move_report_mvp_v1' ||
        trackingSource === 'relationship_contact_timing_v1' ||
        trackingSource === 'en_relationship_contact_timing_v1';
    const landingVariant =
        trackingSource === 'next_move_report_mvp_v1'
            ? 'next_move_report_mvp_v1'
            : trackingSource === 'en_relationship_contact_timing_v1'
            ? 'en_contact_timing_v1'
            : getLandingVariant(eventLanguage);
    const resolvedAutoReferralCode = resolveAutoReferralCode(autoReferralCode);
    const referralCode = appliedReferralCode || resolvedAutoReferralCode || undefined;
    const isFreePromo = discount === 100 && Boolean(promoCodeId);
    const priceState = useReadingPrice({ isOpen, price, discount, isEnglish });
    const startReadingCheckout = useReadingCheckout();
    const offerName = isRelationshipContactTiming
        ? READING_PRODUCT.name
        : (isEnglish ? 'Detailed Decision Timing Note' : '자세한 결정 타이밍 노트');
    const isCheckoutPausedForPriceIssue = priceState.hasBlockingPriceIssue && !isFreePromo;

    useDocumentScrollLock(isOpen);

    useEffect(() => setIsMounted(true), []);

    const trackPaywallClose = useCallback(
        (sourceSuffix?: string) =>
            trackClientGrowthEvent({
                event: 'paywall_close',
                source: sourceSuffix ? `${trackingSource}_${sourceSuffix}` : trackingSource,
                step: 'payment_modal',
                language: eventLanguage,
                context: getReadingContext(readingData),
                invitationMode: Boolean(metadata?.inviteCode),
                referralCode,
                price: priceState.trackedPriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: READING_PRODUCT.id,
                metadata: { landingVariant },
            }),
        [eventLanguage, landingVariant, metadata, readingData, referralCode, priceState.trackedPriceLabel, trackingSource]
    );

    useEffect(() => {
        if (!isOpen) return;

        void trackClientGrowthEvent({
            event: 'paywall_open',
            source: trackingSource,
            step: 'payment_modal',
            language: eventLanguage,
            context: getReadingContext(readingData),
            invitationMode: Boolean(metadata?.inviteCode),
            referralCode,
            price: priceState.trackedPriceLabel,
            readingId: sessionStorage.getItem('pending_reading_id') ||
                (typeof metadata?.readingId === 'string' ? metadata.readingId : undefined),
            plan: READING_PRODUCT.id,
            metadata: { landingVariant },
        });
    }, [eventLanguage, isOpen, landingVariant, metadata, readingData, referralCode, priceState.trackedPriceLabel, trackingSource]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modalType: 'payment', modalOpen: true }, '');
        const handlePopState = () => {
            if (closeTriggeredByUiRef.current) {
                closeTriggeredByUiRef.current = false;
                return;
            }
            void trackPaywallClose('back');
            onClose();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isOpen, onClose, trackPaywallClose]);

    const handleClose = useCallback(() => {
        closeTriggeredByUiRef.current = true;
        void trackPaywallClose();
        onClose();

        if (window.history.state?.modalType === 'payment') window.history.back();
    }, [onClose, trackPaywallClose]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) handleClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, isLoading, isOpen]);

    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        if (emailError) setEmailError(null);
    }, [emailError]);

    const handlePromoApply = useCallback((id: string, appliedDiscount: number, code: string) => {
        setPromoCodeId(id);
        setDiscount(appliedDiscount);
        setAppliedReferralCode(code);
        if (appliedDiscount === 100) setEmailError(null);
    }, []);

    const handlePayment = async () => {
        if (priceState.hasBlockingPriceIssue && !isFreePromo) {
            alert(isEnglish
                ? 'Checkout is paused because the live Stripe price could not be confirmed.'
                : '라이브 Stripe 가격을 확인하지 못해 결제를 잠시 막았습니다.');
            return;
        }
        if (isFreePromo && !email) {
            setEmailError(isEnglish ? 'An email address is required to unlock a free promo.' : '무료 쿠폰 사용 시 이메일 주소가 필요합니다.');
            return;
        }
        if (email && !isValidEmail(email)) {
            setEmailError(isEnglish ? 'Please enter a valid email address.' : '올바른 이메일 형식이 아닙니다.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await startReadingCheckout({
                readingData,
                currentReport,
                metadata,
                isDecisionAccepted,
                email,
                trackingSource,
                eventLanguage,
                landingVariant,
                appliedReferralCode,
                resolvedAutoReferralCode,
                trackedPriceLabel: priceState.trackedPriceLabel,
                discount,
                promoCodeId,
                onPaymentStart,
            });

            if (result.kind === 'free_promo') {
                onClose();
                window.location.href = result.redirectUrl;
                return;
            }
            window.location.href = result.url;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.';
            console.error('Payment error:', error);
            await trackClientGrowthEvent({
                event: 'checkout_failure',
                source: trackingSource,
                step: 'payment_modal',
                language: eventLanguage,
                context: getReadingContext(readingData),
                invitationMode: Boolean(metadata?.inviteCode),
                referralCode,
                price: priceState.trackedPriceLabel,
                readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
                metadata: { landingVariant, message },
            });
            alert(isEnglish ? `Payment error: ${message}` : `결제 오류: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <PaymentModalFrame isOpen={isOpen} onClose={handleClose}>
            <PaymentModalContent
                offerName={offerName}
                isEnglish={isEnglish}
                isRelationshipContactTiming={isRelationshipContactTiming}
                dynamicPrice={priceState.dynamicPrice}
                discountedPriceLabel={priceState.discountedPriceLabel}
                displayedPriceLabel={priceState.displayedPriceLabel}
                hasConcreteDisplayedPrice={priceState.hasConcreteDisplayedPrice}
                showPriceConfirmationBlocked={priceState.showPriceConfirmationBlocked}
                showPriceLoadingState={priceState.showPriceLoadingState}
                showPriceFallbackCopy={priceState.showPriceFallbackCopy}
                isFreePromo={isFreePromo}
                email={email}
                emailError={emailError}
                isOpen={isOpen}
                isLoading={isLoading}
                discount={discount}
                resolvedAutoReferralCode={resolvedAutoReferralCode}
                isCheckoutPausedForPriceIssue={isCheckoutPausedForPriceIssue}
                onEmailChange={handleEmailChange}
                onPromoApply={handlePromoApply}
                onPayment={handlePayment}
            />
        </PaymentModalFrame>
    );
}
