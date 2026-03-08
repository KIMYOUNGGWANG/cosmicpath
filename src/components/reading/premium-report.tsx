'use client';

import { useSession } from 'next-auth/react';
import { useLoginModal } from '@/components/auth/LoginModal';
import { motion, Variants } from 'framer-motion';
import { CompatibilityHeader } from './CompatibilityHeader';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ChevronDown, Sparkles, Star, Shield, TrendingUp, Calendar, Target, Zap, Lock, CircleHelp, Download, Printer, RefreshCw, Briefcase, Coins, Heart, Activity, Droplets, Flame, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrintLayout } from './PrintLayout';
import { CosmicRadar } from './cosmic-radar';
import { DraftProposal } from './draft-proposal';
import { EvidenceTooltip } from '../ui/confidence-badge';
import { TarotDetailModal } from './tarot-detail-modal';
import { ShareCard } from './share-card';
import { BlindSpotTeaser } from './blind-spot-teaser';
import { TeaserCard } from '../sales/TeaserCard';
import { BlurredPreviewSection } from '../sales/BlurredPreviewSection';
import { StickyCTA } from '../common/sticky-cta';

import { FortuneTimelineChart, TimelineScore } from './FortuneTimelineChart';
import { SoulmateSection, SoulmateData } from './SoulmateSection';
import { LuckyAssetsGrid, LuckyAssetsData } from './LuckyAssetsGrid';
import { GlossarySection } from './GlossarySection';
import { PaymentModal } from '../payment/PaymentModal';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import { ElementHarmony } from './ElementHarmony';
import { ActionChecklist } from './ActionChecklist';
import { FinalVerdictCard } from './FinalVerdictCard';
import { InsightCard, InsightHighlight } from './ui/InsightCard';
import { DestinyDashboardSection } from '../dashboard/DestinyDashboardSection';
import { GhostDetectorSection } from '../dashboard/GhostDetectorSection';
// import TossPaymentWidget from '../payment/TossPaymentWidget'; // Toss Payments (Commented out)

// 새로운 Premium Report 타입 (기존 CosmicReport 대체)
export interface PremiumReportData {
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
        radarScores?: {
            saju: number;
            astrology: number;
            tarot: number;
        };
    };
    language?: 'ko' | 'en';
    shareUrl?: string;
    onUnlock?: () => void;
    isPremium?: boolean;
    price?: string;
    isLoading?: boolean;
    onRetry?: () => void;
}

interface MetadataWithReadingData extends NonNullable<PremiumReportProps['metadata']> {
    readingData?: any;
    tarotCards?: any[];
}

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

