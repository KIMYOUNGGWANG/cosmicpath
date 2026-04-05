import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { ReviewOpsDashboard } from '@/components/ops/ReviewOpsDashboard';

export default async function ReviewOpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="Review Command"
                title="로그인이 필요합니다"
                description="Review Ops 대시보드는 운영용 보호 페이지입니다. 먼저 로그인한 뒤 권한을 확인해주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="Review Command"
                title="관리자 전용 페이지입니다"
                description="현재 계정은 Review Ops 대시보드 접근 권한이 없습니다. ADMIN 권한 계정으로 로그인해야 이 페이지를 볼 수 있습니다."
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
                <div className="mb-10 rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                                Review Command
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                Review Ops Dashboard
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                후기 승인, 삭제, reading 연결 여부를 별도 운영 화면으로 분리했습니다.
                                Growth 지표와 섞지 않고, 실제 사용자 목소리와 노출 가능 상태를 여기서 바로 관리할 수 있습니다.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Mode</span>
                                <strong className="ml-2 text-white">Review Moderation</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Queue</span>
                                <strong className="ml-2 text-white">{serializedReviews.length} reviews</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Pending</span>
                                <strong className="ml-2 text-white">{pendingCount}</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Promo Mix</span>
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
