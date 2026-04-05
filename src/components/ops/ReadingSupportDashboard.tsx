'use client';

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    LifeBuoy,
    LockKeyhole,
    MessageSquareText,
    ShieldAlert,
} from 'lucide-react';

import type { ReadingSupportSummary } from '@/lib/ops-metrics';
import {
    formatDateTime,
    formatWindowLabel,
    OpsEmptyState,
    OpsInsightRow,
    OpsMetricCard,
    OpsSignalChip,
} from '@/components/ops/OpsDashboardPrimitives';

interface ReadingSupportDashboardProps {
    summary: ReadingSupportSummary;
}

function TooltipCard({
    active,
    label,
    payload,
}: {
    active?: boolean;
    label?: string;
    payload?: Array<{
        color?: string;
        dataKey?: string;
        value?: number | string;
    }>;
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="min-w-[196px] rounded-[20px] border border-white/10 bg-[rgba(8,12,24,0.94)] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                {label}
            </p>
            <div className="mt-4 space-y-2.5">
                {payload.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2 text-white/72">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.dataKey}</span>
                        </div>
                        <strong className="text-white">
                            {typeof entry.value === 'number'
                                ? entry.value.toLocaleString()
                                : entry.value}
                        </strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RiskBadge({ label }: { label: string }) {
    return (
        <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">
            {label}
        </span>
    );
}

export function ReadingSupportDashboard({ summary }: ReadingSupportDashboardProps) {
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);
    const hasSeries = summary.series.some((point) => point.readings > 0);
    const activeList = summary.searchResults.length > 0 ? summary.searchResults : summary.recentReadings;

    const metrics = [
        {
            label: 'Readings',
            value: summary.totals.readings.toLocaleString(),
            caption: '최근 기간 동안 생성된 reading 수입니다.',
            icon: LifeBuoy,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Anonymous Reads',
            value: summary.totals.anonymousReadings.toLocaleString(),
            caption: 'access key와 owner proof가 중요한 익명 리딩 수입니다.',
            icon: LockKeyhole,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Premium Reads',
            value: summary.totals.premiumReadings.toLocaleString(),
            caption: `${summary.totals.premiumWithoutPaymentRecord.toLocaleString()}건은 결제 proof 확인이 필요합니다.`,
            icon: MessageSquareText,
            iconClassName: 'text-emerald-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.2),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Support Risks',
            value: summary.totals.supportRiskReadings.toLocaleString(),
            caption: `${summary.totals.missingAccessKeys.toLocaleString()}건은 access key가 비어 있습니다.`,
            icon: ShieldAlert,
            iconClassName: 'text-amber-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
    ];

    return (
        <div className="space-y-10">
            <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Support Command
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            리딩 무결성과 지원 리스크를 함께 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            익명 리딩 ownership, premium proof, follow-up 준비 상태를 한 화면에서 봅니다.
                            검색은 readingId, userId, email 일부 문자열 기준으로 바로 확인할 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="Window" value={windowLabel} />
                        <OpsSignalChip label="Chat Ready" value={summary.totals.chatReadyReadings.toLocaleString()} />
                        <OpsSignalChip label="Lookup" value={summary.searchQuery ?? 'recent mode'} />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <OpsMetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        caption={metric.caption}
                        icon={metric.icon}
                        iconClassName={metric.iconClassName}
                        surfaceClassName={metric.surfaceClassName}
                    />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] sm:p-7">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Reading Integrity
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="anonymous" value={summary.totals.anonymousReadings.toLocaleString()} />
                            <OpsSignalChip label="premium" value={summary.totals.premiumReadings.toLocaleString()} />
                            <OpsSignalChip label="risks" value={summary.totals.supportRiskReadings.toLocaleString()} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        reading volume / anonymous / premium / support risk
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        신규 리딩이 어떤 형태로 쌓이는지, ownership과 premium 정합성 리스크가 언제 늘어나는지를 같이 읽습니다.
                    </p>

                    <div className="mt-6 rounded-[28px] border border-white/8 bg-black/15 p-4">
                        {hasSeries ? (
                            <div className="h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={summary.series} margin={{ left: -12, right: 12, top: 8, bottom: 0 }}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                                        <Tooltip content={<TooltipCard />} />
                                        <Line type="monotone" dataKey="readings" stroke="#7DD3FC" strokeWidth={2.75} dot={false} />
                                        <Line type="monotone" dataKey="anonymousReadings" stroke="#C4B5FD" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="premiumReadings" stroke="#6EE7B7" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="supportRiskReadings" stroke="#F5C451" strokeWidth={2.4} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <OpsEmptyState
                                title="아직 리딩 흐름이 충분하지 않습니다"
                                description="recent reading이 쌓이면 ownership 리스크와 premium mismatch 추이가 여기서 보이기 시작합니다."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Support Notes
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="Missing Access Keys"
                                value={summary.totals.missingAccessKeys.toLocaleString()}
                                caption="익명 리딩인데 owner access key가 비어 있는 케이스입니다."
                            />
                            <OpsInsightRow
                                label="Premium Without Proof"
                                value={summary.totals.premiumWithoutPaymentRecord.toLocaleString()}
                                caption="premium이지만 payment record 또는 promo proof를 못 찾은 케이스입니다."
                            />
                            <OpsInsightRow
                                label="Chat Ready"
                                value={summary.totals.chatReadyReadings.toLocaleString()}
                                caption="chat session이 이미 생성되어 follow-up 상태 확인이 쉬운 리딩 수입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Lookup
                        </p>
                        <form action="/ops/readings" method="GET" className="mt-5 space-y-3">
                            <input
                                type="text"
                                name="q"
                                defaultValue={summary.searchQuery ?? ''}
                                placeholder="reading id / user id / email"
                                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[hsl(42_79%_74%/0.4)]"
                            />
                            <button
                                type="submit"
                                className="rounded-full border border-[hsl(42_79%_74%/0.34)] bg-[hsl(42_79%_74%/0.12)] px-4 py-2.5 text-sm font-medium text-[hsl(42_79%_74%)] transition-transform duration-300 hover:-translate-y-0.5"
                            >
                                Search Support Record
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Support Queue
                        </p>
                        <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                            {summary.searchQuery ? '검색 결과' : '최근 리딩 상태'}
                        </h3>
                    </div>
                </div>

                <div className="grid gap-3">
                    {activeList.map((reading) => (
                        <div
                            key={reading.id}
                            className="grid gap-3 rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-white/74 md:grid-cols-[1fr_0.85fr_0.9fr_1.1fr]"
                        >
                            <div>
                                <p className="font-medium text-white">{reading.userEmail || reading.ownerLabel}</p>
                                <p className="mt-1 text-xs text-white/42">{reading.id}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">{reading.questionIntent}</p>
                                <p className="mt-1 text-xs text-white/42">{reading.advisorName} · {reading.selectionMode}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {reading.isPremium ? 'premium' : 'free'}
                                </p>
                                <p className="mt-1 text-xs text-white/42">
                                    {reading.hasAccessKey ? 'access key ok' : 'access key missing'}
                                    {reading.credits !== null ? ` · credits ${reading.credits}` : ''}
                                </p>
                            </div>
                            <div className="space-y-2 md:text-right">
                                <p className="text-xs text-white/42">{formatDateTime(reading.createdAt)}</p>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    {reading.supportRiskFlags.length > 0 ? (
                                        reading.supportRiskFlags.map((risk) => (
                                            <RiskBadge key={risk} label={risk} />
                                        ))
                                    ) : (
                                        <span className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                                            healthy
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
