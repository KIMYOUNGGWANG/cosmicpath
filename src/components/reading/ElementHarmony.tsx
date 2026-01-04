'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { calculateElementScores, type ElementScores } from '@/lib/engines/element-calculator';
import type { SajuResult } from '@/lib/engines/saju';

// Five Elements (Wu Xing) with their traditional associations
const ELEMENTS = [
    { name: '木', en: 'Wood', color: '#22C55E', angle: 270, description: '성장, 창의력' },
    { name: '火', en: 'Fire', color: '#EF4444', angle: 342, description: '열정, 에너지' },
    { name: '土', en: 'Earth', color: '#F59E0B', angle: 54, description: '안정, 신뢰' },
    { name: '金', en: 'Metal', color: '#94A3B8', angle: 126, description: '결단력, 정의' },
    { name: '水', en: 'Water', color: '#3B82F6', angle: 198, description: '지혜, 유연성' },
];

interface ElementHarmonyProps {
    sajuData?: SajuResult;
    scores?: ElementScores;
    language?: 'ko' | 'en';
}

export function ElementHarmony({ sajuData, scores, language = 'ko' }: ElementHarmonyProps) {
    const isEn = language === 'en';

    // Priority: sajuData > scores > defaults
    // Calculate from actual saju data if available (most accurate)
    const elementScores = useMemo(() => {
        if (sajuData?.elements && sajuData.elements.length > 0) {
            return calculateElementScores(sajuData);
        }
        if (scores) {
            return {
                wood: scores.wood ?? 0,
                fire: scores.fire ?? 0,
                earth: scores.earth ?? 0,
                metal: scores.metal ?? 0,
                water: scores.water ?? 0,
            };
        }
        // No data available - show placeholder
        return { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };
    }, [sajuData, scores]);

    const total = Object.values(elementScores).reduce((a, b) => a + b, 0);
    const elementsWithScores = ELEMENTS.map((el) => ({
        ...el,
        score: elementScores[el.en.toLowerCase() as keyof typeof elementScores],
        percentage: Math.round((elementScores[el.en.toLowerCase() as keyof typeof elementScores] / total) * 100),
    }));

    // Find dominant and lacking elements
    const sorted = [...elementsWithScores].sort((a, b) => b.score - a.score);
    const dominant = sorted[0];
    const lacking = sorted[sorted.length - 1];

    // Calculate polygon points for radar-like visualization
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 100;

    const getPoint = (angle: number, score: number) => {
        const radius = (score / 100) * maxRadius;
        const radian = (angle - 90) * (Math.PI / 180);
        return {
            x: centerX + radius * Math.cos(radian),
            y: centerY + radius * Math.sin(radian),
        };
    };

    const polygonPoints = elementsWithScores
        .map((el) => {
            const point = getPoint(el.angle, el.score);
            return `${point.x},${point.y}`;
        })
        .join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6"
        >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-gold">☯</span>
                {isEn ? 'Five Elements Harmony' : '오행(五行) 균형'}
            </h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Radar Visualization */}
                    <div className="relative w-full max-w-[300px] aspect-square mx-auto">
                        <svg viewBox="0 0 300 300" className="w-full h-full text-white">
                            <defs>
                                <radialGradient id="elementGradient" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
                                    <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
                                </radialGradient>
                            </defs>

                            {/* Background circles */}
                            {[25, 50, 75, 100].map((r) => (
                                <circle
                                    key={r}
                                    cx={centerX}
                                    cy={centerY}
                                    r={(r / 100) * maxRadius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            ))}

                            {/* Axis lines */}
                            {elementsWithScores.map((el) => {
                                const endpoint = getPoint(el.angle, 100);
                                return (
                                    <line
                                        key={el.name}
                                        x1={centerX}
                                        y1={centerY}
                                        x2={endpoint.x}
                                        y2={endpoint.y}
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            {/* Data polygon */}
                            <motion.polygon
                                points={polygonPoints}
                                fill="url(#elementGradient)"
                                stroke="#D4AF37"
                                strokeWidth="2"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            />

                            {/* Element labels and points */}
                            {elementsWithScores.map((el) => {
                                const labelPoint = getPoint(el.angle, 115);
                                const dataPoint = getPoint(el.angle, el.score);
                                return (
                                    <g key={el.name}>
                                        {/* Data point */}
                                        <motion.circle
                                            cx={dataPoint.x}
                                            cy={dataPoint.y}
                                            r="6"
                                            fill={el.color}
                                            stroke="rgba(0,0,0,0.3)"
                                            strokeWidth="2"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + elementsWithScores.indexOf(el) * 0.1 }}
                                        />
                                        {/* Label */}
                                        <text
                                            x={labelPoint.x}
                                            y={labelPoint.y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill={el.color}
                                            fontSize="14"
                                            fontWeight="bold"
                                        >
                                            {el.name}
                                        </text>
                                        <text
                                            x={labelPoint.x}
                                            y={labelPoint.y + 14}
                                            textAnchor="middle"
                                            fill="rgba(255,255,255,0.5)"
                                            fontSize="9"
                                        >
                                            {el.score}%
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Center emblem */}
                            <circle cx={centerX} cy={centerY} r="20" fill="rgba(0,0,0,0.5)" stroke="#D4AF37" strokeWidth="1" />
                            <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fill="#D4AF37" fontSize="14" fontWeight="bold">
                                ☯
                            </text>
                        </svg>
                    </div>

                    {/* Analysis Text */}
                    <div className="flex-1 space-y-4">
                        {/* Dominant Element */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${dominant.color}15`, borderLeft: `3px solid ${dominant.color}` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{dominant.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${dominant.color}30`, color: dominant.color }}>
                                    {isEn ? 'Dominant' : '강점'}
                                </span>
                            </div>
                            <p className="text-sm text-moonlight leading-relaxed">
                                {isEn
                                    ? `Your ${dominant.en} element is thriving. This grants you ${dominant.description.split(',')[0].toLowerCase()} energy.`
                                    : `당신의 ${dominant.name}(${dominant.en}) 기운이 가장 왕성합니다. ${dominant.description}의 에너지가 강합니다.`}
                            </p>
                        </div>

                        {/* Lacking Element */}
                        <div className="p-4 rounded-xl" style={{ backgroundColor: `${lacking.color}10`, borderLeft: `3px solid ${lacking.color}50` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl opacity-60">{lacking.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                                    {isEn ? 'Needs Attention' : '보완 필요'}
                                </span>
                            </div>
                            <p className="text-sm text-dim leading-relaxed">
                                {isEn
                                    ? `Your ${lacking.en} element requires nurturing. Focus on activities related to ${lacking.description.split(',')[0].toLowerCase()}.`
                                    : `${lacking.name}(${lacking.en}) 기운이 약합니다. ${lacking.description}과 관련된 활동이 필요합니다.`}
                            </p>
                        </div>

                        {/* Balance Tip */}
                        <p className="text-xs text-dim italic pt-2">
                            {isEn
                                ? '* The Five Elements cycle continuously. Strengthening one affects the others.'
                                : '* 오행은 끊임없이 순환합니다. 하나를 강화하면 다른 것에도 영향을 미칩니다.'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
