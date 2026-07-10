'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { ConsensusSignalMeter } from './ConsensusSignalMeter';
import { GlossarySection } from './GlossarySection';
import { ActionPlanSection, CoreAnalysisSection } from './premium-report-sections';
import { EvidenceTabs } from './verdict-report/evidence-tabs';
import { resolveReportFinalVerdict } from './verdict-report/free-final-verdict';
import { HeroVerdictCard } from './verdict-report/hero-verdict-card';
import { readRadarScores, readSajuResult } from './verdict-report/metadata';
import type { VerdictReportProps } from './verdict-report/types';

const FULL_REPORT_OPEN_STORAGE_KEY = 'cosmicpath_full_report_open';

export function VerdictReport({
    report,
    metadata,
    language = 'ko',
    isLoading,
    tarotCards,
    onCardClick,
    scoreGridNode,
    isFreeView,
}: VerdictReportProps) {
    const isEn = language === 'en';
    const radarScores = readRadarScores(metadata);
    const sajuResult = readSajuResult(metadata);
    const [showFullReport, setShowFullReport] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(FULL_REPORT_OPEN_STORAGE_KEY) === 'true';
    });

    const toggleFullReport = () => {
        const next = !showFullReport;
        setShowFullReport(next);
        localStorage.setItem(FULL_REPORT_OPEN_STORAGE_KEY, next ? 'true' : 'false');
    };

    const finalVerdict = resolveReportFinalVerdict({
        report,
        language,
        isFreeView,
    });
    const decisionPacket = !isFreeView ? report.final_verdict?.decision_packet : undefined;

    const leftColumn = (
        <div className="flex flex-col gap-8">
            <HeroVerdictCard
                finalVerdict={finalVerdict}
                trustScore={report.summary?.trust_score ?? 3}
                isLoading={isLoading}
                language={language}
                actionSummary={report.action_plan?.[0]?.title}
            />

            {radarScores && !isFreeView ? (
                <ConsensusSignalMeter
                    sajuScore={radarScores.saju ?? 60}
                    astroScore={radarScores.astrology ?? 60}
                    tarotScore={radarScores.tarot ?? 60}
                    convergenceScore={report.oracleCouncil?.convergenceScore}
                    language={language}
                />
            ) : null}

            {decisionPacket ? (
                <section className="rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#D4AF37]/10 to-white/[0.025] p-5 sm:p-7">
                    <div className="font-cinzel text-xs uppercase tracking-[0.22em] text-[#D4AF37]">7-Day Decision Packet</div>
                    <h2 className="mt-2 break-keep text-xl font-semibold text-white">
                        {isEn ? 'Turn the reading into a bounded decision test' : '해석을 검증 가능한 결정 실험으로 바꾸기'}
                    </h2>
                    <div className="mt-5 space-y-5 text-sm leading-6 text-white/72">
                        <div>
                            <h3 className="font-semibold text-white">{isEn ? 'Decision fork' : '결정 갈림길'}</h3>
                            <p className="mt-1">A. {decisionPacket.decision_fork.option_a}</p>
                            <p>B. {decisionPacket.decision_fork.option_b}</p>
                            <p className="mt-2 text-[#D4AF37]">{decisionPacket.decision_fork.recommended_test}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="border border-white/10 bg-black/20 p-3">
                                <h3 className="font-semibold text-white">{isEn ? 'Evidence agreement' : '근거 일치'}</h3>
                                <p className="mt-1">{decisionPacket.evidence_disagreement.aligned}</p>
                            </div>
                            <div className="border border-white/10 bg-black/20 p-3">
                                <h3 className="font-semibold text-white">{isEn ? 'Evidence disagreement' : '근거 충돌'}</h3>
                                <p className="mt-1">{decisionPacket.evidence_disagreement.conflicting}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{isEn ? 'Reality checks' : '현실 확인'}</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                {decisionPacket.reality_checks.map((check) => <li key={check}>{check}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{isEn ? '7-day experiment' : '7일 실험'}</h3>
                            <p className="mt-1">{decisionPacket.seven_day_experiment.action}</p>
                            <p className="mt-1 text-white/55">{isEn ? 'Measure' : '측정'}: {decisionPacket.seven_day_experiment.measure}</p>
                            <p className="mt-1 text-rose-200">{isEn ? 'Stop rule' : '중단 기준'}: {decisionPacket.seven_day_experiment.stop_rule}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{isEn ? 'If / Then rules' : '조건별 다음 수'}</h3>
                            <ul className="mt-2 space-y-2">
                                {decisionPacket.if_then_rules.map((rule) => (
                                    <li key={`${rule.if}-${rule.then}`} className="border-l-2 border-[#D4AF37]/45 pl-3">
                                        {isEn ? 'If' : '만약'} {rule.if} → {isEn ? 'then' : '그러면'} {rule.then}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            ) : null}

            {!isFreeView && report.action_plan ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <ActionPlanSection
                        actionPlan={report.action_plan.slice(0, 3)}
                        trustScore={report.summary?.trust_score ?? 3}
                        language={language}
                    />
                </motion.div>
            ) : null}

            {!isFreeView && !showFullReport ? (
                <div className="flex justify-center pb-8 pt-4 xl:hidden">
                    <button
                        type="button"
                        onClick={toggleFullReport}
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 px-8 py-3 font-semibold tracking-wide text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/10"
                    >
                        {isEn ? 'View Full Report' : '전체 리포트 보기 ↓'}
                    </button>
                </div>
            ) : null}

            {showFullReport && report.core_analysis ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <CoreAnalysisSection
                        data={report.core_analysis}
                        sajuData={sajuResult}
                        language={language}
                    />
                </motion.div>
            ) : null}
        </div>
    );

    const rightColumnContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
        >
            {scoreGridNode ? (
                <div className="flex flex-col gap-6">
                    {scoreGridNode}
                </div>
            ) : null}

            {!isFreeView ? (
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
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
                            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-purple-400/50" />
                            <p className="font-cinzel text-sm uppercase tracking-widest text-white/40">
                                {isEn ? 'Compiling glossary...' : '용어집을 정리하는 중...'}
                            </p>
                        </div>
                    ) : null}
                </>
            ) : null}
        </motion.div>
    );

    const rightColumn = (
        <div className="flex flex-col gap-8">
            <div className="hidden xl:block">
                {rightColumnContent}
            </div>
            {isFreeView || showFullReport ? (
                <div className="xl:hidden">
                    {rightColumnContent}
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="mt-8 w-full px-4 md:mt-12 md:px-6">
            <div className="hidden xl:grid xl:items-start xl:gap-8" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
                <div className="xl:sticky xl:top-8 xl:self-start">
                    {leftColumn}
                </div>
                <div>
                    {rightColumn}
                </div>
            </div>

            <div className="space-y-8 xl:hidden">
                {leftColumn}
                {rightColumn}
            </div>
        </div>
    );
}
