import { useEffect, useMemo, useState } from 'react';
import { getReadingFallbackPriceLabel, normalizePriceLabel, READING_PRODUCT } from '@/lib/payment/payment-config';

export const PRICE_CONTRACT_MISMATCH_CODE = 'READING_PRICE_CONTRACT_MISMATCH' as const;

type ReadingPriceLookupState = 'ready' | 'loading' | 'fallback' | 'contract_mismatch';

interface UseReadingPriceInput {
    readonly isOpen: boolean;
    readonly price?: string;
    readonly discount: number;
    readonly isEnglish: boolean;
}

interface UseReadingPriceResult {
    readonly dynamicPrice: string | null;
    readonly discountedPriceLabel: string | null;
    readonly displayedPriceLabel: string;
    readonly hasConcreteDisplayedPrice: boolean;
    readonly trackedPriceLabel: string;
    readonly showPriceLoadingState: boolean;
    readonly showPriceContractMismatch: boolean;
    readonly showPriceFallbackCopy: boolean;
    readonly hasPriceContractMismatch: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasFallbackMetadata(value: unknown): boolean {
    return isRecord(value) && value.fallback === 'true';
}

function getFormattedPrice(value: unknown): string | null {
    return isRecord(value) && typeof value.formattedPrice === 'string'
        ? value.formattedPrice
        : null;
}

function getResponseCode(value: unknown): unknown {
    return isRecord(value) ? value.code : null;
}

export function useReadingPrice({
    isOpen,
    price,
    discount,
    isEnglish,
}: UseReadingPriceInput): UseReadingPriceResult {
    const fallbackPriceLabel = getReadingFallbackPriceLabel();
    const resolvedPriceProp = normalizePriceLabel(price);
    const [fetchedPrice, setFetchedPrice] = useState<string | null>(null);
    const [lookupState, setLookupState] = useState<ReadingPriceLookupState>('ready');
    const hasPriceContractMismatch = !resolvedPriceProp && lookupState === 'contract_mismatch';
    const dynamicPrice = resolvedPriceProp || normalizePriceLabel(fetchedPrice);

    useEffect(() => {
        if (!isOpen || resolvedPriceProp) return;

        let isMounted = true;
        queueMicrotask(() => {
            if (isMounted) setLookupState('loading');
        });

        fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`, { cache: 'no-store' })
            .then(async (response) => {
                const payload: unknown = await response.json();

                if (!response.ok) {
                    if (getResponseCode(payload) === PRICE_CONTRACT_MISMATCH_CODE && isMounted) {
                        setLookupState('contract_mismatch');
                        return;
                    }
                    if (isMounted) setLookupState('fallback');
                    return;
                }

                const formattedPrice = getFormattedPrice(payload);
                const metadata = isRecord(payload) ? payload.metadata : null;

                if (hasFallbackMetadata(metadata) || !normalizePriceLabel(formattedPrice)) {
                    if (isMounted) setLookupState('fallback');
                    return;
                }

                if (isMounted) {
                    setFetchedPrice(formattedPrice);
                    setLookupState('ready');
                }
            })
            .catch((error: unknown) => {
                if (isMounted) setLookupState('fallback');
                if (error instanceof Error) {
                    console.error('Failed to fetch price:', error);
                    return;
                }
                console.error('Failed to fetch price:', String(error));
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, resolvedPriceProp]);

    return useMemo(() => {
        const numericDynamicPrice = Number.parseFloat((dynamicPrice || '').replace(/[^0-9.]/g, ''));
        const discountedPriceLabel =
            dynamicPrice && discount > 0 && discount < 100 && Number.isFinite(numericDynamicPrice)
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(numericDynamicPrice * ((100 - discount) / 100))
                : null;
        const effectivePriceLabel = discount === 100 ? 'FREE' : discountedPriceLabel || dynamicPrice;
        const displayedPriceLabel =
            effectivePriceLabel ||
            fallbackPriceLabel ||
            (isEnglish ? 'Shown at checkout' : '결제 단계에서 확인');
        const trackedPriceLabel = hasPriceContractMismatch
            ? PRICE_CONTRACT_MISMATCH_CODE
            : effectivePriceLabel || fallbackPriceLabel || 'checkout_visible';

        return {
            dynamicPrice,
            discountedPriceLabel,
            displayedPriceLabel,
            hasConcreteDisplayedPrice: /\d/.test(displayedPriceLabel),
            trackedPriceLabel,
            showPriceLoadingState: isOpen && !resolvedPriceProp && lookupState === 'loading',
            showPriceContractMismatch: isOpen && hasPriceContractMismatch,
            showPriceFallbackCopy: isOpen && !resolvedPriceProp && lookupState === 'fallback',
            hasPriceContractMismatch,
        };
    }, [discount, dynamicPrice, fallbackPriceLabel, hasPriceContractMismatch, isEnglish, isOpen, lookupState, resolvedPriceProp]);
}
