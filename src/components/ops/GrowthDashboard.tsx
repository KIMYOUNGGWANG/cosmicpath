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
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    CircleDollarSign,
    Eye,
    Gauge,
    Globe2,
    HeartHandshake,
    LockKeyhole,
    MousePointerClick,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { GrowthSummary } from '@/lib/growth-metrics';

interface GrowthDashboardProps {
    summary: GrowthSummary;
}

type CampaignFunnel = GrowthSummary['campaignFunnels'][number];
type NextMoveDecisionGate = GrowthSummary['nextMoveDecisionGate'];

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
                        지금 숫자
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

function formatSeriesLabel(dataKey?: string) {
    switch (dataKey) {
        case 'firstResultViews':
            return '무료 결과';
        case 'followupStarts':
            return '추가 질문';
        case 'dailyReturnsAfterReading':
            return '다시 방문';
        case 'paidConversions':
            return '유료 전환';
        case 'installs':
            return '새 방문';
        case 'activeUsers':
            return '활성 방문';
        default:
            return dataKey ?? '숫자';
    }
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
                            <span>{formatSeriesLabel(entry.dataKey)}</span>
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

function CampaignIcon({ campaignKey }: { campaignKey: string }) {
    switch (campaignKey) {
        case 'career-timing':
            return <BriefcaseBusiness className="h-5 w-5" />;
        case 'relationship-contact':
            return <HeartHandshake className="h-5 w-5" />;
        case 'english-contact':
            return <Globe2 className="h-5 w-5" />;
        default:
            return <Sparkles className="h-5 w-5" />;
    }
}

function getCampaignSignal(funnel: CampaignFunnel) {
    if (funnel.uniqueSessionCounts.paidConversions > 0) {
        return { label: '결제 신호 있음', className: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' };
    }

    if (funnel.uniqueSessionCounts.paywallViews > 0) {
        return { label: 'Paywall 도달', className: 'border-amber-300/25 bg-amber-300/10 text-amber-100' };
    }

    if (funnel.uniqueSessionCounts.firstResultViews > 0) {
        return { label: '결과 도달', className: 'border-sky-300/25 bg-sky-300/10 text-sky-100' };
    }

    if (funnel.uniqueSessionCounts.promptClicks > 0) {
        return { label: 'CTA 반응', className: 'border-violet-300/25 bg-violet-300/10 text-violet-100' };
    }

    return { label: '트래픽 필요', className: 'border-white/10 bg-white/[0.04] text-white/54' };
}

function CampaignStep({
    icon: Icon,
    label,
    value,
    caption,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="min-w-0 rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
            <div className="flex items-center gap-2 text-white/52">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {label}
                </span>
            </div>
            <strong className="mt-2 block font-[var(--font-outfit)] text-2xl tracking-[-0.05em] text-white">
                {value}
            </strong>
            <p className="mt-1 truncate text-xs text-white/38">{caption}</p>
        </div>
    );
}

function CampaignFunnelRow({ funnel }: { funnel: CampaignFunnel }) {
    const signal = getCampaignSignal(funnel);
    const counts = funnel.uniqueSessionCounts;
    const sourceLabel = funnel.topSources.length > 0
        ? funnel.topSources.map((source) => `${source.source} ${source.count}`).join(' · ')
        : funnel.sources.join(' · ');

    return (
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 xl:max-w-[360px]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-black/18 text-[hsl(42_79%_74%)]">
                            <CampaignIcon campaignKey={funnel.key} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate font-[var(--font-outfit)] text-xl font-semibold tracking-[-0.04em] text-white">
                                {funnel.label}
                            </h3>
                            <p className="mt-1 truncate text-sm text-white/48">{funnel.description}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${signal.className}`}>
                            {signal.label}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs text-white/52">
                            첫 캠페인 접촉 기준
                        </span>
                    </div>
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 md:grid-cols-5">
                    <CampaignStep
                        icon={Users}
                        label="sessions"
                        value={funnel.sessions.toLocaleString()}
                        caption={`landing ${counts.landingViews.toLocaleString()}`}
                    />
                    <CampaignStep
                        icon={MousePointerClick}
                        label="cta"
                        value={counts.promptClicks.toLocaleString()}
                        caption={formatPercent(funnel.rates.landingToPromptRate)}
                    />
                    <CampaignStep
                        icon={Eye}
                        label="result"
                        value={counts.firstResultViews.toLocaleString()}
                        caption={formatPercent(funnel.rates.analysisToResultRate)}
                    />
                    <CampaignStep
                        icon={LockKeyhole}
                        label="paywall"
                        value={counts.paywallViews.toLocaleString()}
                        caption={formatPercent(funnel.rates.resultToPaywallRate)}
                    />
                    <CampaignStep
                        icon={CircleDollarSign}
                        label="paid"
                        value={counts.paidConversions.toLocaleString()}
                        caption={formatPercent(funnel.rates.resultToPaidRate)}
                    />
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-white/8 pt-4 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
                <span className="truncate">source touches: {sourceLabel}</span>
                <span className="inline-flex items-center gap-2 text-white/54">
                    follow-up seed {counts.followupSeeds.toLocaleString()}
                    <ArrowRight className="h-3.5 w-3.5" />
                    checkout {counts.checkoutStarts.toLocaleString()}
                </span>
            </div>
        </div>
    );
}

function NextMoveDecisionGateCard({ gate }: { gate: NextMoveDecisionGate }) {
    const rows = [
        { label: 'visits', current: gate.current.visits, target: gate.thresholds.visits },
        { label: 'days', current: gate.current.days, target: gate.thresholds.days },
        { label: 'question starts', current: gate.current.questionStarts, target: gate.thresholds.questionStarts },
        { label: 'free verdicts', current: gate.current.freeVerdicts, target: gate.thresholds.freeVerdicts },
        { label: 'paywall opens', current: gate.current.paywallOpens, target: gate.thresholds.paywallOpens },
        { label: 'paid conversions', current: gate.current.paidConversions, target: gate.thresholds.paidConversions },
        { label: 'follow-up seeds', current: gate.current.followupSeeds, target: gate.thresholds.followupSeeds },
    ];

    return (
        <div className="rounded-[26px] border border-acc-gold/20 bg-[linear-gradient(135deg,rgba(245,196,81,0.12),rgba(255,255,255,0.035))] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-acc-gold">
                        <Gauge className="h-3.5 w-3.5" />
                        continue / revise / stop
                    </div>
                    <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        Decision Timing 14-day decision gate
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                        visits 300 or 14 days · question starts 45 · free verdicts 30 · paywall opens 8 · paid conversions 2 · follow-up seeds 8.
                        canonical source는 decision_timing_rebuild_v1이고, 관계 연락은 별도 campaign wedge로만 봅니다.
                    </p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3 text-sm text-white/70">
                    <span className="text-white/42">window</span>
                    <strong className="ml-2 text-white">{gate.current.days}d / {gate.thresholds.days}d</strong>
                </div>
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-4">
                {rows.map((row) => (
                    <div key={row.label} className="rounded-[18px] border border-white/8 bg-black/15 px-3 py-3">
                        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-white/42">{row.label}</p>
                        <strong className="mt-2 block text-xl tracking-[-0.04em] text-white">
                            {formatCompact(row.current)} / {formatCompact(row.target)}
                        </strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GrowthDashboard({ summary }: GrowthDashboardProps) {
    const trailingSeries = summary.series.slice(-7);
    const avgDailyActive = Math.round(average(summary.series.map((point) => point.activeUsers)));
    const avgTrailingDailyActive = Math.round(average(trailingSeries.map((point) => point.activeUsers)));
    const sharePerInstall = summary.totals.installs > 0
        ? (summary.totals.shares / summary.totals.installs) * 100
        : 0;
    const topSources = summary.topSources.slice(0, 4);
    const campaignFunnels = summary.campaignFunnels;
    const strongestSource = topSources[0]?.source ?? 'source pending';
    const hasPrimaryData = summary.series.some((point) =>
        point.firstResultViews > 0 ||
        point.followupStarts > 0 ||
        point.dailyReturnsAfterReading > 0 ||
        point.paidConversions > 0
    );
    const hasActivationData =
        summary.activation.firstResultViews > 0 ||
        summary.activation.followupStarts > 0 ||
        summary.activation.dailyReturnsAfterReading > 0;
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);

    const visitMetrics = [
        {
            label: '오늘 방문',
            value: summary.visits.today.toLocaleString(),
            caption: '오늘 이벤트를 남긴 방문 수입니다.',
            icon: Activity,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '최근 7일 방문',
            value: summary.visits.last7Days.toLocaleString(),
            caption: '최근 7일 안에 한 번이라도 들어온 방문 수입니다.',
            icon: CalendarDays,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '최근 30일 방문',
            value: summary.visits.last30Days.toLocaleString(),
            caption: '최근 30일 안에 한 번이라도 들어온 방문 수입니다.',
            icon: Users,
            iconClassName: 'text-blue-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '매일 오는 힘',
            value: formatPercent(summary.visits.dauMauRate),
            caption: '오늘 방문이 최근 30일 방문 안에서 차지하는 비율입니다.',
            icon: Gauge,
            iconClassName: 'text-amber-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
    ];

    const coreMetrics = [
        {
            label: '무료 결과 본 수',
            value: summary.activation.firstResultViews.toLocaleString(),
            caption: '무료 결과 첫 화면까지 실제로 도달한 횟수입니다.',
            icon: Sparkles,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '추가 질문 시작',
            value: summary.activation.followupStarts.toLocaleString(),
            caption: `첫 결과 대비 ${formatPercent(summary.activation.resultToFollowupRate)}가 추가 질문으로 이어졌습니다.`,
            icon: Activity,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '다시 돌아온 수',
            value: summary.activation.dailyReturnsAfterReading.toLocaleString(),
            caption: `첫 결과 대비 ${formatPercent(summary.activation.resultToDailyReturnRate)}가 다시 돌아왔습니다.`,
            icon: TrendingUp,
            iconClassName: 'text-blue-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '유료 전환',
            value: summary.totals.paidConversions.toLocaleString(),
            caption: `첫 결과 대비 ${formatPercent(summary.activation.resultToPaidConversionRate)}가 실제 유료 결제로 이어졌습니다.`,
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
                            한눈에 보기
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            오늘의 운영 상태를 한 번에 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            브라우저 단위 보조 신호보다 실제 오라클 코어 루프가 얼마나 이어지는지를 먼저 보이도록 정렬했습니다.
                            무료 결과, 추가 질문, 다시 방문, 유료 전환을 같은 화면에서 바로 볼 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <SignalChip label="기간" value={windowLabel} />
                        <SignalChip label="오늘 방문" value={formatCompact(summary.visits.today)} />
                        <SignalChip label="30일 방문" value={formatCompact(summary.visits.last30Days)} />
                        <SignalChip label="가장 많이 들어온 곳" value={strongestSource} />
                    </div>
                </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.1),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,196,81,0.1),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            캠페인 퍼널
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                            첫 접촉 이후 같은 세션에서 어디까지 갔는가
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-white/55">
                            관계/커리어 같은 캠페인을 source 단순 카운트가 아니라 같은 session의 후속 행동으로 묶어 봅니다.
                            질문 원문은 읽지 않고 이벤트, source, sessionId만 사용합니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        <SignalChip label="집계" value="session stitched" />
                        <SignalChip label="원문" value="미조회" />
                    </div>
                </div>

                <div className="mt-6 grid gap-3">
                    <NextMoveDecisionGateCard gate={summary.nextMoveDecisionGate} />
                    {campaignFunnels.map((funnel) => (
                        <CampaignFunnelRow key={funnel.key} funnel={funnel} />
                    ))}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {visitMetrics.map((metric) => (
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

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {coreMetrics.map((metric) => (
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
                            사용자 흐름
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <SignalChip label="무료 결과" value={formatCompact(summary.activation.firstResultViews)} />
                            <SignalChip label="추가 질문" value={formatCompact(summary.activation.followupStarts)} />
                            <SignalChip label="다시 방문" value={formatCompact(summary.activation.dailyReturnsAfterReading)} />
                            <SignalChip label="유료 전환" value={formatCompact(summary.totals.paidConversions)} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        무료 결과 / 추가 질문 / 다시 방문 / 결제
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        사용자가 실제로 어디까지 이어지는지 같은 흐름으로 봅니다. 방문 수보다 결과 이후 행동을 먼저 보기 좋게 만든 차트입니다.
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
                                        <Line type="monotone" dataKey="firstResultViews" stroke="#7DD3FC" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="followupStarts" stroke="#C4B5FD" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="dailyReturnsAfterReading" stroke="#60A5FA" strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} />
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
                                    아직 보여줄 흐름이 많지 않습니다
                                </h3>
                                <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
                                    무료 결과, 추가 질문, 다시 방문, 결제 데이터가 쌓이면 여기서 흐름이 보이기 시작합니다.
                                    지금은 계측은 켜져 있지만 아직 숫자가 많지 않은 상태입니다.
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
                                    참고 숫자
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    보조로 보는 숫자
                                </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-[hsl(42_79%_74%)]">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <InsightRow
                                label="새 방문 신호"
                                value={summary.totals.installs.toLocaleString()}
                                caption="새 브라우저로 들어온 방문 신호입니다."
                            />
                            <InsightRow
                                label="하루 평균 방문"
                                value={`${avgDailyActive.toLocaleString()} · 최근 7일 ${avgTrailingDailyActive.toLocaleString()}`}
                                caption="하루에 보통 얼마나 들어오는지 보는 숫자입니다."
                            />
                            <InsightRow
                                label="공유 수"
                                value={`${summary.totals.shares.toLocaleString()} · ${formatPercent(sharePerInstall)}`}
                                caption="새 방문 대비 얼마나 공유가 붙는지 보는 숫자입니다."
                            />
                            <InsightRow
                                label="다시 온 방문"
                                value={`${summary.totals.returningUsers.toLocaleString()} · ${formatPercent(summary.rates.retentionRate)}`}
                                caption="2일 이상 다시 잡힌 방문 수와 비율입니다."
                            />
                            <InsightRow
                                label="결제 전환율"
                                value={formatPercent(summary.rates.checkoutConversionRate)}
                                caption="결제 시작 대비 실제 유료 결제 완료 비율입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    결과 본 뒤 흐름
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    결과를 본 뒤 정말 이어졌는가
                                </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-sky-200">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <InsightRow
                                label="무료 결과 본 수"
                                value={summary.activation.firstResultViews.toLocaleString()}
                                caption="무료 결과 첫 화면까지 실제로 도달한 횟수입니다."
                            />
                            <InsightRow
                                label="추가 질문 시작"
                                value={`${summary.activation.followupStarts.toLocaleString()} · ${formatPercent(summary.activation.resultToFollowupRate)}`}
                                caption="첫 결과를 본 뒤 실제로 질문을 더 한 수와 비율입니다."
                            />
                            <InsightRow
                                label="다시 돌아온 수"
                                value={`${summary.activation.dailyReturnsAfterReading.toLocaleString()} · ${formatPercent(summary.activation.resultToDailyReturnRate)}`}
                                caption="최근 리딩을 본 사용자가 다시 돌아온 수와 비율입니다."
                            />
                            <InsightRow
                                label="유료 전환"
                                value={`${summary.totals.paidConversions.toLocaleString()} · ${formatPercent(summary.activation.resultToPaidConversionRate)}`}
                                caption="첫 결과를 본 뒤 실제 유료 결제로 이어진 수와 전환율입니다."
                            />
                        </div>

                        {!hasActivationData ? (
                            <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/45">
                                아직 이 흐름 데이터가 많지 않습니다. `/start` 결과 진입, 추가 질문, 다시 방문이 쌓이면 여기서 흐름이 보이기 시작합니다.
                            </div>
                        ) : null}
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                    유입 경로
                                </p>
                                <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                    어디에서 많이 들어오는지
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
                                        <p className="text-xs text-white/42">들어온 수</p>
                                    </div>
                                    <strong className="font-[var(--font-outfit)] text-lg tracking-[-0.04em] text-white">
                                        {source.count.toLocaleString()}
                                    </strong>
                                </div>
                            )) : (
                                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/45">
                                    아직 유입 경로 데이터가 많지 않습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
