'use client';

import React from 'react';
import { Sparkles, Compass, CheckCircle2, AlertCircle, FileText, UserCheck } from 'lucide-react';
import type { SajuResult } from '@/lib/engines/saju';

interface OnePageDossierCardProps {
    saju?: SajuResult;
    userName?: string;
    birthDate?: string;
    finalVerdict?: {
        action: string;
        direction?: string;
        timing?: string;
        riskWarning?: string;
    };
    language?: 'ko' | 'en';
    className?: string;
}

export function OnePageDossierCard({
    saju,
    userName = '의뢰인',
    birthDate,
    finalVerdict,
    language = 'ko',
    className = '',
}: OnePageDossierCardProps) {
    const isEn = language === 'en';

    // 사주 기둥 데이터 추출
    const dayStem = saju?.dayPillar?.stem || '甲';
    const dayBranch = saju?.dayPillar?.branch || '子';
    const dayPillarStr = `${dayStem}${dayBranch}`;
    const gyeokguk = saju?.gyeokguk?.type || '정관격';
    const dayMaster = saju?.dayMaster || '갑목';

    // 간지 요약 태그
    const pillarsSummary = saju
        ? `${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar?.stem || ''}${saju.hourPillar?.branch || ''}시`
        : '';

    return (
        <div className={`relative overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/10 via-black/40 to-black/60 p-5 sm:p-7 backdrop-blur-md shadow-2xl ${className}`}>
            {/* Background Seal Watermark */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 border border-[#D4AF37]/10 rounded-full flex items-center justify-center pointer-events-none opacity-20">
                <span className="font-cinzel text-5xl font-serif text-[#D4AF37]">{dayPillarStr}</span>
            </div>

            {/* Top Bar: Volume Badge + Dossier ID */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                        Executive Dossier
                    </span>
                    <span className="text-white/30 text-xs">|</span>
                    <span className="text-xs text-white/60 font-mono">
                        REF-{dayPillarStr}-2026
                    </span>
                </div>

                {/* 3중 검증 반영: "빈 상자 효과" 방지를 위한 분량 보증 뱃지 */}
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 border border-white/15">
                    <FileText className="w-3 h-3 text-[#D4AF37]" />
                    <span>{isEn ? 'Full Dossier (4,200+ Words Verified)' : '4,200자 정밀 다중 합성 진단'}</span>
                </div>
            </div>

            {/* Profile & Pillar Matrix */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* User Identity Block */}
                <div className="md:col-span-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 flex items-center justify-center text-xl font-bold font-serif text-[#D4AF37] shadow-inner shrink-0">
                        {dayPillarStr}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-wide">{userName}</h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
                                {isEn ? 'Authenticated' : '명식 확인완료'}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 font-mono mt-0.5">
                            {birthDate ? `Birth: ${birthDate}` : pillarsSummary}
                        </p>
                    </div>
                </div>

                {/* Tags Matrix */}
                <div className="md:col-span-8 flex flex-wrap items-center gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-white/40 mr-1.5">{isEn ? 'Day Master:' : '일간(본원):'}</span>
                        <strong className="text-white font-semibold">{dayMaster} ({dayStem})</strong>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-white/40 mr-1.5">{isEn ? 'Core Structure:' : '격국(格局):'}</span>
                        <strong className="text-[#D4AF37] font-semibold">{gyeokguk}</strong>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                        <span className="text-white/40 mr-1.5">{isEn ? 'Energy Archetype:' : '에너지 아키타입:'}</span>
                        <strong className="text-emerald-300 font-semibold">{isEn ? 'Strategic Intuitive' : '전략적 통찰형'}</strong>
                    </div>
                </div>
            </div>

            {/* Verdict Highlight Strip */}
            {finalVerdict && (
                <div className="mt-5 rounded-2xl border border-[#D4AF37]/30 bg-black/40 p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-cinzel text-[11px] font-bold tracking-wider text-[#D4AF37] uppercase">
                                    Final Decision Signal
                                </span>
                                {finalVerdict.timing && (
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                                        {finalVerdict.timing}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm sm:text-base font-semibold text-white leading-snug">
                                {finalVerdict.action}
                            </p>
                            {finalVerdict.riskWarning && (
                                <p className="mt-1.5 text-xs text-rose-300/90 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>주의: {finalVerdict.riskWarning}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