export function PremiumReport({ report, metadata, language = 'ko', shareUrl, onUnlock, isPremium, price, isLoading, onRetry }: PremiumReportProps) {
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
    const [fetchedPrice, setFetchedPrice] = useState<string>('');
    const dynamicPrice = price || fetchedPrice || '...';
    const originalPrice = '$19.90';

    // Fetch price from Stripe when component mounts (if not provided via prop)
    useEffect(() => {
        if (!price) {
            fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.formattedPrice) {
                        setFetchedPrice(data.formattedPrice);
                    }
                })
                .catch(err => console.error('Failed to fetch price:', err));
        }
    }, [price]);

    const handleUnlock = () => {
        if (onUnlock) {
            onUnlock();
        } else {
            setIsCheckoutOpen(true);
        }
    };

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

    // Auth & Save Logic
    const { data: session, status } = useSession();
    const { openLoginModal } = useLoginModal();

    return (
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-32">
            {/* Header */}
            {(metadata as any)?.readingData?.partnerName ? (
                <CompatibilityHeader
                    userName={(metadata as any)?.readingData?.name || 'User'}
                    partnerName={(metadata as any)?.readingData?.partnerName}
                    score={report.summary.trust_score * 20} // Convert 1-5 to percentage
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
                            title={isEn ? "Core Energy Analysis" : "핵심 에너지 분석"}
                            subtitle={isEn ? "⚠️ Critical Element Imbalance Detected" : "⚠️ 사주 오행의 심각한 불균형 감지"}
                            onUnlock={handleUnlock}
                            language={language}
                        >
                            <CoreAnalysisSection data={report.core_analysis} sajuData={(metadata as any)?.sajuResult} language={language} />
                        </BlurredPreviewSection>
                    ) : (
                        // 데이터가 없으면 기존 TeaserCard fallback
                        <TeaserCard
                            title={isEn ? "Core Energy Analysis" : "핵심 에너지 분석"}
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
                        ) : (
                            <div className="p-12 text-center bg-red-500/5 rounded-3xl border border-red-500/20 mx-4 md:px-6">
                                <p className="text-red-400 mb-4">{isEn ? 'Analysis Interrupted' : '분석이 일시 중단되었습니다'}</p>
                                <button
                                    onClick={onRetry}
                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-full text-sm transition-colors border border-red-500/30"
                                >
                                    {isEn ? 'Resume Analysis' : '분석 이어하기'}
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <BlindSpotTeaser
                                title={isEn ? "⚠️ UPCOMING FATE ALERT" : "⚠️ 다가오는 운명의 경고"}
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
                        ) : (
                            <div className="p-12 text-center bg-red-500/5 rounded-3xl border border-red-500/20 mx-4 md:px-6">
                                <button
                                    onClick={onRetry}
                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-full text-sm transition-colors border border-red-500/30"
                                >
                                    {isEn ? 'Resume Analysis' : '분석 이어하기'}
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Target size={18} className="text-gold" />
                                {isEn ? 'Life Areas & Soulmate' : '인생 영역 & 소울메이트'}
                            </h2>
                            <BlindSpotTeaser
                                title={isEn ? "🔒 DETAILED LIFE ANALYSIS" : "🔒 영역별 정밀 분석"}
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
                            {/* Legacy Support - Deep Dive */}
                            {report.deep_dive && !report.saju_sections && (
                                <LegacyDeepDiveSection data={report.deep_dive} language={language} />
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
                        ) : (
                            <div className="p-12 text-center bg-red-500/5 rounded-3xl border border-red-500/20 mx-4 md:px-6">
                                <button
                                    onClick={onRetry}
                                    className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-full text-sm transition-colors border border-red-500/30"
                                >
                                    {isEn ? 'Resume Analysis' : '분석 이어하기'}
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="px-4 md:px-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-gold" />
                                {isEn ? 'Special Analysis' : '특수/심화 분석'}
                            </h2>
                            <TeaserCard
                                title={isEn ? 'Special Analysis' : '특수 분석'}
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
                    ) : (
                        <div className="px-4 md:px-6">
                            <BlindSpotTeaser
                                title={isEn ? "🎯 CRITICAL ACTION REQUIRED" : "🎯 긴급 행동 지침"}
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
                    {report.final_verdict && (
                        <div className="px-4 md:px-0">
                            <FinalVerdictCard data={report.final_verdict} />
                        </div>
                    )}
                </motion.section>

                {/* 6. Glossary - PAYWALL (Bonus) */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                >
                    {report.glossary && <GlossarySection data={report.glossary} language={language} />}
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
                        {language === 'en' ? 'Claim Your Destiny' : '운명 봉인 해제'}
                    </h2>
                    <p className="text-white/60 text-sm mb-8 font-light">
                        {language === 'en'
                            ? "Save this card as a talisman, or share it to complete the ritual."
                            : "이 카드를 부적처럼 저장하거나, 공유하여 리추얼을 완성하세요."}
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

                {/* Legacy Print Button (Optional) */}
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
                trackingSource="shared_report_unlock"
            />

            {/* Sticky CTA for Partial Result (Show if we can unlock) */}
            {!report.fortune_flow && !isPremium && (
                <StickyCTA
                    price={dynamicPrice}
                    originalPrice={originalPrice}
                    onUnlock={handleUnlock}
                    language={language}
                />
            )}

            {/* Toss Payment Modal (Commented out)
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCheckoutOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-xl bg-deep-navy border border-white/10 rounded-3xl overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(161,132,255,0.2)]"
                    >
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => setIsCheckoutOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Lock size={20} className="text-white/40" />
                            </button>
                        </div>
                        <TossPaymentWidget
                            onFail={(err) => {
                                console.error('Payment Modal Error:', err);
                                setIsCheckoutOpen(false);
                            }}
                        />
                    </motion.div>
                </div>
            )}
            */}
        </div>
    );
}

// ... (Sub Components)

function TarotSpreadSection({ cards, onCardClick, language }: { cards: { name: string; isReversed: boolean; image?: string }[], onCardClick: (idx: number) => void, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const roles = isEn ? ["Current Situation", "Challenge/Obstacle", "Solution/Outcome"] : ["현재 상황", "장애물/과제", "해결책/결과"];

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 px-4 md:px-6"
        >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <EvidenceTooltip tag="🔮" sources={['tarot']} explanation={isEn ? "Reads the current intuition and psychological state through Tarot cards." : "타로 카드를 통해 현재의 직관과 심리 상태를 읽어냅니다."} />
                {isEn ? 'Tarot Reading' : '타로 리딩'}
            </h2>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div
                            onClick={() => onCardClick(idx)}
                            className="w-full aspect-[2/3] rounded-lg border border-white/10 relative overflow-hidden group cursor-pointer hover:border-tarot-purple/50 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                        >
                            {card.image ? (
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className={cn("w-full h-full object-cover", card.isReversed && "rotate-180")}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <div className={cn("w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20", card.isReversed && "rotate-180")} />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center group-hover:bg-black/20 transition-all">
                                <span
                                    className={cn(
                                        "text-[10px] md:text-sm font-bold text-white/90 notranslate",
                                        card.isReversed && "text-red-300"
                                    )}
                                    translate="no"
                                >
                                    {card.name}
                                    {card.isReversed && (isEn ? " (Rev)" : " (역)")}
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] md:text-xs text-gold mt-2 font-medium">{roles[idx] || (isEn ? `Card ${idx + 1}` : `카드 ${idx + 1}`)}</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-4 text-center">{isEn ? 'Click each card to see detailed integrated interpretation.' : '각 카드를 클릭하면 상세한 융합 해석을 볼 수 있습니다.'}</p>
        </motion.section>
    );
}



function HeaderSection({ summary, language }: { summary: PremiumReportData['summary'], language: 'ko' | 'en' }) {
    const isEn = language === 'en';
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
                    {isEn ? 'Confidence' : '신뢰도'} {trustScore}/5
                </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                {summary.title}
            </h1>

            <div className="bg-deep-navy/50 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md">
                <div className="flex gap-2 mb-2">
                    <EvidenceTooltip tag="📜" sources={['saju']} explanation={isEn ? "Analyzes the energy of the birth time." : "태어난 시각의 기운을 분석합니다."} />
                    <EvidenceTooltip tag="🌌" sources={['astrology']} explanation={isEn ? "Analyzes the movements of the planets." : "행성의 움직임을 분석합니다."} />
                    <EvidenceTooltip tag="🔮" sources={['tarot']} explanation={isEn ? "Reads the current intuitive energy." : "현재의 직관적 에너지를 읽습니다."} />
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

function TraitsSection({ traits, language }: { traits: PremiumReportData['traits'], language: 'ko' | 'en' }) {
    const isEn = language === 'en';
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
            case 'saju': return isEn ? 'Saju Luck' : '사주명리';
            case 'astro':
            case 'astrology': return isEn ? 'Astrology' : '점성술';
            case 'tarot': return isEn ? 'Tarot' : '타로';
            default: return isEn ? 'Analysis' : '분석';
        }
    };

    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
        const totalScroll = scrollWidth - clientWidth;
        setScrollProgress(scrollLeft / totalScroll);
    };

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8 pl-4 md:pl-6"
        >
            {/* Scrollable Container */}
            <div
                className="flex gap-4 overflow-x-auto pb-8 pr-4 md:pr-6 snap-x scrollbar-hide"
                onScroll={handleScroll}
            >
                {traits.map((trait, idx) => (
                    <div
                        key={idx}
                        className="snap-center shrink-0 w-[78vw] md:w-[320px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 md:p-6 flex flex-col gap-3 hover:border-gold/30 transition-colors group shadow-lg relative"
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
                            )}>Grade {trait.grade}</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-2">{trait.name}</h3>
                            <div className="h-px w-full bg-white/10 my-2" />
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-keep">
                                {trait.description}
                            </p>
                        </div>

                        {/* Mobile Swipe Hint (First Card Only) */}
                        {idx === 0 && (
                            <div className="md:hidden absolute bottom-3 right-3 text-[10px] text-gray-500 animate-pulse flex items-center gap-1">
                                <span>Swipe</span>
                                <span>→</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Scroll Indicator (Mobile Only) */}
            <div className="flex justify-center md:hidden gap-1.5 mt-[-1rem] mb-6">
                {traits.map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            // Simple heuristic for active dot based on scroll progress
                            Math.round(scrollProgress * (traits.length - 1)) === i
                                ? "w-6 bg-gold"
                                : "w-1 bg-white/20"
                        )}
                    />
                ))}
            </div>
        </motion.section>
    );
}

