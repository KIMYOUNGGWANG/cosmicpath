'use client';

import { useCallback } from 'react';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

interface ReadingCheckoutMetadata {
    readonly language?: 'ko' | 'en';
    readonly inviteCode?: string;
    readonly readingId?: string;
    readonly [key: string]: unknown;
}

interface StartReadingCheckoutInput {
    readonly readingData?: Record<string, unknown>;
    readonly currentReport?: unknown;
    readonly metadata?: ReadingCheckoutMetadata;
    readonly isDecisionAccepted?: boolean;
    readonly email: string;
    readonly trackingSource: string;
    readonly eventLanguage: 'ko' | 'en';
    readonly landingVariant: string;
    readonly appliedReferralCode: string | null;
    readonly resolvedAutoReferralCode: string | null;
    readonly trackedPriceLabel: string;
    readonly discount: number;
    readonly promoCodeId: string | null;
    readonly onPaymentStart?: () => void;
}

export type ReadingCheckoutResult =
    | { readonly kind: 'redirect'; readonly url: string }
    | { readonly kind: 'free_promo'; readonly redirectUrl: string };

class ReadingCheckoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ReadingCheckoutError';
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getStringField(value: unknown, field: string): string | null {
    return isRecord(value) && typeof value[field] === 'string' ? value[field] : null;
}

function selectedReferralCode(input: StartReadingCheckoutInput): string | undefined {
    return input.appliedReferralCode || input.resolvedAutoReferralCode || undefined;
}

function getReadingContext(input: StartReadingCheckoutInput): string | undefined {
    return typeof input.readingData?.context === 'string' ? input.readingData.context : undefined;
}

function getStoredReadingAccessKey(): string | null {
    if (typeof window === 'undefined') return null;
    return (
        sessionStorage.getItem('pending_reading_access_key') ||
        localStorage.getItem('pending_reading_access_key')
    );
}

function persistPendingCheckoutState(input: StartReadingCheckoutInput): void {
    if (input.readingData) {
        sessionStorage.setItem('pending_reading_data', JSON.stringify(input.readingData));
    }
    if (input.currentReport) {
        sessionStorage.setItem('pending_report_data', JSON.stringify(input.currentReport));
    }
    if (input.metadata) {
        sessionStorage.setItem('pending_metadata', JSON.stringify(input.metadata));
    }
    if (input.isDecisionAccepted) {
        sessionStorage.setItem('decision_accepted', 'true');
    }
    sessionStorage.setItem('is_session_active', 'true');
    if (input.email) {
        localStorage.setItem('user_email', input.email);
    }
}

async function savePendingReading(input: StartReadingCheckoutInput): Promise<string | null> {
    if (!input.currentReport) return null;

    try {
        const response = await fetch('/api/reading/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: input.currentReport,
                accessKey: getStoredReadingAccessKey() || undefined,
                metadata: {
                    ...(input.metadata ?? {}),
                    readingData: input.readingData,
                    isPremium: false,
                    email: input.email,
                    paymentSource: 'stripe_pending',
                },
            }),
        });

        if (!response.ok) return null;

        const saved: unknown = await response.json();
        const accessKey = getStringField(saved, 'accessKey');
        const readingId = getStringField(saved, 'id');

        if (accessKey) {
            sessionStorage.setItem('pending_reading_access_key', accessKey);
            localStorage.setItem('pending_reading_access_key', accessKey);
        }
        if (readingId) {
            sessionStorage.setItem('pending_reading_id', readingId);
            localStorage.setItem('pending_reading_id', readingId);
        }

        return readingId;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('PaymentModal: Failed to save pre-payment state', error);
            return null;
        }
        console.error('PaymentModal: Failed to save pre-payment state', String(error));
        return null;
    }
}

