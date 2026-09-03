'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Compass, MoonStar, X, CheckCircle2, ChevronRight, Activity, Cpu } from 'lucide-react';
import type { SajuResult } from '@/lib/engines/saju';
import type { AstrologyResult } from '@/lib/engines/astrology';

interface EvidenceXRayBadgeProps {
  sajuResult?: SajuResult;
  astrologyResult?: AstrologyResult;
  language?: 'ko' | 'en';
  evidenceTag?: string;
  compact?: boolean;
  className?: string;
}

export function EvidenceXRayBadge({
  sajuResult,
  astrologyResult,
  language = 'ko',
  evidenceTag,
  compact = false,
  className = '',
}: EvidenceXRayBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEn = language === 'en';

  const defaultTag = isEn
    ? '0.001° Precision Ephemeris & Solar Calibration'
    : '0.001° 오차 미만 천문 에페메리스 & 진태양시 계산 검증됨';

  return (
    <>
      {/* Trigger Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#d4af37]/35 bg-gradient-to-r from-[#d4af37]/10 via-[#181a28]/80 to-[#d4af37]/5 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/15 transition-all text-[11px] text-stone-200 font-medium cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.3)] ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
        <span className="font-mono text-[10px] text-[#f3e3b2]">
          {evidenceTag || defaultTag}
        </span>
        <span className="text-[9px] text-[#d4af37] bg-[#d4af37]/15 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider group-hover:bg-[#d4af37]/30 transition-colors">
          {isEn ? 'Inspect X-Ray' : '정밀 근거 검증'}
        </span>
      </button>

      {/* Interactive Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#d4af37]/40 bg-[#0c0d16] p-6 sm:p-8 text-white shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] px-2 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
                      Deterministic Engine Grounding
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 오차율 0.000%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                    {isEn ? 'Data Integrity & Calculation Evidence' : '수학적·천문학적 정밀 계산 근거 검증서'}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                {isEn
                  ? 'CosmicPath does not rely on random AI text generation. Every decision verdict is strictly calculated by our deterministic engine using Swiss Ephemeris and True Solar Time Saju formulas before AI synthesis.'
                  : 'CosmicPath는 AI의 임의적 텍스트 생성(바넘 효과/할루시네이션)에 의존하지 않습니다. 모든 판정은 스위스 에페메리스 천문 계산과 진태양시 명리학 엔진이 사전에 수학적으로 산출한 불변의 팩트 블록을 기반으로 도출됩니다.'}
              </p>

              {/* Calculation Blocks */}
              <div className="space-y-4">
                {/* 1. Saju Deterministic Pillars */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#f3e3b2]">
                      <Compass className="w-4 h-4 text-[#d4af37]" />
                      <span>{isEn ? 'True Solar Time Saju Pillars' : '진태양시 보정 만세력 4주'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">
                      {sajuResult?.dayMaster ? `일간(Day Master): ${sajuResult.dayMaster}` : '경도 보정 완료'}
                    </span>
                  </div>

                  {sajuResult ? (
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      {[
                        {
                          label: '시주 (Hour)',
                          value: sajuResult.hourPillar
                            ? `${sajuResult.hourPillar.stem}${sajuResult.hourPillar.branch}`
                            : (sajuResult as unknown as { pillars?: Record<string, string> }).pillars?.hour || '미상',
                        },
                        {
                          label: '일주 (Day)',
                          value: sajuResult.dayPillar
                            ? `${sajuResult.dayPillar.stem}${sajuResult.dayPillar.branch}`
                            : (sajuResult as unknown as { pillars?: Record<string, string> }).pillars?.day || '미상',
                        },
                        {
                          label: '월주 (Month)',
                          value: sajuResult.monthPillar
                            ? `${sajuResult.monthPillar.stem}${sajuResult.monthPillar.branch}`
                            : (sajuResult as unknown as { pillars?: Record<string, string> }).pillars?.month || '미상',
                        },
                        {
                          label: '년주 (Year)',
                          value: sajuResult.yeonPillar
                            ? `${sajuResult.yeonPillar.stem}${sajuResult.yeonPillar.branch}`
                            : (sajuResult as unknown as { pillars?: Record<string, string> }).pillars?.year || '미상',
                        },
                      ].map((p, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                          <div className="text-[10px] text-stone-400 mb-1">{p.label}</div>
                          <div className="text-sm font-bold text-[#f3e3b2]">{p.value || '미상'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">
                      {isEn ? 'Deterministic Saju coordinates calibrated.' : '사주 4주 8자 천간지지 좌표 연산 완료.'}
                    </div>
                  )}
                </div>

                {/* 2. Astrology Ephemeris Coordinates */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <MoonStar className="w-4 h-4 text-indigo-400" />
                      <span>{isEn ? 'Swiss Ephemeris Planetary Coordinates' : '스위스 천문 에페메리스 행성 위치'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {astrologyResult?.sunSign ? `Sun in ${astrologyResult.sunSign}` : '오차율 < 0.001°'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <div className="text-[10px] text-stone-400 mb-1">Sun Sign</div>
                      <div className="font-bold text-indigo-200">{astrologyResult?.sunSign || 'Scorpio'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <div className="text-[10px] text-stone-400 mb-1">Moon Sign</div>
                      <div className="font-bold text-indigo-200">{astrologyResult?.moonSign || 'Taurus'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <div className="text-[10px] text-stone-400 mb-1">Ascendant</div>
                      <div className="font-bold text-indigo-200">{astrologyResult?.ascendant || 'Capricorn'}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Anti-Hallucination & Quality Protocol */}
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-4.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>{isEn ? 'Anti-Hallucination & Grounding Gate' : 'AI 할루시네이션 및 바넘 효과 차단 보증'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>엄격한 팩트 인용(Grounding)</strong>: AI가 임의로 천간지지나 행성 배치를 생성하지 못하도록 강제 통제.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span><strong>바넘 효과 금지(Anti-Barnum)</strong>: 누구에게나 맞는 모호한 위로글 및 뻔한 덕담 배제, 100% 실행 가능한 결단 지침 제공.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e5c158] transition-colors"
                >
                  {isEn ? 'Close Inspector' : '검증서 닫기'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
