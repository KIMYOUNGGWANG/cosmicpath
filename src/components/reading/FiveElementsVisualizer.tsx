'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, CheckCircle2, Compass } from 'lucide-react';
import {
    analyzeElementDistribution,
    diagnoseElementBalance,
    FIVE_ELEMENTS,
    FIVE_ELEMENTS_HANJA,
    type SajuResult,
} from '@/lib/engines/saju';

interface FiveElementsVisualizerProps {
    saju: SajuResult;
    language?: 'ko' | 'en';
    className?: string;
}

type ElementKey = keyof typeof FIVE_ELEMENTS;

const ELEMENT_CONFIG: Record<
    ElementKey,
    {
        nameKo: string;
        nameEn: string;
        hanja: string;
        color: string;
        textColor: string;
        bgLight: string;
        borderColor: string;
        glowColor: string;
        meaningKo: string;
        meaningEn: string;
    }
> = {
    wood: {
        nameKo: '목(木)',
        nameEn: 'Wood',
        hanja: '木',
        color: '#10B981', // emerald-500
        textColor: 'text-emerald-400',
        bgLight: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        meaningKo: '성장, 시작, 추진력, 창의성',
        meaningEn: 'Growth, initiation, momentum, creativity',
    },
    fire: {
        nameKo: '화(火)',
        nameEn: 'Fire',
        hanja: '火',
        color: '#EF4444', // red-500
        textColor: 'text-rose-400',
        bgLight: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        glowColor: 'rgba(239, 68, 68, 0.4)',
        meaningKo: '열정, 확산, 표현력, 직관',
        meaningEn: 'Passion, expansion, expression, intuition',
    },
    earth: {
        nameKo: '토(土)',
        nameEn: 'Earth',
        hanja: '土',
        color: '#F59E0B', // amber-500
        textColor: 'text-amber-400',
        bgLight: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        meaningKo: '안정, 중재, 신용, 포용력',
        meaningEn: 'Stability, mediation, trust, inclusiveness',
    },
    metal: {
        nameKo: '금(金)',
        nameEn: 'Metal',
        hanja: '金',
        color: '#94A3B8', // slate-400
        textColor: 'text-slate-300',
        bgLight: 'bg-slate-400/10',
        borderColor: 'border-slate-400/30',
        glowColor: 'rgba(148, 163, 184, 0.4)',
        meaningKo: '결단, 규율, 분석력, 완결성',
        meaningEn: 'Decisiveness, discipline, analytical, closure',
    },
    water: {
        nameKo: '수(水)',
        nameEn: 'Water',
        hanja: 'Water',
        color: '#38BDF8', // sky-400
        textColor: 'text-sky-400',
        bgLight: 'bg-sky-400/10',
        borderColor: 'border-sky-400/30',
        glowColor: 'rgba(56, 189, 248, 0.4)',
        meaningKo: '지혜, 유연성, 통찰, 적응력',
        meaningEn: 'Wisdom, fluidity, insight, adaptability',
    },
};

// 5각 오행 노드 좌표 (반지름 R=85, 중심 120, 120)
// 목(상단/상승) -> 화(우상) -> 토(우하) -> 금(좌하) -> 수(좌상)
const SVG_NODES: Record<ElementKey, { x: number; y: number }> = {
    wood: { x: 120, y: 35 },
    fire: { x: 201, y: 94 },
    earth: { x: 170, y: 190 },
    metal: { x: 70, y: 190 },
    water: { x: 39, y: 94 },
};

