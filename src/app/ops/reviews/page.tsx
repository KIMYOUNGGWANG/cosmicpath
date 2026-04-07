import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { ReviewOpsDashboard } from '@/components/ops/ReviewOpsDashboard';
import { OpsNav } from '@/components/ops/OpsNav';

export default async function ReviewOpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="후기 관리"
                title="로그인이 필요합니다"
                description="이 페이지는 운영자만 볼 수 있습니다. 먼저 로그인해 주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="후기 관리"
                title="관리자 전용 페이지입니다"
                description="현재 계정으로는 이 페이지를 볼 수 없습니다. 관리자 계정으로 로그인해 주세요."
                currentRole={session.user.role}
            />
        );
    }

    const reviews = await prisma.review.findMany({
        orderBy: [
            { isApproved: 'asc' },
            { createdAt: 'desc' },
        ],
    });

    const serializedReviews = reviews.map((review) => ({
        ...review,
        createdAt: review.createdAt.toISOString(),
    }));
    const pendingCount = serializedReviews.filter((review) => !review.isApproved).length;
    const promoCount = serializedReviews.filter((review) => review.isPromoUser).length;

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_26%),linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <OpsNav active="reviews" />

                <div className="mb-10 rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                                후기 관리
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                후기를 검토하는 화면
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                후기 승인, 삭제, 리딩 연결 여부를 따로 모아봤습니다.
                                다른 숫자와 섞지 않고 후기만 바로 처리할 수 있게 만든 화면입니다.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">모드</span>
                                <strong className="ml-2 text-white">리뷰 검수</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">리뷰 수</span>
                                <strong className="ml-2 text-white">{serializedReviews.length}건</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">승인 대기</span>
                                <strong className="ml-2 text-white">{pendingCount}</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">프로모션 연결</span>
                                <strong className="ml-2 text-white">{promoCount}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <ReviewOpsDashboard initialReviews={serializedReviews} />
            </div>
        </main>
    );
}
