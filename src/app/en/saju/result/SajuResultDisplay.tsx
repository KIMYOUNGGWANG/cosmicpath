'use client';

import { useState } from 'react';

interface ActionPlanItem {
    date: string;
    action: string;
    reasoning: string;
    type: 'opportunity' | 'caution';
}

interface FreeFocus {
    action_conclusion: string;
    evidence_summary: string;
    next_question: string;
}

interface SajuReport {
    free_focus?: FreeFocus;
    summary?: {
        title?: string;
        content?: string;
    };
    life_areas?: {
        career?: { outlook?: string; timing?: string; strategy?: string };
        wealth?: { flow?: string; opportunity?: string; risk?: string };
        love?: { energy?: string; meeting?: string; advice?: string };
    };
    fortune_timeline?: {
        major_luck?: { period?: string; theme?: string; advice?: string };
        yearly?: { opportunities?: string[]; cautions?: string[] };
    };
    action_plan?: ActionPlanItem[];
    final_verdict?: {
        title?: string;
        core_message?: string;
        action_priorities?: string[];
        closing_words?: string;
    };
}

interface SajuResultDisplayProps {
    readingId: string;
    reportData: Record<string, unknown>;
}

const LIFE_AREA_CONFIG = [
    { key: 'career' as const, icon: '💼', label: 'Career & Purpose' },
    { key: 'wealth' as const, icon: '💰', label: 'Wealth & Resources' },
    { key: 'love' as const, icon: '♥', label: 'Love & Relationships' },
] as const;