async function redeemFreePromo(input: StartReadingCheckoutInput, readingId: string | null): Promise<void> {
    if (!input.promoCodeId) throw new ReadingCheckoutError('쿠폰 정보가 없습니다.');

    const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            codeId: input.promoCodeId,
            email: input.email || localStorage.getItem('user_email') || '',
            readingId: readingId || undefined,
            userAgent: navigator.userAgent,
        }),
    });

    if (response.ok) return;

    const payload: unknown = await response.json();
    throw new ReadingCheckoutError(getStringField(payload, 'message') || '쿠폰 사용에 실패했습니다.');
}

async function createPaymentSession(
    input: StartReadingCheckoutInput,
    readingId: string | null
): Promise<string> {
    const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productId: READING_PRODUCT.productId,
            email: input.email,
            readingId: readingId || undefined,
            accessKey: getStoredReadingAccessKey() || undefined,
            referralCode: selectedReferralCode(input),
            promoCodeId: input.promoCodeId || undefined,
            discount: input.discount || undefined,
            language: input.eventLanguage,
            source: input.trackingSource,
        }),
    });

    const payload: unknown = await response.json();
    const checkoutUrl = getStringField(payload, 'url');
    if (checkoutUrl) return checkoutUrl;

    throw new ReadingCheckoutError(getStringField(payload, 'error') || 'Failed to create payment session');
}

async function trackCheckoutStart(
    input: StartReadingCheckoutInput,
    readingId: string | null,
    isFreePromo: boolean
): Promise<void> {
    await trackClientGrowthEvent({
        event: 'checkout_start',
        source: input.trackingSource,
        step: 'payment_modal',
        language: input.eventLanguage,
        context: getReadingContext(input),
        invitationMode: Boolean(input.metadata?.inviteCode),
        referralCode: selectedReferralCode(input),
        price: input.trackedPriceLabel,
        readingId: readingId || undefined,
        plan: isFreePromo ? 'promo_free_unlock' : READING_PRODUCT.id,
        metadata: {
            landingVariant: input.landingVariant,
            checkoutIntentId: `${input.trackingSource}:${readingId || 'pending'}`,
            conversionSource: input.trackingSource,
            emailProvided: Boolean(input.email),
            discount: input.discount,
            promoCodeId: input.promoCodeId,
        },
    });
}

async function trackFreePromoSuccess(input: StartReadingCheckoutInput, readingId: string | null): Promise<void> {
    await trackClientGrowthEvent({
        event: 'checkout_success',
        source: input.trackingSource,
        step: 'payment_modal',
        language: input.eventLanguage,
        context: getReadingContext(input),
        invitationMode: Boolean(input.metadata?.inviteCode),
        referralCode: selectedReferralCode(input),
        price: 'FREE',
        readingId: readingId || undefined,
        plan: 'promo_free_unlock',
        metadata: {
            landingVariant: input.landingVariant,
            checkoutIntentId: `${input.trackingSource}:${readingId || 'pending'}`,
            conversionSource: input.trackingSource,
        },
    });
}

export async function startReadingCheckout(
    input: StartReadingCheckoutInput
): Promise<ReadingCheckoutResult> {
    const isFreePromo = input.discount === 100 && Boolean(input.promoCodeId);

    persistPendingCheckoutState(input);
    input.onPaymentStart?.();

    let readingId = sessionStorage.getItem('pending_reading_id');
    await trackCheckoutStart(input, readingId, isFreePromo);

    if (!readingId) {
        readingId = await savePendingReading(input);
    }

    if (isFreePromo) {
        await redeemFreePromo(input, readingId);
        sessionStorage.setItem('payment_completed', 'true');
        sessionStorage.setItem('promo_user', 'true');
        sessionStorage.setItem('is_premium_user', 'true');
        await trackFreePromoSuccess(input, readingId);

        return {
            kind: 'free_promo',
            redirectUrl: `/start?paid=true${readingId ? `&reading_id=${readingId}` : ''}`,
        };
    }

    return {
        kind: 'redirect',
        url: await createPaymentSession(input, readingId),
    };
}

export function useReadingCheckout(): typeof startReadingCheckout {
    return useCallback((input: StartReadingCheckoutInput) => startReadingCheckout(input), []);
}
