'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CompatibilityHeader } from './CompatibilityHeader';
import { useReactToPrint } from 'react-to-print';
import { Download, Sparkles, Printer, Compass, Clock, Layers, FileText, ChevronRight } from 'lucide-react';
import * as analytics from '@/lib/client-analytics';
import { PrintLayout } from './PrintLayout';
import { ShareCard } from './share-card';
import { ShareCardModal } from '@/components/share/ShareCardModal';
import { Share2 } from 'lucide-react';
import { BlindSpotTeaser } from './blind-spot-teaser';
import { CaseFileReport } from './case-file-report';
import { StickyCTA } from '../common/sticky-cta';

import type { TimelineScore } from './FortuneTimelineChart';
import type { SoulmateData } from './SoulmateSection';
import type { LuckyAssetsData } from './LuckyAssetsGrid';
import { PaymentModal } from '../payment/PaymentModal';
import { normalizePriceLabel, READING_PRODUCT } from '@/lib/payment/payment-config';
import { GhostDetectorSection } from '../dashboard/GhostDetectorSection';
import type { SajuResult } from '@/lib/engines/saju';
import {
    HeaderSection,
    CoreAnalysisSection,
    AccordionSection,
    AstroDeepSection,
    FortuneFlowSection,
    LifeAreasSection,
    SpecialAnalysisSection,
    DateSelectionSection,
    ActionPlanSection,
    NumerologySection,
    PastLifeSection,
    ShadowTransformationSection,
    WeeklyHeatmapSection,
    Compatibility4DSection,
} from './premium-report-sections';
import dynamic from 'next/dynamic';
import { ZiweiChartComponent } from './ziwei-chart';
import { ExecutiveSummaryDashboard } from './ExecutiveSummaryDashboard';
import { DecisionConsensusGauge } from './DecisionConsensusGauge';
import { ReportSidebarNav } from './ReportSidebarNav';
import { calculateZiweiChart, type ZiweiChartResult } from '@/lib/engines/ziwei';
import { calculateShadowTransformations, type ShadowTransformationResult } from '@/lib/engines/saju-transformation';
import { calculateWeeklyTimingHeatmap, type YearHeatmapResult } from '@/lib/engines/timing-heatmap';
import { calculate4DCompatibility, type Compatibility4DResult } from '@/lib/engines/compatibility-matrix';
import { calculateThaiAstrology, type ThaiAstrologyResult } from '@/lib/engines/thai-astrology';
import { ThaiAstrologySection } from './ThaiAstrologySection';
import { ExecutiveChapterBar, type ChapterKey } from './ExecutiveChapterBar';
import type { ThreeLayerConvergenceDiagnosis } from '@/lib/ai/three-layer-synthesis';

const ChatInterface = dynamic(
    () => import('@/components/oracle-chat/ChatInterface').then((mod) => mod.ChatInterface),
    {
        loading: () => (
            <div className="h-48 w-full animate-pulse rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-center text-white/40 text-xs">
                오라클 1:1 대화 인터페이스를 로드하는 중...
            </div>
        ),
    }
);

