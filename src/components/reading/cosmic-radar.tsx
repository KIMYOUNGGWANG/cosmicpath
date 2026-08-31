'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CosmicRadarProps {
    sajuScore: number;    // 0-100
    starScore: number;    // 0-100
    tarotScore?: number;  // legacy alias
    ziweiScore?: number;  // 0-100
    isLoading?: boolean;
    details?: {
        saju?: string;
        star?: string;
        tarot?: string;
        ziwei?: string;
    };
    language?: 'ko' | 'en';
}

export function CosmicRadar({
    sajuScore = 0,
    starScore = 0,
    tarotScore = 0,
    ziweiScore,
    isLoading = false,
    details,
    language = 'ko'
}: CosmicRadarProps) {
    const effectiveZiwei = ziweiScore ?? tarotScore;
    const isEn = language === 'en';
    // 애니메이션을 위한 상태
    const [currentScores, setCurrentScores] = useState({ saju: 0, star: 0, tarot: 0 });
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // 로딩 중일 때 랜덤하게 꿈틀거리는 효과
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setCurrentScores({
                    saju: 30 + Math.random() * 40,
                    star: 30 + Math.random() * 40,
                    tarot: 30 + Math.random() * 40,
                });
            }, 800);
            return () => clearInterval(interval);
        } else {
            // 로딩 끝나면 실제 점수로
            setCurrentScores({
                saju: sajuScore,
                star: starScore,
                tarot: effectiveZiwei,
            });
        }
    }, [isLoading, sajuScore, starScore, effectiveZiwei]);

    // 좌표 계산 (중심점: 100, 100 / 반지름: 80)
    const getCoordinates = (value: number, angle: number) => {
        const radius = 80 * (value / 100);
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: 100 + radius * Math.cos(rad),
            y: 100 + radius * Math.sin(rad),
        };
    };

    // 각 축의 좌표 (사주: 0도, 자미두수: 120도, 점성술: 240도)
    const sajuPos = getCoordinates(currentScores.saju, 0);       // Top
    const tarotPos = getCoordinates(currentScores.tarot, 120);   // Right Bottom
    const starPos = getCoordinates(currentScores.star, 240);     // Left Bottom

    // 배경 가이드라인 좌표 (100점 기준)
    const maxSaju = getCoordinates(100, 0);
    const maxTarot = getCoordinates(100, 120);
    const maxStar = getCoordinates(100, 240);

    // 다각형 경로 (undefined 방지)
    const pathData = (isNaN(sajuPos.x) || isNaN(sajuPos.y) || isNaN(tarotPos.x) || isNaN(tarotPos.y) || isNaN(starPos.x) || isNaN(starPos.y))
        ? 'M 100 100 L 100 100 L 100 100 Z'  // 기본값: 중심점
        : `M ${sajuPos.x} ${sajuPos.y} L ${tarotPos.x} ${tarotPos.y} L ${starPos.x} ${starPos.y} Z`;

    return (
        <div className="relative w-full max-w-[320px] mx-auto aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--saju-blue)" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="var(--tarot-purple)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--star-yellow)" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--saju-blue)" />
                        <stop offset="50%" stopColor="var(--tarot-purple)" />
                        <stop offset="100%" stopColor="var(--star-yellow)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 배경 가이드라인 (동심원) */}
                {[20, 40, 60, 80, 100].map((r) => (
                    <circle
                        key={r}
                        cx="100"
                        cy="100"
                        r={r * 0.8}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}

                {/* 배경 축 라인 */}
                <line x1="100" y1="100" x2={maxSaju.x} y2={maxSaju.y} stroke="rgba(255,255,255,0.1)" />
                <line x1="100" y1="100" x2={maxTarot.x} y2={maxTarot.y} stroke="rgba(255,255,255,0.1)" />
                <line x1="100" y1="100" x2={maxStar.x} y2={maxStar.y} stroke="rgba(255,255,255,0.1)" />

                {/* 실제 데이터 다각형 */}
                <motion.path
                    initial={{ d: 'M 100 30 L 160.62 135 L 39.38 135 Z' }}
                    d={pathData}
                    fill="url(#radarGradient)"
                    fillOpacity="0.5"
                    stroke="url(#radarStroke)"
                    strokeWidth="2"
                    filter="url(#glow)"
                    animate={{ d: pathData }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                />
            </svg>

            {/* 꼭짓점 라벨 (Absolute Positioning for better spacing) */}
            {/* 사주 (Top) */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex flex-col items-center cursor-pointer group"
                onClick={() => setActiveTooltip('saju')}
            >
                <span className="text-xl font-bold tracking-tighter" style={{ color: 'var(--saju-blue)' }}>Logic</span>
                <span className="text-[10px] font-medium text-white/50 -mt-1 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                    {isEn ? 'Saju' : '사주'}
                </span>
            </div>

            {/* 자미두수 (Right Bottom) */}
            <div
                className="absolute bottom-8 right-0 translate-x-12 flex flex-col items-start cursor-pointer group"
                onClick={() => setActiveTooltip('tarot')}
            >
                <span className="text-lg font-bold tracking-tighter" style={{ color: 'var(--tarot-purple)' }}>Destiny</span>
                <span className="text-[10px] font-medium text-white/50 -mt-1 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                    {isEn ? 'Ziwei' : '자미두수'}
                </span>
            </div>

            {/* 점성술 (Left Bottom) */}
            <div
                className="absolute bottom-8 left-0 -translate-x-12 flex flex-col items-end cursor-pointer group"
                onClick={() => setActiveTooltip('star')}
            >
                <span className="text-lg font-bold tracking-tighter" style={{ color: 'var(--star-yellow)' }}>Flow</span>
                <span className="text-[10px] font-medium text-white/50 -mt-1 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                    {isEn ? 'Astrology' : '점성술'}
                </span>
            </div>

            {/* 중앙 텍스트 (신뢰도) */}
            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                >
                    <div className="text-2xl font-bold text-white drop-shadow-lg">
                        {Math.round((currentScores.saju + currentScores.star + currentScores.tarot) / 3)}%
                    </div>
                </motion.div>
            )}

            {/* 툴팁 상세 설명 패널 */}
            <AnimatePresence>
                {activeTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-4 left-0 right-0 mx-4 md:mx-0 p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-center z-20"
                        onClick={() => setActiveTooltip(null)}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg">
                                {activeTooltip === 'saju' && "📜"}
                                {activeTooltip === 'star' && "✨"}
                                {activeTooltip === 'tarot' && "🔮"}
                            </span>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                                {activeTooltip === 'saju' && (isEn ? "Saju Pillars Breakdown" : "사주 원국 분석")}
                                {activeTooltip === 'star' && (isEn ? "Astrology Transit Flow" : "별자리 트랜짓 흐름")}
                                {activeTooltip === 'tarot' && (isEn ? "Ziwei Palace Structure" : "자미두수 12궁 명반")}
                            </h4>
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed text-left">
                            {activeTooltip === 'saju' && (details?.saju || (isEn ? "Detailed analysis of your birth date and time based on ancient eastern four pillars." : "생년월일시를 바탕으로 분석한 동양 정통 사주 원국과 10년 대운의 구조입니다."))}
                            {activeTooltip === 'star' && (details?.star || (isEn ? "Planetary alignments, transits, and elemental distributions at your birth moment." : "출생 순간의 행성 정렬과 현재의 트랜짓이 가리키는 기회의 창입니다."))}
                            {activeTooltip === 'tarot' && (details?.ziwei || (isEn ? "12-Palace destiny chart analysis based on your birth coordinates." : "출생 좌표를 바탕으로 산출된 자미두수 12궁 명반과 기회의 방향성 지표입니다."))}
                        </p>
                        <div className="mt-2 text-[10px] text-gold/60 text-right">{isEn ? 'Click to close' : '클릭하여 닫기'}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