export function SajuResultDisplay({ readingId, reportData }: SajuResultDisplayProps) {
    const [activeTab, setActiveTab] = useState<'verdict' | 'timeline' | 'areas' | 'plan'>('verdict');
    const report = reportData as SajuReport;

    const verdict = report.final_verdict;
    const summary = report.summary;
    const freeFocus = report.free_focus;
    const fortuneTimeline = report.fortune_timeline;
    const lifeAreas = report.life_areas;
    const actionPlan = report.action_plan;

    const TABS = [
        { key: 'verdict' as const, label: 'Your Verdict' },
        { key: 'timeline' as const, label: 'Destiny Cycle' },
        { key: 'areas' as const, label: 'Life Areas' },
        { key: 'plan' as const, label: 'Action Plan' },
    ];

    return (
        <div className="min-h-screen px-4 py-16 sm:px-6" style={{ background: '#050505' }}>
            {/* Ambient */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.05) 0%, transparent 60%)',
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>
                        ✦ Your Saju Destiny Reading
                    </p>
                    {summary?.title && (
                        <h1
                            className="font-serif text-2xl sm:text-3xl md:text-4xl mb-4"
                            style={{
                                color: '#E4E4E7',
                                letterSpacing: '-0.02em',
                                lineHeight: '1.3',
                            }}
                        >
                            {summary.title}
                        </h1>
                    )}
                    {summary?.content && (
                        <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#A1A1AA' }}>
                            {summary.content}
                        </p>
                    )}
                </div>

                {/* Decisive Verdict Banner */}
                {freeFocus?.action_conclusion && (
                    <div
                        className="rounded-2xl p-6 mb-8"
                        style={{
                            background: 'rgba(212,175,55,0.07)',
                            border: '1px solid rgba(212,175,55,0.25)',
                        }}
                    >
                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#D4AF37' }}>
                            ⚡ Your Decisive Verdict
                        </p>
                        <p className="text-base sm:text-lg font-semibold" style={{ color: '#E4E4E7', lineHeight: '1.6' }}>
                            {freeFocus.action_conclusion}
                        </p>
                        {freeFocus.evidence_summary && (
                            <p className="mt-3 text-sm" style={{ color: '#71717A' }}>
                                {freeFocus.evidence_summary}
                            </p>
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <div
                    className="flex gap-1 p-1 rounded-xl mb-8 overflow-x-auto scrollbar-hide"
                    style={{ background: 'rgba(18,18,20,0.8)' }}
                >
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            id={`saju-result-tab-${key}`}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className="flex-1 min-w-fit py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap"
                            style={{
                                background: activeTab === key ? 'rgba(212,175,55,0.12)' : 'transparent',
                                color: activeTab === key ? '#D4AF37' : '#71717A',
                                border: activeTab === key ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                {activeTab === 'verdict' && verdict && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {verdict.core_message && (
                            <div
                                className="rounded-2xl p-6"
                                style={{ background: 'rgba(18,18,20,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>
                                    The Oracle's Final Verdict
                                </p>
                                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#E4E4E7' }}>
                                    {verdict.core_message}
                                </p>
                            </div>
                        )}

                        {verdict.action_priorities && verdict.action_priorities.length > 0 && (
                            <div
                                className="rounded-2xl p-6"
                                style={{ background: 'rgba(18,18,20,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
                                    Action Priorities
                                </p>
                                <ul className="space-y-3">
                                    {verdict.action_priorities.map((priority, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span
                                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                                                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
                                            >
                                                {index + 1}
                                            </span>
                                            <span className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{priority}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {verdict.closing_words && (
                            <div
                                className="rounded-2xl p-6 text-center"
                                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}
                            >
                                <p className="text-sm italic leading-relaxed" style={{ color: '#A1A1AA' }}>
                                    &ldquo;{verdict.closing_words}&rdquo;
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'timeline' && fortuneTimeline && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {fortuneTimeline.major_luck && (
                            <div
                                className="rounded-2xl p-6"
                                style={{ background: 'rgba(18,18,20,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
                                    Your 10-Year Destiny Cycle (大運)
                                </p>
                                <div className="space-y-3">
                                    {fortuneTimeline.major_luck.period && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs" style={{ color: '#52525B' }}>Period</span>
                                            <span className="text-sm font-semibold" style={{ color: '#E4E4E7' }}>
                                                {fortuneTimeline.major_luck.period}
                                            </span>
                                        </div>
                                    )}
                                    {fortuneTimeline.major_luck.theme && (
                                        <p className="text-sm" style={{ color: '#A1A1AA' }}>
                                            <strong style={{ color: '#E4E4E7' }}>Theme: </strong>
                                            {fortuneTimeline.major_luck.theme}
                                        </p>
                                    )}
                                    {fortuneTimeline.major_luck.advice && (
                                        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                                            {fortuneTimeline.major_luck.advice}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(fortuneTimeline.yearly?.opportunities || fortuneTimeline.yearly?.cautions) && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {fortuneTimeline.yearly.opportunities && fortuneTimeline.yearly.opportunities.length > 0 && (
                                    <div
                                        className="rounded-2xl p-5"
                                        style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}
                                    >
                                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#22C55E' }}>
                                            Opportunities
                                        </p>
                                        <ul className="space-y-2">
                                            {fortuneTimeline.yearly.opportunities.map((item, index) => (
                                                <li key={index} className="text-xs flex gap-2" style={{ color: '#A1A1AA' }}>
                                                    <span style={{ color: '#22C55E' }}>✓</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {fortuneTimeline.yearly.cautions && fortuneTimeline.yearly.cautions.length > 0 && (
                                    <div
                                        className="rounded-2xl p-5"
                                        style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.15)' }}
                                    >
                                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#FF3B30' }}>
                                            Cautions
                                        </p>
                                        <ul className="space-y-2">
                                            {fortuneTimeline.yearly.cautions.map((item, index) => (
                                                <li key={index} className="text-xs flex gap-2" style={{ color: '#A1A1AA' }}>
                                                    <span style={{ color: '#FF3B30' }}>⚠</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'areas' && lifeAreas && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        {LIFE_AREA_CONFIG.map(({ key, icon, label }) => {
                            const area = lifeAreas[key];
                            if (!area) return null;
                            return (
                                <div
                                    key={key}
                                    className="rounded-2xl p-6"
                                    style={{ background: 'rgba(18,18,20,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
                                        {icon} {label}
                                    </p>
                                    <div className="space-y-3 text-sm" style={{ color: '#A1A1AA' }}>
                                        {('outlook' in area && area.outlook) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Outlook: </strong>{area.outlook}</p>
                                        )}
                                        {('timing' in area && area.timing) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Timing: </strong>{area.timing}</p>
                                        )}
                                        {('strategy' in area && area.strategy) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Strategy: </strong>{area.strategy}</p>
                                        )}
                                        {('flow' in area && area.flow) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Flow: </strong>{area.flow}</p>
                                        )}
                                        {('opportunity' in area && area.opportunity) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Opportunity: </strong>{area.opportunity}</p>
                                        )}
                                        {('risk' in area && area.risk) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Risk: </strong>{area.risk}</p>
                                        )}
                                        {('energy' in area && area.energy) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Energy: </strong>{area.energy}</p>
                                        )}
                                        {('meeting' in area && area.meeting) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Meeting: </strong>{area.meeting}</p>
                                        )}
                                        {('advice' in area && area.advice) && (
                                            <p><strong style={{ color: '#E4E4E7' }}>Advice: </strong>{area.advice}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'plan' && actionPlan && actionPlan.length > 0 && (
                    <div className="space-y-3 animate-in fade-in duration-500">
                        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#52525B' }}>
                            Your personalized action timeline
                        </p>
                        {actionPlan.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-4 rounded-2xl p-5"
                                style={{
                                    background: 'rgba(18,18,20,0.7)',
                                    border: `1px solid ${item.type === 'opportunity' ? 'rgba(34,197,94,0.15)' : 'rgba(255,59,48,0.15)'}`,
                                }}
                            >
                                <div className="flex-shrink-0 text-center">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                        style={{
                                            background: item.type === 'opportunity' ? 'rgba(34,197,94,0.1)' : 'rgba(255,59,48,0.1)',
                                            color: item.type === 'opportunity' ? '#22C55E' : '#FF3B30',
                                        }}
                                    >
                                        {item.type === 'opportunity' ? '✓' : '!'}
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: '#52525B' }}>{item.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold mb-1" style={{ color: '#E4E4E7' }}>{item.action}</p>
                                    <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>{item.reasoning}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Share / Archive CTA */}
                <div className="mt-12 text-center">
                    <p className="text-xs mb-4" style={{ color: '#52525B' }}>
                        Reading ID: {readingId}
                    </p>
                    <a
                        href="/en/saju"
                        className="inline-block text-sm px-6 py-2.5 rounded-full transition-colors"
                        style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
                    >
                        Get another reading ↗
                    </a>
                </div>
            </div>
        </div>
    );
}
