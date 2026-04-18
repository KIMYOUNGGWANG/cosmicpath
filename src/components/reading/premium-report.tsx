'use client';

import { useSession } from 'next-auth/react';
import { useLoginModal } from '@/components/auth/LoginModal';
import { motion, Variants } from 'framer-motion';
import { CompatibilityHeader } from './CompatibilityHeader';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Target, Zap, Lock, CircleHelp, Download, Printer, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrintLayout } from './PrintLayout';
import { CosmicRadar } from './cosmic-radar';
import { EvidenceTooltip } from '../ui/confidence-badge';
import { TarotDetailModal } from './tarot-detail-modal';
import { ShareCard } from './share-card';
import { BlindSpotTeaser } from './blind-spot-teaser';
import { TeaserCard } from '../sales/TeaserCard';
import { BlurredPreviewSection } from '../sales/BlurredPreviewSection';
import { StickyCTA } from '../common/sticky-cta';

import type { TimelineScore } from './FortuneTimelineChart';
import { SoulmateSection, SoulmateData } from './SoulmateSection';
import { LuckyAssetsGrid, LuckyAssetsData } from './LuckyAssetsGrid';
import { GlossarySection } from './GlossarySection';
import { PaymentModal } from '../payment/PaymentModal';
import { normalizePriceLabel, READING_PRODUCT } from '@/lib/payment/payment-config';
import { FinalVerdictCard } from './FinalVerdictCard';
import { InsightCard, InsightHighlight } from './ui/InsightCard';
import { DestinyDashboardSection } from '../dashboard/DestinyDashboardSection';
import { GhostDetectorSection } from '../dashboard/GhostDetectorSection';
import {
    ActionPlanSection,
    AccordionSection,
    AstroDeepSection,
    CompatibleDeepDiveSection,
    CompatibilitySection,
    ContentCard,
    CoreAnalysisSection,
    DateSelectionSection,
    FortuneFlowSection,
    FreeFocusSection,
    HeaderSection,
    LifeAreasSection,
    NumerologySection,
    PastLifeSection,
    PremiumSectionInterruptionCard,
    SpecialAnalysisSection,
    TarotSpreadSection,
    TraitsSection,
} from './premium-report-sections';

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
            tarot: number;
        };
        precisionMetadata?: {
            inputDate: string;
            inputTime: string;
            tstOffset: number;
            correctedDate: string;
            correctedTime: string;
            lon: number;
            hourPillar: string;
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
    readingData?: any;
    tarotCards?: any[];
}

type PremiumSectionKey =
    | 'fortune_flow'
    | 'life_areas'
    | 'special_analysis'
    | 'action_plan'
    | 'final_verdict';

// ... (existing helper)

