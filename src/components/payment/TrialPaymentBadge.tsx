'use client';

import { useEffect } from 'react';
import { useABVariant } from '@/hooks/useABVariant';

interface TrialPaymentBadgeProps {
  experimentKey?: string;
  regularPrice: string;
  trialPrice: string;
  trialDurationLabel?: string;
  language?: 'ko' | 'en';
  onVariantReady?: (variant: 'control' | 'trial') => void;
}

export function TrialPaymentBadge({
  experimentKey = 'payment_trial_2025',
  regularPrice,
  trialPrice,
  trialDurationLabel,
  language = 'ko',
  onVariantReady,
}: TrialPaymentBadgeProps) {
  const { variant, isReady } = useABVariant(experimentKey);
  const isEn = language === 'en';
  const durationLabel = trialDurationLabel ?? (isEn ? '24-hour offer' : '24시간 한정');

  useEffect(() => {
    if (isReady && onVariantReady) onVariantReady(variant);
  }, [isReady, variant, onVariantReady]);

  if (!isReady) return null;

  if (variant === 'control') {
    return (
      <span className="text-2xl font-bold text-white">{regularPrice}</span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#D4AF37]">{trialPrice}</span>
        <span className="text-sm text-white/40 line-through">{regularPrice}</span>
      </div>
      <span className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
        {isEn ? 'Limited Offer' : '한정 특가'} — {durationLabel}
      </span>
    </div>
  );
}
