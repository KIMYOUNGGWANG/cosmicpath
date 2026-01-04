'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Heart, Sparkles } from 'lucide-react';

// Five Elements
const ELEMENTS = [
    { name: '木', en: 'Wood', color: '#22C55E', angle: 270 },
    { name: '火', en: 'Fire', color: '#EF4444', angle: 342 },
    { name: '土', en: 'Earth', color: '#F59E0B', angle: 54 },
    { name: '金', en: 'Metal', color: '#94A3B8', angle: 126 },
    { name: '水', en: 'Water', color: '#3B82F6', angle: 198 },
];

interface ElementScores {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
}

interface CompatibilityOverlayProps {
    myScores: ElementScores;
    partnerScores: ElementScores;
    myName?: string;
    partnerName?: string;
    language?: 'ko' | 'en';
}

export function CompatibilityOverlay({
    myScores,
    partnerScores,
    myName = '나',
    partnerName = '상대',
    language = 'ko'
}: CompatibilityOverlayProps) {
    const isEn = language === 'en';

    // Calculate compatibility score
    const compatibilityScore = useMemo(() => {
        const keys: (keyof ElementScores)[] = ['wood', 'fire', 'earth', 'metal', 'water'];
        let totalDiff = 0;
        keys.forEach(key => {
            totalDiff += Math.abs(myScores[key] - partnerScores[key]);
        });
        // Lower difference = higher compatibility
        const avgDiff = totalDiff / 5;
        return Math.max(0, Math.min(100, 100 - avgDiff));
    }, [myScores, partnerScores]);

    // Generate polygon points
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

    const myPolygon = ELEMENTS.map(el => {
        const score = myScores[el.en.toLowerCase() as keyof ElementScores];
        const point = getPoint(el.angle, score);
        return `${point.x},${point.y}`;
    }).join(' ');

    const partnerPolygon = ELEMENTS.map(el => {
        const score = partnerScores[el.en.toLowerCase() as keyof ElementScores];
        const point = getPoint(el.angle, score);
        return `${point.x},${point.y}`;
    }).join(' ');

    // Determine compatibility tier
    const getTier = (score: number) => {
        if (score >= 85) return { label: isEn ? 'Soulmate' : '천생연분', color: '#FFD700', emoji: '💫' };
        if (score >= 70) return { label: isEn ? 'Great Match' : '환상의 짝', color: '#22C55E', emoji: '💚' };
        if (score >= 55) return { label: isEn ? 'Good Harmony' : '좋은 궁합', color: '#3B82F6', emoji: '💙' };
        if (score >= 40) return { label: isEn ? 'Needs Work' : '노력 필요', color: '#F59E0B', emoji: '💛' };
        return { label: isEn ? 'Challenging' : '도전적', color: '#EF4444', emoji: '❤️‍🔥' };
    };

    const tier = getTier(compatibilityScore);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart size={20} className="text-pink-400" />
                    <h2 className="text-lg font-bold text-white">
                        {isEn ? 'Element Compatibility' : '오행 궁합'}
                    </h2>
                </div>
                <p className="text-xs text-white/50">
                    {myName} + {partnerName}
                </p>
            </div>

            {/* Radar Overlay */}
            <div className="relative w-[300px] h-[300px] mx-auto">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                    <defs>
                        <linearGradient id="myGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="partnerGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
                        </linearGradient>
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
                    {ELEMENTS.map((el) => {
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

                    {/* My polygon (Gold) */}
                    <motion.polygon
                        points={myPolygon}
                        fill="url(#myGradient)"
                        stroke="#D4AF37"
                        strokeWidth="2"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    />

                    {/* Partner polygon (Purple) */}
                    <motion.polygon
                        points={partnerPolygon}
                        fill="url(#partnerGradient)"
                        stroke="#A855F7"
                        strokeWidth="2"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    />

                    {/* Element labels */}
                    {ELEMENTS.map((el) => {
                        const labelPoint = getPoint(el.angle, 115);
                        return (
                            <text
                                key={el.name}
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
                        );
                    })}

                    {/* Center emblem */}
                    <circle cx={centerX} cy={centerY} r="25" fill="rgba(0,0,0,0.6)" stroke={tier.color} strokeWidth="2" />
                    <text x={centerX} y={centerY - 5} textAnchor="middle" fill={tier.color} fontSize="18" fontWeight="bold">
                        {Math.round(compatibilityScore)}
                    </text>
                    <text x={centerX} y={centerY + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">
                        {isEn ? 'MATCH' : '궁합'}
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gold/60 border border-gold" />
                    <span className="text-white/70">{myName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500/60 border border-purple-400" />
                    <span className="text-white/70">{partnerName}</span>
                </div>
            </div>

            {/* Result Badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 rounded-xl text-center"
                style={{ backgroundColor: `${tier.color}15`, border: `1px solid ${tier.color}40` }}
            >
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">{tier.emoji}</span>
                    <span className="text-lg font-bold" style={{ color: tier.color }}>
                        {tier.label}
                    </span>
                </div>
                <p className="text-xs text-white/60">
                    {isEn
                        ? `Your elements complement each other at ${Math.round(compatibilityScore)}% harmony.`
                        : `두 사람의 오행이 ${Math.round(compatibilityScore)}%의 조화를 이루고 있습니다.`}
                </p>
            </motion.div>

            {/* CTA */}
            <div className="mt-4 text-center">
                <button className="text-xs text-gold underline hover:text-gold/80 transition-colors flex items-center gap-1 mx-auto">
                    <Sparkles size={12} />
                    {isEn ? 'Get detailed compatibility reading' : '상세 궁합 분석 받기'}
                </button>
            </div>
        </motion.div>
    );
}
