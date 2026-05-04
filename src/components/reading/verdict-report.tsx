'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PremiumReportData } from './premium-report';
import {
    ActionPlanSection,
    AccordionSection,
    AstroDeepSection,
    CoreAnalysisSection,
    FortuneFlowSection,
    LifeAreasSection,
    NumerologySection,
    PastLifeSection,
    SpecialAnalysisSection,
    TarotSpreadSection,
    TraitsSection,
} from './premium-report-sections';
import { SoulmateSection } from './SoulmateSection';
import { LuckyAssetsGrid } from './LuckyAssetsGrid';
import { GlossarySection } from './GlossarySection';
import { 
    RefreshCw, 
    Sparkles, 
    Shield, 
    ChevronDown, 
    Layers, 
    Compass, 
    MoonStar, 
    Hash, 
    Hourglass, 
    Map,
    CheckCircle2
} from 'lucide-react';

// ─────────────────────────────────────────────
// Tab Definition
// ─────────────────────────────────────────────

type TabId = 'tarot' | 'saju' | 'astro' | 'numerology' | 'fortune' | 'life' | 'special';

interface EvidenceTab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    summary: string; // "왜 같은 결론인가" 한 줄
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface VerdictReportProps {
    report: PremiumReportData;
    metadata?: Record<string, unknown>;
    language?: 'ko' | 'en';
    isLoading?: boolean;
    onRetry?: () => void;
    tarotCards?: { name: string; isReversed: boolean }[];
    onCardClick?: (idx: number) => void;
    scoreGridNode?: React.ReactNode;
    isFreeView?: boolean;
}

// ─────────────────────────────────────────────
// Hero Verdict Card
// ─────────────────────────────────────────────

