'use client';

import { useMemo, useState, useTransition } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    FileText,
    MessageSquareQuote,
    ShieldCheck,
    Sparkles,
    Star,
    Trash2,
} from 'lucide-react';

interface ReviewRecord {
    id: string;
    readingId: string | null;
    nickname: string;
    rating: number;
    content: string;
    isApproved: boolean;
    isPromoUser: boolean;
    createdAt: string;
}

type ReviewFilter = 'pending' | 'approved' | 'all';

interface ReviewOpsDashboardProps {
    initialReviews: ReviewRecord[];
}

function ReviewStatCard({
    label,
    value,
    caption,
    glowClassName,
}: {
    label: string;
    value: string;
    caption: string;
    glowClassName: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-[30px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.24)] ${glowClassName}`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
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

function ReviewFilterButton({
    label,
    value,
    isActive,
    onClick,
}: {
    label: string;
    value: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 ${
                isActive
                    ? 'border-[hsl(42_79%_74%/0.4)] bg-[hsl(42_79%_74%/0.14)] text-[hsl(42_79%_74%)]'
                    : 'border-white/10 bg-white/[0.04] text-white/68 hover:border-white/18 hover:bg-white/[0.08] hover:text-white'
            }`}
        >
            {label}
            <span className="ml-2 text-white/42">{value}</span>
        </button>
    );
}

function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    className={`h-4 w-4 ${
                        index < rating
                            ? 'fill-[hsl(42_79%_74%)] text-[hsl(42_79%_74%)]'
                            : 'text-white/16'
                    }`}
                />
            ))}
        </div>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatPercent(value: number) {
    return `${Math.round(value)}%`;
}

function getModerationLabel(isApproved: boolean) {
    return isApproved ? '승인됨' : '승인 대기';
}

function getConnectionLabel(readingId: string | null) {
    return readingId ? '리딩 연결' : '리딩 미연결';
}