function CoreAnalysisSection({ data, sajuData, language }: { data: NonNullable<PremiumReportData['core_analysis']>, sajuData?: any, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-xl font-cinzel text-white mb-6 flex items-center gap-3">
                <Sparkles size={24} className="text-acc-gold" />
                {isEn ? 'Elemental Blueprint' : '내 사주 핵심 정리'}
            </h2>

            {/* Five Elements Harmony Chart */}
            <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                        {isEn ? 'Five Elements Harmony' : '오행 균형도'}
                    </h3>
                    <p className="text-sm text-white/50">
                        {isEn ? 'Your energy distribution based on birth chart' : '내 사주 원국의 오행 분포율'}
                    </p>
                </div>
                <ElementHarmony sajuData={sajuData} scores={data.element_scores} language={language} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lacking Elements */}
                <InsightCard
                    title={isEn ? 'Lacking Elements' : '부족한 오행'}
                    tag={isEn ? 'Custom Remedy' : '맞춤 개운법'}
                    icon={Droplets}
                    className="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🌊</span>
                        <span className="text-lg font-bold text-blue-200">{data.lacking_elements.elements}</span>
                    </div>

                    <p className="text-blue-100/80 leading-relaxed mb-6">
                        {data.lacking_elements.description}
                    </p>

                    <InsightHighlight type="tip">
                        <span className="font-bold mr-2">{isEn ? 'Remedy:' : '개운법:'}</span>
                        {data.lacking_elements.remedy}
                    </InsightHighlight>
                </InsightCard>

                {/* Abundant Elements */}
                <InsightCard
                    title={isEn ? 'Dominant Elements' : '발달한 오행'}
                    tag={isEn ? 'Hidden Talent' : '재능 활용'}
                    icon={Flame}
                    className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🔥</span>
                        <span className="text-lg font-bold text-amber-200">{data.abundant_elements.elements}</span>
                    </div>

                    <p className="text-amber-100/80 leading-relaxed mb-6">
                        {data.abundant_elements.description}
                    </p>

                    <InsightHighlight type="default">
                        <span className="font-bold mr-2">{isEn ? 'Strategy:' : '활용법:'}</span>
                        {data.abundant_elements.usage}
                    </InsightHighlight>
                </InsightCard>
            </div>
        </section>
    );
}

