'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Hash, Hourglass, Layers, Map, MoonStar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabContent } from './tab-content';
import type { EvidenceTab, TabId, VerdictReportProps } from './types';

function evidenceTab(tab: EvidenceTab): EvidenceTab {
    return tab;
}

export function EvidenceTabs({
    report,
    language = 'ko',
    tarotCards,
    onCardClick,
}: Omit<VerdictReportProps, 'isLoading' | 'onRetry' | 'isFreeView'>) {
    const isEn = language === 'en';
    const [activeTab, setActiveTab] = useState<TabId | null>(null);
    const [expandedTab, setExpandedTab] = useState<TabId | null>(null);

    const tabs: readonly EvidenceTab[] = [
        ...(tarotCards && tarotCards.length > 0
            ? [
                evidenceTab({
                    id: 'tarot',
                    label: isEn ? 'Tarot' : '타로',
                    icon: <Layers size={14} className="opacity-70" />,
                    summary: report.tarot_details?.[0]?.interpretation
                        ? `${report.tarot_details[0].interpretation.split('.')[0]}.`
                        : (isEn ? 'The cards add an immediate timing signal.' : '카드가 질문 주변의 즉각 신호를 더합니다.'),
                }),
            ]
            : []),
        ...(report.saju_sections
            ? [
                evidenceTab({
                    id: 'saju',
                    label: isEn ? 'Saju' : '사주',
                    icon: <Compass size={14} className="opacity-70" />,
                    summary: isEn
                        ? 'The elemental blueprint frames the decision structure.'
                        : '사주 원국이 결정 구조를 잡아줍니다.',
                }),
            ]
            : []),
        ...(report.astro_deep
            ? [
                evidenceTab({
                    id: 'astro',
                    label: isEn ? 'Astro' : '점성',
                    icon: <MoonStar size={14} className="opacity-70" />,
                    summary: report.astro_deep.sun_moon_dynamic?.content
                        ? `${report.astro_deep.sun_moon_dynamic.content.split('.')[0]}.`
                        : (isEn ? 'The timing layer adds context for this decision note.' : '점성 타이밍 레이어가 결정 노트에 맥락을 더합니다.'),
                }),
            ]
            : []),
        ...(report.numerology
            ? [
                evidenceTab({
                    id: 'numerology',
                    label: isEn ? 'Numbers' : '수비',
                    icon: <Hash size={14} className="opacity-70" />,
                    summary: isEn
                        ? `Life path ${report.numerology.life_path.number} adds context to this timing.`
                        : `생명수 ${report.numerology.life_path.number}이(가) 이 시기 판단에 맥락을 더합니다.`,
                }),
            ]
            : []),
        ...(report.fortune_flow
            ? [
                evidenceTab({
                    id: 'fortune',
                    label: isEn ? 'Timing' : '운세',
                    icon: <Hourglass size={14} className="opacity-70" />,
                    summary: report.fortune_flow.yearly_luck?.content
                        ? `${report.fortune_flow.yearly_luck.content.split('.')[0]}.`
                        : (isEn ? 'This timing window is worth reviewing.' : '지금은 점검할 만한 타이밍 창입니다.'),
                }),
            ]
            : []),
        ...(report.life_areas
            ? [
                evidenceTab({
                    id: 'life',
                    label: isEn ? 'Life Areas' : '영역별',
                    icon: <Map size={14} className="opacity-70" />,
                    summary: isEn
                        ? 'Career, wealth, and love signals show a similar pattern.'
                        : '커리어·재물·사랑 신호가 비슷한 패턴을 보입니다.',
                }),
            ]
            : []),
        ...(report.special_analysis
            ? [
                evidenceTab({
                    id: 'special',
                    label: isEn ? 'Assets' : '특수',
                    icon: <Sparkles size={14} className="opacity-70" />,
                    summary: isEn
                        ? 'Supportive and caution zones are mapped for review.'
                        : '도움이 되는 지점과 주의할 지점을 검토용으로 정리합니다.',
                }),
            ]
            : []),
    ];

    const firstTab = tabs[0];
    if (!firstTab) return null;

    const currentTab = activeTab ?? firstTab.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 w-full"
            style={{ wordBreak: 'keep-all' }}
        >
            <p className="mb-4 px-1 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                {isEn ? '— Why this decision note?' : '— 세 가지 원천의 근거가 모이는 방식'}
            </p>

            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                            currentTab === tab.id
                                ? 'border-white/30 bg-white/15 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                                : 'border-white/10 bg-transparent text-white/40 hover:border-white/20 hover:text-white/70'
                        )}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {tabs.map((tab) => (
                <AnimatePresence key={tab.id} mode="wait">
                    {currentTab === tab.id ? (
                        <motion.div
                            key={tab.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="mt-5 rounded-md border border-[#D4AF37]/10 bg-black/40 p-6 backdrop-blur-sm lg:p-8"
                        >
                            <p className="text-base font-light leading-relaxed text-stone-300 md:text-lg">
                                {tab.summary}
                            </p>

                            <div className="my-6 h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent" />

                            <TabContent
                                tabId={tab.id}
                                report={report}
                                language={language}
                                tarotCards={tarotCards}
                                onCardClick={onCardClick}
                                isExpanded={expandedTab === tab.id}
                                onToggle={() => setExpandedTab(expandedTab === tab.id ? null : tab.id)}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            ))}
        </motion.div>
    );
}