export function ReviewOpsDashboard({ initialReviews }: ReviewOpsDashboardProps) {
    const [reviews, setReviews] = useState(initialReviews);
    const [filter, setFilter] = useState<ReviewFilter>('pending');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const pendingCount = reviews.filter((review) => !review.isApproved).length;
    const approvedCount = reviews.filter((review) => review.isApproved).length;
    const promoCount = reviews.filter((review) => review.isPromoUser).length;
    const averageRating = reviews.length
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    const highSignalCount = reviews.filter((review) => review.rating >= 4).length;
    const pendingShare = reviews.length ? (pendingCount / reviews.length) * 100 : 0;
    const promoShare = reviews.length ? (promoCount / reviews.length) * 100 : 0;
    const latestReview = reviews[0] ?? null;

    const filteredReviews = useMemo(() => {
        if (filter === 'all') return reviews;
        return reviews.filter((review) => (filter === 'approved' ? review.isApproved : !review.isApproved));
    }, [filter, reviews]);

    const mutateReview = (reviewId: string, request: RequestInit, onSuccess: () => void) => {
        setActiveReviewId(reviewId);
        setFeedbackMessage(null);

        startTransition(async () => {
            try {
                const response = await fetch('/api/review/admin', request);
                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(payload?.error || '리뷰 작업을 완료하지 못했습니다.');
                }

                onSuccess();
                setFeedbackMessage('리뷰 운영 상태를 업데이트했습니다.');
            } catch (error) {
                setFeedbackMessage(error instanceof Error ? error.message : '리뷰 작업 중 오류가 발생했습니다.');
            } finally {
                setActiveReviewId(null);
            }
        });
    };

    const handleApprovalToggle = (reviewId: string, isApproved: boolean) => {
        mutateReview(
            reviewId,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, isApproved: !isApproved }),
            },
            () => {
                setReviews((currentReviews) =>
                    currentReviews.map((review) =>
                        review.id === reviewId
                            ? { ...review, isApproved: !isApproved }
                            : review
                    )
                );
            }
        );
    };

    const handleDelete = (reviewId: string) => {
        const confirmed = window.confirm('이 리뷰를 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
        if (!confirmed) return;

        mutateReview(
            reviewId,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId }),
            },
            () => {
                setReviews((currentReviews) =>
                    currentReviews.filter((review) => review.id !== reviewId)
                );
            }
        );
    };

    return (
        <div className="space-y-8">
            <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.14),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(42_79%_74%/0.24)] bg-[hsl(42_79%_74%/0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
                        <Sparkles className="h-4 w-4" />
                        Moderation Orbit
                    </div>

                    <h2 className="mt-5 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                        후기 큐의 결을 먼저 읽고, 공개 가능한 목소리만 올립니다
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                        단순 승인/삭제보다 중요한 건 어떤 후기 흐름이 쌓이고 있는지 읽는 것입니다.
                        프로모션 유입, 높은 만족도, 대기 적체를 한 화면에서 보고 바로 정리할 수 있게 구성했습니다.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/42">대기 비중</span>
                            <strong className="ml-2 text-white">{formatPercent(pendingShare)}</strong>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/42">프로모션 비중</span>
                            <strong className="ml-2 text-white">{formatPercent(promoShare)}</strong>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                            <span className="text-white/42">고평점 리뷰</span>
                            <strong className="ml-2 text-white">{highSignalCount}건</strong>
                        </div>
                    </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[hsl(42_79%_74%)]">
                        큐 스냅샷
                    </p>
                    <div className="mt-5 space-y-3">
                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/10 text-amber-200">
                                        <Clock3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/72">검수 대기</p>
                                        <p className="text-xs text-white/46">먼저 확인해야 할 큐</p>
                                    </div>
                                </div>
                                <strong className="font-[var(--font-outfit)] text-2xl tracking-[-0.05em] text-white">
                                    {pendingCount}
                                </strong>
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/10 text-emerald-200">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/72">공개 가능</p>
                                        <p className="text-xs text-white/46">랜딩 반영 후보</p>
                                    </div>
                                </div>
                                <strong className="font-[var(--font-outfit)] text-2xl tracking-[-0.05em] text-white">
                                    {approvedCount}
                                </strong>
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                                최신 후기
                            </p>
                            <div className="mt-3 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                        {latestReview ? latestReview.nickname : '아직 리뷰 없음'}
                                    </p>
                                    <p className="mt-1 text-xs text-white/46">
                                        {latestReview ? formatDate(latestReview.createdAt) : '큐가 비어 있습니다'}
                                    </p>
                                </div>
                                {latestReview ? <RatingStars rating={latestReview.rating} /> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ReviewStatCard
                    label="승인 대기"
                    value={pendingCount.toLocaleString()}
                    caption="바로 검수해야 할 신규 리뷰 수입니다."
                    glowClassName="bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]"
                />
                <ReviewStatCard
                    label="승인됨"
                    value={approvedCount.toLocaleString()}
                    caption="공개 가능한 후기 풀입니다."
                    glowClassName="bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]"
                />
                <ReviewStatCard
                    label="평균 평점"
                    value={averageRating}
                    caption="현재 누적 만족도 평균입니다."
                    glowClassName="bg-[radial-gradient(circle_at_top_right,rgba(245,196,81,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]"
                />
                <ReviewStatCard
                    label="프로모션 연결"
                    value={promoCount.toLocaleString()}
                    caption="보상 루프와 연결된 후기 수입니다."
                    glowClassName="bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))]"
                />
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.28)] backdrop-blur-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                            리뷰 큐
                        </p>
                        <h2 className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tracking-[-0.05em] text-white">
                            스캔이 쉬운 카드 보드로 검수 흐름을 정리했습니다
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-white/56">
                            상태, 평점, 프로모션 연동 여부, reading 연결 상태를 같은 카드 안에서 읽고 바로 액션할 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <ReviewFilterButton label="승인 대기" value={pendingCount.toString()} isActive={filter === 'pending'} onClick={() => setFilter('pending')} />
                        <ReviewFilterButton label="승인됨" value={approvedCount.toString()} isActive={filter === 'approved'} onClick={() => setFilter('approved')} />
                        <ReviewFilterButton label="전체" value={reviews.length.toString()} isActive={filter === 'all'} onClick={() => setFilter('all')} />
                    </div>
                </div>

                {feedbackMessage ? (
                    <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/74">
                        {feedbackMessage}
                    </div>
                ) : null}

                <div className="mt-6 space-y-4">
                    {filteredReviews.length > 0 ? filteredReviews.map((review) => {
                        const isBusy = isPending && activeReviewId === review.id;
                        const statusTone = review.isApproved
                            ? 'border-emerald-400/12 bg-[radial-gradient(circle_at_top_left,rgba(110,231,183,0.14),transparent_28%),rgba(3,7,18,0.55)]'
                            : 'border-amber-400/12 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_28%),rgba(3,7,18,0.55)]';

                        return (
                            <article
                                key={review.id}
                                className={`relative overflow-hidden rounded-[30px] border p-5 shadow-[0_20px_50px_rgba(2,6,23,0.24)] transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-white/14 ${statusTone}`}
                            >
                                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" />

                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/64">
                                                {formatDate(review.createdAt)}
                                            </span>
                                            <span className={`rounded-full border px-3 py-1 text-xs ${
                                                review.isApproved
                                                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                                                    : 'border-amber-400/20 bg-amber-400/10 text-amber-200'
                                            }`}>
                                                {getModerationLabel(review.isApproved)}
                                            </span>
                                            {review.isPromoUser ? (
                                                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
                                                    프로모션 연결
                                                </span>
                                            ) : null}
                                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/64">
                                                {getConnectionLabel(review.readingId)}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                                        {review.nickname}
                                                    </h3>
                                                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-white/68">
                                                        {`평점 ${review.rating}/5`}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    <RatingStars rating={review.rating} />
                                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
                                                        <MessageSquareQuote className="h-3.5 w-3.5" />
                                                        후기 시그널
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4">
                                            <p className="whitespace-pre-wrap text-sm leading-7 text-white/74">
                                                {review.content}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/45">
                                            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
                                                reviewId {review.id}
                                            </span>
                                            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
                                                readingId {review.readingId ?? 'none'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 xl:w-[220px]">
                                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">
                                                운영 액션
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-white/58">
                                                {review.isApproved
                                                    ? '이미 공개 중인 후기입니다. 노출을 유지할지 판단하세요.'
                                                    : '이 후기를 공개 풀에 올릴지 검수하세요.'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleApprovalToggle(review.id, review.isApproved)}
                                            disabled={isBusy}
                                            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 ${
                                                review.isApproved
                                                    ? 'border-white/10 bg-white/[0.04] text-white/78 hover:bg-white/[0.08]'
                                                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/16'
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            {review.isApproved ? <ShieldCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                            <span>{review.isApproved ? '승인 해제' : '승인하기'}</span>
                                        </button>

                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={isBusy}
                                            className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-100 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-red-400/16 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>삭제하기</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    }) : (
                        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%),rgba(255,255,255,0.02)] px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[hsl(42_79%_74%)]">
                                {filter === 'approved'
                                    ? <ShieldCheck className="h-7 w-7" />
                                    : filter === 'pending'
                                        ? <AlertTriangle className="h-7 w-7" />
                                        : <FileText className="h-7 w-7" />}
                            </div>
                            <h3 className="mt-5 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                                {filter === 'pending'
                                    ? '승인 대기 리뷰가 없습니다'
                                    : filter === 'approved'
                                        ? '승인된 리뷰가 없습니다'
                                        : '리뷰가 아직 없습니다'}
                            </h3>
                            <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
                                후기 데이터가 쌓이면 이 보드에서 목소리의 질감, 공개 가능 상태, 보상 연결 여부를 함께 읽을 수 있습니다.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
