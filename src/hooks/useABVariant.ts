'use client';

import { useState, useEffect } from 'react';

export type ABVariant = 'control' | 'trial';

export interface ABVariantResult {
  variant: ABVariant;
  isReady: boolean;
}

export function useABVariant(experimentKey: string, splitRatio = 0.5): ABVariantResult {
  const [result, setResult] = useState<ABVariantResult>({ variant: 'control', isReady: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = `ab_${experimentKey}`;
    const stored = localStorage.getItem(storageKey) as ABVariant | null;
    if (stored === 'control' || stored === 'trial') {
      setResult({ variant: stored, isReady: true });
      return;
    }
    const assigned: ABVariant = Math.random() < splitRatio ? 'trial' : 'control';
    localStorage.setItem(storageKey, assigned);
    setResult({ variant: assigned, isReady: true });
  }, [experimentKey, splitRatio]);

  return result;
}