function AccordionSection({ title, items, source, language }: { title: string; items: { id: string; title: string; content: string }[]; source?: string; language: 'ko' | 'en' }) {
    const isEn = language === 'en';

    return (
        <section className="mt-8 px-4 md:px-6">
            <h2 className="text-xl font-cinzel text-white mb-6 flex items-center gap-3">
                {source && <EvidenceTooltip tag={source === 'saju' ? '📜' : source === 'tarot' ? '🔮' : '🌌'} sources={[source]} explanation={isEn ? "Analysis based on this scholarly system." : "이 섹션의 분석은 해당 학문 체계를 근거로 합니다."} />}
                {title}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map((item, idx) => (
                    <InsightCard
                        key={item.id}
                        title={item.title}
                        delay={idx * 0.1}
                        className="bg-white/5 border-white/10 hover:border-acc-gold/30 transition-colors"
                    >
                        <p className="whitespace-pre-line leading-relaxed text-secondary-100">
                            {item.content}
                        </p>
                    </InsightCard>
                ))}
            </div>
        </section>
    );
}

function FortuneFlowSection({ data, language }: { data: NonNullable<PremiumReportData['fortune_flow']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const [openItems, setOpenItems] = useState<Set<string>>(new Set(['major_luck']));
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

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

    // 현재 월 (0-indexed)
    const currentMonth = new Date().getMonth();

    // monthly_luck 또는 monthly_highlights 사용 (후방 호환성)
    const monthlyData = data.monthly_luck || data.monthly_highlights?.map(m => ({
        ...m,
        element: undefined,
        opportunity: undefined,
        warning: undefined,
        score: 50
    }));

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-gold" />
                {isEn ? 'Fortune Flow' : '운의 흐름'}
            </h2>

            {/* Timeline Chart */}
            {data.timeline_scores && data.timeline_scores.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <span className="text-gold">📈</span>
                        {isEn ? '10-Year Major Luck Timeline' : '10년 대운 타임라인'}
                    </h3>
                    <FortuneTimelineChart
                        scores={data.timeline_scores}
                        language={language}
                    />
                </motion.div>
            )}

            {/* 🗓️ 12개월 월운 그리드 (NEW) */}
            {monthlyData && monthlyData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <span className="text-gold">🗓️</span>
                        {isEn ? '12-Month Fortune Map' : '12개월 월운 지도'}
                        <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                            NEW
                        </span>
                    </h3>

                    {/* 월별 그리드 */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                        {monthlyData.map((month, idx) => {
                            const score = month.score || 50;
                            const isCurrentMonth = idx === currentMonth;
                            const isSelected = selectedMonth === idx;

                            // 점수에 따른 색상
                            const getScoreColor = (s: number) => {
                                if (s >= 70) return 'from-emerald-500/30 to-emerald-600/20 border-emerald-500/40';
                                if (s >= 50) return 'from-amber-500/30 to-amber-600/20 border-amber-500/40';
                                return 'from-red-500/30 to-red-600/20 border-red-500/40';
                            };

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedMonth(isSelected ? null : idx)}
                                    className={cn(
                                        "relative p-3 rounded-xl border transition-all duration-300 text-center",
                                        isSelected
                                            ? "bg-gradient-to-br " + getScoreColor(score) + " scale-105 shadow-lg"
                                            : isCurrentMonth
                                                ? "bg-gradient-to-br from-gold/20 to-gold/10 border-gold/50"
                                                : "bg-white/5 border-white/10 hover:border-white/30"
                                    )}
                                >
                                    {isCurrentMonth && (
                                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-gold rounded-full animate-pulse" />
                                    )}
                                    <p className="text-xs text-gray-400">{month.month}</p>
                                    <p className="text-sm font-bold text-white mt-1">{month.theme}</p>
                                    {month.score != null && (
                                        <div className="mt-2 text-xs">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded-full",
                                                score >= 70 ? "bg-emerald-500/20 text-emerald-300" :
                                                    score >= 50 ? "bg-amber-500/20 text-amber-300" :
                                                        "bg-red-500/20 text-red-300"
                                            )}>
                                                {score}점
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 선택된 월 상세 */}
                    {selectedMonth !== null && monthlyData[selectedMonth] && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{monthlyData[selectedMonth].element || '🌟'}</span>
                                <h4 className="font-bold text-white">
                                    {monthlyData[selectedMonth].month} - {monthlyData[selectedMonth].theme}
                                </h4>
                            </div>

                            <div className="space-y-3 text-sm">
                                {monthlyData[selectedMonth].opportunity && (
                                    <div className="flex gap-2">
                                        <span className="text-emerald-400">✅</span>
                                        <div>
                                            <p className="text-emerald-300 font-medium">{isEn ? 'Opportunity' : '기회'}</p>
                                            <p className="text-gray-300">{monthlyData[selectedMonth].opportunity}</p>
                                        </div>
                                    </div>
                                )}
                                {monthlyData[selectedMonth].warning && (
                                    <div className="flex gap-2">
                                        <span className="text-red-400">⚠️</span>
                                        <div>
                                            <p className="text-red-300 font-medium">{isEn ? 'Warning' : '주의'}</p>
                                            <p className="text-gray-300">{monthlyData[selectedMonth].warning}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <span className="text-blue-400">💡</span>
                                    <div>
                                        <p className="text-blue-300 font-medium">{isEn ? 'Advice' : '조언'}</p>
                                        <p className="text-gray-300">{monthlyData[selectedMonth].advice}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

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


function LifeAreasSection({ data, language }: { data: NonNullable<PremiumReportData['life_areas']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';

    const areas = [
        data.career && { id: 'career', icon: Briefcase, ...data.career },
        data.wealth && { id: 'wealth', icon: Coins, ...data.wealth },
        data.love && { id: 'love', icon: Heart, ...data.love },
        data.health && { id: 'health', icon: Activity, ...data.health },
    ].filter(Boolean) as { id: string; icon: any; title: string; tag?: string; content: string; subsections?: string[] }[];

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-xl font-cinzel text-white mb-6 flex items-center gap-3">
                <Target size={24} className="text-acc-gold" />
                {isEn ? 'Detailed Life Analysis' : '영역별 상세 분석'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {areas.map((area, idx) => (
                    <InsightCard
                        key={area.id}
                        title={area.title}
                        icon={area.icon}
                        tag={area.tag}
                        delay={idx * 0.1}
                        className="h-full" // Ensure equal height
                    >
                        {/* Subsections as Pill Tags */}
                        {area.subsections && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {area.subsections.map((sub: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-secondary-300">
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Main Content */}
                        <p className="whitespace-pre-line leading-relaxed text-secondary-100">
                            {area.content}
                        </p>
                    </InsightCard>
                ))}
            </div>

            {/* 🤝 Compatibility (NEW - P2-2) */}
            {data.compatibility && <CompatibilitySection data={data.compatibility} language={language} />}
        </section>
    );
}

function SpecialAnalysisSection({ data, language }: { data: NonNullable<PremiumReportData['special_analysis']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
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
                {isEn ? 'Special Analysis' : '특수 분석'}
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

function ActionPlanSection({ actionPlan, trustScore, language }: {
    actionPlan: NonNullable<PremiumReportData['action_plan']>;
    trustScore: number;
    language: 'ko' | 'en';
}) {
    const isEn = language === 'en';
    return (
        <section className="mt-8 md:mt-10 px-4 md:px-6">
            <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-gold" />
                {isEn ? 'Action Plan (Super Days)' : '액션 플랜 (Super Days)'}
            </h2>

            <div className="grid gap-3">
                {actionPlan.map((item, idx) => (
                    <DraftProposal
                        key={idx}
                        title={item.title}
                        date={item.date}
                        time={item.date.includes(' ') ? item.date.split(' ')[1] : "12:00"}
                        description={item.description}
                        confidence={trustScore * 20}
                        language={language}
                        onConfirm={(data) => console.log('Action Confirmed:', data)}
                        onCancel={() => { }}
                    />
                ))}
            </div>

            {/* Interactive Checklist */}
            <ActionChecklist items={actionPlan} language={language} />
        </section>
    );
}

// Legacy support for old schema
function LegacyDeepDiveSection({ data, language }: { data: NonNullable<PremiumReportData['deep_dive']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
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
                        {tab === 'saju' && (isEn ? "📜 Saju" : "📜 사주명리")}
                        {tab === 'astro' && (isEn ? "🌌 Astrology" : "🌌 점성술")}
                        {tab === 'tarot' && (isEn ? "🔮 Tarot" : "🔮 타로")}
                    </button>
                ))}
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'saju' && data.saju && (
                    <div className="space-y-4">
                        <ContentCard title={isEn ? "Elemental Analysis" : "오행 분석"} content={data.saju.balance} />
                        <ContentCard title={isEn ? "Major Luck Analysis" : "대운 분석"} content={data.saju.flow_10yr} />
                        <ContentCard title={isEn ? "Yearly Luck Analysis" : "세운 분석"} content={data.saju.flow_yearly} />
                    </div>
                )}
                {activeTab === 'astro' && data.astro && (
                    <div className="space-y-4">
                        <ContentCard title={isEn ? "Natal Chart" : "출생 차트"} content={data.astro.natal} />
                        <ContentCard title={isEn ? "Transit" : "트랜짓"} content={data.astro.transit} />
                    </div>
                )}
                {activeTab === 'tarot' && data.tarot && (
                    <div className="space-y-4">
                        <ContentCard title={isEn ? "Spread" : "스프레드"} content={data.tarot.spread_analysis} />
                        <ContentCard title={isEn ? "Card Detail" : "카드 상세"} content={data.tarot.card_details} />
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



// 🌌 Astro Deep Dive Section (NEW)
function AstroDeepSection({ data, language }: { data: NonNullable<PremiumReportData['astro_deep']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const [openItems, setOpenItems] = useState<string[]>(['sun_moon_dynamic']);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const sections = [
        { id: 'sun_moon_dynamic', data: data.sun_moon_dynamic, icon: '☀️🌙' },
        { id: 'ascendant_influence', data: data.ascendant_influence, icon: '⬆️' },
        { id: 'dominant_element', data: data.dominant_element, icon: '🔥' },
        { id: 'planetary_warning', data: data.planetary_warning, icon: '⚠️' },
    ].filter(s => s.data);

    if (sections.length === 0) return null;

    return (
        <section className="mt-8 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌌</span>
                {isEn ? 'Astro Deep Dive' : '점성술 심층 분석'}
                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                    NEW
                </span>
            </h2>

            <div className="space-y-3">
                {sections.map(({ id, data: sectionData, icon }) => {
                    if (!sectionData) return null;
                    const isOpen = openItems.includes(id);

                    return (
                        <div
                            key={id}
                            className={cn(
                                "rounded-2xl border transition-all duration-300 overflow-hidden",
                                isOpen
                                    ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-purple-500/30"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                            )}
                        >
                            <button
                                onClick={() => toggleItem(id)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{icon}</span>
                                    <span className="text-white font-medium text-sm md:text-base">
                                        {sectionData.title}
                                    </span>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={cn(
                                        "text-gray-400 transition-transform duration-300",
                                        isOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-4 pb-4"
                                >
                                    <div className="pl-9">
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                            {sectionData.content}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Astrology Source Badge */}
            <div className="mt-4 flex justify-end">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span>✨</span>
                    {isEn ? 'Based on birth chart analysis' : '출생 차트 기반 분석'}
                </span>
            </div>
        </section>
    );
}

// 📅 Date Selection Section (NEW - P1-3)
function DateSelectionSection({ data, language }: { data: NonNullable<PremiumReportData['date_selection']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const [activeTab, setActiveTab] = useState<'auspicious' | 'inauspicious'>('auspicious');

    const auspiciousDates = data.auspicious || [];
    const inauspiciousDates = data.inauspicious || [];

    if (auspiciousDates.length === 0 && inauspiciousDates.length === 0) return null;

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekday = isEn
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                : ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            return isEn ? `${month}/${day} (${weekday})` : `${month}월 ${day}일 (${weekday})`;
        } catch {
            return dateStr;
        }
    };

    return (
        <section className="mt-8 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                {isEn ? 'Date Selection Guide' : '택일 가이드'}
                <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                    NEW
                </span>
            </h2>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('auspicious')}
                    className={cn(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'auspicious'
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    )}
                >
                    ✅ {isEn ? 'Lucky Days' : '길일'} ({auspiciousDates.length})
                </button>
                <button
                    onClick={() => setActiveTab('inauspicious')}
                    className={cn(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'inauspicious'
                            ? "bg-red-500/20 text-red-300 border border-red-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    )}
                >
                    ⚠️ {isEn ? 'Avoid' : '흉일'} ({inauspiciousDates.length})
                </button>
            </div>

            {/* Date Cards */}
            <div className="space-y-3">
                {(activeTab === 'auspicious' ? auspiciousDates : inauspiciousDates).map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                            "p-4 rounded-xl border",
                            activeTab === 'auspicious'
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-red-500/10 border-red-500/30"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "text-lg font-bold",
                                        activeTab === 'auspicious' ? "text-emerald-300" : "text-red-300"
                                    )}>
                                        {formatDate(item.date)}
                                    </span>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        activeTab === 'auspicious'
                                            ? "bg-emerald-500/20 text-emerald-200"
                                            : "bg-red-500/20 text-red-200"
                                    )}>
                                        {item.purpose}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300">{item.reason}</p>
                            </div>
                            <span className="text-2xl">
                                {activeTab === 'auspicious' ? '🍀' : '🚫'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Source Badge */}
            <div className="mt-4 flex justify-end">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span>📜</span>
                    {isEn ? 'Based on Saju date analysis' : '사주 기반 택일 분석'}
                </span>
            </div>
        </section>
    );
}

// 🔢 Numerology Section (NEW - P2-3)
function NumerologySection({ data, language }: { data: NonNullable<PremiumReportData['numerology']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const { life_path, lucky_numbers, lucky_day_advice } = data;

    return (
        <section className="mt-6 px-4 md:px-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">🔢</span>
                {isEn ? 'Numerology Insight' : '수비학(Numerology) 분석'}
                <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    NEW
                </span>
            </h2>

            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20 p-5 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Life Path Number Badge */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] relative">
                            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-300">
                                {life_path.number}
                            </span>
                            <div className="absolute -bottom-3 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white shadow-lg uppercase tracking-wider">
                                Life Path
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{life_path.title}</h3>
                            <p className="text-sm text-indigo-100 leading-relaxed">
                                {life_path.meaning}
                            </p>
                        </div>

                        {/* Saju Connection */}
                        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                                <span className="text-xs font-bold text-gold">🔗 {isEn ? 'Saju Connection' : '사주 연결 고리'}</span>
                            </div>
                            <p className="text-xs text-gray-300">
                                {life_path.saju_connection}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lucky Numbers */}
                    <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                            <span>🍀</span> {isEn ? 'Lucky Numbers' : '행운의 숫자'}
                        </div>
                        <div className="flex gap-2">
                            {lucky_numbers.map((num, i) => (
                                <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/10">
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lucky Advice */}
                    <div>
                        <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                            <span>💡</span> {isEn ? 'Action Tip' : '활용 팁'}
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            {lucky_day_advice}
                        </p>
                    </div>
                </div>
            </div>

            {/* Source Badge */}
            <div className="mt-4 flex justify-end">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span>📐</span>
                    {isEn ? 'Calculated via Pythagorean Numerology' : '피타고라스 수비학 기반 계산'}
                </span>
            </div>
        </section>
    );
}

// 🌀 Past Life Section (NEW - P2-1)
function PastLifeSection({ data, language }: { data: NonNullable<PremiumReportData['past_life']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const { theme, karma, soul_mission } = data;

    return (
        <div className="mt-8 px-4 md:px-0">
            <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span className="text-lg">🌀</span>
                {isEn ? 'Past Life & Karma' : '전생과 카르마'}
            </h3>

            <div className="space-y-4">
                {/* 1. Theme */}
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                            🕰️
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">{theme.title}</h4>
                            <p className="text-sm text-purple-100 leading-relaxed opacity-90">
                                {theme.content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Karma */}
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                            ⚖️
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">{karma.title}</h4>
                            <p className="text-sm text-purple-100 leading-relaxed opacity-90">
                                {karma.content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Soul Mission */}
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                            ✨
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-200 text-sm mb-1">{soul_mission.title}</h4>
                            <p className="text-sm text-purple-100 leading-relaxed">
                                {soul_mission.content}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 🤝 Compatibility Section (NEW - P2-2)
function CompatibilitySection({ data, language }: { data: NonNullable<NonNullable<PremiumReportData['life_areas']>['compatibility']>, language: 'ko' | 'en' }) {
    const isEn = language === 'en';
    const [activeTab, setActiveTab] = useState<'boss' | 'colleague' | 'friend'>('boss');

    const content = data[activeTab];

    return (
        <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold text-pink-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="text-lg">🤝</span>
                {isEn ? 'Social Compatibility' : '사회적 궁합 분석'}
                <span className="ml-2 text-xs px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">
                    NEW
                </span>
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('boss')}
                    className={cn(
                        "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === 'boss'
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    )}
                >
                    {isEn ? 'Boss/Leader' : '상사/리더'}
                </button>
                <button
                    onClick={() => setActiveTab('colleague')}
                    className={cn(
                        "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === 'colleague'
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    )}
                >
                    {isEn ? 'Colleague' : '동료/파트너'}
                </button>
                <button
                    onClick={() => setActiveTab('friend')}
                    className={cn(
                        "flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === 'friend'
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                    )}
                >
                    {isEn ? 'Friend' : '친구/지인'}
                </button>
            </div>

            {/* Content Card */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-pink-900/10 rounded-xl p-5 border border-pink-500/20"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-pink-200 font-bold text-sm">
                            <span>👍</span> {isEn ? 'Ideal Type' : '잘 맞는 유형'}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                            {content.ideal_type}
                        </p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-red-200 font-bold text-sm">
                            <span>👎</span> {isEn ? 'Avoid Type' : '주의할 유형'}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                            {content.avoid_type}
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-gold font-bold text-sm">
                        <span>💡</span> {isEn ? 'Winning Strategy' : (activeTab === 'friend' ? '우정 관리 팁' : '처세술/전략')}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {'strategy' in content ? content.strategy : content.advice}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
