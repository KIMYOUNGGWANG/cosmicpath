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

function formatIntentLabel(intent: string) {
    switch (intent) {
        case 'general':
            return '전체';
        case 'compatibility':
            return '궁합';
        case 'reunion':
            return '재회';
        case 'wealth':
            return '재물';
        case 'timing':
            return '타이밍';
        case 'career':
            return '커리어';
        case 'business':
            return '사업';
        default:
            return intent;
    }
}

function formatSelectionModeLabel(mode: 'auto' | 'manual') {
    return mode === 'manual' ? '직접 선택' : '자동 추천';
}

function formatRiskLabel(label: string) {
    switch (label) {
        case 'anonymous without access key':
            return '익명 리딩인데 주인 확인 키 없음';
        case 'premium without payment proof':
            return '유료인데 결제 기록 없음';
        case 'premium without source trace':
            return '유료인데 결제 경로 기록 없음';
        default:
            return label;
    }
}

function formatSeriesLabel(label: string | undefined) {
    switch (label) {
        case 'readings':
            return '리딩';
        case 'anonymousReadings':
            return '로그인 없이 만든 리딩';
        case 'premiumReadings':
            return '유료 리딩';
        case 'supportRiskReadings':
            return '확인 필요한 리딩';
        default:
            return label ?? '숫자';
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
            label: '리딩 수',
            value: summary.totals.readings.toLocaleString(),
            caption: '최근 기간에 만들어진 리딩 수입니다.',
            icon: LifeBuoy,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '로그인 없이 만든 리딩',
            value: summary.totals.anonymousReadings.toLocaleString(),
            caption: '주인 확인용 키가 중요한 익명 리딩 수입니다.',
            icon: LockKeyhole,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '유료 리딩',
            value: summary.totals.premiumReadings.toLocaleString(),
            caption: `${summary.totals.premiumWithoutPaymentRecord.toLocaleString()}건은 결제 기록 확인이 필요합니다.`,
            icon: MessageSquareText,
            iconClassName: 'text-emerald-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.2),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '확인 필요한 리딩',
            value: summary.totals.supportRiskReadings.toLocaleString(),
            caption: `${summary.totals.missingAccessKeys.toLocaleString()}건은 주인 확인 키가 비어 있습니다.`,
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
                            리딩 확인
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            리딩 문제를 찾는 화면
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            리딩 주인 확인, 유료 상태, 추가 질문 준비 상태를 한 화면에서 봅니다.
                            리딩 ID, 유저 ID, 이메일 일부로 바로 찾을 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="기간" value={windowLabel} />
                        <OpsSignalChip label="채팅 가능한 리딩" value={summary.totals.chatReadyReadings.toLocaleString()} />
                        <OpsSignalChip label="검색 상태" value={summary.searchQuery ?? '최근 리딩 보기'} />
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
                            리딩 흐름
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="익명 리딩" value={summary.totals.anonymousReadings.toLocaleString()} />
                            <OpsSignalChip label="유료 리딩" value={summary.totals.premiumReadings.toLocaleString()} />
                            <OpsSignalChip label="확인 필요" value={summary.totals.supportRiskReadings.toLocaleString()} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        리딩 / 익명 / 유료 / 확인 필요
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        리딩이 어떤 형태로 쌓이는지, 주인 확인 문제나 유료 처리 문제가 언제 늘어나는지 같이 봅니다.
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
                                description="리딩이 더 쌓이면 주인 확인 문제와 유료 처리 문제 흐름이 여기서 보입니다."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            바로 볼 숫자
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="주인 확인 키 없음"
                                value={summary.totals.missingAccessKeys.toLocaleString()}
                                caption="익명 리딩인데 주인 확인 키가 비어 있는 경우입니다."
                            />
                            <OpsInsightRow
                                label="결제 기록 없는 유료 리딩"
                                value={summary.totals.premiumWithoutPaymentRecord.toLocaleString()}
                                caption="유료 상태인데 결제 기록을 찾지 못한 경우입니다."
                            />
                            <OpsInsightRow
                                label="채팅 가능한 리딩"
                                value={summary.totals.chatReadyReadings.toLocaleString()}
                                caption="이미 채팅이 열려 있어서 상태를 보기 쉬운 리딩 수입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            찾기
                        </p>
                        <form action="/ops/readings" method="GET" className="mt-5 space-y-3">
                            <input
                                type="text"
                                name="q"
                                defaultValue={summary.searchQuery ?? ''}
                                placeholder="리딩 ID / 유저 ID / 이메일"
                                className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[hsl(42_79%_74%/0.4)]"
                            />
                            <button
                                type="submit"
                                className="rounded-full border border-[hsl(42_79%_74%/0.34)] bg-[hsl(42_79%_74%/0.12)] px-4 py-2.5 text-sm font-medium text-[hsl(42_79%_74%)] transition-transform duration-300 hover:-translate-y-0.5"
                            >
                                리딩 찾기
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            리딩 목록
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
                                <p className="font-medium text-white">{formatIntentLabel(reading.questionIntent)}</p>
                                <p className="mt-1 text-xs text-white/42">{reading.advisorName} · {formatSelectionModeLabel(reading.selectionMode)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {reading.isPremium ? '유료' : '무료'}
                                </p>
                                <p className="mt-1 text-xs text-white/42">
                                    {reading.hasAccessKey ? '주인 확인 키 있음' : '주인 확인 키 없음'}
                                    {reading.credits !== null ? ` · 크레딧 ${reading.credits}` : ''}
                                </p>
                            </div>
                            <div className="space-y-2 md:text-right">
                                <p className="text-xs text-white/42">{formatDateTime(reading.createdAt)}</p>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    {reading.supportRiskFlags.length > 0 ? (
                                        reading.supportRiskFlags.map((risk) => (
                                            <RiskBadge key={risk} label={formatRiskLabel(risk)} />
                                        ))
                                    ) : (
                                        <span className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                                            정상
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
