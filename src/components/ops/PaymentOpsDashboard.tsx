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
            return 'Premium Reading';
        case 'chat_credit':
            return 'Chat Credit';
        case 'match':
            return 'Compatibility Unlock';
        default:
            return type;
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
                                <span>{entry.dataKey}</span>
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
            label: 'Gross Revenue',
            value: formatUsdFromCents(summary.totals.grossRevenueCents),
            caption: `평균 객단가는 ${formatUsdFromCents(summary.totals.averageOrderValueCents)} 입니다.`,
            icon: CircleDollarSign,
            iconClassName: 'text-amber-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Completed Payments',
            value: summary.totals.completedPayments.toLocaleString(),
            caption: `${summary.totals.premiumReadingPayments.toLocaleString()} premium / ${summary.totals.chatCreditPayments.toLocaleString()} credit`,
            icon: CreditCard,
            iconClassName: 'text-sky-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Promo Orders',
            value: summary.totals.promoPayments.toLocaleString(),
            caption: '할인 코드나 프로모션이 실제 결제까지 이어진 건수입니다.',
            icon: WalletCards,
            iconClassName: 'text-violet-200',
            surfaceClassName:
                'bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]',
        },
        {
            label: 'Unreconciled Reads',
            value: summary.totals.unresolvedPremiumReadings.toLocaleString(),
            caption: '결제는 있는데 reading premium 상태가 아직 맞지 않는 건수입니다.',
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
                            Payment Command
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                            결제가 어디서 떨어지고, 어디서 회복되는지 읽는 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                            매출 총액보다 중요한 건 checkout 시작, 실제 결제 완료, premium sync mismatch가 함께 보이는지입니다.
                            one-time 결제와 구독 스냅샷을 분리해서 운영 판단이 쉬운 구조로 묶었습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <OpsSignalChip label="Window" value={windowLabel} />
                        <OpsSignalChip label="Checkout Conv." value={formatPercent(summary.funnel.checkoutConversionRate)} />
                        <OpsSignalChip label="Subscribers" value={`${summary.subscriptions.activePro + summary.subscriptions.activeCouple}`} />
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
                            Revenue Pulse
                        </p>

                        <div className="flex flex-wrap gap-2.5">
                            <OpsSignalChip label="payments" value={summary.totals.completedPayments.toLocaleString()} />
                            <OpsSignalChip label="promo" value={summary.totals.promoPayments.toLocaleString()} />
                            <OpsSignalChip label="gross" value={formatUsdFromCents(summary.totals.grossRevenueCents)} />
                        </div>
                    </div>

                    <h2 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        revenue / completed payments / promo orders
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                        운영자가 가장 먼저 봐야 하는 건 매출 절대값이 아니라 결제량과 수익이 함께 오르는지, 프로모션 비중이 어떤지입니다.
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
                                title="아직 결제 펄스가 충분하지 않습니다"
                                description="completed payment와 revenue가 쌓이기 시작하면 이 패널에서 급락 구간과 회복 구간을 바로 읽을 수 있습니다."
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Subscription Snapshot
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="Active Pro"
                                value={summary.subscriptions.activePro.toLocaleString()}
                                caption="현재 활성 `pro` 구독 상태를 가진 계정 수입니다."
                            />
                            <OpsInsightRow
                                label="Active Couple"
                                value={summary.subscriptions.activeCouple.toLocaleString()}
                                caption="현재 `couple` 상태로 유지되는 계정 수입니다."
                            />
                            <OpsInsightRow
                                label="Expiring Soon"
                                value={summary.subscriptions.expiringSoon.toLocaleString()}
                                caption="7일 안에 만료 예정인 활성 구독 수입니다."
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Funnel Read
                        </p>
                        <div className="mt-5 space-y-3">
                            <OpsInsightRow
                                label="Checkout Starts"
                                value={summary.funnel.checkoutStarts.toLocaleString()}
                                caption="paywall 이후 실제 checkout을 시작한 횟수입니다."
                            />
                            <OpsInsightRow
                                label="Paid Conversions"
                                value={summary.funnel.paidConversions.toLocaleString()}
                                caption="growth 이벤트 기준 결제 완료 수입니다."
                            />
                            <OpsInsightRow
                                label="Checkout Conversion"
                                value={formatPercent(summary.funnel.checkoutConversionRate)}
                                caption="checkout 시작 대비 paid conversion 비율입니다."
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
                                Product Mix
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
                                Status Mix
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
                                    <p className="text-xs text-white/42">payment records</p>
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
                            Recent Payments
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
                                <p className="font-medium text-white">{payment.customerEmail || 'customer pending'}</p>
                                <p className="mt-1 text-xs text-white/42">{payment.orderId}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">{formatPaymentTypeLabel(payment.type)}</p>
                                <p className="mt-1 text-xs text-white/42">{payment.readingId ?? 'reading n/a'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-white">{formatUsdFromCents(payment.amountCents)}</p>
                                <p className="mt-1 text-xs text-white/42">
                                    {payment.discountPercent ? `${payment.discountPercent}% off` : 'standard'}
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
