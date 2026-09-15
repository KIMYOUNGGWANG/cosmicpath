'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Sparkles, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BlindSpotTeaserProps {
    title: string;
    previewText: string;
    hiddenText: string;
    language: 'ko' | 'en';
    isLocked?: boolean;
    onUnlock: () => void;
    // 신규 확장: 3중 검증 반영 시각적 결핍 훅
    elementDeficitWarning?: string;
    timelineRiskWarning?: string;
}

export function BlindSpotTeaser({
    title,
    previewText,
    hiddenText,
    language,
    isLocked = false,
    onUnlock,
    elementDeficitWarning,
    timelineRiskWarning,
}: BlindSpotTeaserProps) {
    const isEn = language === 'en';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border mt-6 group transition-colors shadow-xl',
                isLocked ? 'border-red-500/30 bg-gradient-to-b from-red-500/10 via-black/50 to-black/80' : 'border-[#D4AF37]/30 bg-[#D4AF37]/5'
            )}
        >
            {/* Header / Hook */}
            <div
                className={cn(
                    'flex items-center justify-between p-4 border-b',
                    isLocked ? 'border-red-500/20 bg-red-500/10' : 'border-[#D4AF37]/10 bg-[#D4AF37]/5'
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded-full animate-pulse', isLocked ? 'bg-red-500/20' : 'bg-[#D4AF37]/10')}>
                        <AlertTriangle size={16} className={isLocked ? 'text-red-400' : 'text-[#D4AF37]'} />
                    </div>
                    <h3
                        className={cn(
                            'font-bold text-sm md:text-base tracking-wide flex items-center gap-2',
                            isLocked ? 'text-red-200' : 'text-white'
                        )}
                    >
                        {title}
                    </h3>
                </div>
                <div
                    className={cn(
                        'text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest border font-bold h-fit transition-all duration-500',
                        isLocked
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30'
                    )}
                >
                    {isEn ? (isLocked ? 'Risk Encrypted' : 'Unlocked') : isLocked ? '사각지대 암호화' : '잠금 해제됨'}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 relative">
                {/* Visible Teaser */}
                <p
                    className={cn(
                        'text-sm md:text-base leading-relaxed mb-4 font-medium italic border-l-2 pl-4',
                        isLocked ? 'text-red-100/90 border-red-500/40' : 'text-gray-300 border-[#D4AF37]/30'
                    )}
                >
                    {previewText}
                </p>

                {/* 3중 검증 반영: 성급한 종결 방지형 시각 결핍 실루엣 */}
                {isLocked && (
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 결핍 에너지 실루엣 */}
                        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
                                <ShieldX className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-cinzel text-red-300/70 tracking-wider">
                                    Energy Deficit Hook
                                </div>
                                <div className="text-xs text-white font-semibold flex items-center gap-1.5 mt-0.5">
                                    <span className="bg-red-500/30 px-1.5 py-0.5 rounded text-[10px] text-red-200">
                                        [ ? ] 에너지 0% 고갈
                                    </span>
                                </div>
                                <p className="text-[11px] text-red-200/70 truncate mt-0.5">
                                    {elementDeficitWarning || '치명적 재물/의사결정 제동 변수 포착'}
                                </p>
                            </div>
                        </div>

                        {/* 타임라인 위험 월 실루엣 */}
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] uppercase font-cinzel text-amber-300/70 tracking-wider">
                                    Timeline Hazard
                                </div>
                                <div className="text-xs text-white font-semibold flex items-center gap-1.5 mt-0.5">
                                    <span className="bg-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-amber-200">
                                        2026 하반기 요주의 월
                                    </span>
                                </div>
                                <p className="text-[11px] text-amber-200/70 truncate mt-0.5">
                                    {timelineRiskWarning || '해당 분기 돌발 이탈 및 손실 주의'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden Content Area */}
                <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/10 shadow-inner overflow-hidden min-h-[90px]">
                    <p
                        className={cn(
                            'text-white text-sm md:text-base leading-relaxed transition-all duration-1000',
                            isLocked && 'blur-md select-none opacity-40'
                        )}
                    >
                        {hiddenText}
                    </p>

                    {/* Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[5px] p-4 text-center">
                            <p className="text-xs text-red-200 mb-2.5 font-medium">
                                {isEn
                                    ? 'Detailed mitigation protocol and timing dates are encrypted.'
                                    : '정밀 방어 프로토콜과 결핍 에너지 해법이 암호화되어 있습니다.'}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onUnlock}
                                className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border border-red-400/50 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-red-950/50 hover:shadow-red-500/40 transition-all"
                            >
                                <Lock size={13} fill="currentColor" />
                                {isEn ? 'Unlock Deep Defense Protocol' : '사각지대 리스크 해법 전체 열람'}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Hazard Stripes (Only when locked) */}
            {isLocked && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
                    style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.2) 10px, rgba(239, 68, 68, 0.2) 20px)`,
                    }}
                />
            )}
        </motion.div>
    );
}
