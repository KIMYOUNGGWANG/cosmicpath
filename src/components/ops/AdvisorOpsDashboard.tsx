'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Compass,
    Crown,
    Sparkles,
    Target,
} from 'lucide-react';

import type { AdvisorOpsSummary } from '@/lib/ops-metrics';
import {
    formatPercent,
    formatWindowLabel,
    OpsEmptyState,
    OpsInsightRow,
    OpsMetricCard,
    OpsSignalChip,
} from '@/components/ops/OpsDashboardPrimitives';

interface AdvisorOpsDashboardProps {
    summary: AdvisorOpsSummary;
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

export function AdvisorOpsDashboard({ summary }: AdvisorOpsDashboardProps) {
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);
    const hasSeries = summary.series.some((point) => point.readings > 0);
    const overallFollowupRate = summary.totals.readings > 0
        ? (summary.totals.followupReadings / summary.totals.readings) * 100
        : 0;
    const overallPaidRate = summary.totals.readings > 0
        ? (summary.totals.paidReadings / summary.totals.readings) * 100
        : 0;
    const manualShare = summary.totals.readings > 0
        ? (summary.totals.manualSelections / summary.totals.readings) * 100
        : 0;
    const topIntent = summary.intentRows[0]?.label ?? 'general';
    const topAdvisor = summary.advisorRows[0]?.label ?? 'advisor pending';

    const metrics = [
        {
            label: 'Reads by Intent',
            value: summary.totals.readings.toLocaleString(),
            caption: '의도 라우팅이 실제로 발생한 reading 볼륨입니다.',
            icon: Compass,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Manual Share',
            value: formatPercent(manualShare),
            caption: `${summary.totals.manualSelections.toLocaleString()} manual / ${summary.totals.autoSelections.toLocaleString()} auto`,
            icon: Target,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Follow-up Rate',
            value: formatPercent(overallFollowupRate),
            caption: `${summary.totals.followupReadings.toLocaleString()} reading이 follow-up으로 이어졌습니다.`,
            icon: Sparkles,
            iconClassName: 'text-blue-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Paid Rate',
            value: formatPercent(overallPaidRate),
            caption: `${summary.totals.paidReadings.toLocaleString()} reading이 premium으로 이어졌습니다.`,
            icon: Crown,
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
                            Advisor Command
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            어떤 질문 의도와 상담가가 실제 전환을 만드는지 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            intent routing과 advisor assignment를 운영 관점에서 봅니다.
                            단순 볼륨이 아니라 follow-up, daily return, paid outcome까지 함께 비교할 수 있도록 묶었습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="Window" value={windowLabel} />
                        <OpsSignalChip label="Top Intent" value={topIntent} />
                        <OpsSignalChip label="Top Advisor" value={topAdvisor} />
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

            <section className="grid gap-6 xl:grid-cols-[1.45fr_1.05fr]">
                <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] sm:p-7">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Intent Timeline
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="reads" value={summary.totals.readings.toLocaleString()} />
                            <OpsSignalChip label="manual" value={summary.totals.manualSelections.toLocaleString()} />
                            <OpsSignalChip label="paid" value={summary.totals.paidReadings.toLocaleString()} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        readings / manual selections / follow-ups / paid
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        reading 생성량만 보는 대신 실제로 이어지는 manual 선택과 paid outcome을 한 번에 비교합니다.
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
                                        <Line type="monotone" dataKey="manualSelections" stroke="#C4B5FD" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="followups" stroke="#60A5FA" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="paidReadings" stroke="#F5C451" strokeWidth={2.4} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <OpsEmptyState
                                title="아직 advisor 데이터가 충분하지 않습니다"
                                description="intent와 advisor metadata가 누적되면 어떤 질문이 실제 전환을 만드는지 이 패널에서 읽을 수 있습니다."
                            />
                        )}
                    </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Intent Conversion
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                의도별 follow-up / paid
                            </h3>
                        </div>
                    </div>

                    <div className="h-[340px] rounded-[24px] border border-white/8 bg-black/15 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.intentRows}>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                                <Tooltip />
                                <Bar dataKey="followupRate" fill="#7DD3FC" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="paidRate" fill="#F5C451" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Intent Table
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                intent breakdown
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {summary.intentRows.map((row) => (
                            <OpsInsightRow
                                key={row.key}
                                label={row.label}
                                value={`${row.readings.toLocaleString()} reads · ${formatPercent(row.paidRate)}`}
                                caption={`follow-up ${formatPercent(row.followupRate)} · manual ${formatPercent(row.manualShare)}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Advisor Table
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                advisor breakdown
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {summary.advisorRows.map((row) => (
                            <OpsInsightRow
                                key={row.key}
                                label={row.label}
                                value={`${row.readings.toLocaleString()} reads · ${formatPercent(row.paidRate)}`}
                                caption={`follow-up ${formatPercent(row.followupRate)} · manual ${formatPercent(row.manualShare)}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
