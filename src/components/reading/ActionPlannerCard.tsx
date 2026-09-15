'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, ArrowRight, Sparkles, Trophy } from 'lucide-react';

interface ActionItem {
    id: string;
    title: string;
    period: string;
    description: string;
    category?: string;
}

interface ActionPlannerCardProps {
    items?: ActionItem[];
    language?: 'ko' | 'en';
    className?: string;
}

const DEFAULT_ACTIONS_KO: ActionItem[] = [
    {
        id: 'action-1',
        title: '불필요한 지출 및 구독 계정 정리',
        period: '1~7일차',
        description: '사주 내 재물 누수(비겁 과다/오행 결핍)를 차단하기 위해 고정비 지출을 즉시 재점검하세요.',
        category: '재물 방어',
    },
    {
        id: 'action-2',
        title: '신규 계약 및 이직 제안 사전 필터링',
        period: '8~14일차',
        description: '구두 약속이나 감정적 호소에 흔들리지 말고, 계약서와 객관적 수치 지표만으로 의사결정하세요.',
        category: '리스크 회피',
    },
    {
        id: 'action-3',
        title: '핵심 결정 타이밍(골든 윈도우) 액션 개시',
        period: '15~30일차',
        description: '타임라인에서 지정된 길일(吉日) 에너지 주간에 맞춰 최종 결재나 제안서를 공식 제출하세요.',
        category: '골든 모멘텀',
    },
];

const DEFAULT_ACTIONS_EN: ActionItem[] = [
    {
        id: 'action-1',
        title: 'Audit and trim recurring expenses',
        period: 'Days 1-7',
        description: 'Shield against wealth leakages by eliminating unnecessary outflows and audit subscriptions.',
        category: 'Wealth Defense',
    },
    {
        id: 'action-2',
        title: 'Filter pending contracts with cold metrics',
        period: 'Days 8-14',
        description: 'Refuse verbal promises and enforce written boundaries before agreeing to new commitments.',
        category: 'Risk Mitigation',
    },
    {
        id: 'action-3',
        title: 'Execute your primary proposal in the Golden Window',
        period: 'Days 15-30',
        description: 'Synchronize submission with your indicated auspicious timing for maximum leverage.',
        category: 'Golden Momentum',
    },
];

export function ActionPlannerCard({
    items,
    language = 'ko',
    className = '',
}: ActionPlannerCardProps) {
    const isEn = language === 'en';
    const actionList = items && items.length > 0 ? items : (isEn ? DEFAULT_ACTIONS_EN : DEFAULT_ACTIONS_KO);

    const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setCompletedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const completedCount = Object.values(completedIds).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / actionList.length) * 100);

    return (
        <div className={`rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 p-5 sm:p-7 backdrop-blur-md ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                            Action Execution Blueprint
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            {completedCount}/{actionList.length} {isEn ? 'Completed' : '완료'}
                        </span>
                    </div>
                    <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">
                        {isEn ? 'Immediate Action Protocol (This Month)' : '이번 달 즉각 실행해야 할 3대 행동 강령'}
                    </h3>
                </div>

                {/* Progress Bar */}
                <div className="w-full sm:w-48">
                    <div className="flex justify-between text-[11px] text-white/50 mb-1">
                        <span>{isEn ? 'Execution Rate' : '실행 달성률'}</span>
                        <span className="font-bold text-[#D4AF37]">{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400"
                        />
                    </div>
                </div>
            </div>

            {/* Checklist Items */}
            <div className="mt-5 space-y-3">
                {actionList.map((item, index) => {
                    const isDone = !!completedIds[item.id];

                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`group flex items-start gap-4 rounded-2xl border p-4 transition-all cursor-pointer ${
                                isDone
                                    ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                                    : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                        >
                            <button
                                type="button"
                                className="mt-0.5 shrink-0 text-white/40 transition-colors group-hover:text-white"
                                aria-label={isDone ? '완료 취소' : '완료 체크'}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <Circle className="w-5 h-5" />
                                )}
                            </button>

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20">
                                        STEP 0{index + 1}
                                    </span>
                                    {item.category && (
                                        <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                                            {item.category}
                                        </span>
                                    )}
                                    <span className="text-xs text-white/40 font-mono ml-auto">
                                        {item.period}
                                    </span>
                                </div>
                                <h4
                                    className={`mt-1.5 text-sm font-semibold transition-all ${
                                        isDone ? 'line-through text-white/40' : 'text-white'
                                    }`}
                                >
                                    {item.title}
                                </h4>
                                <p
                                    className={`mt-1 text-xs leading-relaxed transition-all ${
                                        isDone ? 'text-white/30' : 'text-white/70'
                                    }`}
                                >
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Achievement Footer */}
            {progressPercent === 100 && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 font-semibold"
                >
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span>{isEn ? 'All core protocols completed! Golden momentum is maximized.' : '모든 행동 지침을 완수했습니다. 2026년 운의 모멘텀이 극대화되었습니다.'}</span>
                </motion.div>
            )}
        </div>
    );
}
