'use client';

import { forwardRef } from 'react';
import { Sparkles, Star, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getSajuArchetype } from '@/lib/cosmic/archetypes';

export interface CosmicShareCardProps {
    title: string;
    matchLevel: 'PERFECT' | 'PARTIAL' | 'CONFLICT';
    keywords: string[];
    dayMaster?: string;
    language?: 'ko' | 'en';
}

/**
 * 인스타그램 / 스레드 스토리 전용 9:16 오행 페르소나 바이럴 카드
 * 360x640px 비율, 다크 골드 & 오행 고유 그라디언트 테마
 */
export const CosmicShareCard = forwardRef<HTMLDivElement, CosmicShareCardProps>(
    function CosmicShareCard({ title, matchLevel, keywords, dayMaster = '甲', language = 'ko' }, ref) {
        const isEn = language === 'en';
        const archetype = getSajuArchetype(dayMaster);

        const matchLevelConfig = {
            PERFECT: { label: isEn ? 'Perfect 94% Sync' : '5대 엔진 합의율 94%', color: 'from-emerald-400 to-teal-500', emoji: '✨' },
            PARTIAL: { label: isEn ? 'High Resonance' : '교차 일치율 88%', color: 'from-amber-400 to-orange-500', emoji: '🌙' },
            CONFLICT: { label: isEn ? 'Strategic Focus' : '정밀 타이밍 분기', color: 'from-purple-400 to-pink-500', emoji: '🔮' },
        };

        const config = matchLevelConfig[matchLevel] || matchLevelConfig.PERFECT;
        const currentYear = new Date().getFullYear();

        return (
            <div
                ref={ref}
                className="relative overflow-hidden flex flex-col justify-between"
                style={{
                    width: '360px',
                    height: '640px',
                    background: 'linear-gradient(180deg, #090b10 0%, #121622 45%, #080a0f 100%)',
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
            >
                {/* 배경 앰비언트 글로우 */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30"
                        style={{ backgroundColor: archetype.glowColor }}
                    />
                    <div className="absolute top-8 left-6 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                    <div className="absolute top-24 right-8 w-1 h-1 bg-[#e8c86d]/60 rounded-full" />
                    <div className="absolute bottom-36 left-10 w-2 h-2 bg-white/20 rounded-full" />
                    <div className="absolute bottom-24 right-12 w-1.5 h-1.5 bg-[#e8c86d]/40 rounded-full animate-pulse" />
                </div>

                {/* 상단 헤더: 브랜드 & 일간 뱃지 */}
                <div className="relative pt-7 px-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#e8c86d]" />
                        <span className="text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase font-cinzel">
                            COSMICPATH
                        </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md shadow-sm">
                        <span className="text-xs">{archetype.emoji}</span>
                        <span className="text-stone-200 text-[10px] font-bold tracking-wider">
                            {archetype.stem}{isEn ? ` (${archetype.elementEn})` : `일간 · ${archetype.element} 기운`}
                        </span>
                    </div>
                </div>

                {/* 중앙 메인: 오행 페르소나 아키타입 */}
                <div className="relative px-6 py-2 flex flex-col items-center text-center z-10">
                    {/* Hero Element Orb */}
                    <div className="relative mb-3.5">
                        <div
                            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${archetype.gradientTheme} flex items-center justify-center border border-white/20 shadow-xl`}
                            style={{ boxShadow: `0 8px 32px ${archetype.glowColor}` }}
                        >
                            <span className="text-3xl filter drop-shadow-md">{archetype.emoji}</span>
                        </div>
                    </div>

                    {/* Consensus Pill */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r ${config.color} mb-2 shadow-sm`}>
                        <span className="text-xs">{config.emoji}</span>
                        <span className="text-black font-extrabold text-[10px] tracking-tight">{config.label}</span>
                    </div>

                    {/* Archetype Title */}
                    <h2 className="text-lg font-black text-white leading-snug tracking-tight px-2 mb-1">
                        {isEn ? archetype.titleEn : archetype.titleKo}
                    </h2>

                    {/* Quote */}
                    <p className="text-[11px] font-medium text-amber-200/90 leading-relaxed max-w-[290px] mb-3 px-1 italic">
                        {isEn ? archetype.quoteEn : archetype.quoteKo}
                    </p>

                    {/* Viral Relationship Grid: 귀인 vs 충돌 */}
                    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md mb-3 text-left space-y-2">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="text-[10px] font-bold text-stone-300">
                                    {isEn ? 'Noble Allies (귀인)' : '나의 운명적 귀인'}
                                </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-300">
                                {isEn ? archetype.nobleAlliesEn : archetype.nobleAlliesKo}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="text-[10px] font-bold text-stone-300">
                                    {isEn ? 'Friction Clash (주의)' : '주의해야 할 충돌'}
                                </span>
                            </div>
                            <span className="text-[10px] font-extrabold text-rose-300">
                                {isEn ? archetype.frictionWarningEn : archetype.frictionWarningKo}
                            </span>
                        </div>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {(keywords.length > 0 ? keywords.slice(0, 3) : (isEn ? archetype.keywordsEn : archetype.keywordsKo)).map((kw, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg border border-[#e8c86d]/25 bg-[#e8c86d]/10 text-[10px] font-bold text-[#f5e6be]"
                            >
                                #{kw.replace(/^#/, '')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 하단 바이럴 워터마크 & CTA */}
                <div className="relative pb-6 px-6 text-center z-10">
                    <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-stone-200">
                            <span>{isEn ? 'Find your 100% Noble Ally Match' : '내 사주 100% 찰떡 귀인 찾기'}</span>
                            <span className="text-[#e8c86d]">➔ cosmicpath.app</span>
                        </div>
                        <p className="text-[9px] text-stone-400 mt-0.5 tracking-wider">
                            {currentYear} 5-Engine Deterministic Decision Dossier
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);
