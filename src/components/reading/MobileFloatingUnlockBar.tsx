'use client';

import { Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MobileFloatingUnlockBarProps = {
  language: 'ko' | 'en';
  isPremium: boolean;
  priceLabel: string;
  onUnlock: () => Promise<void>;
};

export function MobileFloatingUnlockBar({
  language,
  isPremium,
  priceLabel,
  onUnlock,
}: MobileFloatingUnlockBarProps) {
  const isEn = language === 'en';
  const displayPrice = priceLabel || (isEn ? '$3.99' : '₩4,900');
  const originalPrice = isEn ? '$14.99' : '₩19,800';

  if (isPremium) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label={isEn ? 'Unlock VIP Report' : 'VIP 심층 리포트 열기'}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 px-3 py-2.5 sm:px-6 sm:py-3.5 bg-[#0d0c0a]/95 backdrop-blur-xl border-t border-[#c8a84d]/40 shadow-[0_-16px_48px_rgba(0,0,0,0.85)] pointer-events-auto"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {/* Left info badge */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-[#c8a84d]/40 bg-[#c8a84d]/15 text-[#e8c86d] shadow-[0_0_15px_rgba(200,168,77,0.25)]">
              <Lock size={15} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e8c86d] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e8c86d]" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-300 border border-rose-500/30">
                  {isEn ? '75% OFF' : '75% 특가'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#e8c86d]">
                  {isEn ? 'VIP Defense Dossier' : 'VIP 손실 방어 리포트'}
                </span>
              </div>
              <p className="truncate text-xs font-semibold text-stone-200 sm:text-sm">
                {isEn ? 'High-Risk Clash Dates & Noble Allies' : '🚨 손실 방어 일진 캘린더 & 천을귀인'}
              </p>
            </div>
          </div>

          {/* Right CTA Button with Anchored Price */}
          <button
            type="button"
            onClick={() => { void onUnlock(); }}
            className="group relative inline-flex shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] px-4 py-2 sm:px-6 sm:py-2.5 shadow-[0_0_24px_rgba(200,168,77,0.45)] transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-stone-950 font-black text-xs sm:text-sm">
              <Lock size={12} className="text-stone-950" />
              <span>{isEn ? 'Unlock All' : '전체 열기'}</span>
              <span className="text-[11px] sm:text-xs font-black">{displayPrice}</span>
            </div>
            <span className="text-[9px] font-semibold text-stone-800 line-through opacity-75">
              {originalPrice}
            </span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
