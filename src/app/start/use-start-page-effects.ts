'use client';

import { useEffect, useState } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { readPreferredClientLanguage, USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';

export function resolveInitialStartLanguage(searchParams: ReadonlyURLSearchParams): 'ko' | 'en' {
  const query = searchParams.get('lang') || searchParams.get('language');
  if (query === 'en' || query === 'ko') return query;
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(USER_LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'ko') return stored;
  }
  return 'ko';
}

export function useStartDynamicPrice() {
  const [dynamicPrice, setDynamicPrice] = useState('');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/payment/price');
        const data: unknown = await response.json();
        if (isPricePayload(data) && data.formattedPrice) {
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
    setLanguage((current) => (current === nextLanguage ? current : nextLanguage));
    localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, nextLanguage);
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
