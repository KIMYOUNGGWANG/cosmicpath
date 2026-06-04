'use client';

import { useEffect, useState } from 'react';
import { readPreferredClientLanguage, USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';

export function useStartDynamicPrice() {
  const [dynamicPrice, setDynamicPrice] = useState('');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/payment/price');
        const data: unknown = await response.json();
        if (isPricePayload(data) && data.metadata?.fallback !== 'true' && data.formattedPrice) {
          setDynamicPrice(data.formattedPrice);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic price:', error);
      }
    };

    void fetchPrice();
  }, []);

  return dynamicPrice;
}

export function useStartPreferredLanguage(
  queryLanguage: 'ko' | 'en' | null,
  setLanguage: (value: 'ko' | 'en' | ((current: 'ko' | 'en') => 'ko' | 'en')) => void
) {
  useEffect(() => {
    const nextLanguage = queryLanguage || readPreferredClientLanguage();
    let isCurrent = true;

    queueMicrotask(() => {
      if (isCurrent) {
        setLanguage((current) => current === nextLanguage ? current : nextLanguage);
      }
    });
    localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, nextLanguage);

    return () => {
      isCurrent = false;
    };
  }, [queryLanguage, setLanguage]);
}

export function useBeforeUnloadGuard(isLoading: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isLoading) return;

      event.preventDefault();
      return '분석 중입니다. 정말 닫으시겠습니까? 결과가 손실될 수 있습니다.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);
}

function isPricePayload(value: unknown): value is {
  readonly formattedPrice?: string;
  readonly metadata?: { readonly fallback?: string };
} {
  return Boolean(value && typeof value === 'object');
}
