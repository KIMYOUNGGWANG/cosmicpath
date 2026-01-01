'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';


export interface TimelineScore {
    year: number;
    score: number;
    type: 'opportunity' | 'warning' | 'neutral';
    summary: string;
}

interface FortuneTimelineChartProps {
    scores: TimelineScore[];
    language?: 'ko' | 'en';
}

export function FortuneTimelineChart({ scores, language = 'ko' }: FortuneTimelineChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const chartId = useId();
    const isEn = language === 'en';

    if (!scores || scores.length === 0) return null;

    // Fixed aspect ratio coordinate system
    // We use these internal coordinates, but the SVG will scale with CSS
    const width = 600;
    const height = 300;
    const padding = { top: 40, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate scales
    const minYear = Math.min(...scores.map(s => s.year));
    const maxYear = Math.max(...scores.map(s => s.year));
    const yearRange = maxYear - minYear || 1;

    const minScore = 0;
    const maxScore = 100;
    const scoreRange = maxScore - minScore;

    // Scale functions
    const xScale = (year: number) => padding.left + ((year - minYear) / yearRange) * chartWidth;
    const yScale = (score: number) => padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;

    // Generate path data
    const pathData = scores.map((s, i) => {
        const x = xScale(s.year);
        const y = yScale(s.score);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Generate area path (for gradient fill)
    const areaPath = pathData + ` L ${xScale(scores[scores.length - 1].year)} ${padding.top + chartHeight} L ${xScale(scores[0].year)} ${padding.top + chartHeight} Z`;

    // Get color based on type
    const getTypeColor = (type: TimelineScore['type']) => {
        switch (type) {
            case 'opportunity': return { stroke: '#FFD700', fill: 'rgba(255, 215, 0, 0.2)' };
            case 'warning': return { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.2)' };
            default: return { stroke: '#A1A1AA', fill: 'rgba(161, 161, 170, 0.2)' };
        }
    };

    // Determine dominant type for gradient
    const typeCount = scores.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const dominantType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0] as TimelineScore['type'];
    const dominantColor = getTypeColor(dominantType);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut"
            }
        },
    } as const;

    const pointVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
    } as const;

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="w-full relative"
        >
            <div className="w-full aspect-[2/1]">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <linearGradient id={`areaGradient-${chartId}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={dominantColor.stroke} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={dominantColor.stroke} stopOpacity="0.05" />
                        </linearGradient>
                        <filter id={`glow-${chartId}`}>
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <g key={val}>
                            <line
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={yScale(val)}
                                y2={yScale(val)}
                                stroke="rgba(255,255,255,0.1)"
                                strokeDasharray="4,4"
                            />
                            <text
                                x={padding.left - 10}
                                y={yScale(val)}
                                fill="rgba(255,255,255,0.4)"
                                fontSize="10"
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {val}
                            </text>
                        </g>
                    ))}

                    {/* Area fill - Fades in */}
                    <motion.path
                        d={areaPath}
                        fill={`url(#areaGradient-${chartId})`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    />

                    {/* Main line - Draws itself */}
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke={dominantColor.stroke}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${chartId})`}
                        variants={pathVariants}
                    />

                    {/* Data points */}
                    {scores.map((s, i) => {
                        const x = xScale(s.year);
                        const y = yScale(s.score);
                        const color = getTypeColor(s.type);
                        const isHovered = hoveredIndex === i;

                        return (
                            <motion.g key={i} variants={pointVariants}>
                                {/* Year label - Responsive positioning */}
                                <text
                                    x={x}
                                    y={height - padding.bottom + 25}
                                    fill={isHovered ? '#FFD700' : 'rgba(255,255,255,0.5)'}
                                    fontSize="11"
                                    textAnchor="middle"
                                    fontWeight={isHovered ? 'bold' : 'normal'}
                                    className="transition-colors duration-200"
                                >
                                    {s.year}
                                </text>

                                {/* Interactive Zone (Larger hidden circle for easier hovering) */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={20}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onTouchStart={() => setHoveredIndex(i)}
                                />

                                {/* Visible Point */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? 8 : 5}
                                    fill={color.stroke}
                                    stroke="rgba(0,0,0,0.5)"
                                    strokeWidth="2"
                                    className="pointer-events-none transition-all duration-200"
                                />

                                {/* Tooltip - rendered last to be on top */}
                                {isHovered && (
                                    <g pointerEvents="none">
                                        {/* Tooltip Background */}
                                        <rect
                                            x={Math.max(padding.left, Math.min(x - 60, width - padding.right - 120))}
                                            y={y - 65}
                                            width={120}
                                            height={50}
                                            rx={8}
                                            fill="rgba(10,10,10,0.95)"
                                            stroke={color.stroke}
                                            strokeWidth="1"
                                            filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.3))"
                                        />
                                        {/* Tooltip Arrow (Simple triangle) */}
                                        <path
                                            d={`M ${x} ${y - 15} L ${x - 6} ${y - 22} L ${x + 6} ${y - 22} Z`}
                                            fill={color.stroke}
                                        />

                                        {/* Tooltip Text */}
                                        <text
                                            x={Math.max(padding.left + 60, Math.min(x, width - padding.right - 60))}
                                            y={y - 45}
                                            fill="#fff"
                                            fontSize="13"
                                            textAnchor="middle"
                                            fontWeight="bold"
                                        >
                                            {s.year} • {s.score}{isEn ? 'pts' : '점'}
                                        </text>
                                        <text
                                            x={Math.max(padding.left + 60, Math.min(x, width - padding.right - 60))}
                                            y={y - 28}
                                            fill="rgba(255,255,255,0.8)"
                                            fontSize="10"
                                            textAnchor="middle"
                                        >
                                            {s.summary.length > 15 ? s.summary.slice(0, 15) + '...' : s.summary}
                                        </text>
                                    </g>
                                )}
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* Analysis & Legend Section - Responsive Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Legend */}
                <div className="flex justify-center md:justify-start items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                        <span className="text-gray-300">{isEn ? 'Opportunity' : '기회'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <span className="text-gray-300">{isEn ? 'Caution' : '주의'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                        <span className="text-gray-300">{isEn ? 'Neutral' : '평이'}</span>
                    </span>
                </div>

                {/* Key Insights */}
                <div className="flex flex-col gap-2">
                    {/* Peak */}
                    {(() => {
                        const peak = [...scores].sort((a, b) => b.score - a.score)[0];
                        if (peak && peak.score >= 80) {
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="flex items-center gap-3 p-3 bg-gold/5 rounded-lg border border-gold/20 backdrop-blur-sm"
                                >
                                    <span className="text-xl">👑</span>
                                    <div>
                                        <div className="text-xs font-bold text-gold mb-0.5">
                                            {isEn ? `Best: ${peak.year}` : `최고의 해: ${peak.year}년`}
                                        </div>
                                        <p className="text-xs text-gray-400 leading-snug line-clamp-1">{peak.summary}</p>
                                    </div>
                                </motion.div>
                            );
                        }
                        return null;
                    })()}

                    {/* Low */}
                    {(() => {
                        const low = [...scores].sort((a, b) => a.score - b.score)[0];
                        if (low && low.score <= 60) {
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.4 }}
                                    className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20 backdrop-blur-sm"
                                >
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <div className="text-xs font-bold text-red-400 mb-0.5">
                                            {isEn ? `Caution: ${low.year}` : `주의할 해: ${low.year}년`}
                                        </div>
                                        <p className="text-xs text-gray-400 leading-snug line-clamp-1">{low.summary}</p>
                                    </div>
                                </motion.div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>
        </motion.div>
    );
}
