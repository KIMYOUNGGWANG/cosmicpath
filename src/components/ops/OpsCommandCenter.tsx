import Link from 'next/link';
import {
    ArrowRight,
    CircleDollarSign,
    LifeBuoy,
    Radar,
    ShieldAlert,
} from 'lucide-react';
import type { GrowthSummary } from '@/lib/growth-metrics';

interface ReviewOpsSnapshot {
    totalReviews: number;
    approvedReviews: number;
    pendingReviews: number;
    promoReviews: number;
}

interface OpsCommandCenterProps {
    summary: GrowthSummary;
    reviews: ReviewOpsSnapshot;
}

function StatCard({
    label,
    value,
    caption,
}: {
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                {label}
            </p>
            <p className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                {value}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/58">
                {caption}
            </p>
        </div>
    );
}

function SurfaceCard({
    href,
    eyebrow,
    title,
    description,
    metricLabel,
    metricValue,
}: {
    href: string;
    eyebrow: string;
    title: string;
    description: string;
    metricLabel: string;
    metricValue: string;
}) {
    return (
        <Link
            href={href}
            className="group block rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_22%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.26)] transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/18"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
                        {eyebrow}
                    </p>
                    <h3 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                        {title}
                    </h3>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-white/76 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-5 w-5" />
                </span>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">
                {description}
            </p>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46">
                    {metricLabel}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                    {metricValue}
                </p>
            </div>
        </Link>
    );
}

function ChecklistItem({
    title,
    body,
}: {
    title: string;
    body: string;
}) {
    return (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-7 text-white/56">{body}</p>
        </div>
    );
}

