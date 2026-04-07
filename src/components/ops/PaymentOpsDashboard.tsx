'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    CircleDollarSign,
    CreditCard,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';

import type { PaymentOpsSummary } from '@/lib/ops-metrics';
import {
    formatDateTime,
    formatPercent,
    formatUsdFromCents,
    formatWindowLabel,
    OpsEmptyState,
    OpsInsightRow,
    OpsMetricCard,
    OpsSignalChip,
} from '@/components/ops/OpsDashboardPrimitives';

interface PaymentOpsDashboardProps {
    summary: PaymentOpsSummary;
}

function formatPaymentTypeLabel(type: string) {
    switch (type) {
        case 'premium_reading':
            return '유료 리딩';
        case 'chat_credit':
            return '채팅 크레딧';
        case 'match':
            return '궁합 열람';
        default:
            return type;
    }
}

function formatSeriesLabel(label: string | undefined) {
    switch (label) {
        case 'completedPayments':
            return '결제 완료';
        case 'revenueUsd':
            return '매출';
        case 'promoPayments':
            return '할인 결제';
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
        <div className="min-w-[220px] rounded-[20px] border border-white/10 bg-[rgba(8,12,24,0.94)] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                {label}
            </p>
            <div className="mt-4 space-y-2.5">
                {payload.map((entry) => {
                    const isRevenue = entry.dataKey === 'revenueUsd';
                    const rawValue = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0);

                    return (
                        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2 text-white/72">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span>{formatSeriesLabel(entry.dataKey)}</span>
                            </div>
                            <strong className="text-white">
                                {isRevenue ? formatUsdFromCents(rawValue * 100) : rawValue.toLocaleString()}
                            </strong>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function PaymentOpsDashboard({ summary }: PaymentOpsDashboardProps) {
    const chartData = summary.series.map((point) => ({
        ...point,
        revenueUsd: Number((point.revenueCents / 100).toFixed(2)),
    }));
    const windowLabel = formatWindowLabel(summary.dateRange.from, summary.dateRange.to);
    const hasSeries = chartData.some((point) => point.completedPayments > 0 || point.revenueUsd > 0);

    const metrics = [
        {
            label: '총매출',
            value: formatUsdFromCents(summary.totals.grossRevenueCents),
            caption: `평균 객단가는 ${formatUsdFromCents(summary.totals.averageOrderValueCents)} 입니다.`,
            icon: CircleDollarSign,
            iconClassName: 'text-amber-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '결제 완료',
            value: summary.totals.completedPayments.toLocaleString(),
            caption: `${summary.totals.premiumReadingPayments.toLocaleString()}건 리딩 / ${summary.totals.chatCreditPayments.toLocaleString()}건 크레딧`,
            icon: CreditCard,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '할인 결제',
            value: summary.totals.promoPayments.toLocaleString(),
            caption: '할인 코드나 프로모션이 실제 결제까지 이어진 건수입니다.',
            icon: WalletCards,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: '유료 처리 안 된 리딩',
            value: summary.totals.unresolvedPremiumReadings.toLocaleString(),
            caption: '결제는 끝났지만 리딩이 아직 유료로 안 바뀐 건수입니다.',
            icon: ShieldCheck,
            iconClassName: 'text-rose-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.2),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
    ];

    return (
        <div className="space-y-10">
            <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            결제 상태
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            결제가 어디서 막히는지 보는 화면
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            매출만 보는 대신, 결제 시작, 결제 완료, 유료 처리 누락을 같이 보게 만들었습니다.
                            한 번 결제와 구독도 따로 볼 수 있게 정리했습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="기간" value={windowLabel} />
                        <OpsSignalChip label="결제 전환율" value={formatPercent(summary.funnel.checkoutConversionRate)} />
                        <OpsSignalChip label="구독 중" value={`${summary.subscriptions.activePro + summary.subscriptions.activeCouple}`} />
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

            <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
                <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] sm:p-7">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            매출 흐름
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="결제 완료" value={summary.totals.completedPayments.toLocaleString()} />
                            <OpsSignalChip label="할인 결제" value={summary.totals.promoPayments.toLocaleString()} />
                            <OpsSignalChip label="총매출" value={formatUsdFromCents(summary.totals.grossRevenueCents)} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        매출 / 결제 완료 / 할인 결제
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        매출만이 아니라 결제가 꾸준히 들어오는지, 할인 결제가 너무 많지는 않은지 같이 봅니다.
                    </p>

                    <div className="mt-6 rounded-[28px] border border-white/8 bg-black/15 p-4">
                        {hasSeries ? (
                            <div className="h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ left: -12, right: 12, top: 8, bottom: 0 }}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                                        <YAxis yAxisId="revenue" orientation="right" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
                                        <Tooltip content={<TooltipCard />} />
                                        <Bar dataKey="completedPayments" fill="#7DD3FC" radius={[8, 8, 0, 0]} />
                                        <Line yAxisId="revenue" type="monotone" dataKey="revenueUsd" stroke="#F5C451" strokeWidth={2.75} dot={false} />
                                        <Line type="monotone" dataKey="promoPayments" stroke="#C4B5FD" strokeWidth={2.2} dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <OpsEmptyState
                                title="아직 결제 기록이 많지 않습니다"
                                description="결제가 더 쌓이면, 줄어드는 구간과 회복 구간을 여기서 바로 볼 수 있습니다."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            구독 현황
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="개인 구독 중"
                                value={summary.subscriptions.activePro.toLocaleString()}
                                caption="지금 개인 구독을 쓰는 계정 수입니다."
                            />
                            <OpsInsightRow
                                label="커플 구독 중"
                                value={summary.subscriptions.activeCouple.toLocaleString()}
                                caption="지금 커플 구독을 쓰는 계정 수입니다."
                            />
                            <OpsInsightRow
                                label="곧 끝나는 구독"
                                value={summary.subscriptions.expiringSoon.toLocaleString()}
                                caption="7일 안에 끝나는 구독 수입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            결제 흐름
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="결제 시작"
                                value={summary.funnel.checkoutStarts.toLocaleString()}
                                caption="결제 창을 연 뒤 실제 결제를 시작한 수입니다."
                            />
                            <OpsInsightRow
                                label="결제 완료"
                                value={summary.funnel.paidConversions.toLocaleString()}
                                caption="실제로 결제가 끝난 수입니다."
                            />
                            <OpsInsightRow
                                label="결제 전환율"
                                value={formatPercent(summary.funnel.checkoutConversionRate)}
                                caption="결제 시작한 사람 중 결제를 끝낸 비율입니다."
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                결제 종류
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                어떤 결제가 실제로 찍히는지
                            </h3>
                        </div>
                    </div>

                    <div className="h-[280px] rounded-[24px] border border-white/8 bg-black/15 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.productMix}>
                                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#7DD3FC" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                                결제 상태
                            </p>
                            <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                상태 분포
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {summary.statusMix.map((status) => (
                            <div
                                key={status.label}
                                className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/75"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-white">{status.label}</p>
                                    <p className="text-xs text-white/42">기록 수</p>
                                </div>
                                <strong className="font-[var(--font-outfit)] text-lg tracking-[-0.04em] text-white">
                                    {status.count.toLocaleString()}
                                </strong>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            최근 결제
                        </p>
                        <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                            최근 결제 흐름
                        </h3>
                    </div>
                </div>

                <div className="grid gap-3">
                    {summary.recentPayments.map((payment) => (
                        <div
                            key={payment.orderId}
                            className="grid gap-3 rounded-[24px] border border-white/8 bg-black/15 px-4 py-4 text-sm text-white/74 md:grid-cols-[1.1fr_0.8fr_0.7fr_0.9fr]"
                        >
                            <div>
                                <p className="font-medium text-white">{payment.customerEmail || '고객 정보 없음'}</p>
                                <p className="mt-1 text-xs text-white/42">{payment.orderId}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">{formatPaymentTypeLabel(payment.type)}</p>
                                <p className="mt-1 text-xs text-white/42">{payment.readingId ?? '연결된 리딩 없음'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">{formatUsdFromCents(payment.amountCents)}</p>
                                <p className="mt-1 text-xs text-white/42">
                                    {payment.discountPercent ? `${payment.discountPercent}% 할인` : '기본 결제'}
                                </p>
                            </div>
                            <div className="md:text-right">
                                <p className="font-medium text-white">{payment.status}</p>
                                <p className="mt-1 text-xs text-white/42">{formatDateTime(payment.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