// 새로운 Premium Report 타입 (기존 CosmicReport 대체)
export interface PremiumReportData {
    precisionMetadata?: {
        inputDate: string;
        inputTime: string;
        tstOffset: number;
        correctedDate: string;
        correctedTime: string;
        lon: number;
        hourPillar: string;
        astrologyInputDate?: string;
        astrologyInputTime?: string;
        astrologyTimezoneOffset?: number;
        astrologyTimePolicy?: 'civil_time';
        astrologyAscendantConfidence?: 'exact_time' | 'approximate_noon';
    };
    oracleCouncil?: {
        convergenceScore: number;
        ziweiSummary: string;
        natalSummary: string;
    };
    characterId?: string;
    oraclePersona?: {
        id: string;
        name: string;
        title: string;
    };
    free_focus?: {
        decision_label?: 'move_now' | 'wait_with_deadline' | 'narrow_first' | 'hold_or_stop';
        delayed_choice?: string;
        timing_boundary?: string;
        first_action?: string;
        avoid?: string;
        confidence_note?: string;
        copy_ready_message?: string;
        gaeun_action?: string;
        action_conclusion: string;
        evidence_summary: string;
        next_question: string;
    };
    questionIntent?: string;
    selectionMode?: string;
    advisorEvidenceSummary?: string;
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
        element_scores?: {
            wood: number;
            fire: number;
            earth: number;
            metal: number;
            water: number;
        };
    };
    astro_deep?: {
        sun_moon_dynamic?: { title: string; content: string };
        ascendant_influence?: { title: string; content: string };
        dominant_element?: { title: string; content: string };
        planetary_warning?: { title: string; content: string };
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
        monthly_luck?: {
            month: string;
            theme: string;
            element?: string;
            opportunity?: string;
            warning?: string;
            advice: string;
            score?: number;
        }[];
        timeline_scores?: TimelineScore[];
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
        compatibility?: {
            boss: { ideal_type: string; avoid_type: string; strategy: string };
            colleague: { ideal_type: string; avoid_type: string; strategy: string };
            friend: { ideal_type: string; avoid_type: string; advice: string };
        };
    };
    special_analysis?: {
        noble_person?: { title: string; content: string };
        charm?: { title: string; content: string };
        conflicts?: { title: string; content: string };
    };
    tarot_details?: {
        position: string;
        card_name: string;
        is_reversed?: boolean;
        keywords?: string[];
        interpretation: string;
        saju_connection?: string;
        advice?: string;
    }[];
    soulmate?: SoulmateData;
    lucky_assets?: LuckyAssetsData;
    action_plan?: {
        date: string;
        title: string;
        description: string;
        type: string;
    }[];
    glossary?: {
        term: string;
        hanja: string;
        definition: string;
        context: string;
    }[];
    final_verdict?: {
        title: string;
        core_message: string;
        saju_foundation: string;
        astro_support: string;
        tarot_insight: string;
        action_priorities: string[];
        closing_words: string;
        convergence_diagnosis: ThreeLayerConvergenceDiagnosis;
        decision_packet?: {
            decision_fork: { option_a: string; option_b: string; recommended_test: string };
            evidence_disagreement: { aligned: string; conflicting: string };
            reality_checks: string[];
            seven_day_experiment: { action: string; measure: string; stop_rule: string };
            if_then_rules: { if: string; then: string }[];
        };
    };
    date_selection?: {
        auspicious?: {
            date: string;
            purpose: string;
            reason: string;
        }[];
        inauspicious?: {
            date: string;
            purpose: string;
            reason: string;
        }[];
    };
    numerology?: {
        life_path: {
            number: number;
            title: string;
            meaning: string;
            saju_connection: string;
        };
        personal_year?: {
            year?: number;
            number?: number;
            theme: string;
            keyword?: string;
            action_tag?: string;
            action_code?: string;
            tactical_advice?: string;
        };
        decision_strategy?: {
            energy_type?: string;
            strategy?: string;
            authority?: string;
            wedge_tactic?: string;
            optimal_timing?: string;
            blindspot_risk?: string;
        };
        lucky_numbers: number[];
        lucky_day_advice: string;
    };
    past_life?: {
        theme: { title: string; content: string };
        karma: { title: string; content: string };
        soul_mission: { title: string; content: string };
    };
    // Fallback for older saved report schema
    deep_dive?: {
        saju?: { balance: string; flow_10yr: string; flow_yearly: string };
        astro?: { natal: string; transit: string };
        tarot?: { spread_analysis: string; card_details: string };
    };
}

interface PremiumReportProps {
    report: PremiumReportData;
    metadata?: {
        readingId?: string;
        tarot?: {
            name: string;
            isReversed: boolean;
        }[];
        tarotCards?: {
            name: string;
            isReversed: boolean;
        }[];
        radarScores?: {
            saju: number;
            astrology: number;
            ziwei?: number;
            tarot?: number;
        };
        precisionMetadata?: {
            inputDate: string;
            inputTime: string;
            tstOffset: number;
            correctedDate: string;
            correctedTime: string;
            lon: number;
            hourPillar: string;
            astrologyInputDate?: string;
            astrologyInputTime?: string;
            astrologyTimezoneOffset?: number;
            astrologyTimePolicy?: 'civil_time';
            astrologyAscendantConfidence?: 'exact_time' | 'approximate_noon';
        };
        oracleCouncil?: {
            convergenceScore: number;
            ziweiSummary: string;
            natalSummary: string;
        };
        characterId?: string;
        language?: 'ko' | 'en';
        isPremium?: boolean;
        sajuResult?: Record<string, unknown>;
        astrologyResult?: Record<string, unknown>;
        readingData?: {
            name?: string;
            partnerName?: string;
            [key: string]: unknown;
        };
        oraclePersona?: {
            id: string;
            name: string;
            title: string;
        };
    };
    language?: 'ko' | 'en';
    shareUrl?: string;
    onUnlock?: () => void;
    isPremium?: boolean;
    price?: string;
    isLoading?: boolean;
    onRetry?: () => void;
    userQuestion?: string;
}