const ELEMENT_CYCLE: ElementKey[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export function FiveElementsVisualizer({ saju, language = 'ko', className = '' }: FiveElementsVisualizerProps) {
    const isEn = language === 'en';
    const distribution = analyzeElementDistribution(saju);
    const balance = diagnoseElementBalance(saju);
    const [selectedElement, setSelectedElement] = useState<ElementKey | null>(null);

    // 총 글자수 (천간 4 + 지지 4 = 8)
    const totalCount = Object.values(distribution).reduce((acc, count) => acc + count, 0) || 8;

    const yongsin = saju.enhancedYongsin?.primary || (saju as any).yongsin;

    return (
        <div className={`rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-7 backdrop-blur-md ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                            Five Elements Dynamics
                        </span>
                        {balance.balanced ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> {isEn ? 'Balanced' : '오행 균형'}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                                <Compass className="w-3 h-3" /> {isEn ? 'Specific Focus' : '편중/특화형 명식'}
                            </span>
                        )}
                    </div>
                    <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">
                        {isEn ? 'Elemental Energy Architecture' : '나를 구성하는 5가지 원초 에너지 밸런스'}
                    </h3>
                </div>
                {yongsin && (
                    <div className="flex items-center gap-2 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl px-3 py-1.5 self-start sm:self-auto">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-white/70">{isEn ? 'Key Activator:' : '핵심 균형자(용신):'}</span>
                        <span className="font-bold text-[#D4AF37]">
                            {ELEMENT_CONFIG[yongsin as ElementKey]?.nameKo ?? yongsin}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Grid: Interactive Circular Map + Horizontal Bars */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: SVG Network Map */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
                    <div className="relative w-[240px] h-[240px]">
                        <svg viewBox="0 0 240 240" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="streamFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>

                            {/* 1. 상생 외곽 순환선 */}
                            {ELEMENT_CYCLE.map((el, i) => {
                                const nextEl = ELEMENT_CYCLE[(i + 1) % ELEMENT_CYCLE.length];
                                const p1 = SVG_NODES[el];
                                const p2 = SVG_NODES[nextEl];
                                return (
                                    <line
                                        key={`gen-${el}-${nextEl}`}
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={p2.x}
                                        y2={p2.y}
                                        stroke="url(#streamFlow)"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                        className="opacity-60"
                                    />
                                );
                            })}

                            {/* 2. 상극 내부 별모양 선 */}
                            <path
                                d={`M ${SVG_NODES.wood.x} ${SVG_NODES.wood.y} 
                                   L ${SVG_NODES.earth.x} ${SVG_NODES.earth.y} 
                                   L ${SVG_NODES.water.x} ${SVG_NODES.water.y} 
                                   L ${SVG_NODES.fire.x} ${SVG_NODES.fire.y} 
                                   L ${SVG_NODES.metal.x} ${SVG_NODES.metal.y} Z`}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.08)"
                                strokeWidth="1"
                            />

                            {/* 3. 5개 노드 렌더링 */}
                            {ELEMENT_CYCLE.map((key) => {
                                const node = SVG_NODES[key];
                                const count = distribution[key];
                                const cfg = ELEMENT_CONFIG[key];
                                const isSelected = selectedElement === key;
                                const isLacking = count === 0;
                                const isExcessive = count >= 3;

                                return (
                                    <g
                                        key={key}
                                        className="cursor-pointer transition-transform duration-200"
                                        onClick={() => setSelectedElement(selectedElement === key ? null : key)}
                                    >
                                        {/* Outer Ring on select */}
                                        {isSelected && (
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={25}
                                                fill="none"
                                                stroke={cfg.color}
                                                strokeWidth="2"
                                                strokeDasharray="4 2"
                                            />
                                        )}

                                        {/* Background Circle */}
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={19}
                                            fill="#111319"
                                            stroke={cfg.color}
                                            strokeWidth={isExcessive ? 3 : isLacking ? 1 : 2}
                                            strokeOpacity={isLacking ? 0.3 : 1}
                                        />

                                        {/* Inner Fill if count > 0 */}
                                        {count > 0 && (
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={Math.min(16, 7 + count * 2.5)}
                                                fill={cfg.color}
                                                fillOpacity={0.25}
                                            />
                                        )}

                                        {/* Hanja text */}
                                        <text
                                            x={node.x}
                                            y={node.y - 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill={isLacking ? 'rgba(255, 255, 255, 0.3)' : '#FFFFFF'}
                                            fontSize="11"
                                            fontWeight="bold"
                                        >
                                            {cfg.hanja}
                                        </text>

                                        {/* Count Badge */}
                                        <text
                                            x={node.x}
                                            y={node.y + 10}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill={cfg.color}
                                            fontSize="9"
                                            fontWeight="bold"
                                        >
                                            {count}개
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Center Label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase font-cinzel tracking-widest text-white/30 text-center">
                                Harmony<br />Network
                            </span>
                        </div>
                    </div>
                    <span className="text-[11px] text-white/40 mt-1">
                        {isEn ? 'Tap node to see element attributes' : '원형 노드를 탭하여 세부 속성 확인'}
                    </span>
                </div>

                {/* Right: Five Element Progress Bars */}
                <div className="lg:col-span-7 space-y-3">
                    {ELEMENT_CYCLE.map((key) => {
                        const count = distribution[key];
                        const percentage = Math.round((count / totalCount) * 100);
                        const cfg = ELEMENT_CONFIG[key];
                        const isLacking = count === 0;
                        const isExcessive = count >= 3;
                        const isSelected = selectedElement === key;

                        return (
                            <div
                                key={key}
                                onClick={() => setSelectedElement(selectedElement === key ? null : key)}
                                className={`rounded-xl border p-3 transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-white/40 bg-white/[0.08] shadow-lg'
                                        : 'border-white/5 bg-black/20 hover:bg-white/[0.03]'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${cfg.textColor}`}>
                                            {isEn ? cfg.nameEn : cfg.nameKo}
                                        </span>
                                        <span className="text-white/40 text-[11px] hidden sm:inline">
                                            {isEn ? cfg.meaningEn : cfg.meaningKo}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono">
                                        {isLacking && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                                {isEn ? 'Deficit (0)' : '결핍 (0개)'}
                                            </span>
                                        )}
                                        {isExcessive && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                                {isEn ? 'Dominant' : '과다 (주도)'}
                                            </span>
                                        )}
                                        <span className="text-white/80 font-bold">{count}개</span>
                                        <span className="text-white/40 text-[11px]">({percentage}%)</span>
                                    </div>
                                </div>

                                {/* Progress Track */}
                                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(percentage, isLacking ? 0 : 5)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{
                                            backgroundColor: cfg.color,
                                            boxShadow: count > 0 ? `0 0 10px ${cfg.glowColor}` : 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Diagnosis / Action Guidance */}
            <div className="mt-5 rounded-2xl bg-black/40 border border-white/5 p-4 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold text-white">
                            {isEn ? 'Structural Elemental Prescription: ' : '명식 오행 구조화 진단: '}
                        </span>
                        <span className="text-white/70">
                            {balance.lacking.length > 0 ? (
                                <>
                                    현재 명식에{' '}
                                    <strong className="text-rose-300">
                                        {balance.lacking.map((k) => ELEMENT_CONFIG[k].nameKo).join(', ')}
                                    </strong>
                                    이(가) 부족하여 결정 시 유연성과 비축력에 불균형이 발생할 수 있습니다.{' '}
                                    {yongsin && (
                                        <>
                                            이를 보완하는{' '}
                                            <strong className="text-[#D4AF37]">
                                                {ELEMENT_CONFIG[yongsin as ElementKey]?.nameKo ?? yongsin}
                                            </strong>{' '}
                                            에너지를 업무 환경과 결정 시기에 우선 배치하는 것이 유리합니다.
                                        </>
                                    )}
                                </>
                            ) : balance.excessive.length > 0 ? (
                                <>
                                    <strong className="text-amber-300">
                                        {balance.excessive.map((k) => ELEMENT_CONFIG[k].nameKo).join(', ')}
                                    </strong>
                                    의 기운이 매우 강하게 주도하고 있어, 목표를 향한 추진력은 월등하나 주변과의 속도 조율에 주의해야 합니다.
                                </>
                            ) : (
                                <>모든 오행이 고르게 조화되어 있어 특정 영역에 편중되지 않고 안정적인 의사결정 체력을 지니고 있습니다.</>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
