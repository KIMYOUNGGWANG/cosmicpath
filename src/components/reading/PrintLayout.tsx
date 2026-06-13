'use client';

import React, { forwardRef } from 'react';
import { PremiumReportData } from './premium-report';
import { cn } from '@/lib/utils';
import { Star, Zap, Target, TrendingUp, Sparkles, Shield, Calendar, BookOpen, FileText } from 'lucide-react';
import { FortuneTimelineChart } from './FortuneTimelineChart';
import { LuckyAssetsGrid } from './LuckyAssetsGrid';
import { GlossarySection } from './GlossarySection';
import { SoulmateSection } from './SoulmateSection';

interface PrintLayoutProps {
    data: PremiumReportData;
    userData?: {
        name?: string;
        birthDate?: string;
    };
    language?: 'ko' | 'en';
}

export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(({ data, userData, language = 'ko' }, ref) => {
    const isEn = language === 'en';
    const date = new Date().toLocaleDateString(isEn ? 'en-US' : 'ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const reportBookPages = buildReportBookPages(data, isEn);
    const tableOfContents = buildTableOfContents(data, isEn);

    return (
        <div ref={ref} className="print-layout bg-slate-950 text-white font-sans">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0; 
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background-color: #020617 !important; /* slate-950 */
                        color: white !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    .print-layout {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 40px;
                    }
                    .no-break {
                        break-inside: avoid;
                    }
                }
            `}</style>

            {/* --- Cover Page --- */}
            <div className="page-break flex flex-col items-center justify-center min-h-[1050px] text-center p-12 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

                <div className="relative z-10 w-full max-w-2xl border border-white/10 bg-white/5 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
                    <div className="mb-8">
                        <div className="text-xl font-bold tracking-[0.5em] text-gold mb-2">
                            COSMIC PATH
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest">
                            Detailed 3-Layer Decision Report
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gold via-white to-gold">
                        {data.summary.title}
                    </h1>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto my-8" />

                    <div className="space-y-2">
                        <p className="text-2xl font-light text-white">
                            <span className="font-bold text-gold">{userData?.name || (isEn ? 'User' : '사용자')}</span>
                            {isEn ? "'s Decision Report" : "님을 위한 프리미엄 결정 리포트"}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">
                            {date}
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-break py-10">
                <SectionHeader icon={<BookOpen className="text-gold" />} title={isEn ? 'Report Book Guide' : '리포트북 가이드'} />

                <div className="mb-8 border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-gold">
                        {isEn ? 'Premium PDF Edition' : '프리미엄 PDF 에디션'}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-white">
                        {isEn ? 'A structured book, not a short result page' : '짧은 결과지가 아니라 구조화된 리포트북'}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-gray-300">
                        {isEn
                            ? 'This print edition turns the reading into a deeper reference report: source evidence, timing map, area-by-area diagnosis, and practical review sheets.'
                            : '이 인쇄본은 근거, 타이밍 지도, 영역별 진단, 실전 점검 시트를 한 번에 다시 볼 수 있게 구성한 심화 리포트입니다.'}
                    </p>
                    <p className="mt-3 text-xs leading-6 text-gray-400">
                        {isEn
                            ? 'For visa, legal, tax, or financial-risk decisions, this report stays within documents, deadlines, questions, risk buffers, and qualified consultation checkpoints.'
                            : '비자, 법률, 세금, 재무 리스크 결정은 문서, 마감, 질문, 리스크 버퍼, 전문가 상담 체크포인트 안에서만 다룹니다.'}
                    </p>
                </div>

                <div className="grid gap-3">
                    {tableOfContents.map((item, index) => (
                        <div key={item.title} className="flex items-center justify-between border-b border-white/10 py-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                                    {String(index + 1).padStart(2, '0')}
                                </p>
                                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                            </div>
                            <p className="max-w-52 text-right text-sm leading-6 text-gold">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Chapter 1: Summary & Traits --- */}
            <div className="page-break py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Star className="text-gold" size={24} />
                    <h2 className="text-2xl font-bold text-white">
                        {isEn ? 'Executive Summary' : '핵심 요약'}
                    </h2>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-line">
                        {data.summary.content}
                    </p>
                    {data.summary.trust_reason && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2">
                            <Shield size={16} className="text-gold/60 mt-0.5" />
                            <p className="text-sm text-gray-400 italic">{data.summary.trust_reason}</p>
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-4 mt-12">{isEn ? 'Cosmic Traits' : '나의 코스믹 특성 (Traits)'}</h3>
                <div className="grid grid-cols-2 gap-4">
                    {data.traits.map((trait, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{trait.type}</span>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded border",
                                    trait.grade === 'S' ? "text-purple-300 border-purple-500/30" :
                                        trait.grade === 'A' ? "text-blue-300 border-blue-500/30" :
                                            "text-gray-400 border-gray-600"
                                )}>Grade {trait.grade}</span>
                            </div>
                            <h4 className="text-white font-bold text-lg mb-2">{trait.name}</h4>
                            <p className="text-sm text-gray-400 leading-snug">{trait.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Chapter 2: Core Analysis & Saju --- */}
            <div className="page-break py-10">
                <SectionHeader icon={<Sparkles className="text-gold" />} title={isEn ? "Core Saju Analysis" : "사주 핵심 분석"} />

                {data.core_analysis && (
                    <div className="grid grid-cols-1 gap-6 mb-10">
                        {/* Lacking Elements */}
                        <div className="border border-white/10 bg-white/5 p-6 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
                            <h4 className="text-lg font-bold text-white mb-1">{isEn ? 'Lacking Elements' : '부족한 오행과 개운법'}</h4>
                            <p className="text-gold font-bold mb-3">{data.core_analysis.lacking_elements.elements}</p>
                            <p className="text-sm text-gray-300 mb-4">{data.core_analysis.lacking_elements.description}</p>
                            <div className="bg-black/30 p-3 rounded-lg">
                                <span className="text-xs font-bold text-gold mr-2">{isEn ? 'Remedy:' : '개운법:'}</span>
                                <span className="text-xs text-gray-300">{data.core_analysis.lacking_elements.remedy}</span>
                            </div>
                        </div>

                        {/* Abundant Elements */}
                        <div className="border border-white/10 bg-white/5 p-6 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-red-500" />
                            <h4 className="text-lg font-bold text-white mb-1">{isEn ? 'Abundant Elements' : '풍부한 오행과 활용'}</h4>
                            <p className="text-gold font-bold mb-3">{data.core_analysis.abundant_elements.elements}</p>
                            <p className="text-sm text-gray-300">{data.core_analysis.abundant_elements.description}</p>
                        </div>
                    </div>
                )}

                {data.saju_sections && (
                    <div className="space-y-6">
                        {data.saju_sections.map((section) => (
                            <div key={section.id} className="no-break bg-white/[0.02] border border-white/5 rounded-xl p-5">
                                <h3 className="text-lg font-bold text-white mb-3">{section.title}</h3>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{section.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Chapter 3: Fortune Flow --- */}
            {data.fortune_flow && (
                <div className="page-break py-10">
                    <SectionHeader icon={<TrendingUp className="text-gold" />} title={isEn ? "Fortune Flow" : "운의 흐름"} />

                    {data.fortune_flow.timeline_scores && (
                        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10 no-break">
                            <h3 className="text-sm font-bold text-gray-300 mb-4">{isEn ? '10-Year Luck Graph' : '10년 대운 그래프'}</h3>
                            <FortuneTimelineChart scores={data.fortune_flow.timeline_scores} language={language} />
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="no-break">
                            <h3 className="text-xl font-bold text-white mb-2">{data.fortune_flow.major_luck.title}</h3>
                            <p className="text-xs text-gold mb-4">{data.fortune_flow.major_luck.period}</p>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{data.fortune_flow.major_luck.content}</p>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div className="no-break">
                            <h3 className="text-xl font-bold text-white mb-4">{data.fortune_flow.yearly_luck.title}</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{data.fortune_flow.yearly_luck.content}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Chapter 4: Life Areas & Relationship Signals --- */}
            <div className="page-break py-10">
                <SectionHeader icon={<Target className="text-gold" />} title={isEn ? "Life Areas & Relationship Signals" : "인생 영역 & 관계 신호"} />

                <div className="grid gap-6">
                    {data.life_areas && [
                        { icon: '💼', ...data.life_areas.career },
                        { icon: '💰', ...data.life_areas.wealth },
                        { icon: '💕', ...data.life_areas.love },
                        { icon: '🏥', ...data.life_areas.health }
                    ].filter(item => item.content).map((area, idx) => (
                        <div key={idx} className="no-break bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span>{area.icon}</span>
                                <span>{area.title}</span>
                            </h3>
                            {area.subsections && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {area.subsections.map((sub, i) => (
                                        <span key={i} className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">{sub}</span>
                                    ))}
                                </div>
                            )}
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{area.content}</p>
                        </div>
                    ))}
                </div>

                {data.soulmate && (
                    <div className="mt-8 pt-8 border-t border-white/10 no-break">
                        <SoulmateSection data={data.soulmate} language={language} />
                    </div>
                )}
            </div>

            {/* --- Chapter 5: Lucky Assets & Special --- */}
            <div className="page-break py-10">
                <SectionHeader icon={<Zap className="text-gold" />} title={isEn ? "Special Analysis" : "특수 분석"} />

                {data.special_analysis && (
                    <div className="grid gap-6 mb-10">
                        {[data.special_analysis.noble_person, data.special_analysis.charm, data.special_analysis.conflicts].filter(Boolean).map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 no-break">
                                <h3 className="text-white font-bold mb-2">{item?.title}</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{item?.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {data.lucky_assets && (
                    <div className="no-break">
                        <h3 className="text-xl font-bold text-white mb-4">{isEn ? 'Lucky Assets' : '나의 행운 요소'}</h3>
                        <LuckyAssetsGrid data={data.lucky_assets} language={language} />
                    </div>
                )}
            </div>

            {/* --- Chapter 6: Action Plan --- */}
            {data.action_plan && (
                <div className="page-break py-10">
                    <SectionHeader icon={<Calendar className="text-gold" />} title={isEn ? "Action Plan" : "실전 행동 지침"} />
                    <div className="grid gap-4">
                        {data.action_plan.map((plan, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4 no-break">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-lg border border-white/10 shrink-0">
                                    <span className="text-xs text-gray-400 font-bold uppercase">{plan.date.includes('-') ? new Date(plan.date).toLocaleString('en', { month: 'short' }) : 'Day'}</span>
                                    <span className="text-lg font-bold text-white">{plan.date.includes('-') ? plan.date.split('-')[2] : 'D'}</span>
                                </div>
                                <div>
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded border mb-2 inline-block",
                                        plan.type === 'opportunity' ? "text-blue-300 border-blue-500/30 bg-blue-500/10" : "text-amber-300 border-amber-500/30 bg-amber-500/10"
                                    )}>{plan.type === 'opportunity' ? 'OPPORTUNITY' : 'WARNING'}</span>
                                    <h4 className="text-white font-bold text-lg leading-tight mb-1">{plan.title}</h4>
                                    <p className="text-sm text-gray-400">{plan.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- Appendix: Glossary --- */}
            {data.glossary && (
                <div className="page-break py-10">
                    <GlossarySection data={data.glossary} language={language} />
                </div>
            )}

            {reportBookPages.length > 0 && (
                <>
                    <div className="page-break flex min-h-[1050px] flex-col justify-center py-10">
                        <div className="border-y border-white/10 py-12 text-center">
                            <p className="text-sm uppercase tracking-[0.35em] text-gold">
                                {isEn ? 'Expanded Report Book' : '확장 리포트북'}
                            </p>
                            <h2 className="mt-5 text-4xl font-black text-white">
                                {isEn ? 'Detailed Reading Archive' : '상세 해석 아카이브'}
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-400">
                                {isEn
                                    ? 'The following pages reorganize the same reading into focused reference pages and worksheets for later review.'
                                    : '다음 장부터는 같은 해석을 나중에 다시 펼쳐보기 쉽도록 주제별 참조 페이지와 워크북으로 재구성했습니다.'}
                            </p>
                        </div>
                    </div>

                    {reportBookPages.map((page, index) => (
                        <ReportBookPage key={page.id} page={page} pageNumber={index + 1} />
                    ))}
                </>
            )}
        </div>
    );
});

PrintLayout.displayName = "PrintLayout";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 24 })}
            </div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
    )
}

type TableOfContentsItem = {
    title: string;
    detail: string;
};

type ReportBookPageData = {
    id: string;
    label: string;
    title: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
    metadata?: { label: string; value: string }[];
    prompts?: string[];
};

function buildTableOfContents(data: PremiumReportData, isEn: boolean): TableOfContentsItem[] {
    const items: TableOfContentsItem[] = [
        { title: isEn ? 'Cover and Reading Summary' : '표지와 핵심 요약', detail: isEn ? 'Main guidance and trust basis' : '핵심 안내와 신뢰 근거' },
        { title: isEn ? 'Saju Core Analysis' : '사주 핵심 분석', detail: data.saju_sections?.length ? `${data.saju_sections.length} source sections` : (isEn ? 'Core source reading' : '핵심 근거 해석') },
        { title: isEn ? 'Fortune Flow and Timing' : '운의 흐름과 타이밍', detail: data.fortune_flow?.monthly_luck?.length ? `${data.fortune_flow.monthly_luck.length} monthly checkpoints` : (isEn ? 'Major and yearly flow' : '대운과 세운 흐름') },
        { title: isEn ? 'Life Areas and Special Signals' : '인생 영역과 특수 신호', detail: data.life_areas ? (isEn ? 'Career, money, love, health' : '커리어, 재물, 관계, 건강') : (isEn ? 'Focused diagnosis' : '핵심 진단') },
        { title: isEn ? 'Action Plan Workbook' : '실전 행동 워크북', detail: data.action_plan?.length ? `${data.action_plan.length} action priorities` : (isEn ? 'Practical next steps' : '실행 우선순위') },
    ];

    if (data.glossary?.length) {
        items.push({ title: isEn ? 'Glossary and Reference Notes' : '용어 해설과 참조 노트', detail: `${data.glossary.length} reference terms` });
    }

    items.push({
        title: isEn ? 'Expanded Report Book Appendix' : '확장 리포트북 부록',
        detail: isEn ? 'Deep-dive archive and review sheets' : '심화 해석과 점검 시트',
    });

    return items;
}

function buildReportBookPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    const pages: ReportBookPageData[] = [];

    pushTextPage(pages, {
        id: 'summary-archive',
        label: isEn ? 'Archive / Summary' : '아카이브 / 요약',
        title: data.summary.title,
        subtitle: isEn ? 'Core message with trust note' : '핵심 메시지와 신뢰 근거',
        body: data.summary.content,
        bullets: [data.summary.trust_reason].filter(Boolean),
    });

    data.saju_sections?.forEach((section, index) => {
        pushTextPage(pages, {
            id: `saju-${section.id || index}`,
            label: isEn ? `Saju Detail ${index + 1}` : `사주 상세 ${index + 1}`,
            title: section.title,
            body: section.content,
            prompts: buildReflectionPrompts(isEn),
        });
    });

    Object.entries(data.astro_deep || {}).forEach(([key, section], index) => {
        if (!section?.content) return;
        pushTextPage(pages, {
            id: `astro-${key}`,
            label: isEn ? `Astrology Detail ${index + 1}` : `점성술 상세 ${index + 1}`,
            title: section.title,
            body: section.content,
            prompts: buildReflectionPrompts(isEn),
        });
    });

    data.tarot_details?.forEach((card, index) => {
        pushTextPage(pages, {
            id: `tarot-${index}`,
            label: isEn ? `Tarot Card ${index + 1}` : `타로 카드 ${index + 1}`,
            title: `${card.position}: ${card.card_name}${card.is_reversed ? (isEn ? ' Reversed' : ' 역방향') : ''}`,
            body: [card.interpretation, card.saju_connection, card.advice].filter(Boolean).join('\n\n'),
            bullets: card.keywords,
            prompts: buildReflectionPrompts(isEn),
        });
    });

    data.fortune_flow?.monthly_luck?.forEach((month, index) => {
        pushTextPage(pages, {
            id: `monthly-${month.month}-${index}`,
            label: isEn ? 'Monthly Timing Map' : '월별 타이밍 지도',
            title: `${month.month} · ${month.theme}`,
            subtitle: month.element,
            body: [month.opportunity, month.warning, month.advice].filter(Boolean).join('\n\n'),
            metadata: [
                { label: isEn ? 'Score' : '점수', value: month.score ? `${month.score}/100` : '-' },
                { label: isEn ? 'Element' : '오행', value: month.element || '-' },
            ],
            prompts: [
                isEn ? 'What should I start this month?' : '이번 달에 시작할 일',
                isEn ? 'What should I delay or reduce?' : '이번 달에 늦추거나 줄일 일',
                isEn ? 'One measurable action' : '측정 가능한 행동 하나',
            ],
        });

        pushTextPage(pages, {
            id: `monthly-workbook-${month.month}-${index}`,
            label: isEn ? 'Monthly Workbook' : '월별 워크북',
            title: isEn ? `${month.month} Action Sheet` : `${month.month} 실행 시트`,
            body: month.advice,
            prompts: [
                isEn ? 'Signal I will watch' : '이번 달 관찰할 신호',
                isEn ? 'Boundary I will keep' : '이번 달 지킬 경계선',
                isEn ? 'Result I will review' : '월말에 점검할 결과',
            ],
        });
    });

    buildLifeAreaPages(data, isEn).forEach((page) => pushTextPage(pages, page));
    buildSpecialPages(data, isEn).forEach((page) => pushTextPage(pages, page));
    buildActionPages(data, isEn).forEach((page) => pushTextPage(pages, page));
    buildDateSelectionPages(data, isEn).forEach((page) => pushTextPage(pages, page));
    buildNumerologyPages(data, isEn).forEach((page) => pushTextPage(pages, page));
    buildPastLifePages(data, isEn).forEach((page) => pushTextPage(pages, page));

    data.glossary?.forEach((item, index) => {
        pushTextPage(pages, {
            id: `glossary-${index}`,
            label: isEn ? 'Glossary Note' : '용어 해설',
            title: `${item.term}${item.hanja ? ` (${item.hanja})` : ''}`,
            body: [item.definition, item.context].filter(Boolean).join('\n\n'),
            prompts: [
                isEn ? 'Where this appears in my reading' : '내 리포트에서 연결되는 부분',
                isEn ? 'How I will remember this concept' : '이 개념을 기억할 방식',
            ],
        });
    });

    if (data.final_verdict) {
        pushTextPage(pages, {
            id: 'final-verdict-core',
            label: isEn ? 'Final Decision Note' : '최종 결정 노트',
            title: data.final_verdict.title,
            body: [
                data.final_verdict.core_message,
                data.final_verdict.saju_foundation,
                data.final_verdict.astro_support,
                data.final_verdict.tarot_insight,
                data.final_verdict.closing_words,
            ].filter(Boolean).join('\n\n'),
            bullets: data.final_verdict.action_priorities,
        });
    }

    return pages;
}

function buildLifeAreaPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    const areas = [
        { id: 'career', section: data.life_areas?.career, label: isEn ? 'Career' : '커리어' },
        { id: 'wealth', section: data.life_areas?.wealth, label: isEn ? 'Wealth' : '재물' },
        { id: 'love', section: data.life_areas?.love, label: isEn ? 'Love' : '연애/관계' },
        { id: 'health', section: data.life_areas?.health, label: isEn ? 'Health' : '건강' },
    ];

    return areas.flatMap((area) => {
        if (!area.section?.content) return [];

        return [{
            id: `life-${area.id}`,
            label: isEn ? `Life Area / ${area.label}` : `인생 영역 / ${area.label}`,
            title: area.section.title,
            subtitle: 'tag' in area.section && typeof area.section.tag === 'string' ? area.section.tag : undefined,
            body: area.section.content,
            bullets: area.section.subsections,
            prompts: buildReflectionPrompts(isEn),
        }];
    });
}

function buildSpecialPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    const specials = [
        data.special_analysis?.noble_person,
        data.special_analysis?.charm,
        data.special_analysis?.conflicts,
    ];

    return specials.flatMap((section, index) => {
        if (!section?.content) return [];

        return [{
            id: `special-${index}`,
            label: isEn ? 'Special Signal' : '특수 신호',
            title: section.title,
            body: section.content,
            prompts: buildReflectionPrompts(isEn),
        }];
    });
}

function buildActionPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    return (data.action_plan || []).flatMap((plan, index) => [
        {
            id: `action-${index}`,
            label: isEn ? 'Action Plan' : '실전 행동 지침',
            title: plan.title,
            subtitle: plan.date,
            body: plan.description,
            metadata: [{ label: isEn ? 'Type' : '유형', value: plan.type }],
            prompts: [
                isEn ? 'First action within 24 hours' : '24시간 안에 할 첫 행동',
                isEn ? 'Risk to avoid' : '피해야 할 리스크',
            ],
        },
        {
            id: `action-workbook-${index}`,
            label: isEn ? 'Action Workbook' : '행동 워크북',
            title: isEn ? `${plan.title} Checklist` : `${plan.title} 체크리스트`,
            body: plan.description,
            prompts: [
                isEn ? 'Preparation' : '준비할 것',
                isEn ? 'Execution' : '실행할 것',
                isEn ? 'Review' : '점검할 것',
            ],
        },
    ]);
}

function buildDateSelectionPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    const auspicious = data.date_selection?.auspicious || [];
    const inauspicious = data.date_selection?.inauspicious || [];

    return [
        ...auspicious.map((item, index) => ({
            id: `auspicious-${index}`,
            label: isEn ? 'Auspicious Date' : '길일 메모',
            title: `${item.date} · ${item.purpose}`,
            body: item.reason,
            prompts: [isEn ? 'How I will use this date' : '이 날짜를 활용할 방식'],
        })),
        ...inauspicious.map((item, index) => ({
            id: `inauspicious-${index}`,
            label: isEn ? 'Caution Date' : '주의일 메모',
            title: `${item.date} · ${item.purpose}`,
            body: item.reason,
            prompts: [isEn ? 'What I should avoid on this date' : '이 날짜에 피할 행동'],
        })),
    ];
}

function buildNumerologyPages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    if (!data.numerology) return [];

    return [{
        id: 'numerology-life-path',
        label: isEn ? 'Numerology' : '수비학',
        title: `${data.numerology.life_path.number} · ${data.numerology.life_path.title}`,
        body: [
            data.numerology.life_path.meaning,
            data.numerology.life_path.saju_connection,
            data.numerology.lucky_day_advice,
        ].filter(Boolean).join('\n\n'),
        bullets: data.numerology.lucky_numbers.map((number) => `${number}`),
        prompts: buildReflectionPrompts(isEn),
    }];
}

function buildPastLifePages(data: PremiumReportData, isEn: boolean): ReportBookPageData[] {
    const sections = [
        { id: 'theme', section: data.past_life?.theme },
        { id: 'karma', section: data.past_life?.karma },
        { id: 'mission', section: data.past_life?.soul_mission },
    ];

    return sections.flatMap((item) => {
        if (!item.section?.content) return [];

        return [{
            id: `past-life-${item.id}`,
            label: isEn ? 'Repeating Pattern' : '반복 패턴',
            title: item.section.title,
            body: item.section.content,
            prompts: buildReflectionPrompts(isEn),
        }];
    });
}

function buildReflectionPrompts(isEn: boolean): string[] {
    return isEn
        ? ['What this explains', 'Where this shows up now', 'One adjustment I will test']
        : ['이 해석이 설명하는 것', '지금 현실에서 드러나는 장면', '내가 시험해볼 조정 하나'];
}

function pushTextPage(pages: ReportBookPageData[], page: ReportBookPageData) {
    if (!page.body?.trim() && !page.bullets?.length && !page.prompts?.length) return;
    pages.push(page);
}

function ReportBookPage({ page, pageNumber }: { page: ReportBookPageData; pageNumber: number }) {
    return (
        <div className="page-break min-h-[1050px] py-10">
            <div className="mb-8 flex items-start justify-between border-b border-white/10 pb-5">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
                        {page.label}
                    </p>
                    <h2 className="mt-3 text-3xl font-black leading-tight text-white">{page.title}</h2>
                    {page.subtitle && <p className="mt-2 text-sm text-gray-400">{page.subtitle}</p>}
                </div>
                <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5 text-sm font-bold text-gold">
                    {String(pageNumber).padStart(2, '0')}
                </div>
            </div>

            {page.metadata?.length ? (
                <div className="mb-6 grid grid-cols-2 gap-3">
                    {page.metadata.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
                            <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
                        </div>
                    ))}
                </div>
            ) : null}

            {page.body && (
                <div className="border border-white/10 bg-white/5 p-6">
                    <p className="whitespace-pre-line text-base leading-8 text-gray-200">{page.body}</p>
                </div>
            )}

            {page.bullets?.length ? (
                <div className="mt-6 grid gap-3">
                    {page.bullets.map((bullet) => (
                        <div key={bullet} className="flex gap-3 border border-white/10 bg-black/20 p-4">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                            <p className="text-sm leading-6 text-gray-300">{bullet}</p>
                        </div>
                    ))}
                </div>
            ) : null}

            {page.prompts?.length ? (
                <div className="mt-8 grid gap-4">
                    {page.prompts.map((prompt) => (
                        <div key={prompt} className="min-h-24 border border-dashed border-white/15 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{prompt}</p>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
