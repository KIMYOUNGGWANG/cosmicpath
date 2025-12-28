'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Sparkles, Star, Shield, TrendingUp, Calendar, Briefcase, DollarSign, Heart, Activity, Target, Zap, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CosmicRadar } from './cosmic-radar';
import { DraftProposal } from './draft-proposal';
import { EvidenceTooltip } from '../ui/confidence-badge';
import { TarotDetailModal } from './tarot-detail-modal';

// 새로운 Premium Report 타입 (기존 CosmicReport 대체)
interface PremiumReportData {
    summary: {
        title: string;
        content: string;
        trust_score: number;
        trust_reason: string;
    };
    traits: {
        type: string;
        name: string;
        description: string;
        grade: string;
    }[];
    core_analysis?: {
        lacking_elements: {
            elements: string;
            remedy: string;
            description: string;
        };
        abundant_elements: {
            elements: string;
            usage: string;
            description: string;
        };
    };
    saju_sections?: {
        id: string;
        title: string;
        content: string;
    }[];
    fortune_flow?: {
        major_luck: {
            title: string;
            period?: string;
            content: string;
        };
        yearly_luck: {
            title: string;
            content: string;
        };
        monthly_highlights?: {
            month: string;
            theme: string;
            advice: string;
        }[];
    };
    life_areas?: {
        career?: {
            title: string;
            tag?: string;
            subsections?: string[];
            content: string;
        };
        wealth?: {
            title: string;
            tag?: string;
            subsections?: string[];
            content: string;
        };
        love?: {
            title: string;
            tag?: string;
            subsections?: string[];
            content: string;
        };
        health?: {
            title: string;
            subsections?: string[];
            content: string;
        };
    };
    special_analysis?: {
        noble_person?: { title: string; content: string };
        charm?: { title: string; content: string };
        conflicts?: { title: string; content: string };
    };
    action_plan?: {
        date: string;
        title: string;
        description: string;
        type: string;
    }[];
    // Legacy support for old schema
    // Legacy support for old schema
    deep_dive?: {
        saju?: { balance: string; flow_10yr: string; flow_yearly: string };
        astro?: { natal: string; transit: string };
        tarot?: { spread_analysis: string; card_details: string };
    };
}

interface PremiumReportProps {
    report: PremiumReportData;
    metadata?: {
        tarot?: {
            name: string;
            isReversed: boolean;
        }[];
    };
}

export function PremiumReport({ report, metadata }: PremiumReportProps) {
    const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

    if (!report) return null;

    const tarotCards = metadata?.tarot || [];

    return (
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-32">
            {/* Header */}
            <HeaderSection summary={report.summary} />

            {/* Cosmic Radar Section (New) */}
            <section className="mt-8 px-4 md:px-6">
                <CosmicRadar
                    sajuScore={report.summary.trust_score * 20 - (Math.random() * 5)}
                    starScore={report.summary.trust_score * 20 - (Math.random() * 10)}
                    tarotScore={report.summary.trust_score * 20 - (Math.random() * 15)}
                />
            </section>

            {/* Tarot Spread Section (New) */}
            {tarotCards.length > 0 && (
                <TarotSpreadSection cards={tarotCards} onCardClick={setSelectedCardIdx} />
            )}

            {/* Traits */}
            <TraitsSection traits={report.traits} />

            {/* Core Analysis (Rainbow Cards) */}
            {report.core_analysis && (
                <CoreAnalysisSection data={report.core_analysis} />
            )}

            {/* Saju Sections (Accordions) */}
            {report.saju_sections && (
                <AccordionSection
                    title="📜 사주 기본 분석"
                    items={report.saju_sections}
                    source="saju"
                />
            )}

            {/* Fortune Flow */}
            {report.fortune_flow && (
                <FortuneFlowSection data={report.fortune_flow} />
            )}

            {/* Life Areas */}
            {report.life_areas && (
                <LifeAreasSection data={report.life_areas} />
            )}

            {/* Special Analysis */}
            {report.special_analysis && (
                <SpecialAnalysisSection data={report.special_analysis} />
            )}

            {/* Action Plan */}
            {report.action_plan && (
                <ActionPlanSection
                    actionPlan={report.action_plan}
                    trustScore={report.summary.trust_score}
                />
            )}

            {/* Legacy Support - Deep Dive */}
            {report.deep_dive && !report.saju_sections && (
                <LegacyDeepDiveSection data={report.deep_dive} />
            )}

            {/* Tarot Detail Modal */}
            {selectedCardIdx !== null && (
                <TarotDetailModal
                    isOpen={selectedCardIdx !== null}
                    onClose={() => setSelectedCardIdx(null)}
                    cardName={tarotCards[selectedCardIdx]?.name || "배정된 카드"}
                    role={["현재 상황", "장애물/과제", "해결책/결과"][selectedCardIdx]}
                    isReversed={tarotCards[selectedCardIdx]?.isReversed}
                    convergenceData={{
                        sajuConnection: "현재 사주의 운 흐름과 이 카드가 상징하는 변화의 에너지가 강하게 공명하고 있습니다.",
                        astroConnection: "행성의 정렬 상태가 보여주는 추진력이 카드에 담긴 결단력을 더욱 강화합니다.",
                        insight: "이 카드는 현재 당신의 직관이 가리키는 방향을 나타냅니다. 사주와 점성술 모두 지금은 행동해야 할 때임을 강력하게 시사하고 있습니다."
                    }}
                />
            )}
        </div>
    );
}