function HeroVerdictCard({
    finalVerdict,
    trustScore,
    isLoading,
    language,
}: {
    finalVerdict?: PremiumReportData['final_verdict'];
    trustScore: number;
    isLoading?: boolean;
    language: 'ko' | 'en';
}) {
    const isEn = language === 'en';

    if (isLoading && !finalVerdict) {
        return (
            <div className="relative w-full rounded-[28px] overflow-hidden border border-white/5 bg-[#0a0a0c] p-8 md:p-12 min-h-[360px] flex flex-col justify-between">
                {/* Noise overlay */}
                <div
                    className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                />
                <div className="z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]/50" />
                        <p className="text-[#D4AF37]/60 text-sm tracking-widest uppercase font-medium">
                            {isEn ? 'Oracle is analyzing three sources...' : '오라클이 세 가지 원천을 교차 분석하고 있습니다...'}
                        </p>
                    </div>
                    {/* Skeleton lines */}
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 bg-white/5 rounded-md w-3/4" />
                        <div className="h-8 bg-white/5 rounded-md w-full" />
                        <div className="h-8 bg-white/5 rounded-md w-5/6" />
                    </div>
                    <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!finalVerdict) return null;

    const bardPercent = Math.round(trustScore * 20);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: isEn ? 'My CosmicPath Verdict' : '나의 코스믹패스 결론',
                    text: finalVerdict.core_message,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Fallback to copy URL
            navigator.clipboard.writeText(window.location.href);
            alert(isEn ? 'Link copied to clipboard!' : '링크가 복사되었습니다!');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative w-full rounded-[28px] overflow-hidden border border-[#D4AF37]/20 bg-[#070708] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] min-h-[360px] flex flex-col justify-between"
            style={{ wordBreak: 'keep-all' }}
        >
            {/* Radial glow - subtle ink/gold */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[300px] -translate-y-1/2 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
            {/* Inner border shimmer */}
            <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />
            {/* Noise overlay for paper texture */}
            <div
                className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-8 md:p-12 gap-8">
                {/* Seal badge - Vermillion/Dojang inspired */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-red-900/50 bg-[#2A0808]/80 text-red-400/90 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md">
                        <Sparkles size={12} className="opacity-80" />
                        {isEn ? 'Destiny Moment' : '통합 분석 (Destiny Moment)'}
                    </span>
                </div>

                {/* Core message — Typeset block */}
                <div className="flex-1 flex flex-col justify-center gap-6">
                    <div className="pl-6 border-l-2 border-[#D4AF37]/30 py-2">
                        <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-stone-100 leading-tight">
                            &ldquo;{finalVerdict.core_message}&rdquo;
                        </h2>
                    </div>
                    {finalVerdict.closing_words && (
                        <p className="pl-6 text-stone-400/80 text-base md:text-lg leading-relaxed font-light max-w-2xl">
                            {finalVerdict.closing_words}
                        </p>
                    )}
                </div>

                {/* Trust meter + cross-validation badge + Share */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-[#D4AF37]/80" />
                            <span className="text-stone-400 text-xs tracking-wide">
                                {isEn ? 'Trinity Cross-verified' : '3대 원천 교차 검증률'} &nbsp;
                            </span>
                            <span className="text-[#D4AF37] text-xs font-serif italic">{bardPercent}%</span>
                        </div>
                        {/* Visual bar */}
                        <div className="hidden md:block flex-1 h-[2px] bg-stone-800 overflow-hidden min-w-[100px] max-w-[200px]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${bardPercent}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                                className="h-full bg-[#D4AF37]/80"
                            />
                        </div>
                    </div>
                    
                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium z-20 cursor-pointer"
                    >
                        {isEn ? 'Share Verdict' : '결론 공유하기'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Evidence Tab Content
// ─────────────────────────────────────────────

function TabContent({
    tabId,
    report,
    metadata,
    language,
    tarotCards,
    onCardClick,
    isExpanded,
    onToggle,
}: {
    tabId: TabId;
    report: PremiumReportData;
    metadata?: Record<string, unknown>;
    language: 'ko' | 'en';
    tarotCards?: { name: string; isReversed: boolean }[];
    onCardClick?: (idx: number) => void;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const isEn = language === 'en';

    const detailLabel = isEn ? 'Full Reading' : '이 결론의 근거 보기';
    const hideLabel = isEn ? 'Collapse' : '접기';

    const renderDetailContent = () => {
        switch (tabId) {
            case 'tarot':
                return (
                    <TarotSpreadSection
                        cards={tarotCards || []}
                        onCardClick={onCardClick || (() => {})}
                        language={language}
                    />
                );
            case 'saju':
                return report.saju_sections ? (
                    <AccordionSection
                        title={isEn ? 'Elemental Blueprint' : '사주 기본 분석'}
                        items={report.saju_sections}
                        source="saju"
                        language={language}
                    />
                ) : null;
            case 'astro':
                return report.astro_deep ? (
                    <AstroDeepSection data={report.astro_deep} language={language} />
                ) : null;
            case 'numerology':
                return report.numerology ? (
                    <NumerologySection data={report.numerology} language={language} />
                ) : null;
            case 'fortune':
                return report.fortune_flow ? (
                    <FortuneFlowSection data={report.fortune_flow} language={language} />
                ) : null;
            case 'life':
                return (
                    <>
                        {report.life_areas && (
                            <LifeAreasSection data={report.life_areas} language={language} />
                        )}
                        {report.soulmate && (
                            <SoulmateSection data={report.soulmate} language={language} />
                        )}
                    </>
                );
            case 'special':
                return (
                    <>
                        {report.special_analysis && (
                            <SpecialAnalysisSection data={report.special_analysis} language={language} />
                        )}
                        {report.lucky_assets && (
                            <LuckyAssetsGrid data={report.lucky_assets} language={language} />
                        )}
                        {report.past_life && (
                            <PastLifeSection data={report.past_life} language={language} />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Expand toggle */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-3 px-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors text-xs tracking-widest uppercase group font-bold"
            >
                <span>{isExpanded ? hideLabel : detailLabel}</span>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="group-hover:text-[#D4AF37]" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pt-2 pb-6">{renderDetailContent()}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// Evidence Tabs Section
// ─────────────────────────────────────────────

function EvidenceTabs({
    report,
    metadata,
    language,
    tarotCards,
    onCardClick,
}: Omit<VerdictReportProps, 'isLoading' | 'onRetry' | 'isFreeView'>) {
    const isEn = language === 'en';
    const [activeTab, setActiveTab] = useState<TabId | null>(null);
    const [expandedTab, setExpandedTab] = useState<TabId | null>(null);

    const tabs: EvidenceTab[] = [
        ...(tarotCards && tarotCards.length > 0
            ? [{
                id: 'tarot' as TabId,
                label: isEn ? 'Tarot' : '타로',
                icon: <Layers size={14} className="opacity-70" />,
                summary: report.tarot_details?.[0]?.interpretation
                    ? report.tarot_details[0].interpretation.split('.')[0] + '.'
                    : (isEn ? 'The cards confirm the same timing.' : '카드가 같은 타이밍을 가리킵니다.'),
            }]
            : []),
        ...(report.saju_sections
            ? [{
                id: 'saju' as TabId,
                label: isEn ? 'Saju' : '사주',
                icon: <Compass size={14} className="opacity-70" />,
                summary: isEn
                    ? 'The elemental blueprint supports this direction.'
                    : '사주 원국이 동일한 방향성을 지지합니다.',
            }]
            : []),
        ...(report.astro_deep
            ? [{
                id: 'astro' as TabId,
                label: isEn ? 'Astro' : '점성',
                icon: <MoonStar size={14} className="opacity-70" />,
                summary: report.astro_deep.sun_moon_dynamic?.content
                    ? report.astro_deep.sun_moon_dynamic.content.split('.')[0] + '.'
                    : (isEn ? 'Planetary alignment echoes the verdict.' : '행성 배치가 결단을 뒷받침합니다.'),
            }]
            : []),
        ...(report.numerology
            ? [{
                id: 'numerology' as TabId,
                label: isEn ? 'Numbers' : '수비',
                icon: <Hash size={14} className="opacity-70" />,
                summary: isEn
                    ? `Life path ${report.numerology.life_path.number} aligns with this moment.`
                    : `생명수 ${report.numerology.life_path.number}이(가) 이 시기를 가리킵니다.`,
            }]
            : []),
        ...(report.fortune_flow
            ? [{
                id: 'fortune' as TabId,
                label: isEn ? 'Timing' : '운세',
                icon: <Hourglass size={14} className="opacity-70" />,
                summary: report.fortune_flow.yearly_luck?.content
                    ? report.fortune_flow.yearly_luck.content.split('.')[0] + '.'
                    : (isEn ? 'The timing window is now open.' : '지금이 바로 그 타이밍입니다.'),
            }]
            : []),
        ...(report.life_areas
            ? [{
                id: 'life' as TabId,
                label: isEn ? 'Life Areas' : '영역별',
                icon: <Map size={14} className="opacity-70" />,
                summary: isEn
                    ? 'Career, wealth, and love signals all point the same way.'
                    : '커리어·재물·사랑이 모두 같은 신호를 보냅니다.',
            }]
            : []),
        ...(report.special_analysis
            ? [{
                id: 'special' as TabId,
                label: isEn ? 'Assets' : '특수',
                icon: <Sparkles size={14} className="opacity-70" />,
                summary: isEn
                    ? 'Your hidden noble allies and danger zones revealed.'
                    : '당신의 귀인과 공망이 결단을 뒷받침합니다.',
            }]
            : []),
    ];

    if (tabs.length === 0) return null;

    const currentTab = activeTab ?? tabs[0].id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="w-full mt-8"
            style={{ wordBreak: 'keep-all' }}
        >
            {/* Section label */}
            <p className="text-white/40 text-xs tracking-[0.18em] uppercase font-medium mb-4 px-1">
                {isEn ? '— Why the same verdict?' : '— 세 가지 원천이 같은 결론을 가리키는 이유'}
            </p>

            {/* Tab bar — horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabId)}
                        className={cn(
                            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border flex items-center gap-2',
                            currentTab === tab.id
                                ? 'bg-white/15 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                                : 'bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                        )}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            {tabs.map((tab) => (
                <AnimatePresence key={tab.id} mode="wait">
                    {currentTab === tab.id && (
                        <motion.div
                            key={tab.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="mt-5 rounded-md border border-[#D4AF37]/10 bg-black/40 backdrop-blur-sm p-6 lg:p-8"
                        >
                            {/* Tab headline summary */}
                            <p className="text-stone-300 text-base md:text-lg leading-relaxed font-light">
                                {tab.summary}
                            </p>

                            {/* Divider */}
                            <div className="my-6 h-[1px] bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />

                            {/* Expandable detail */}
                            <TabContent
                                tabId={tab.id}
                                report={report}
                                metadata={metadata}
                                language={language ?? 'ko'}
                                tarotCards={tarotCards}
                                onCardClick={onCardClick}
                                isExpanded={expandedTab === tab.id}
                                onToggle={() =>
                                    setExpandedTab(expandedTab === tab.id ? null : tab.id)
                                }
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            ))}
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Main VerdictReport Component
// ─────────────────────────────────────────────

export function VerdictReport({
    report,
    metadata,
    language = 'ko',
    isLoading,
    onRetry,
    tarotCards,
    onCardClick,
    scoreGridNode,
    isFreeView,
}: VerdictReportProps) {
    const isEn = language === 'en';

    const LS_KEY = 'cosmicpath_full_report_open';
    const [showFullReport, setShowFullReport] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(LS_KEY) === 'true';
    });

    const toggleFullReport = () => {
        const next = !showFullReport;
        setShowFullReport(next);
        localStorage.setItem(LS_KEY, next ? 'true' : 'false');
    };

    // If it's a Free View, we construct a mock finalVerdict from free_focus
    const finalVerdict = isFreeView && report.free_focus ? {
        title: '',
        core_message: report.free_focus.action_conclusion,
        saju_foundation: '',
        astro_support: '',
        tarot_insight: '',
        action_priorities: [],
        closing_words: report.free_focus.evidence_summary
    } : report.final_verdict;

    // Left column content (Verdict + Action Plan + Core)
    const leftColumn = (
        <div className="flex flex-col gap-8">
            {/* ── HERO: Oracle Verdict Card ── */}
            <HeroVerdictCard
                finalVerdict={finalVerdict}
                trustScore={report.summary?.trust_score ?? 3}
                isLoading={isLoading}
                language={language}
            />

            {/* ── ACTION PLAN (Top 3) ── */}
            {(!isFreeView && report.action_plan) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <ActionPlanSection
                        actionPlan={report.action_plan.slice(0, 3)} // PRD F-02: Top 3 only initially, compact
                        trustScore={report.summary?.trust_score ?? 3}
                        language={language}
                    />
                </motion.div>
            )}

            {/* ── PROGRESSIVE DISCLOSURE TOGGLE — mobile/tablet only (xl: hidden, content always shown) ── */}
            {!isFreeView && !showFullReport && (
                <div className="flex xl:hidden justify-center pt-4 pb-8">
                    <button
                        onClick={toggleFullReport}
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold tracking-wide hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/10 transition-all shadow-[0_0_20px_rgba(212,175,55,0.1)] flex items-center gap-2 cursor-pointer"
                    >
                        {isEn ? 'View Full Report' : '전체 리포트 보기 ↓'}
                    </button>
                </div>
            )}

            {/* ── CORE ANALYSIS (optional deep) - Hidden until expanded ── */}
            {showFullReport && report.core_analysis && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <CoreAnalysisSection
                        data={report.core_analysis}
                        sajuData={(metadata as any)?.sajuResult}
                        language={language}
                    />
                </motion.div>
            )}
        </div>
    );

    // Shared right column inner content (desktop: always visible, mobile: behind toggle)
    const rightColumnContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
        >
            {/* ── SCORE GRID: Cosmic Radar & Dashboard ── */}
            {scoreGridNode && (
                <div className="flex flex-col gap-6">
                    {scoreGridNode}
                </div>
            )}

            {/* ── PREMIUM CONTENT: Evidence Tabs & Glossary ── */}
            {!isFreeView && (
                <>
                    <EvidenceTabs
                        report={report}
                        metadata={metadata}
                        language={language}
                        tarotCards={tarotCards}
                        onCardClick={onCardClick}
                    />
                    {report.glossary ? (
                        <GlossarySection data={report.glossary} language={language} />
                    ) : isLoading && report.final_verdict ? (
                        <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400/50" />
                            <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                {isEn ? 'Compiling glossary...' : '용어집을 정리하는 중...'}
                            </p>
                        </div>
                    ) : null}
                </>
            )}
        </motion.div>
    );

    // Right column: desktop always shows, mobile gated behind showFullReport
    const rightColumn = (
        <div className="flex flex-col gap-8">
            {/* Desktop xl+: always visible (no progressive disclosure gate) */}
            <div className="hidden xl:block">
                {rightColumnContent}
            </div>
            {/* Mobile / Tablet: show only when toggled or free user */}
            {(isFreeView || showFullReport) && (
                <div className="xl:hidden">
                    {rightColumnContent}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full mt-8 md:mt-12 px-4 md:px-6">
            {/* ── Desktop 2-column layout (≥1280px) — mirrors result-layout spec ── */}
            <div className="hidden xl:grid xl:gap-8 xl:items-start" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
                {/* Left: sticky verdict + action */}
                <div className="xl:sticky xl:top-8 xl:self-start">
                    {leftColumn}
                </div>
                {/* Right: scrollable evidence archive */}
                <div>
                    {rightColumn}
                </div>
            </div>

            {/* ── Mobile / Tablet single-column stack (< 1280px) ── */}
            <div className="xl:hidden space-y-8">
                {leftColumn}
                {rightColumn}
            </div>
        </div>
    );
}
