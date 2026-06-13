'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
    AccordionSection,
    AstroDeepSection,
    FortuneFlowSection,
    LifeAreasSection,
    NumerologySection,
    PastLifeSection,
    SpecialAnalysisSection,
    TarotSpreadSection,
} from '../premium-report-sections';
import { LuckyAssetsGrid } from '../LuckyAssetsGrid';
import { SoulmateSection } from '../SoulmateSection';
import type { TabId, VerdictReportProps } from './types';

type TabContentProps = {
    readonly tabId: TabId;
    readonly report: VerdictReportProps['report'];
    readonly language: NonNullable<VerdictReportProps['language']>;
    readonly tarotCards?: VerdictReportProps['tarotCards'];
    readonly onCardClick?: VerdictReportProps['onCardClick'];
    readonly isExpanded: boolean;
    readonly onToggle: () => void;
};

const noopCardClick = (): void => {};

export function TabContent({
    tabId,
    report,
    language,
    tarotCards,
    onCardClick,
    isExpanded,
    onToggle,
}: TabContentProps) {
    const isEn = language === 'en';
    const detailLabel = isEn ? 'Detailed Report' : '이 결론의 근거 보기';
    const hideLabel = isEn ? 'Collapse' : '접기';

    const renderDetailContent = () => {
        switch (tabId) {
            case 'tarot':
                return (
                    <TarotSpreadSection
                        cards={tarotCards ? [...tarotCards] : []}
                        onCardClick={onCardClick ?? noopCardClick}
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
                        {report.life_areas ? (
                            <LifeAreasSection data={report.life_areas} language={language} />
                        ) : null}
                        {report.soulmate ? (
                            <SoulmateSection data={report.soulmate} language={language} />
                        ) : null}
                    </>
                );
            case 'special':
                return (
                    <>
                        {report.special_analysis ? (
                            <SpecialAnalysisSection data={report.special_analysis} language={language} />
                        ) : null}
                        {report.lucky_assets ? (
                            <LuckyAssetsGrid data={report.lucky_assets} language={language} />
                        ) : null}
                        {report.past_life ? (
                            <PastLifeSection data={report.past_life} language={language} />
                        ) : null}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={onToggle}
                className="group flex w-full items-center justify-between px-1 py-3 text-xs font-bold uppercase tracking-widest text-[#D4AF37]/60 transition-colors hover:text-[#D4AF37]"
            >
                <span>{isExpanded ? hideLabel : detailLabel}</span>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="group-hover:text-[#D4AF37]" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 pt-2">{renderDetailContent()}</div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
