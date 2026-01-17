'use client';

import { motion } from 'framer-motion';

interface MatchRadarProps {
    scores: {
        chemistry: number;
        stability: number;
        growth: number;
        passion: number;
        communication?: number;
        trust?: number;
    };
    isLoading?: boolean;
}

/**
 * 궁합용 6각 레이더 차트
 */
export function MatchRadar({ scores, isLoading = false }: MatchRadarProps) {
    const dimensions = [
        { key: 'chemistry', label: '케미', color: '#EC4899' },      // pink
        { key: 'stability', label: '안정', color: '#10B981' },      // emerald
        { key: 'growth', label: '성장', color: '#8B5CF6' },         // purple
        { key: 'passion', label: '열정', color: '#F59E0B' },        // amber
        { key: 'communication', label: '소통', color: '#3B82F6' },  // blue
        { key: 'trust', label: '신뢰', color: '#6366F1' },          // indigo
    ];

    const centerX = 100;
    const centerY = 100;
    const maxRadius = 70;

    // 좌표 계산
    const getCoord = (value: number, index: number) => {
        const angle = (index * 60 - 90) * (Math.PI / 180);
        const radius = maxRadius * (value / 100);
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    };

    // 각 축 끝점
    const axisEnds = dimensions.map((_, i) => getCoord(100, i));

    // 데이터 폴리곤
    const dataPoints = dimensions.map((d, i) => {
        const val = scores[d.key as keyof typeof scores] || 50;
        return getCoord(val, i);
    });

    const polygonPath = dataPoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z';

    return (
        <div className="relative w-full max-w-[280px] mx-auto aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                    <linearGradient id="matchRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="matchGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 배경 동심원 */}
                {[25, 50, 75, 100].map((r) => (
                    <circle
                        key={r}
                        cx={centerX}
                        cy={centerY}
                        r={maxRadius * (r / 100)}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* 축 라인 */}
                {axisEnds.map((end, i) => (
                    <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* 데이터 폴리곤 */}
                <motion.path
                    d={polygonPath}
                    fill="url(#matchRadarGradient)"
                    stroke="url(#matchRadarGradient)"
                    strokeWidth="2"
                    filter="url(#matchGlow)"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                />

                {/* 데이터 포인트 */}
                {dataPoints.map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={dimensions[i].color}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    />
                ))}
            </svg>

            {/* 라벨 */}
            {dimensions.map((d, i) => {
                const labelPos = getCoord(130, i);
                const val = scores[d.key as keyof typeof scores] || 50;
                return (
                    <div
                        key={d.key}
                        className="absolute text-center"
                        style={{
                            left: `${labelPos.x}%`,
                            top: `${labelPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <div className="text-xs font-bold" style={{ color: d.color }}>
                            {val}
                        </div>
                        <div className="text-[10px] text-white/60">{d.label}</div>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Quick Insight 배지 컴포넌트
 */
interface InsightBadgeProps {
    icon: string;
    label: string;
    value: string;
    sentiment: 'positive' | 'neutral' | 'caution';
}

export function InsightBadge({ icon, label, value, sentiment }: InsightBadgeProps) {
    const colors = {
        positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        neutral: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        caution: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${colors[sentiment]}`}
        >
            <span className="text-lg">{icon}</span>
            <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
                <div className="text-sm font-bold">{value}</div>
            </div>
        </motion.div>
    );
}

/**
 * Cosmic Signature 배지
 */
interface CosmicSignatureProps {
    title: string;
    archetype: string;
    emoji: string;
    oneLiner: string;
}

export function CosmicSignatureBadge({ title, archetype, emoji, oneLiner }: CosmicSignatureProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl border border-[var(--acc-gold)]/30 bg-gradient-to-br from-[var(--acc-gold)]/10 to-purple-500/10 p-6 text-center"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--acc-gold)] to-transparent opacity-50" />

            <div className="text-4xl mb-3">{emoji}</div>
            <h3 className="text-xl font-cinzel font-bold text-[var(--acc-gold)] mb-1">
                {title}
            </h3>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-3">
                {archetype}
            </div>
            <p className="text-sm text-white/80 font-outfit">
                "{oneLiner}"
            </p>
        </motion.div>
    );
}

/**
 * 타임라인 카드
 */
interface TimelineCardProps {
    period: string;
    title: string;
    prediction: string;
    advice: string;
    riskLevel?: 'low' | 'medium' | 'high';
}

export function TimelineCard({ period, title, prediction, advice, riskLevel = 'low' }: TimelineCardProps) {
    const riskColors = {
        low: 'border-emerald-500/20',
        medium: 'border-yellow-500/20',
        high: 'border-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-card p-4 ${riskColors[riskLevel]}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{title.split(' ')[0]}</span>
                <span className="text-xs font-bold text-[var(--acc-gold)]">{period}</span>
            </div>
            <p className="text-sm text-white/80 mb-2">{prediction}</p>
            <p className="text-xs text-purple-400">💡 {advice}</p>
        </motion.div>
    );
}

/**
 * 액션 체크리스트
 */
interface ActionChecklistProps {
    doList: string[];
    dontList: string[];
}

export function ActionChecklist({ doList, dontList }: ActionChecklistProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Do */}
            <div className="glass-card p-4 border-emerald-500/20">
                <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    ✅ DO
                </h4>
                <ul className="space-y-2">
                    {doList.slice(0, 5).map((item, i) => (
                        <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Don't */}
            <div className="glass-card p-4 border-red-500/20">
                <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                    ❌ DON'T
                </h4>
                <ul className="space-y-2">
                    {dontList.slice(0, 5).map((item, i) => (
                        <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/**
 * 럭키 요소 카드
 */
interface LuckyElementsProps {
    colors: string[];
    numbers: number[];
    direction: string;
    season: string;
}

export function LuckyElements({ colors, numbers, direction, season }: LuckyElementsProps) {
    return (
        <div className="glass-card p-4 border-[var(--acc-gold)]/20">
            <h4 className="text-sm font-cinzel font-bold text-[var(--acc-gold)] mb-3">
                🍀 Lucky Elements
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <span className="text-white/50">색상</span>
                    <p className="text-white font-bold">{colors.join(', ')}</p>
                </div>
                <div>
                    <span className="text-white/50">숫자</span>
                    <p className="text-white font-bold">{numbers.join(', ')}</p>
                </div>
                <div>
                    <span className="text-white/50">방위</span>
                    <p className="text-white font-bold">{direction}</p>
                </div>
                <div>
                    <span className="text-white/50">계절</span>
                    <p className="text-white font-bold">{season}</p>
                </div>
            </div>
        </div>
    );
}
