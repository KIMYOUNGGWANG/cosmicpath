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
    Activity,
    CircleDollarSign,
    Compass,
    Share2,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { GrowthSummary } from '@/lib/growth-metrics';

interface GrowthDashboardProps {
    summary: GrowthSummary;
}

function MetricCard({
    label,
    value,
    caption,
    icon: Icon,
    iconClassName,
    surfaceClassName,
}: {
    label: string;
    value: string;
    caption: string;
    icon: LucideIcon;
    iconClassName: string;
    surfaceClassName: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-[30px] border border-white/10 p-6 shadow-[0_22px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl ${surfaceClassName}`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                        Signal
                    </p>
                    <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.24em] text-white/54">
                        {label}
                    </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-black/15 ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-8">
                <p className="font-[var(--font-outfit)] text-[38px] font-semibold tracking-[-0.06em] text-white sm:text-[42px]">
                    {value}
                </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                <p className="text-sm leading-7 text-white/62">{caption}</p>
            </div>
        </div>
    );
}

function InsightRow({
    label,
    value,
    caption,
}: {
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/70">{label}</span>
                <strong className="text-sm text-white">{value}</strong>
            </div>
            <p className="mt-2 text-xs leading-6 text-white/45">{caption}</p>
        </div>
    );
}

function formatPercent(value: number) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function formatCompact(value: number) {
    return new Intl.NumberFormat('ko-KR', {
        notation: 'compact',
        maximumFractionDigits: value >= 1000 ? 1 : 0,
    }).format(value);
}

function formatWindowLabel(from: string, to: string) {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
    });

    return `${formatter.format(new Date(from))} - ${formatter.format(new Date(to))}`;
}

function average(values: number[]) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
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

function SignalChip({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
            <span className="text-white/44">{label}</span>
            <strong className="ml-2 font-medium text-white">{value}</strong>
        </div>
    );
}

export function GrowthDashboard({ summary }: GrowthDashboardProps) {
    const latestPoint = summary.series.at(-1);
    const trailingSeries = summary.series.slice(-7);
    const avgDailyActive = Math.round(average(summary.series.map((point) => point.activeUsers)));
    const avgTrailingDailyActive = Math.round(average(trailingSeries.map((point) => point.activeUsers)));
    const sharePerInstall = summary.totals.installs > 0
        ? (summary.totals.shares / summary.totals.installs) * 100
        : 0;
    const paidPerInstall = summary.totals.installs > 0
        ? (summary.totals.paidConversions / summary.totals.installs) * 100
        : 0;
    const topSources = summary.topSources.slice(0, 4);
    const latestPulse = latestPoint
        ? latestPoint.installs + latestPoint.activeUsers + latestPoint.shares + latestPoint.paidConversions
        : 0;
    const strongestSource = topSources[0]?.source ?? 'source pending';
    const hasPrimaryData = summary.series.some((point) =>
        point.installs > 0 ||
        point.activeUsers > 0 ||
        point.shares > 0 ||
        point.paidConversions > 0
    );
    const hasActivationData =
        summary.activation.firstResultViews > 0 ||
        summary.activation.followupStarts > 0 ||
        summary.activation.dailyReturnsAfterReading > 0;
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);

    const metrics = [
        {
            label: 'Installs',
            value: summary.totals.installs.toLocaleString(),
            caption: `${summary.dateRange.days}일 누적 신규 유입입니다.`,
            icon: Compass,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Daily Active',
            value: avgDailyActive.toLocaleString(),
            caption: `일평균 활성 세션입니다. 최근 7일 평균은 ${avgTrailingDailyActive.toLocaleString()}입니다.`,
            icon: Activity,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Shares',
            value: summary.totals.shares.toLocaleString(),
            caption: `공유 이벤트 누적입니다. install 대비 ${formatPercent(sharePerInstall)}입니다.`,
            icon: Share2,
            iconClassName: 'text-blue-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Paid Conversions',
            value: summary.totals.paidConversions.toLocaleString(),
            caption: `결제 완료 누적입니다. install 대비 ${formatPercent(paidPerInstall)}입니다.`,
            icon: CircleDollarSign,
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
                            Signal Deck
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            오늘의 운영 상태를 한 번에 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            핵심 4지표와 마지막 펄스, 강한 유입원을 같은 시야 안에 두었습니다.
                            세부 퍼널을 뒤지기 전에 지금 무엇이 움직이고 있는지 먼저 읽도록 정렬했습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <SignalChip label="Window" value={windowLabel} />
                        <SignalChip label="Latest Pulse" value={formatCompact(latestPulse)} />
                        <SignalChip label="Strongest Source" value={strongestSource} />
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricCard
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

            <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] sm:p-7">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Core Pulse
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <SignalChip label="installs" value={formatCompact(summary.totals.installs)} />
                            <SignalChip label="active" value={formatCompact(avgDailyActive)} />
                            <SignalChip label="shares" value={formatCompact(summary.totals.shares)} />
                            <SignalChip label="paid" value={formatCompact(summary.totals.paidConversions)} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        install / daily active / share / paid conversion
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        운영 판단에 직접 쓰는 4개 신호만 같은 축에서 봅니다. 데이터가 조용한 날도 빈 화면 대신 현재 상태를 설명해주는 패널이 먼저 뜹니다.
                    </p>

                    <div className="mt-6 rounded-[28px] border border-white/8 bg-black/15 p-4">
                        {hasPrimaryData ? (
                            <div className="h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={summary.series} margin={{ left: -12, right: 12, top: 8, bottom: 0 }}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={44}
                                        />
                                        <Tooltip content={<TooltipCard />} />
                                        <Line type="monotone" dataKey="installs" stroke="#7DD3FC" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="activeUsers" stroke="#C4B5FD" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="shares" stroke="#60A5FA" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="paidConversions" stroke="#F5C451" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[hsl(42_79%_74%)]">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    아직 수집된 코어 펄스가 없습니다
                                </h3>
                                <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
                                    install, daily active, share, paid conversion 이벤트가 쌓이기 시작하면 여기서 추세가 바로 보입니다.
                                    지금은 계측은 살아 있지만 관찰 구간이 조용한 상태입니다.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.1),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    Operator Notes
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    지금 읽어야 할 보조 신호
                                </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-[hsl(42_79%_74%)]">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <InsightRow
                                label="Latest Daily Active"
                                value={latestPoint ? latestPoint.activeUsers.toLocaleString() : '0'}
                                caption="마지막 집계일 기준 활성 세션입니다."
                            />
                            <InsightRow
                                label="Retention"
                                value={formatPercent(summary.rates.retentionRate)}
                                caption="2일 이상 재방문한 세션 비율입니다."
                            />
                            <InsightRow
                                label="Checkout Conversion"
                                value={formatPercent(summary.rates.checkoutConversionRate)}
                                caption="체크아웃 시작 대비 실제 결제 완료 비율입니다."
                            />
                            <InsightRow
                                label="Share to Paid Gap"
                                value={formatPercent(Math.max(0, sharePerInstall - paidPerInstall))}
                                caption="공유량 대비 결제 전환까지 남아 있는 격차를 빠르게 읽기 위한 보조값입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    Activation Loop
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    첫 결과 이후 실제로 이어지는가
                                </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-sky-200">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <InsightRow
                                label="First Result Views"
                                value={summary.activation.firstResultViews.toLocaleString()}
                                caption="무료 결과 첫 화면까지 실제로 도달한 횟수입니다."
                            />
                            <InsightRow
                                label="Follow-up Starts"
                                value={`${summary.activation.followupStarts.toLocaleString()} · ${formatPercent(summary.activation.resultToFollowupRate)}`}
                                caption="첫 결과를 본 뒤 추가 질문으로 이어진 시작 수와 전환율입니다."
                            />
                            <InsightRow
                                label="Daily Returns"
                                value={`${summary.activation.dailyReturnsAfterReading.toLocaleString()} · ${formatPercent(summary.activation.resultToDailyReturnRate)}`}
                                caption="최근 리딩을 가진 사용자가 /daily로 다시 돌아온 연결 수와 전환율입니다."
                            />
                        </div>

                        {!hasActivationData ? (
                            <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/45">
                                아직 activation 신호가 누적되지 않았습니다. `/start` 결과 진입, 첫 follow-up, linked daily 복귀가 쌓이면 이 패널이 살아납니다.
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    Top Sources
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    어디에서 펄스가 들어오는지
                                </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-sky-200">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {topSources.length > 0 ? topSources.map((source) => (
                                <div
                                    key={source.source}
                                    className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/75"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-white">{source.source}</p>
                                        <p className="text-xs text-white/42">channel volume</p>
                                    </div>
                                    <strong className="font-[var(--font-outfit)] text-lg tracking-[-0.04em] text-white">
                                        {source.count.toLocaleString()}
                                    </strong>
                                </div>
                            )) : (
                                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/45">
                                    아직 source 데이터가 충분하지 않습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
