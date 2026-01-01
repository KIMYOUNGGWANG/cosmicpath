'use client';

import React, { forwardRef } from 'react';
import { PremiumReportData } from './premium-report';
import { cn } from '@/lib/utils';
import { Star, Zap, Target, TrendingUp, Sparkles, Shield, Calendar } from 'lucide-react';
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
                            Premium Destiny Report
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gold via-white to-gold">
                        {data.summary.title}
                    </h1>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto my-8" />

                    <div className="space-y-2">
                        <p className="text-2xl font-light text-white">
                            <span className="font-bold text-gold">{userData?.name || (isEn ? 'User' : '사용자')}</span>
                            {isEn ? "'s Destiny Reading" : "님을 위한 프리미엄 리딩"}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">
                            {date}
                        </p>
                    </div>
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

            {/* --- Chapter 4: Life Areas & Soulmate --- */}
            <div className="page-break py-10">
                <SectionHeader icon={<Target className="text-gold" />} title={isEn ? "Life Areas & Soulmate" : "인생 영역 & 소울메이트"} />

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