function NeededCard({
    status,
    title,
    description,
    bullets,
    icon: Icon,
}: {
    status: string;
    title: string;
    description: string;
    bullets: string[];
    icon: typeof CircleDollarSign;
}) {
    return (
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(42_79%_74%)]">
                        {status}
                    </p>
                    <h3 className="mt-3 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                        {title}
                    </h3>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 text-[hsl(42_79%_74%)]">
                    <Icon className="h-5 w-5" />
                </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/58">
                {description}
            </p>

            <div className="mt-5 space-y-2.5">
                {bullets.map((bullet) => (
                    <div
                        key={bullet}
                        className="rounded-[20px] border border-white/8 bg-black/15 px-4 py-3 text-sm text-white/74"
                    >
                        {bullet}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatPercent(value: number) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export function OpsCommandCenter({
    summary,
    reviews,
}: OpsCommandCenterProps) {
    const strongestSource = summary.topSources[0]?.source ?? 'source pending';
    const reviewApprovalRate = reviews.totalReviews > 0
        ? (reviews.approvedReviews / reviews.totalReviews) * 100
        : 0;

    return (
        <div className="space-y-10">
            <section className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.16),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(96,165,250,0.16),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                            Ops Command
                        </p>
                        <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                            Admin Command Center
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-white/64">
                            지금 운영자가 먼저 봐야 하는 신호를 위로 올리고, 아직 없는 어드민 도구는 다음 큐로 정리했습니다.
                            코어 루프, 후기 검수, 운영 리스크를 한 화면에서 빠르게 읽는 허브입니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/44">Range</span>
                            <strong className="ml-2 text-white">{summary.dateRange.days} days</strong>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/44">Strongest Source</span>
                            <strong className="ml-2 text-white">{strongestSource}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="First Result"
                    value={summary.activation.firstResultViews.toLocaleString()}
                    caption="무료 결과까지 실제로 도달한 수입니다."
                />
                <StatCard
                    label="Follow-up Rate"
                    value={formatPercent(summary.activation.resultToFollowupRate)}
                    caption="첫 결과 이후 질문이 이어지는 핵심 activation 비율입니다."
                />
                <StatCard
                    label="Paid from Result"
                    value={formatPercent(summary.activation.resultToPaidConversionRate)}
                    caption="첫 결과를 본 뒤 실제 결제로 이어진 비율입니다."
                />
                <StatCard
                    label="Pending Reviews"
                    value={reviews.pendingReviews.toLocaleString()}
                    caption="지금 바로 검수 대기 중인 후기 수입니다."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Current Surfaces
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            지금 바로 쓰는 운영 패널
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58">
                            이미 있는 어드민 표면을 한 번에 모았습니다. 코어 루프 추이와 후기 검수를 서로 다른 맥락으로 분리해 읽도록 유지합니다.
                        </p>

                        <div className="mt-6 grid gap-4 xl:grid-cols-2">
                            <SurfaceCard
                                href="/ops/growth"
                                eyebrow="Growth Command"
                                title="Growth Ops"
                                description="first result -> follow-up -> daily return -> paid conversion 흐름을 중심으로 실제 제품 전개를 읽는 패널입니다."
                                metricLabel="Current pulse"
                                metricValue={`${summary.activation.followupStarts.toLocaleString()} follow-ups · ${formatPercent(summary.activation.resultToPaidConversionRate)} paid from result`}
                            />
                            <SurfaceCard
                                href="/ops/reviews"
                                eyebrow="Review Command"
                                title="Review Ops"
                                description="후기 승인 대기, 프로모션 연결, reading 연결 여부를 기준으로 노출 가능한 사용자 목소리를 검수하는 패널입니다."
                                metricLabel="Moderation state"
                                metricValue={`${reviews.pendingReviews.toLocaleString()} pending · ${reviews.promoReviews.toLocaleString()} promo · ${formatPercent(reviewApprovalRate)} approved`}
                            />
                            <SurfaceCard
                                href="/ops/payments"
                                eyebrow="Payment Command"
                                title="Payment Ops"
                                description="결제, promo, subscription snapshot, premium reconcile 상태를 그래프 중심으로 읽는 패널입니다."
                                metricLabel="What it answers"
                                metricValue="revenue · checkout conv. · unresolved premium"
                            />
                            <SurfaceCard
                                href="/ops/readings"
                                eyebrow="Support Command"
                                title="Reading Support"
                                description="reading owner proof, anonymous access key, premium proof, follow-up credits를 함께 확인하는 지원 패널입니다."
                                metricLabel="What it answers"
                                metricValue="owner proof · premium state · support lookup"
                            />
                            <SurfaceCard
                                href="/ops/trust"
                                eyebrow="Trust Command"
                                title="Trust Ops"
                                description="ops alert, webhook warning, follow-up failure를 한 화면에서 보는 인시던트 패널입니다."
                                metricLabel="What it answers"
                                metricValue="open alerts · failed jobs · pending incidents"
                            />
                            <SurfaceCard
                                href="/ops/advisors"
                                eyebrow="Advisor Command"
                                title="Advisor Ops"
                                description="questionIntent와 advisor routing이 실제 follow-up과 paid outcome에 어떤 차이를 만드는지 읽는 패널입니다."
                                metricLabel="What it answers"
                                metricValue="intent routing · advisor lift · manual vs auto"
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Daily Watch
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            매일 체크하면 좋은 것
                        </h2>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                            <ChecklistItem
                                title="첫 결과 대비 follow-up 비율"
                                body="무료 aha moment가 실제 질문 확장으로 이어지는지 보는 가장 빠른 activation 지표입니다."
                            />
                            <ChecklistItem
                                title="첫 결과 대비 결제 비율"
                                body="paywall 카피나 가격 문제가 생기면 가장 먼저 무너지는 코어 전환 신호입니다."
                            />
                            <ChecklistItem
                                title="linked daily 복귀"
                                body="리딩 이후 하루 뒤 다시 돌아오는 이유가 작동하는지 보는 retention loop 신호입니다."
                            />
                            <ChecklistItem
                                title="승인 대기 후기 / 프로모션 후기"
                                body="신뢰 표면이 쌓이고 있는지, 검수 병목이 생기는지 바로 읽을 수 있습니다."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Ops Modules
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            지금 운영에서 바로 쓰는 모듈
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58">
                            코어 루프 외에 실제 운영이 자주 막히는 지점을 기준으로 패널을 추가했습니다. 지원, 수익화, 사고 대응, advisor 라우팅을 각각 분리해서 읽도록 유지합니다.
                        </p>

                        <div className="mt-6 space-y-4">
                            <NeededCard
                                status="Now Live"
                                title="Payment Ops"
                                description="매출, checkout conversion, promo 주문, unresolved premium reading을 같이 보는 대시보드입니다."
                                bullets={[
                                    'revenue / completed payments / promo mix 차트',
                                    'active subscription / expiring soon snapshot',
                                    'recent payment 흐름과 premium reconcile 확인',
                                ]}
                                icon={CircleDollarSign}
                            />
                            <NeededCard
                                status="Now Live"
                                title="Reading Support Ops"
                                description="사용자 문의 대응용으로 reading ownership, access key, premium proof, credits를 함께 보는 지원 패널입니다."
                                bullets={[
                                    'email / readingId / userId 기반 검색',
                                    'anonymous owner proof / accessKey 상태 확인',
                                    'premium unlock / follow-up credits / support risk 확인',
                                ]}
                                icon={LifeBuoy}
                            />
                            <NeededCard
                                status="Now Live"
                                title="Trust & Incident Ops"
                                description="ops alert와 follow-up delivery failure를 같이 보는 인시던트 패널입니다."
                                bullets={[
                                    'Stripe webhook / reconcile / runner alert 확인',
                                    'failed / pending follow-up job 추세',
                                    'open alert source와 stage mix 차트',
                                ]}
                                icon={ShieldAlert}
                            />
                            <NeededCard
                                status="Now Live"
                                title="Advisor & Intent Ops"
                                description="specialist advisor 체계의 실제 성과를 intent와 advisor 기준으로 읽는 패널입니다."
                                bullets={[
                                    'questionIntent별 follow-up / paid 성과',
                                    'advisor profile별 activation 차이',
                                    'manual vs auto selection 성과 비교',
                                ]}
                                icon={Radar}
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            Notes
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            해석할 때 주의할 것
                        </h2>

                        <div className="mt-5 space-y-3">
                            <ChecklistItem
                                title="installs는 방문 proxy"
                                body="실제 회원가입 수나 앱 설치 수가 아니라 localStorage 기준 신규 브라우저 신호입니다."
                            />
                            <ChecklistItem
                                title="active users는 세션 proxy"
                                body="로그인 유저 수가 아니라 이벤트를 남긴 unique sessionId 기반 일평균 활성 세션입니다."
                            />
                            <ChecklistItem
                                title="코어 루프는 activation 패널 기준"
                                body="운영 판단은 first result, follow-up, daily return, paid conversion 순으로 읽는 것이 현재 제품 구조에 더 맞습니다."
                            />
                        </div>

                        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/56">
                            정리 문서는 <code>docs/admin-ops-guide.md</code>에 따로 남겨두었습니다.
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
