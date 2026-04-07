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
                            운영 홈
                        </p>
                        <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                            지금 봐야 할 숫자 모음
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-white/64">
                            지금 먼저 봐야 할 숫자와 화면을 위로 올려뒀습니다.
                            사용자 흐름, 후기, 결제, 오류를 한 화면에서 빠르게 훑는 곳입니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/44">기간</span>
                            <strong className="ml-2 text-white">{summary.dateRange.days}일</strong>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/44">가장 많이 들어온 곳</span>
                            <strong className="ml-2 text-white">{strongestSource}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="무료 결과 본 사람"
                    value={summary.activation.firstResultViews.toLocaleString()}
                    caption="무료 결과 첫 화면까지 실제로 본 수입니다."
                />
                <StatCard
                    label="추가 질문 비율"
                    value={formatPercent(summary.activation.resultToFollowupRate)}
                    caption="무료 결과를 본 뒤 추가 질문으로 이어진 비율입니다."
                />
                <StatCard
                    label="결제까지 간 비율"
                    value={formatPercent(summary.activation.resultToPaidConversionRate)}
                    caption="무료 결과를 본 뒤 실제 결제까지 간 비율입니다."
                />
                <StatCard
                    label="기다리는 후기"
                    value={reviews.pendingReviews.toLocaleString()}
                    caption="아직 확인하지 않은 후기 수입니다."
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            바로 가기
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            지금 바로 열어볼 화면
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58">
                            이미 있는 운영 화면을 한곳에 모았습니다.
                            필요한 일에 따라 바로 들어갈 수 있게 정리했습니다.
                        </p>

                        <div className="mt-6 grid gap-4 xl:grid-cols-2">
                            <SurfaceCard
                                href="/ops/growth"
                                eyebrow="사용자 흐름"
                                title="결과부터 결제까지"
                                description="무료 결과를 본 뒤 추가 질문, 다시 방문, 결제까지 얼마나 이어지는지 보는 화면입니다."
                                metricLabel="지금 상태"
                                metricValue={`추가 질문 ${summary.activation.followupStarts.toLocaleString()}건 · 결제 비율 ${formatPercent(summary.activation.resultToPaidConversionRate)}`}
                            />
                            <SurfaceCard
                                href="/ops/reviews"
                                eyebrow="후기 관리"
                                title="후기 검토"
                                description="후기 승인 대기, 프로모션 연결, 리딩 연결 여부를 보고 후기 노출 상태를 정리하는 화면입니다."
                                metricLabel="지금 상태"
                                metricValue={`대기 ${reviews.pendingReviews.toLocaleString()}건 · 프로모션 ${reviews.promoReviews.toLocaleString()}건 · 승인 ${formatPercent(reviewApprovalRate)}`}
                            />
                            <SurfaceCard
                                href="/ops/payments"
                                eyebrow="결제 상태"
                                title="결제 확인"
                                description="결제, 할인 코드, 구독, 유료 처리가 제대로 됐는지 보는 화면입니다."
                                metricLabel="여기서 보는 것"
                                metricValue="매출 · 결제 비율 · 유료 처리 누락"
                            />
                            <SurfaceCard
                                href="/ops/readings"
                                eyebrow="리딩 확인"
                                title="리딩 문제 찾기"
                                description="리딩 주인 확인, 유료 상태, 추가 질문 가능 여부를 함께 보는 화면입니다."
                                metricLabel="여기서 보는 것"
                                metricValue="주인 확인 · 유료 상태 · 문의 확인"
                            />
                            <SurfaceCard
                                href="/ops/trust"
                                eyebrow="오류 / 경고"
                                title="문제 모아보기"
                                description="경고, 실패한 작업, 아직 처리되지 않은 문제를 한 화면에서 보는 곳입니다."
                                metricLabel="여기서 보는 것"
                                metricValue="열린 경고 · 실패한 작업 · 아직 안 끝난 문제"
                            />
                            <SurfaceCard
                                href="/ops/advisors"
                                eyebrow="가이드 추천"
                                title="추천 잘 맞는지 보기"
                                description="어떤 질문에 어떤 가이드를 붙였을 때 반응이 좋은지 보는 화면입니다."
                                metricLabel="여기서 보는 것"
                                metricValue="질문 종류 · 가이드 차이 · 자동 추천 / 직접 선택"
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            매일 확인
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            매일 체크하면 좋은 것
                        </h2>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                            <ChecklistItem
                                title="첫 결과 뒤 추가 질문 비율"
                                body="무료 결과를 본 뒤 사람들이 바로 질문을 더 하는지 보는 숫자입니다."
                            />
                            <ChecklistItem
                                title="첫 결과 대비 결제 비율"
                                body="가격이나 결제 화면에 문제가 있으면 이 숫자가 먼저 떨어집니다."
                            />
                            <ChecklistItem
                                title="다음 날 다시 온 사람"
                                body="리딩을 본 사람이 다음 날 다시 돌아오는지 보는 숫자입니다."
                            />
                            <ChecklistItem
                                title="승인 대기 후기 / 프로모션 후기"
                                body="후기가 잘 쌓이는지, 확인이 밀리고 있는지 바로 볼 수 있습니다."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            자주 쓰는 화면
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            운영할 때 자주 보는 화면
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/58">
                            사용자 흐름 말고도 자주 막히는 부분을 따로 빼서 모아뒀습니다.
                            결제, 문의, 오류, 추천 효과를 각각 나눠서 보기 쉽게 했습니다.
                        </p>

                        <div className="mt-6 space-y-4">
                            <NeededCard
                                status="지금 사용 가능"
                                title="결제 상태"
                                description="매출, 결제 비율, 할인 결제, 유료 처리 누락을 같이 보는 화면입니다."
                                bullets={[
                                    '매출 / 결제 완료 / 할인 결제 흐름 보기',
                                    '지금 구독 중인 사람과 곧 끝나는 사람 보기',
                                    '결제는 됐는데 유료 처리가 안 된 리딩 찾기',
                                ]}
                                icon={CircleDollarSign}
                            />
                            <NeededCard
                                status="지금 사용 가능"
                                title="리딩 확인"
                                description="사용자 문의에 답할 때 리딩 주인, 유료 상태, 질문 가능 여부를 같이 보는 화면입니다."
                                bullets={[
                                    '이메일 / 리딩 ID / 유저 ID로 찾기',
                                    '로그인 없이 만든 리딩도 주인 확인하기',
                                    '유료 풀림 / 추가 질문권 / 확인 필요한 문제 보기',
                                ]}
                                icon={LifeBuoy}
                            />
                            <NeededCard
                                status="지금 사용 가능"
                                title="오류 / 경고"
                                description="경고와 실패한 작업을 같이 보는 화면입니다."
                                bullets={[
                                    '결제 관련 경고와 작업 실패 확인',
                                    '후속 메일이 실패했는지 보기',
                                    '어떤 종류의 경고가 많은지 보기',
                                ]}
                                icon={ShieldAlert}
                            />
                            <NeededCard
                                status="지금 사용 가능"
                                title="가이드 추천"
                                description="어떤 질문과 가이드 조합이 잘 맞는지 보는 화면입니다."
                                bullets={[
                                    '질문 종류별 추가 질문 / 결제 차이 보기',
                                    '가이드별 반응 차이 보기',
                                    '직접 고른 경우와 자동 추천 비교',
                                ]}
                                icon={Radar}
                            />
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            읽을 때 참고
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            숫자를 볼 때 알아둘 것
                        </h2>

                        <div className="mt-5 space-y-3">
                            <ChecklistItem
                                title="installs는 새 방문 신호"
                                body="실제 설치 수가 아니라 새 브라우저로 들어온 신호입니다."
                            />
                            <ChecklistItem
                                title="active users는 로그인 유저 수가 아님"
                                body="로그인한 사람 수가 아니라 이벤트를 남긴 방문 수에 가깝습니다."
                            />
                            <ChecklistItem
                                title="이 제품은 결과 이후 흐름이 더 중요함"
                                body="방문 수보다 무료 결과, 추가 질문, 다시 방문, 결제 순서로 보는 게 더 맞습니다."
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
