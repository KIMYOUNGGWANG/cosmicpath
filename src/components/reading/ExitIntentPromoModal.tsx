'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface ExitIntentPromoModalProps {
  isOpen?: boolean;
  isPremium?: boolean;
  language?: 'ko' | 'en';
  onUnlock: () => void;
  onClose?: () => void;
}

export function ExitIntentPromoModal({
  isPremium = false,
  language = 'ko',
  onUnlock,
  onClose,
}: ExitIntentPromoModalProps) {
  const isEn = language === 'en';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user is already premium, do not trigger
    if (isPremium) return;

    // Check if exit intent was already shown this session
    const hasShown = typeof window !== 'undefined' && window.sessionStorage.getItem('cp_exit_intent_shown');
    if (hasShown) return;

    let timeoutId: NodeJS.Timeout;

    // 1. Mouse exit intent (Desktop)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !sessionStorage.getItem('cp_exit_intent_shown')) {
        sessionStorage.setItem('cp_exit_intent_shown', 'true');
        setIsVisible(true);
      }
    };

    // 2. Timer-based backup (Mobile & Desktop after 60s)
    timeoutId = setTimeout(() => {
      if (!sessionStorage.getItem('cp_exit_intent_shown') && !isPremium) {
        sessionStorage.setItem('cp_exit_intent_shown', 'true');
        setIsVisible(true);
      }
    }, 60000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, [isPremium]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleClaimOffer = () => {
    setIsVisible(false);
    onUnlock();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#c8a84d]/50 bg-gradient-to-b from-[#1c1912] via-[#12110d] to-[#090807] p-6 md:p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(200,168,77,0.2)]"
          >
            {/* Top Amber Light */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#c8a84d]/25 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Urgent Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-4">
              <Zap className="h-3.5 w-3.5" />
              <span>{isEn ? 'Special 1-Time Opportunity' : '첫 방문 한정 특별 혜택'}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold leading-snug mb-3 text-white">
              {isEn ? (
                <>Wait! Don&apos;t miss your <span className="text-[#e6ca7d]">{new Date().getFullYear()} Golden Timing Window</span></>
              ) : (
                <>잠깐! {new Date().getFullYear()}년 당신의 <span className="text-[#e6ca7d]">골든타임 분석</span>을 놓치지 마세요</>
              )}
            </h3>

            <p className="text-xs md:text-sm text-white/70 leading-relaxed mb-6">
              {isEn
                ? 'Your chart indicates a critical timing transition this year. Unlock the full 8-phase dossier now with a special first-visit welcome discount.'
                : '당신의 사주 원국과 점성술 차트에서 올해 하반기 매우 중대한 운의 전환점이 포착되었습니다. 이탈 전 첫 방문 한정가로 전체 8단계 VIP 분석을 확인하세요.'}
            </p>

            {/* Price Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/40 line-through mr-2">
                  {isEn ? '$3.99' : '₩4,900'}
                </span>
                <span className="text-2xl font-extrabold text-[#e6ca7d]">
                  {isEn ? '$2.49' : '₩2,900'}
                </span>
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  40% OFF
                </span>
              </div>
              <div className="text-right text-[11px] text-white/50">
                {isEn ? 'Instant 1-Click Access' : '1회 결제 · 평생 소장'}
              </div>
            </div>

            {/* 3 Core Unlock Perks */}
            <div className="space-y-2.5 mb-6 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c8a84d] shrink-0" />
                <span>{isEn ? `${new Date().getFullYear()}~${new Date().getFullYear() + 1} 12-Month Fortune Flow & Golden Timing Window` : `${new Date().getFullYear()}~${new Date().getFullYear() + 1} 12개월 월별 운세 장부 & 정확한 골든타임 날짜`}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{isEn ? 'Critical Risk Avoidance Calendar & Loss Prevention Strategy' : '손실을 막는 치명적 사각지대 방어선 & 천을귀인 조력자 분석'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{isEn ? '3 Free 1:1 Follow-Up Questions with AI Grand Oracle' : '사주·점성 듀얼 오라클과 1:1 심층 대화 (무료 질문 3회)'}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClaimOffer}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f3c85a] to-[#d4af37] py-4 font-bold text-black text-sm md:text-base shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <span>{isEn ? 'Claim 40% Off & Unlock Full Report' : '40% 특가로 전체 VIP 리포트 즉시 열기'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-white/40 hover:text-white/70 mt-3 transition-colors"
            >
              {isEn ? 'No thanks, I will decide later' : '다음에 확인할게요'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