// ... (Sub Components)

function TarotSpreadSection({ cards, onCardClick }: { cards: { name: string; isReversed: boolean }[], onCardClick: (idx: number) => void }) {
    const roles = ["현재 상황", "장애물/과제", "해결책/결과"];

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 px-4 md:px-6"
        >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <EvidenceTooltip tag="🔮" sources={['tarot']} explanation="타로 카드를 통해 현재의 직관과 심리 상태를 읽어냅니다." />
                타로 리딩
            </h2>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div
                            onClick={() => onCardClick(idx)}
                            className="w-full aspect-[2/3] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/10 relative overflow-hidden group cursor-pointer hover:border-tarot-purple/50 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                        >
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center group-hover:bg-black/20 transition-all">
                                <span className={cn(
                                    "text-[10px] md:text-sm font-bold text-white/90",
                                    card.isReversed && "text-red-300"
                                )}>
                                    {card.name}
                                    {card.isReversed && " (역)"}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] md:text-xs text-gold mt-2 font-medium">{roles[idx] || `카드 ${idx + 1}`}</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-4 text-center">각 카드를 클릭하면 상세한 융합 해석을 볼 수 있습니다.</p>
        </motion.section>
    );
}

// --- Sub Components ---

function HeaderSection({ summary }: { summary: PremiumReportData['summary'] }) {
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

            <h1 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                {summary.title}
            </h1>

            <div className="bg-deep-navy/50 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md">
                <div className="flex gap-2 mb-2">
                    <EvidenceTooltip tag="📜" sources={['saju']} explanation="태어난 시각의 기운을 분석합니다." />
                    <EvidenceTooltip tag="🌌" sources={['astrology']} explanation="행성의 움직임을 분석합니다." />
                    <EvidenceTooltip tag="🔮" sources={['tarot']} explanation="현재의 직관적 에너지를 읽습니다." />
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                    {summary.content}
                </p>
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

function TraitsSection({ traits }: { traits: PremiumReportData['traits'] }) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'saju': return '📜';
            case 'astrology':
            case 'astro': return '🌌';
            case 'tarot': return '🔮';
            default: return '✨';
        }
    };

    const getSourceLabel = (type: string) => {
        switch (type) {
            case 'saju': return '사주명리';
            case 'astro':
            case 'astrology': return '점성술';
            case 'tarot': return '타로';
            default: return '분석';
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8 pl-4 md:pl-6"
        >
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-6 pr-4 md:pr-6 snap-x">
                {traits.map((trait, idx) => (
                    <div
                        key={idx}
                        className="snap-center shrink-0 w-[85vw] md:w-[320px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 md:p-6 flex flex-col gap-3 hover:border-gold/30 transition-colors group shadow-lg"
                    >
                        <div className="flex justify-between items-start">
                            <EvidenceTooltip
                                tag={getTypeIcon(trait.type)}
                                sources={[trait.type]}
                                explanation={`${getSourceLabel(trait.type)} 기반 분석 데이터입니다.`}
                            />
                            <span className={cn(
                                "text-xs font-bold px-2 py-1 rounded border",
                                trait.grade === 'S' ? "text-purple-300 border-purple-500/30 bg-purple-500/10" :
                                    trait.grade === 'A' ? "text-blue-300 border-blue-500/30 bg-blue-500/10" :
                                        "text-gray-400 border-gray-600 bg-gray-600/10"
                            )}>{trait.grade} 등급</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-2">{trait.name}</h3>
                            <div className="h-px w-full bg-white/10 my-2" />
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-keep">
                                {trait.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}

function CoreAnalysisSection({ data }: { data: NonNullable<PremiumReportData['core_analysis']> }) {
    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                내 사주 핵심 정리
            </h2>

            <div className="space-y-4">
                {/* Lacking Elements - Rainbow Border */}
                <div className="rainbow-border p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🌊</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-bold">부족한 오행 및 개운법</h3>
                                <span className="category-tag tag-general">맞춤 개운법 제시</span>
                            </div>
                            <p className="text-sm text-gold mb-2">💧 {data.lacking_elements.elements}</p>
                            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                                {data.lacking_elements.description}
                            </p>
                            <div className="mt-3 p-3 bg-white/5 rounded-lg">
                                <p className="text-xs text-gray-300">
                                    <span className="text-gold font-bold">개운법:</span> {data.lacking_elements.remedy}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abundant Elements */}
                <div className="accordion-item p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⭐</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-bold">풍부한 오행과 활용법</h3>
                                <span className="category-tag tag-career">재능 활용법</span>
                            </div>
                            <p className="text-sm text-gold mb-2">⭐ {data.abundant_elements.elements}</p>
                            <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                                {data.abundant_elements.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AccordionSection({ title, items, source }: { title: string; items: { id: string; title: string; content: string }[]; source?: string }) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {source && <EvidenceTooltip tag={source === 'saju' ? '📜' : source === 'tarot' ? '🔮' : '🌌'} sources={[source]} explanation="이 섹션의 분석은 해당 학문 체계를 근거로 합니다." />}
                {title}
            </h2>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className={cn("accordion-item", openItems.has(item.id) && "open")}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleItem(item.id)}
                        >
                            <h3 className="text-sm md:text-base">{item.title}</h3>
                            <ChevronDown
                                size={20}
                                className={cn(
                                    "accordion-icon transition-transform duration-300",
                                    openItems.has(item.id) && "rotate-180"
                                )}
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            openItems.has(item.id) ? "max-h-[2000px] px-5 pb-5" : "max-h-0"
                        )}>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {item.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FortuneFlowSection({ data }: { data: NonNullable<PremiumReportData['fortune_flow']> }) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set(['major_luck']));

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const items = [
        { id: 'major_luck', ...data.major_luck },
        { id: 'yearly_luck', ...data.yearly_luck },
    ];

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-gold" />
                운의 흐름
            </h2>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className={cn("accordion-item", openItems.has(item.id) && "open")}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleItem(item.id)}
                        >
                            <h3 className="text-sm md:text-base">{item.title}</h3>
                            <ChevronDown
                                size={20}
                                className={cn(
                                    "accordion-icon transition-transform duration-300",
                                    openItems.has(item.id) && "rotate-180"
                                )}
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            openItems.has(item.id) ? "max-h-[2000px] px-5 pb-5" : "max-h-0"
                        )}>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {item.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function LifeAreasSection({ data }: { data: NonNullable<PremiumReportData['life_areas']> }) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const areas = [
        data.career && { id: 'career', icon: '💼', ...data.career },
        data.wealth && { id: 'wealth', icon: '💰', ...data.wealth },
        data.love && { id: 'love', icon: '💕', ...data.love },
        data.health && { id: 'health', icon: '🏥', ...data.health },
    ].filter(Boolean) as { id: string; icon: string; title: string; tag?: string; content: string; subsections?: string[] }[];

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target size={18} className="text-gold" />
                영역별 상세 분석
            </h2>
            <div className="space-y-3">
                {areas.map((area) => (
                    <div key={area.id} className={cn("accordion-item rainbow-border-static", openItems.has(area.id) && "open")}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleItem(area.id)}
                        >
                            <h3 className="text-sm md:text-base flex items-center gap-2">
                                <span>{area.icon}</span>
                                <span>{area.title}</span>
                                {area.tag && (
                                    <span className="category-tag tag-career text-[10px]">{area.tag}</span>
                                )}
                            </h3>
                            <ChevronDown
                                size={20}
                                className={cn(
                                    "accordion-icon transition-transform duration-300",
                                    openItems.has(area.id) && "rotate-180"
                                )}
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            openItems.has(area.id) ? "max-h-[2000px] px-5 pb-5" : "max-h-0"
                        )}>
                            {area.subsections && (
                                <div className="subsection-grid mb-4">
                                    {area.subsections.map((sub: string, idx: number) => (
                                        <div key={idx} className="subsection-item">
                                            <span className="text-gold">✦</span>
                                            <span>{sub}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {area.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function SpecialAnalysisSection({ data }: { data: NonNullable<PremiumReportData['special_analysis']> }) {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const specials = [
        data.noble_person && { id: 'noble_person', icon: '🎯', ...data.noble_person },
        data.charm && { id: 'charm', icon: '💖', ...data.charm },
        data.conflicts && { id: 'conflicts', icon: '🔄', ...data.conflicts },
    ].filter(Boolean) as { id: string; icon: string; title: string; content: string }[];

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-gold" />
                특수 분석
            </h2>
            <div className="space-y-3">
                {specials.map((item) => (
                    <div key={item.id} className={cn("accordion-item", openItems.has(item.id) && "open")}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleItem(item.id)}
                        >
                            <h3 className="text-sm md:text-base flex items-center gap-2">
                                <span>{item.icon}</span>
                                <span>{item.title}</span>
                            </h3>
                            <ChevronDown
                                size={20}
                                className={cn(
                                    "accordion-icon transition-transform duration-300",
                                    openItems.has(item.id) && "rotate-180"
                                )}
                            />
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            openItems.has(item.id) ? "max-h-[2000px] px-5 pb-5" : "max-h-0"
                        )}>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {item.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ActionPlanSection({ actionPlan, trustScore }: {
    actionPlan: NonNullable<PremiumReportData['action_plan']>;
    trustScore: number;
}) {
    return (
        <section className="mt-8 md:mt-10 px-4 md:px-6">
            <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-gold" />
                액션 플랜 (Super Days)
            </h2>

            <div className="grid gap-3">
                {actionPlan.map((item, idx) => (
                    <DraftProposal
                        key={idx}
                        title={item.title}
                        date={item.date}
                        time="12:00" // 기본값
                        description={item.description}
                        confidence={trustScore * 20}
                        onConfirm={(data) => console.log('Action Confirmed:', data)}
                        onCancel={() => { }}
                    />
                ))}
            </div>
        </section>
    );
}

// Legacy support for old schema
function LegacyDeepDiveSection({ data }: { data: NonNullable<PremiumReportData['deep_dive']> }) {
    const [activeTab, setActiveTab] = useState<'saju' | 'astro' | 'tarot'>('saju');

    return (
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

            <div className="min-h-[300px]">
                {activeTab === 'saju' && data.saju && (
                    <div className="space-y-4">
                        <ContentCard title="오행 분석" content={data.saju.balance} />
                        <ContentCard title="대운 분석" content={data.saju.flow_10yr} />
                        <ContentCard title="세운 분석" content={data.saju.flow_yearly} />
                    </div>
                )}
                {activeTab === 'astro' && data.astro && (
                    <div className="space-y-4">
                        <ContentCard title="출생 차트" content={data.astro.natal} />
                        <ContentCard title="트랜짓" content={data.astro.transit} />
                    </div>
                )}
                {activeTab === 'tarot' && data.tarot && (
                    <div className="space-y-4">
                        <ContentCard title="스프레드" content={data.tarot.spread_analysis} />
                        <ContentCard title="카드 상세" content={data.tarot.card_details} />
                    </div>
                )}
            </div>
        </section>
    );
}

function ContentCard({ title, content }: { title: string; content: string }) {
    return (
        <div className="bg-white/5 rounded-2xl p-4 md:p-5 border border-white/10">
            <h3 className="text-sm md:text-base font-bold text-white mb-3">{title}</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
    );
}