interface MetadataWithReadingData extends NonNullable<PremiumReportProps['metadata']> {
    readingData?: Record<string, unknown>;
    tarotCards?: NonNullable<PremiumReportProps['metadata']>['tarotCards'];
}

function isSajuResult(value: unknown): value is SajuResult {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;

    return (
        'yeonPillar' in candidate &&
        'monthPillar' in candidate &&
        'dayPillar' in candidate &&
        'hourPillar' in candidate
    );
}

export function PremiumReport({ report, metadata, language = 'ko', shareUrl, onUnlock, isPremium, price, isLoading, onRetry, userQuestion }: PremiumReportProps) {
    const isEn = language === 'en';
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [activeDossierTab, setActiveDossierTab] = useState<'strategy' | 'timing' | 'intelligence'>(() => {
        if (typeof window !== 'undefined') {
            const tabParam = new URLSearchParams(window.location.search).get('tab');
            if (tabParam === 'strategy' || tabParam === 'timing' || tabParam === 'intelligence') {
                return tabParam;
            }
        }
        return 'strategy';
    });
    const [intelligenceSubFilter, setIntelligenceSubFilter] = useState<'all' | 'eastern' | 'western' | 'ancient'>('all');
    const tabNavRef = useRef<HTMLDivElement>(null);
    const [readingProgress, setReadingProgress] = useState(0);
    const [, setActiveChapter] = useState<ChapterKey>('brief');
    const printRef = useRef<HTMLDivElement>(null);
    const metadataWithReading = metadata as MetadataWithReadingData | undefined;
    const readingData = metadataWithReading?.readingData;
    const sajuResult = isSajuResult(metadata?.sajuResult) ? metadata.sajuResult : null;
    const userName = (readingData?.name as string | undefined) || (report.summary?.title ? report.summary.title.split(' ')[0] : '귀하');

    const handleTabChange = (nextTab: 'strategy' | 'timing' | 'intelligence') => {
        setActiveDossierTab(nextTab);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', nextTab);
            window.history.replaceState({}, '', url.toString());
        }
        if (tabNavRef.current) {
            const rect = tabNavRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - 85;
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
    };

    // Track scroll progress for executive chapter bar
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (height > 0) {
                const scrolled = (winScroll / height) * 100;
                setReadingProgress(Math.min(100, Math.max(0, Math.round(scrolled))));
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isProgrammaticScrollRef = useRef(false);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleChapterSelect = (nextChapter: ChapterKey) => {
        setActiveChapter(nextChapter);

        // Temporarily lock scroll-spy while smooth scrolling to target
        isProgrammaticScrollRef.current = true;
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
        }, 1200);

        const chapterMap: Record<ChapterKey, string> = {
            brief: 'domain-brief',
            timing: 'domain-timing',
            intelligence: 'domain-intelligence',
            life: 'domain-life',
        };
        const targetId = chapterMap[nextChapter];
        const target = (targetId ? document.getElementById(targetId) : null) ||
                       (nextChapter === 'timing' ? (document.getElementById('section-flow') || document.getElementById('section-weekly-heatmap') || document.getElementById('section-thai-astrology')) : null) ||
                       (nextChapter === 'intelligence' ? (document.getElementById('section-ziwei') || document.getElementById('section-core')) : null) ||
                       document.getElementById('dossier-main-container');

        if (target) {
            // 135px offset compensates for top global navbar (~56px) + sticky chapter radar bar (~60px) + padding
            const headerOffset = 135;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: Math.max(0, offsetPosition),
                behavior: 'smooth',
            });
        }
    };

    const handleChapterInView = (nextChapter: ChapterKey) => {
        if (isProgrammaticScrollRef.current) return;
        setActiveChapter(nextChapter);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CosmicPath_Decision_Report_${report.summary.title || 'VIP'}`,
    });

    const displayPrice = normalizePriceLabel(price || (isEn ? '$3.99' : '₩4,900')) || (isEn ? '$3.99' : '₩4,900');

    const handleUnlock = () => {
        if (onUnlock) {
            onUnlock();
        } else {
            setIsCheckoutOpen(true);
        }
    };

    // Extract Birth Info from precision metadata or readingData
    const birthDateStr = (metadata?.precisionMetadata?.inputDate || (readingData?.birthDate as string)) || '';
    const birthTimeStr = (metadata?.precisionMetadata?.inputTime || (readingData?.birthTime as string)) || '12:00';
    const birthGender = ((readingData?.gender as string) || 'male') as 'male' | 'female';

    // Deterministic Calculations
    let computedZiweiChart: ZiweiChartResult | null = null;
    if (birthDateStr) {
        try {
            const birthDateObj = new Date(birthDateStr);
            const hour = parseInt(birthTimeStr.split(':')[0] || '12', 10);
            if (!isNaN(birthDateObj.getTime())) {
                computedZiweiChart = calculateZiweiChart(
                    birthDateObj,
                    isNaN(hour) ? 12 : hour,
                    birthGender
                );
            }
        } catch (e) {
            console.error('Failed to compute Ziwei chart:', e);
        }
    }

    let computedShadowTransformations: ShadowTransformationResult | null = null;
    if (sajuResult) {
        try {
            computedShadowTransformations = calculateShadowTransformations(sajuResult);
        } catch (e) {
            console.error('Failed to compute shadow transformations:', e);
        }
    }

    let computedWeeklyHeatmap: YearHeatmapResult | null = null;
    if (sajuResult) {
        try {
            const currentYear = new Date().getFullYear();
            computedWeeklyHeatmap = calculateWeeklyTimingHeatmap(sajuResult, currentYear);
        } catch (e) {
            console.error('Failed to compute weekly heatmap:', e);
        }
    }

    let computedCompatibility4D: Compatibility4DResult | null = null;
    if (sajuResult) {
        try {
            computedCompatibility4D = calculate4DCompatibility(sajuResult);
        } catch (e) {
            console.error('Failed to compute 4D compatibility:', e);
        }
    }

    // Thai Royal Astrology & Maha Thaksa 108
    let computedThaiAstrology: ThaiAstrologyResult | null = null;
    if (birthDateStr) {
        try {
            computedThaiAstrology = calculateThaiAstrology({
                birthDate: birthDateStr,
                birthTime: birthTimeStr,
                tropicalSunSign: 4,
                tropicalMoonSign: 9,
                tropicalAscendantSign: 7,
            });
        } catch (e) {
            console.error('Failed to compute Thai astrology:', e);
        }
    }

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const readingId = metadata?.readingId || shareUrl?.split('/').pop();

    const availableSectionIds = [
        'section-executive',
        computedZiweiChart ? 'section-ziwei' : '',
        report.core_analysis ? 'section-core' : '',
        computedShadowTransformations ? 'section-shadow-transformation' : '',
        report.saju_sections && report.saju_sections.length > 0 ? 'section-saju' : '',
        report.astro_deep ? 'section-astro' : '',
        computedThaiAstrology ? 'section-thai-astrology' : '',
        report.fortune_flow ? 'section-flow' : '',
        computedWeeklyHeatmap ? 'section-weekly-heatmap' : '',
        report.life_areas ? 'section-life-areas' : '',
    ].filter(Boolean) as string[];

    return (
        <div className={`w-full mx-auto pb-24 md:pb-32 ${isPremium ? 'max-w-6xl px-4 sm:px-6 lg:px-8' : 'max-w-3xl px-4'}`}>
            {/* Hidden Print Layout */}
            <div className="hidden">
                <PrintLayout
                    ref={printRef}
                    data={report}
                    language={language}
                    userData={{ name: report.summary.title.split(' ')[0] }}
                />
            </div>

            {isPremium && (
                <div id="dossier-main-container" className="space-y-8">
                    {/* Executive Hero Banner with Direct Verdict */}
                    <div className="rounded-[28px] border border-[#c8a84d]/40 bg-[radial-gradient(ellipse_at_top,rgba(200,168,77,0.12),transparent_70%),linear-gradient(180deg,rgba(24,22,18,0.95),rgba(12,11,9,0.98))] p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8a84d]/40 bg-[#c8a84d]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#f5e6be]">
                                <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
                                <span>{isEn ? 'Confidential Executive Dossier' : 'VIP 의사결정 마스터 리포트'}</span>
                            </div>
                            <div className="text-xs text-stone-400 font-mono">
                                {userName} · {birthDateStr}
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d4af37]/80">
                                {isEn ? 'CORE VERDICT & STRATEGY' : '핵심 직답 판정 & 전략'}
                            </span>
                            <h1 className="mt-2 text-xl sm:text-2xl md:text-3xl font-bold font-cinzel text-white leading-tight">
                                {report.summary?.title || (isEn ? 'Executive Decision Timing Blueprint' : '2026 하반기 전략 및 골든타임 블루프린트')}
                            </h1>
                            {userQuestion && (
                                <p className="mt-3 text-xs sm:text-sm text-stone-300 bg-white/5 border border-white/10 rounded-xl p-3 leading-relaxed">
                                    <span className="text-[#d4af37] font-bold">Q.</span> {userQuestion}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3-Tab Segmented Switcher */}
                    <div ref={tabNavRef} className="sticky top-20 z-40 flex items-center justify-center p-1.5 bg-[#14120e]/95 border border-[#c8a84d]/40 rounded-2xl backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] max-w-3xl mx-auto">
                        <button
                            type="button"
                            onClick={() => handleTabChange('strategy')}
                            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeDossierTab === 'strategy'
                                    ? 'bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] text-stone-950 shadow-md font-black'
                                    : 'text-stone-400 hover:text-stone-200'
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="hidden sm:inline">{isEn ? '1. Strategy & Action' : '1. 전략 요약 & 실행'}</span>
                            <span className="sm:hidden">{isEn ? 'Strategy' : '전략 실행'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('timing')}
                            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeDossierTab === 'timing'
                                    ? 'bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] text-stone-950 shadow-md font-black'
                                    : 'text-stone-400 hover:text-stone-200'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="hidden sm:inline">{isEn ? '2. Timing & Allies' : '2. 골든타임 & 귀인'}</span>
                            <span className="sm:hidden">{isEn ? 'Timing' : '골든타임'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('intelligence')}
                            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeDossierTab === 'intelligence'
                                    ? 'bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] text-stone-950 shadow-md font-black'
                                    : 'text-stone-400 hover:text-stone-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="hidden sm:inline">{isEn ? '3. 5-Engine Intelligence' : '3. 5대 엔진 심층근거'}</span>
                            <span className="sm:hidden">{isEn ? '5 Engines' : '5대 엔진'}</span>
                        </button>
                    </div>

                    {/* Active Tab View */}
                    <div className="space-y-10">
                        {activeDossierTab === 'strategy' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <ExecutiveSummaryDashboard
                                    report={report}
                                    question={userQuestion}
                                    language={language}
                                    sajuResult={sajuResult || undefined}
                                    userName={userName}
                                />
                                {report.action_plan && report.action_plan.length > 0 && (
                                    <ActionPlanSection
                                        actionPlan={report.action_plan}
                                        trustScore={report.summary.trust_score * 20}
                                        language={language}
                                    />
                                )}
                                {report.date_selection && (
                                    <DateSelectionSection
                                        data={report.date_selection}
                                        language={language}
                                    />
                                )}
                                <DecisionConsensusGauge
                                    language={language}
                                    reportData={report as any}
                                />
                            </motion.div>
                        )}

                        {activeDossierTab === 'timing' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {report.fortune_flow && (
                                    <FortuneFlowSection
                                        data={report.fortune_flow}
                                        language={language}
                                    />
                                )}
                                {computedWeeklyHeatmap && (
                                    <WeeklyHeatmapSection
                                        data={computedWeeklyHeatmap}
                                        language={language}
                                    />
                                )}
                                {report.special_analysis && (
                                    <SpecialAnalysisSection
                                        data={report.special_analysis}
                                        language={language}
                                    />
                                )}
                                {report.life_areas && (
                                    <LifeAreasSection
                                        data={report.life_areas}
                                        language={language}
                                    />
                                )}
                                {sajuResult && (
                                    <GhostDetectorSection sajuResult={sajuResult} userName={userName} />
                                )}
                            </motion.div>
                        )}

                        {activeDossierTab === 'intelligence' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {/* 3-Domain Sub-Filter Bar */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold whitespace-nowrap mr-1">
                                        {isEn ? 'Filter School:' : '분파 필터:'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIntelligenceSubFilter('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            intelligenceSubFilter === 'all'
                                                ? 'bg-[#c8a84d] text-stone-950 shadow-sm font-bold'
                                                : 'bg-white/5 text-stone-400 border border-white/10 hover:text-stone-200'
                                        }`}
                                    >
                                        {isEn ? 'All 9 Modules' : '전체 보기 (9개)'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIntelligenceSubFilter('eastern')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            intelligenceSubFilter === 'eastern'
                                                ? 'bg-[#c8a84d] text-stone-950 shadow-sm font-bold'
                                                : 'bg-white/5 text-stone-400 border border-white/10 hover:text-stone-200'
                                        }`}
                                    >
                                        {isEn ? '☯️ Eastern Saju & Ziwei' : '☯️ 동양 명리 (사주 · 자미두수)'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIntelligenceSubFilter('western')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            intelligenceSubFilter === 'western'
                                                ? 'bg-[#c8a84d] text-stone-950 shadow-sm font-bold'
                                                : 'bg-white/5 text-stone-400 border border-white/10 hover:text-stone-200'
                                        }`}
                                    >
                                        {isEn ? '🪐 Western Astrology' : '🪐 서양 점성 (Big 3 · 트랜짓)'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIntelligenceSubFilter('ancient')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            intelligenceSubFilter === 'ancient'
                                                ? 'bg-[#c8a84d] text-stone-950 shadow-sm font-bold'
                                                : 'bg-white/5 text-stone-400 border border-white/10 hover:text-stone-200'
                                        }`}
                                    >
                                        {isEn ? '🪷 Ancient & Numerology' : '🪷 고대 비전 (태국 · 수비학 · 전생)'}
                                    </button>
                                </div>

                                {/* Eastern Domain: Saju & Ziwei */}
                                {(intelligenceSubFilter === 'all' || intelligenceSubFilter === 'eastern') && (
                                    <>
                                        {computedZiweiChart && (
                                            <ZiweiChartComponent
                                                chart={computedZiweiChart}
                                                language={language}
                                            />
                                        )}
                                        {report.core_analysis && (
                                            <CoreAnalysisSection
                                                data={report.core_analysis}
                                                language={language}
                                            />
                                        )}
                                        {computedShadowTransformations && (
                                            <ShadowTransformationSection
                                                data={computedShadowTransformations}
                                                language={language}
                                            />
                                        )}
                                        {report.saju_sections && report.saju_sections.length > 0 && (
                                            <AccordionSection
                                                title={isEn ? 'Classical Saju 4 Pillars Breakdown' : '정통 사주 4주 심층 분석'}
                                                items={report.saju_sections}
                                                source="saju"
                                                language={language}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Western Domain: Astrology */}
                                {(intelligenceSubFilter === 'all' || intelligenceSubFilter === 'western') && (
                                    <>
                                        {report.astro_deep && (
                                            <AstroDeepSection
                                                data={report.astro_deep}
                                                language={language}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Ancient Domain: Thai, Numerology, Compatibility, Past Life */}
                                {(intelligenceSubFilter === 'all' || intelligenceSubFilter === 'ancient') && (
                                    <>
                                        {computedThaiAstrology && (
                                            <ThaiAstrologySection
                                                data={computedThaiAstrology}
                                                language={language}
                                            />
                                        )}
                                        {report.numerology && (
                                            <NumerologySection
                                                data={report.numerology}
                                                language={language}
                                            />
                                        )}
                                        {computedCompatibility4D && (
                                            <Compatibility4DSection
                                                data={computedCompatibility4D}
                                                language={language}
                                            />
                                        )}
                                        {report.past_life && (
                                            <PastLifeSection
                                                data={report.past_life}
                                                language={language}
                                            />
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Master Dossier PDF Banner */}
                    <div className="mt-12 rounded-3xl border border-[#c8a84d]/40 bg-gradient-to-r from-[#c8a84d]/15 via-[#181611] to-[#0c0b08] p-6 sm:p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#c8a84d]/20 text-[#f5d77f] border border-[#c8a84d]/30 mb-4 shadow-lg">
                            <Printer className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-cinzel text-white">
                            {isEn ? '15-Page Confidential Master Dossier' : '15페이지 최고급 A4 마스터 도시에'}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-lg mx-auto leading-relaxed">
                            {isEn
                                ? 'Download or print the full high-resolution A4 executive dossier containing all 5-engine calculations, SVG celestial wheels, and dialectical synthesis.'
                                : '동서양 5대 엔진 계산식, 천문 차트 휠, 12개월 전략 캘린더가 집약된 정식 A4 도시에를 열람하거나 PDF로 저장하세요.'}
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (readingId) {
                                        window.open(`/api/report/pdf?readingId=${readingId}`, '_blank');
                                    } else {
                                        handlePrint();
                                    }
                                }}
                                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] text-stone-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(200,168,77,0.35)] transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4 text-stone-950" />
                                <span>{isEn ? 'Open 15p A4 Master Dossier (PDF)' : '15p A4 마스터 도시에 열기 (PDF)'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsShareModalOpen(true)}
                                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-xs sm:text-sm text-stone-200 font-semibold border border-white/15 transition-all flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4 text-[#d4af37]" />
                                <span>{isEn ? 'Story Card (9:16)' : '소장용 스토리 카드 (9:16)'}</span>
                            </button>
                        </div>
                    </div>

                    {/* 1:1 Oracle Chat Follow-Up Interface */}
                    {readingId && (
                        <div id="oracle-chat" data-chat-interface className="mt-12">
                            <div className="rounded-3xl border border-[#c8a84d]/40 bg-gradient-to-b from-[#181611]/90 via-[#0f0e0b]/95 to-[#0a0907]/98 p-6 md:p-8 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                                <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c8a84d]/40 bg-[#c8a84d]/20 text-[#f5d77f]">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {isEn ? '1:1 Private Oracle Consultation' : '1:1 프라이빗 오라클 심층 상담'}
                                        </h3>
                                        <p className="text-xs text-white/50">
                                            {isEn ? 'Ask follow-up questions directly to the AI Oracle Council.' : '방금 분석된 당신의 5단 융합 명반을 기반으로 추가 질문을 나눠보세요.'}
                                        </p>
                                    </div>
                                </div>
                                <ChatInterface readingId={readingId} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isPremium && (
                <CaseFileReport
                    report={report}
                    language={language}
                    isFreeView={true}
                    isLoading={isLoading}
                    onRetry={onRetry}
                    onUnlock={handleUnlock}
                    displayPrice={displayPrice}
                    personName={userName}
                    question={userQuestion}
                />
            )}

            {/* Sticky Floating CTA for Free Users */}
            {!isPremium && (
                <StickyCTA
                    price={displayPrice}
                    originalPrice={isEn ? '$19.99' : '₩29,000'}
                    onUnlock={handleUnlock}
                    language={language}
                />
            )}

            {/* Modal Checkout */}
            {isCheckoutOpen && (
                <PaymentModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    price={displayPrice}
                    metadata={{
                        readingId: readingId,
                        language: language,
                    }}
                />
            )}
                    {/* Share Card Modal for Instagram 9:16 */}
            <ShareCardModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={report.summary?.title || (isEn ? 'CosmicPath Dossier' : 'CosmicPath VIP 운명 리포트')}
                matchLevel="PERFECT"
                keywords={report.traits?.map(t => t.name).slice(0, 3) || ['신뢰도 94%', `${new Date().getFullYear()} 골든타임`, '사주·점성 융합']}
                source="vip_report_footer"
                language={language}
                readingId={readingId}
                resultType="vip_dossier"
            />
        </div>
    );
}
