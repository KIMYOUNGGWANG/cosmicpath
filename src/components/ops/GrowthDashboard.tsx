'use client';

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import type { GrowthSummary } from '@/lib/growth-metrics';

interface GrowthDashboardProps {
    summary: GrowthSummary;
}

function MetricCard({
    label,
    value,
    caption,
}: {
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                {label}
            </p>
            <p className="mt-5 font-[var(--font-outfit)] text-[34px] font-semibold tracking-[-0.05em] text-white">
                {value}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/62">{caption}</p>
        </div>
    );
}

export function GrowthDashboard({ summary }: GrowthDashboardProps) {
    const metrics = [
        {
            label: 'Installs',
            value: summary.totals.installs.toLocaleString(),
            caption: '브라우저 기준 최초 유입/설치 신호입니다.',
        },
        {
            label: 'Active Users',
            value: summary.totals.activeUsers.toLocaleString(),
            caption: `${summary.dateRange.days}일 창에서 활동한 세션 수입니다.`,
        },
        {
            label: 'Paid Conversions',
            value: summary.totals.paidConversions.toLocaleString(),
            caption: '결제 완료 이벤트 기준 유료 전환 수입니다.',
        },
        {
            label: 'Retention',
            value: `${summary.rates.retentionRate}%`,
            caption: '2일 이상 재방문 세션 / install 기준 비율입니다.',
        },
    ];

    return (
        <div className="space-y-10">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        caption={metric.caption}
                    />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Daily Pulse
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                            install / active / paid conversion
                        </h2>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={summary.series}>
                                <defs>
                                    <linearGradient id="installGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7DD3FC" stopOpacity={0.38} />
                                        <stop offset="95%" stopColor="#7DD3FC" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F5C451" stopOpacity={0.32} />
                                        <stop offset="95%" stopColor="#F5C451" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(9,12,24,0.92)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 16,
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="installs" stroke="#7DD3FC" fill="url(#installGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="activeUsers" stroke="#A78BFA" fill="transparent" strokeWidth={2} />
                                <Area type="monotone" dataKey="paidConversions" stroke="#F5C451" fill="url(#paidGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Conversion Lens
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                            share / invite / conversion
                        </h2>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.series}>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(9,12,24,0.92)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 16,
                                        color: '#fff',
                                    }}
                                />
                                <Bar dataKey="shares" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="invites" fill="#C084FC" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="inviteConversions" fill="#F5C451" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                        KPI Snapshot
                    </p>
                    <div className="mt-5 space-y-4 text-sm text-white/75">
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                            <span>Landing → Checkout Start</span>
                            <strong className="text-white">{summary.rates.landingToCheckoutRate}%</strong>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                            <span>Checkout → Paid Conversion</span>
                            <strong className="text-white">{summary.rates.checkoutConversionRate}%</strong>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                            <span>Viral Coefficient Proxy</span>
                            <strong className="text-white">{summary.rates.viralCoefficientProxy}</strong>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                            <span>Returning Users</span>
                            <strong className="text-white">{summary.totals.returningUsers.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                        Top Sources
                    </p>
                    <div className="mt-5 space-y-3">
                        {summary.topSources.map((source) => (
                            <div
                                key={source.source}
                                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/75"
                            >
                                <span className="truncate">{source.source}</span>
                                <strong className="text-white">{source.count.toLocaleString()}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
