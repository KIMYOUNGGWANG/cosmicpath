'use client';

import { useSession } from 'next-auth/react';
import { useLoginModal } from '@/components/auth/LoginModal';
import { motion } from 'framer-motion';
import { CompatibilityHeader } from './CompatibilityHeader';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';
import * as analytics from '@/lib/client-analytics';
import { PrintLayout } from './PrintLayout';
import { TarotDetailModal } from './tarot-detail-modal';
import { ShareCard } from './share-card';
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
import { HeaderSection } from './premium-report-sections';
import type { ThreeLayerConvergenceDiagnosis } from '@/lib/ai/three-layer-synthesis';

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

    const handleUnlock = (source?: string) => {
        const contextValue = typeof source === 'string' ? source : 'generic_locked_item';
        analytics.trackEvent('paywall_item_clicked', { context: contextValue });
        analytics.trackEvent('checkout_start', { step: 'click_cta' });
        
        if (onUnlock) {
            onUnlock();
        } else {
            setIsCheckoutOpen(true);
        }
    };

    // Phase B: Paywall View Tracking
    useEffect(() => {
        if (!isPremium) {
            analytics.trackEvent('paywall_view', { step: 'rendered' });
        }
    }, [isPremium]);

    // Dynamic Teaser Hooks
    const readingData = metadata?.readingData;
    const userName = readingData?.name || '';
    const sajuResult = isSajuResult(metadata?.sajuResult) ? metadata.sajuResult : null;

    const tarotCards = metadata?.tarot || [];
    // Auth & Save Logic
    const { status } = useSession();
    const { openLoginModal } = useLoginModal();

    return (
        <div className={`w-full mx-auto pb-24 md:pb-32 ${isPremium ? 'max-w-screen-2xl px-4 lg:px-8' : 'max-w-2xl'}`}>
            {!(isPremium && report.final_verdict) && (
                readingData?.partnerName ? (
                    <CompatibilityHeader
                        userName={readingData?.name || 'User'}
                        partnerName={readingData.partnerName}
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
                )
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

            <CaseFileReport
                report={report}
                language={language}
                isFreeView={!isPremium}
                isLoading={isLoading}
                onRetry={onRetry}
                tarotCards={tarotCards}
                onOpenTarotCard={setSelectedCardIdx}
                onUnlock={handleUnlock}
                displayPrice={displayPrice}
                personName={userName}
                question={userQuestion}
            />

            {!isPremium && (
                <div className="mt-0 px-4 md:px-6 mb-16">
                    <BlindSpotTeaser
                        title={language === 'en' ? "Important Blind Spot Note" : "중요한 사각지대 메모"}
                        previewText={language === 'en' ? "Conflicting planetary alignments suggest a meaningful risk of misreading the situation unless you review the underlying pattern." : "별자리와 타로카드 배열에서 다시 확인할 만한 오판 리스크가 보입니다."}
                        hiddenText={language === 'en' ? "Unlock to see the full detailed reading and the decision context not shown in the preview." : "자세한 전체 결론과 점검 포인트를 보려면 잠금을 해제하세요."}
                        language={language || 'ko'}
                        isLocked={true}
                        onUnlock={handleUnlock}
                    />
                </div>
            )}

            {/* Ghost Detector (Viral Hook) — Personal Report */}
            {(() => {
                return sajuResult && (
                    <GhostDetectorSection
                        sajuResult={sajuResult}
                        userName={readingData?.name || 'You'}
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
