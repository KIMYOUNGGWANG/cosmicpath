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
    AlertTriangle,
    Radar,
    ShieldAlert,
    Siren,
} from 'lucide-react';

import type { TrustOpsSummary } from '@/lib/ops-metrics';
import {
    formatDateTime,
    formatPercent,
    formatWindowLabel,
    OpsEmptyState,
    OpsInsightRow,
    OpsMetricCard,
    OpsSignalChip,
} from '@/components/ops/OpsDashboardPrimitives';

interface TrustOpsDashboardProps {
    summary: TrustOpsSummary;
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

function SeverityBadge({
    severity,
    children,
}: {
    severity: string;
    children: string;
}) {
    const className = severity === 'critical'
        ? 'border-rose-300/18 bg-rose-300/10 text-rose-100'
        : 'border-amber-300/18 bg-amber-300/10 text-amber-100';

    return (
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}>
            {children}
        </span>
    );
}

export function TrustOpsDashboard({ summary }: TrustOpsDashboardProps) {
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);
    const hasSeries = summary.series.some((point) =>
        point.alerts > 0 ||
        point.failedJobs > 0 ||
        point.pendingJobs > 0
    );

    const metrics = [
        {
            label: 'Open Alerts',
            value: summary.totals.openAlerts.toLocaleString(),
            caption: '운영자가 아직 닫지 않은 현재 open alert 수입니다.',
            icon: ShieldAlert,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Critical Alerts',
            value: summary.totals.criticalOpenAlerts.toLocaleString(),
            caption: '즉시 확인이 필요한 critical open alert 수입니다.',
            icon: Siren,
            iconClassName: 'text-rose-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Due Pending Jobs',
            value: summary.totals.duePendingJobs.toLocaleString(),
            caption: '이미 실행 시점이 지난 follow-up pending job 수입니다.',
            icon: Radar,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Failed Job Rate',
            value: formatPercent(summary.totals.failedJobRate),
            caption: `${summary.totals.failedJobs.toLocaleString()} failed / ${summary.totals.sentJobs.toLocaleString()} sent`,
            icon: AlertTriangle,
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
                            Trust Command
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            인시던트와 follow-up 실패를 같이 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            Stripe webhook, reconcile, drip runner, follow-up runner가 남긴 신호를 한 곳에 모았습니다.
                            알림과 job 실패를 분리해서 보되, 운영 우선순위는 같은 시야에서 판단할 수 있게 구성했습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="Window" value={windowLabel} />
                        <OpsSignalChip label="Open" value={summary.totals.openAlerts.toLocaleString()} />
                        <OpsSignalChip label="Critical" value={summary.totals.criticalOpenAlerts.toLocaleString()} />
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
                            Incident Timeline
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="alerts" value={summary.totals.openAlerts.toLocaleString()} />
                            <OpsSignalChip label="failed jobs" value={summary.totals.failedJobs.toLocaleString()} />
                            <OpsSignalChip label="pending due" value={summary.totals.duePendingJobs.toLocaleString()} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        alerts / critical alerts / failed jobs / pending jobs
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        이 차트는 알림이 늘어나는 날과 follow-up delivery가 흔들리는 날을 같은 축에서 보여줍니다.
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
                                        <Line type="monotone" dataKey="alerts" stroke="#7DD3FC" strokeWidth={2.75} dot={false} />
                                        <Line type="monotone" dataKey="criticalAlerts" stroke="#FB7185" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="failedJobs" stroke="#F5C451" strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="pendingJobs" stroke="#C4B5FD" strokeWidth={2.3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <OpsEmptyState
                                title="아직 incident 데이터가 적습니다"
                                description="ops alert나 follow-up job 상태 변화가 쌓이면 이상 징후를 이 패널에서 바로 읽을 수 있습니다."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Alert Sources
                        </p>
                        <div className="mt-5 space-y-3">
                            {summary.alertsBySource.map((source) => (
                                <OpsInsightRow
                                    key={source.label}
                                    label={source.label}
                                    value={source.count.toLocaleString()}
                                    caption="최근 window 안에서 감지된 alert source volume 입니다."
                                />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Job Stage Mix
                        </p>
                        <div className="mt-4 h-[260px] rounded-[24px] border border-white/8 bg-black/15 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.jobsByStage}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#C4B5FD" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Open Alerts
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                아직 닫히지 않은 이슈
                            </h3>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {summary.openAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-white/74"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-white">{alert.title}</p>
                                        <p className="mt-1 text-xs text-white/42">{alert.source} · {formatDateTime(alert.lastSeenAt)}</p>
                                    </div>
                                    <SeverityBadge severity={alert.severity}>
                                        {alert.severity}
                                    </SeverityBadge>
                                </div>
                                <p className="mt-3 leading-7 text-white/58">{alert.message}</p>
                                <p className="mt-2 text-xs text-white/42">occurrence {alert.occurrenceCount} · status {alert.status}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                Failed Follow-ups
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                최근 실패 job
                            </h3>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {summary.failedJobs.map((job) => (
                            <div
                                key={job.id}
                                className="rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-white/74"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-white">{job.stage}</p>
                                        <p className="mt-1 text-xs text-white/42">{job.readingId} · {formatDateTime(job.scheduledFor)}</p>
                                    </div>
                                    <SeverityBadge severity="warning">
                                        {job.status}
                                    </SeverityBadge>
                                </div>
                                <p className="mt-3 leading-7 text-white/58">{job.lastError || 'No error message saved.'}</p>
                                <p className="mt-2 text-xs text-white/42">attempts {job.attempts}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