function CosmicRadarMemo({ report, metadata, language }: { report: PremiumReportData; metadata?: PremiumReportProps['metadata']; language: 'ko' | 'en' }) {
    const isEn = language === 'en';

    // Use dynamic scores from metadata if available, otherwise fallback to derived
    const sajuScore = metadata?.radarScores?.saju || (report.summary.trust_score * 20 - (report.summary.trust_score > 3 ? 5 : 15));
    const starScore = metadata?.radarScores?.astrology || (report.summary.trust_score * 20 - (report.summary.trust_score > 3 ? 15 : 25));
    const tarotScore = metadata?.radarScores?.tarot || (report.summary.trust_score * 20 - (report.summary.trust_score > 3 ? 25 : 35));

    // Analyze imbalance
    const scores = {
        saju: { score: sajuScore, label: isEn ? 'Logic' : '논리(사주)', icon: '📜' },
        star: { score: starScore, label: isEn ? 'Flow' : '흐름(별자리)', icon: '🌌' },
        tarot: { score: tarotScore, label: isEn ? 'Intuition' : '직관(타로)', icon: '🔮' }
    };

    const maxScore = Math.max(sajuScore, starScore, tarotScore);
    const minScore = Math.min(sajuScore, starScore, tarotScore);
    const diff = maxScore - minScore;

    const highest = Object.values(scores).find(s => s.score === maxScore)!;
    const lowest = Object.values(scores).find(s => s.score === minScore)!;

    let badgeConfig;
    if (diff < 15) {
        badgeConfig = {
            color: 'bg-green-500/10 border-green-500/50 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
            dot: 'bg-green-500',
            ping: 'bg-green-400',
            text: isEn ? "IDEAL BALANCE" : "완벽한 조화"
        };
    } else if (diff < 30) {
        badgeConfig = {
            color: 'bg-gold/10 border-gold/50 text-gold/90 shadow-[0_0_15px_rgba(255,215,0,0.2)]',
            dot: 'bg-gold',
            ping: 'bg-gold/60',
            text: isEn ? "STABLE HARMONY" : "안정적 균형"
        };
    } else {
        badgeConfig = {
            color: 'bg-red-500/10 border-red-500/50 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
            dot: 'bg-red-500',
            ping: 'bg-red-400',
            text: isEn ? "DYNAMIC IMBALANCE" : "심각한 불균형"
        };
    }

    const tooltipText = isEn
        ? `Your '${highest.label}' is dominant, while '${lowest.label}' is currently recessed. This indicates a focus on ${maxScore > 80 ? 'strong' : 'developing'} external manifestations over internal ${minScore < 40 ? 'needs' : 'adjustments'}.`
        : `회원님의 운세는 '${highest.label}'의 기운이 매우 강한 반면, '${lowest.label}'가 상대적으로 낮게 나타납니다. 이는 현재 상황에서 ${maxScore > 80 ? '강력한' : '뚜렷한'} 추진력을 발휘하고 있지만 ${minScore < 40 ? '세밀한' : '유연한'} 조율이 필요함을 암시합니다.`;

    return (
        <section className="mt-8 px-4 md:px-6 relative">
            {/* Dynamic Warning/Status Badge */}
            <div className="absolute -top-4 right-4 z-10 group cursor-help">
                <div className={cn("backdrop-blur-md text-xs px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-500", badgeConfig.color)}>
                    <span className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", badgeConfig.ping)}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", badgeConfig.dot)}></span>
                    </span>
                    <span className="font-bold tracking-wide">{badgeConfig.text}</span>
                    <CircleHelp size={12} className="opacity-70" />
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 border border-white/10 p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl scale-95 group-hover:scale-100 origin-top-right">
                    <p className="text-[11px] text-gray-200 leading-relaxed font-light">
                        {tooltipText}
                    </p>
                </div>
            </div>

            <CosmicRadar
                sajuScore={sajuScore}
                starScore={starScore}
                tarotScore={tarotScore}
                isLoading={false}
                language={language}
                details={{
                    saju: isEn ? "Logic is at its peak." : "논리적 판단력이 정점에 달해 있습니다.",
                    tarot: isEn ? "Intuition is dangerously low." : "직관력이 매우 약해져 있어 경고가 필요합니다.",
                    star: isEn ? "Cosmic flow is stable." : "우주의 흐름은 평이한 상태입니다."
                }}
            />
        </section>
    );
}

