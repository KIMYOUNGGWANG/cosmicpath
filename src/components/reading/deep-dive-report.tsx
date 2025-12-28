'use client';

import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { CosmicReport, CosmicTrait } from '@/lib/ai/json-schema';
import { cn } from '@/lib/utils';
import { Sparkles, Star, Shield, TrendingUp, Calendar, BookOpen, Orbit, Layers } from 'lucide-react';

interface DeepDiveReportProps {
    report: CosmicReport;
}

export function DeepDiveReport({ report }: DeepDiveReportProps) {
    const [activeTab, setActiveTab] = useState<'saju' | 'astro' | 'tarot'>('saju');

    if (!report) return null;

    return (
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-32">
            {/* 1. Header: The Hook */}
            <HeaderSection summary={report.summary} />

            {/* 2. Visual Break: Cosmic Traits */}
            <TraitsSection traits={report.traits} />

            {/* 3. Deep Dive: Analysis Tabs */}
            <section className="mt-6 md:mt-8 px-4 md:px-6">
                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    {(['saju', 'astro', 'tarot'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-all duration-300",
                                activeTab === tab
                                    ? "bg-white/10 text-gold shadow-[0_0_15px_rgba(255,215,0,0.1)] border border-gold/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab === 'saju' && "📜 사주명리"}
                            {tab === 'astro' && "🌌 점성술"}
                            {tab === 'tarot' && "🔮 타로"}
                        </button>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'saju' && report.deep_dive?.saju && <SajuDeepDive data={report.deep_dive.saju} />}
                    {activeTab === 'astro' && report.deep_dive?.astro && <AstroDeepDive data={report.deep_dive.astro} />}
                    {activeTab === 'tarot' && report.deep_dive?.tarot && <TarotDeepDive data={report.deep_dive.tarot} />}
                    {!report.deep_dive && (
                        <div className="flex items-center justify-center min-h-[400px] text-gray-500 italic">
                            심층 분석 정보를 불러올 수 없습니다.
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Action Plan */}
            <ActionPlanSection actionPlan={report.action_plan} />
        </div>
    );
}

// --- Sub Components ---

function HeaderSection({ summary }: { summary: CosmicReport['summary'] }) {
    const trustScore = summary.trust_score || 3;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 md:px-6 pt-4 md:pt-6"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < trustScore ? "currentColor" : "none"} className={i < trustScore ? "text-gold" : "text-gray-700"} />
                    ))}
                </div>
                <span className="text-xs font-medium text-gold/80 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                    신뢰도 {trustScore}/5
                </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
                {summary.title}
            </h1>

            <div className="bg-deep-navy/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-gold/10 transition-colors" />

                {/* Executive Summary (content) */}
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                    {summary.content}
                </p>

                {/* Trust Reason */}
                {summary.trust_reason && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-start gap-2">
                            <Shield size={14} className="text-gold/60 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-400 italic">{summary.trust_reason}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.section>
    );
}

function TraitsSection({ traits }: { traits: CosmicTrait[] }) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'saju': return '📜';
            case 'astro': return '🌌';
            case 'tarot': return '🔮';
            default: return '✨';
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8 pl-4 md:pl-6"
        >
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 pr-4 md:pr-6 scrollbar-hide snap-x">
                {traits.map((trait, idx) => (
                    <div
                        key={idx}
                        className="snap-start min-w-[180px] md:min-w-[220px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 hover:border-gold/30 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-2xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                                {getTypeIcon(trait.type)}
                            </span>
                            <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded border",
                                trait.grade === 'S' ? "text-purple-300 border-purple-500/30 bg-purple-500/10" :
                                    trait.grade === 'A' ? "text-blue-300 border-blue-500/30 bg-blue-500/10" :
                                        "text-gray-400 border-gray-600 bg-gray-600/10"
                            )}>{trait.grade} 등급</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-1">{trait.name}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">{trait.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}

// --- Deep Dive Sections ---

function SajuDeepDive({ data }: { data: CosmicReport['deep_dive']['saju'] }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Balance */}
            <ContentCard title="오행(五行) 균형 분석" icon={<Layers size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.balance}
                </p>
            </ContentCard>

            {/* 10 Year Flow */}
            <ContentCard title="대운(大運) 10년 주기" icon={<TrendingUp size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.flow_10yr}
                </p>
            </ContentCard>

            {/* Yearly Flow */}
            <ContentCard title="2026년 세운(歲運) 흐름" icon={<Calendar size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.flow_yearly}
                </p>
            </ContentCard>
        </motion.div>
    );
}

function AstroDeepDive({ data }: { data: CosmicReport['deep_dive']['astro'] }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Natal */}
            <ContentCard title="출생 차트 (Natal Chart) 분석" icon={<Orbit size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.natal}
                </p>
            </ContentCard>

            {/* Transit */}
            <ContentCard title="현재 행성 이동 (Transit)" icon={<TrendingUp size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.transit}
                </p>
            </ContentCard>
        </motion.div>
    );
}

function TarotDeepDive({ data }: { data: CosmicReport['deep_dive']['tarot'] }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Spread Analysis */}
            <ContentCard title="스프레드 전체 해석" icon={<BookOpen size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.spread_analysis}
                </p>
            </ContentCard>

            {/* Card Details */}
            <ContentCard title="카드 상세 해석" icon={<Sparkles size={18} />}>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.card_details}
                </p>
            </ContentCard>
        </motion.div>
    );
}

// Reusable Content Card
function ContentCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-gold">{icon}</span>
                {title}
            </h3>
            {children}
        </div>
    );
}

// --- Action Plan ---

function ActionPlanSection({ actionPlan }: { actionPlan: CosmicReport['action_plan'] }) {
    if (!actionPlan || actionPlan.length === 0) return null;

    return (
        <section className="mt-8 md:mt-10 px-4 md:px-6">
            <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                액션 플랜 (Super Days)
            </h2>

            <div className="grid gap-3">
                {actionPlan.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "border rounded-xl p-3 md:p-4 group",
                            item.type === 'opportunity'
                                ? "bg-gradient-to-r from-green-900/20 to-transparent border-green-500/30"
                                : "bg-gradient-to-r from-red-900/20 to-transparent border-red-500/30"
                        )}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className={cn(
                                    "text-xs font-bold mb-0.5",
                                    item.type === 'opportunity' ? "text-green-400" : "text-red-400"
                                )}>
                                    {item.date}
                                </div>
                                <div className="text-base text-white font-bold">{item.title}</div>
                            </div>
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded",
                                item.type === 'opportunity' ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                            )}>
                                {item.type === 'opportunity' ? '기회' : '주의'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                            {item.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