// Animation Variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export function PremiumReport({ report, metadata, language = 'ko', shareUrl, onUnlock, isPremium, price, isLoading, onRetry, userQuestion }: PremiumReportProps) {
    const isEn = language === 'en';
    const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // PDF Printing Logic
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `CosmicPath_Report_${report.summary.title.replace(/\s+/g, '_')}`,
    });

    // Dynamic price from prop or fetched from API
    const resolvedPriceProp = normalizePriceLabel(price);
    const [fetchedPrice, setFetchedPrice] = useState<string | null>(null);
    const dynamicPrice = resolvedPriceProp || normalizePriceLabel(fetchedPrice);
    const originalPrice = '$19.90';
    const displayPrice = dynamicPrice || (isEn ? 'Shown at checkout' : '결제 단계에서 확인');

    // Fetch price from Stripe when component mounts (if not provided via prop)
    useEffect(() => {
        if (resolvedPriceProp) return;

        let isMounted = true;

        fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`, { cache: 'no-store' })
            .then(async (response) => {
                const data = await response.json();

                if (
                    isMounted &&
                    response.ok &&
                    data?.metadata?.fallback !== 'true' &&
                    normalizePriceLabel(data.formattedPrice)
                ) {
                    setFetchedPrice(data.formattedPrice);
                }
            })
            .catch(err => console.error('Failed to fetch price:', err));

        return () => {
            isMounted = false;
        };
    }, [resolvedPriceProp]);

    const handleUnlock = () => {
        if (onUnlock) {
            onUnlock();
        } else {
            setIsCheckoutOpen(true);
        }
    };

    const firstMissingPremiumSection: PremiumSectionKey | null = (() => {
        if (!isPremium || isLoading || !onRetry) return null;
        if (!report.fortune_flow) return 'fortune_flow';
        if (!report.life_areas) return 'life_areas';
        if (!report.special_analysis) return 'special_analysis';
        if (!report.action_plan) return 'action_plan';
        if (!report.past_life || !report.glossary || !report.final_verdict) return 'final_verdict';
        return null;
    })();

    // Dynamic Teaser Text Generator
    const getTeaserText = (section: string) => {
        const month = new Date().getMonth() + 2; // Next month
        if (isEn) {
            return section === 'flow'
                ? `In ${month > 12 ? 1 : month}th month, a significant turning point approaches...`
                : `A hidden obstacle in your ${section} sector requires immediate attention...`;
        }
        return section === 'flow'
            ? `${month > 12 ? 1 : month}월, 당신의 운명에 결정적인 전환점이 찾아옵니다...`
            : `당신의 ${section} 영역에 숨겨진 치명적인 장애물이 있습니다...`;
    };

    if (!report) return null;

    const tarotCards = metadata?.tarot || [];
    const freeFocus = report.free_focus;

    // Auth & Save Logic
    const { data: session, status } = useSession();
    const { openLoginModal } = useLoginModal();

    return (
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-32">
            {/* FreeFocusSection: 비구독자는 최상단에, 프리미엄은 HeaderSection 다음에 */}
            {!isPremium && (
                <FreeFocusSection
                    freeFocus={freeFocus}
                    language={language}
                    isPremium={false}
                    userQuestion={userQuestion}
                />
            )}

            {/* Header */}
            {(metadata as any)?.readingData?.partnerName ? (
                <CompatibilityHeader
                    userName={(metadata as any)?.readingData?.name || 'User'}
                    partnerName={(metadata as any)?.readingData?.partnerName}
                    score={report.summary.trust_score * 20}
                    title={report.summary.title}
                    content={report.summary.content}
                    language={language}
                />
            ) : (
                <HeaderSection
                    summary={report.summary}
                    language={language}
                />
            )}

            {isPremium && (
                <FreeFocusSection
                    freeFocus={freeFocus}
                    language={language}
                    isPremium={true}
                />
            )}

            {/* Hidden Print Layout */}
            <div className="hidden">
                <PrintLayout
                    ref={printRef}
                    data={report}
                    language={language}
                    userData={{ name: report.summary.title.split(' ')[0] }} // Simplified user name extraction or pass from props
                />
            </div>

            {/* Cosmic Radar Section (New) */}
            <CosmicRadarMemo report={report} metadata={metadata} language={language} />

            {/* Destiny Dashboard — Saju Energy Visualization */}
            {/* Destiny Dashboard — Saju Energy Visualization */}
            {(metadata as any)?.sajuResult && (
                <DestinyDashboardSection
                    details={{
                        hostSaju: (metadata as any).sajuResult,
                        hostAstrology: (metadata as any)?.astrologyResult
                    }}
                    hasGuest={false}
                    hostName={(metadata as any)?.readingData?.name || 'You'}
                    guestName={undefined}
                />
            )}

            {/* Tarot Spread Section */}
            {tarotCards.length > 0 && (
                <TarotSpreadSection cards={tarotCards} onCardClick={setSelectedCardIdx} language={language} />
            )}

            {/* Traits */}
            <TraitsSection traits={report.traits} language={language} />

            {/* Categorized Analysis - LINEAR LAYOUT */}
            <div className="space-y-12 md:space-y-16 mt-8 md:mt-12">

                {/* 1. Basic Analysis - FREE: summary + traits only, PREMIUM: all */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {/* Core Analysis */}
                    {isPremium ? (
                        report.core_analysis && <CoreAnalysisSection data={report.core_analysis} sajuData={(metadata as any)?.sajuResult} language={language} />
                    ) : report.core_analysis ? (
                        // 실제 데이터가 있으면 블러 처리로 미리보기
                        <BlurredPreviewSection
                            title={isEn ? "Oracle Core Reading" : "오라클 코어 리딩"}
                            subtitle={isEn ? "⚠️ Critical Element Imbalance Detected" : "⚠️ 사주 오행의 심각한 불균형 감지"}
                            onUnlock={handleUnlock}
                            language={language}
                        >
                            <CoreAnalysisSection data={report.core_analysis} sajuData={(metadata as any)?.sajuResult} language={language} />
                        </BlurredPreviewSection>
                    ) : (
                        // 데이터가 없으면 기존 TeaserCard fallback
                        <TeaserCard
                            title={isEn ? "Oracle Core Reading" : "오라클 코어 리딩"}
                            hook={isEn ? "⚠️ Critical Element Imbalance Detected in your chart foundation." : "⚠️ 사주 오행의 심각한 불균형이 감지되었습니다."}
                            type="danger"
                            onUnlock={handleUnlock}
                            language={language}
                        />
                    )}


                    {/* 🌌 Astro Deep Dive */}
                    {isPremium ? (
                        report.astro_deep && <AstroDeepSection data={report.astro_deep} language={language} />
                    ) : report.astro_deep ? (
                        <BlurredPreviewSection
                            title={isEn ? "Deep Astrological Insight" : "점성술 심층 분석"}
                            subtitle={isEn ? "🪐 Saturn's karmic challenge awaits" : "🪐 토성이 가리키는 업보(Karma)"}
                            onUnlock={handleUnlock}
                            language={language}
                        >
                            <AstroDeepSection data={report.astro_deep} language={language} />
                        </BlurredPreviewSection>
                    ) : (
                        <TeaserCard
                            title={isEn ? "Deep Astrological Insight" : "점성술 심층 분석"}
                            hook={isEn ? "🪐 Saturn's position indicates a karmic challenge you must face." : "🪐 토성의 위치가 당신이 마주해야 할 업보(Karma)를 가리킵니다."}
                            type="general"
                            onUnlock={handleUnlock}
                            language={language}
                        />
                    )}

                    {/* 🔢 Numerology */}
                    {isPremium ? (
                        report.numerology && <NumerologySection data={report.numerology} language={language} />
                    ) : report.numerology ? (
                        <BlurredPreviewSection
                            title={isEn ? "Soul Code (Numerology)" : "영혼의 코드 (수비학)"}
                            subtitle={isEn ? "🔢 Your Life Path reveals a turning point" : "🔢 생명수가 가리키는 전환점"}
                            onUnlock={handleUnlock}
                            language={language}
                        >
                            <NumerologySection data={report.numerology} language={language} />
                        </BlurredPreviewSection>
                    ) : (
                        <TeaserCard
                            title={isEn ? "Soul Code (Numerology)" : "영혼의 코드 (수비학)"}
                            hook={isEn ? "🔢 Your Life Path Number reveals a major turning point at age 30." : "🔢 당신의 '생명수'가 가리키는 인생의 결정적 전환점."}
                            type="general"
                            onUnlock={handleUnlock}
                            language={language}
                        />
                    )}

                    {/* Saju Sections (Renamed for EN: Elemental Blueprint) */}
                    {isPremium ? (
                        report.saju_sections && (
                            <AccordionSection
                                title={isEn ? "🌏 Elemental Blueprint (Eastern Insight)" : "📜 사주 기본 분석"}
                                items={report.saju_sections}
                                source="saju"
                                language={language}
                            />
                        )
                    ) : report.saju_sections ? (
                        <BlurredPreviewSection
                            title={isEn ? "Elemental Blueprint" : "사주 원국 정밀 분석"}
                            subtitle={isEn ? "📜 60-year destiny cycle revealed" : "📜 60년 운명의 지도"}
                            onUnlock={handleUnlock}
                            language={language}
                        >
                            <AccordionSection
                                title={isEn ? "🌏 Elemental Blueprint" : "📜 사주 기본 분석"}
                                items={report.saju_sections}
                                source="saju"
                                language={language}
                            />
                        </BlurredPreviewSection>
                    ) : (
                        <TeaserCard
                            title={isEn ? "Elemental Blueprint" : "사주 원국 정밀 분석"}
                            hook={isEn ? "📜 Your birth chart holds the key to your 60-year destiny cycle." : "📜 내 사주팔자에 숨겨진 60년 운명의 지도를 확인하세요."}
                            type="general"
                            onUnlock={handleUnlock}
                            language={language}
                        />
                    )}

                </motion.section>

                {/* 2. Destiny Flow - PAYWALL */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.fortune_flow ? (
                        <FortuneFlowSection data={report.fortune_flow} language={language} />
                    ) : isPremium ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-acc-gold/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Syncing Cosmic Flow..." : "심층 운세 동기화 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'fortune_flow' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : (
                            null
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <BlindSpotTeaser
                                title={isEn ? "⚠️ WHAT TO WATCH NEXT" : "⚠️ 곧 주의해서 볼 흐름"}
                                previewText={getTeaserText('flow')}
                                hiddenText={isEn
                                    ? "This period brings a rare alignment of Jupiter and Saturn, signaling a massive shift in your career path. Without preparation, you may miss this 12-year cycle opportunity."
                                    : "이 시기에는 목성과 토성이 드물게 정렬하며, 당신의 커리어에 거대한 지각 변동을 예고합니다. 준비하지 않으면 12년 만에 오는 이 기회를 영영 놓칠 수 있습니다."
                                }
                                language={language}
                                isLocked={true}
                                onUnlock={handleUnlock}
                            />
                        </div>
                    )}
                </motion.section>

                {/* 3. Life Areas & Soulmate - PAYWALL */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.life_areas ? (
                        <>
                            <LifeAreasSection data={report.life_areas} language={language} />
                            {report.soulmate && <SoulmateSection data={report.soulmate} language={language} />}
                        </>
                    ) : isPremium ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-star-yellow/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Unveiling Life Secrets..." : "영역별 상세 분석 조율 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'life_areas' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : (
                            null
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Target size={18} className="text-gold" />
                                {isEn ? 'Life Areas & Soulmate' : '분야별 해석 & 인연'}
                            </h2>
                            <BlindSpotTeaser
                                title={isEn ? "🔒 MORE DETAILED READING" : "🔒 더 자세한 해석"}
                                previewText={getTeaserText('life')}
                                hiddenText={isEn
                                    ? "Your wealth luck flows strongly in the northeast direction this year. A crucial romantic encounter is waiting in late autumn."
                                    : "올해 북동쪽 방향에서 재물운이 강력하게 들어오고 있습니다. 늦가을에는 인생을 바꿀 중요한 인연이 기다리고 있습니다."
                                }
                                language={language}
                                isLocked={true}
                                onUnlock={handleUnlock}
                            />
                        </div>
                    )}
                </motion.section>

                {/* 4. Special Analysis & Lucky Assets - PAYWALL */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.special_analysis ? (
                        <>
                            <SpecialAnalysisSection data={report.special_analysis} language={language} />
                            {report.lucky_assets && <LuckyAssetsGrid data={report.lucky_assets} language={language} />}
                            {/* 🌀 Past Life Analysis (NEW - P2-1) */}
                            {report.past_life && <PastLifeSection data={report.past_life} language={language} />}
                            {/* Compatibility deep-dive block for older saved report payloads */}
                            {report.deep_dive && !report.saju_sections && (
                                <CompatibleDeepDiveSection data={report.deep_dive} language={language} />
                            )}
                        </>
                    ) : isPremium ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Finalizing Action Plan..." : "특수 비책 및 솔루션 도출 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'special_analysis' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : (
                            null
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-gold" />
                                {isEn ? 'More Detailed Insight' : '더 자세한 분석'}
                            </h2>
                            <TeaserCard
                                title={isEn ? 'More Detailed Insight' : '더 자세한 분석'}
                                hook={isEn ? "⚡ Confirm your hidden 'Noble Person' and 'Danger Zones'." : "⚡ 당신을 도울 '천을귀인'과 피해야 할 '공망'을 확인하세요."}
                                type="money"
                                onUnlock={handleUnlock}
                                language={language}
                            />
                        </div>
                    )}
                </motion.section>

                {/* 5. Action Plan - PAYWALL */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.action_plan ? (
                        <>
                            <ActionPlanSection
                                actionPlan={report.action_plan}
                                trustScore={report.summary.trust_score}
                                language={language}
                            />
                            {/* 📅 Date Selection (NEW - P1-3) */}
                            {report.date_selection && (
                                <DateSelectionSection data={report.date_selection} language={language} />
                            )}
                        </>
                    ) : isPremium ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-acc-gold/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Preparing Next Actions..." : "다음 행동을 정리하는 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'action_plan' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : null
                    ) : (
                        <div className="px-4 md:px-6">
                            <BlindSpotTeaser
                                title={isEn ? "🎯 YOUR NEXT ACTION" : "🎯 지금 필요한 다음 행동"}
                                previewText={isEn ? "To avoid the approaching crisis, you must act on..." : "다가오는 위기를 피하기 위해, 반드시 실행해야 할 행동은..."}
                                hiddenText={isEn
                                    ? "On the 15th, avoid signing any contracts. Instead, focus on reconnecting with a past ally who holds the key to your next breakthrough."
                                    : "15일에는 어떤 계약도 피하십시오. 대신, 당신의 다음 돌파구를 쥐고 있는 과거의 귀인과 다시 연결되는 데 집중해야 합니다."
                                }
                                language={language}
                                isLocked={true}
                                onUnlock={handleUnlock}
                            />
                        </div>
                    )}
                </motion.section>

                {/* 5.5 Final Verdict - The Grand Conclusion */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.final_verdict ? (
                        <div className="px-4 md:px-0">
                            <FinalVerdictCard data={report.final_verdict} />
                        </div>
                    ) : isPremium ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gold/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Wrapping the final verdict..." : "최종 결론을 정리하는 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'final_verdict' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : null
                    ) : null}
                </motion.section>

                {/* 6. Glossary - PAYWALL (Bonus) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.glossary ? (
                        <GlossarySection data={report.glossary} language={language} />
                    ) : isPremium && report.final_verdict ? (
                        isLoading ? (
                            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 mx-4 md:px-6">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400/50" />
                                <p className="text-white/40 text-sm font-cinzel tracking-widest uppercase">
                                    {isEn ? "Compiling your glossary..." : "용어집을 정리하는 중..."}
                                </p>
                            </div>
                        ) : firstMissingPremiumSection === 'final_verdict' ? (
                            <PremiumSectionInterruptionCard language={language} onRetry={onRetry} />
                        ) : null
                    ) : null}
                </motion.section>

            </div>

            {/* Ghost Detector (Viral Hook) — Personal Report */}
            {(() => {
                return (metadata as any)?.sajuResult && (
                    <GhostDetectorSection
                        sajuResult={(metadata as any).sajuResult}
                        userName={(metadata as any)?.readingData?.name || 'You'}
                    />
                );
            })()}

            {/* Share Panel */}
            <section className="mt-16 px-4 md:px-6 text-center">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />


                {/* Visual Share Card */}
                <div className="mb-12">
                    <h2 className="text-xl font-cinzel text-white mb-6">
                        {language === 'en' ? 'Save Your Result Card' : '결과 카드 저장하기'}
                    </h2>
                    <p className="text-white/60 text-sm mb-8 font-light">
                        {language === 'en'
                            ? "Save this card for later, or share it if you want to keep the result close."
                            : "결과 카드를 저장해두거나, 필요하면 공유해서 다시 보기 쉽게 남겨두세요."}
                    </p>


                    <ShareCard
                        shareUrl={shareUrl || (typeof window !== 'undefined' ? window.location.href : '')}
                        trustScore={report.summary?.trust_score}
                        mainCardName={metadata?.tarot?.[0]?.name}
                    />

                    {/* Guest: Save to Account */}
                    {status === 'unauthenticated' && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={openLoginModal}
                            className="mt-6 px-6 py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] font-cinzel text-sm transition-all flex items-center gap-2 mx-auto"
                        >
                            <Download className="w-4 h-4" />
                            <span>{language === 'en' ? 'Save Result needed' : '결과 영구 저장하기'}</span>
                        </motion.button>
                    )}
                </div>

                {/* Optional print action */}
                <button
                    onClick={() => handlePrint()}
                    className="text-xs text-white/30 hover:text-white/60 underline decoration-white/20 underline-offset-4 transition-colors"
                >
                    {language === 'en' ? 'Print Full Report' : '전체 리포트 인쇄하기'}
                </button>
            </section>

            {/* Tarot Detail Modal */}
            {selectedCardIdx !== null && (() => {
                const detail = report.tarot_details?.[selectedCardIdx];
                const hasDetail = !!detail;

                return (
                    <TarotDetailModal
                        isOpen={selectedCardIdx !== null}
                        onClose={() => setSelectedCardIdx(null)}
                        cardName={hasDetail ? detail.card_name : (tarotCards[selectedCardIdx]?.name || (isEn ? "Assigned Card" : "배정된 카드"))}
                        role={hasDetail ? detail.position : (isEn ? ["Current Situation", "Challenge/Obstacle", "Solution/Outcome"][selectedCardIdx] : ["현재 상황", "장애물/과제", "해결책/결과"][selectedCardIdx])}
                        isReversed={hasDetail ? detail.is_reversed : tarotCards[selectedCardIdx]?.isReversed}
                        convergenceData={hasDetail ? {
                            sajuConnection: detail.saju_connection || (isEn ? "Deep connection with your Saju chart." : "사주와 깊은 연결이 있습니다."),
                            astroConnection: detail.interpretation,
                            insight: detail.advice || (isEn ? "Trust your intuition." : "직관을 믿으세요."),
                        } : (isEn ? {
                            sajuConnection: "The current flow of your Saju luck strongly resonates with the transformative energy symbolized by this card.",
                            astroConnection: "The driving force shown by the planetary alignment further strengthens the determination contained in the card.",
                            insight: "This card represents the direction your intuition is currently pointing. Both Saju and Astrology strongly suggest that now is the time to act."
                        } : {
                            sajuConnection: "현재 사주의 운 흐름과 이 카드가 상징하는 변화의 에너지가 강하게 공명하고 있습니다.",
                            astroConnection: "행성의 정렬 상태가 보여주는 추진력이 카드에 담긴 결단력을 더욱 강화합니다.",
                            insight: "이 카드는 현재 당신의 직관이 가리키는 방향을 나타냅니다. 사주와 점성술 모두 지금은 행동해야 할 때임을 강력하게 시사하고 있습니다."
                        })}
                        language={language}
                    />
                );
            })()}

            {/* Stripe Payment Modal */}
            <PaymentModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                currentReport={report}
                metadata={metadata}
                readingData={(metadata as MetadataWithReadingData)?.readingData}
                price={dynamicPrice || undefined}
                trackingSource="shared_report_unlock"
            />

            {/* Sticky CTA for Partial Result (Show if we can unlock) */}
            {!report.fortune_flow && !isPremium && (
                <StickyCTA
                    price={displayPrice}
                    originalPrice={originalPrice}
                    onUnlock={handleUnlock}
                    language={language}
                    isSuppressed={isCheckoutOpen}
                />
            )}

        </div>
    );
}

// Compatibility renderer for older saved report payloads
// 📅 Date Selection Section (NEW - P1-3)
