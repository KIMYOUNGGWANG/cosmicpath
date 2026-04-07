import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { OpsCommandCenter } from '@/components/ops/OpsCommandCenter';
import { OpsNav } from '@/components/ops/OpsNav';
import { getGrowthSummary } from '@/lib/growth-metrics';

export default async function OpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="운영 홈"
                title="로그인이 필요합니다"
                description="이 페이지는 운영자만 볼 수 있습니다. 먼저 로그인해 주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="운영 홈"
                title="관리자 전용 페이지입니다"
                description="현재 계정으로는 이 페이지를 볼 수 없습니다. 관리자 계정으로 로그인해 주세요."
                currentRole={session.user.role}
            />
        );
    }

    const [summary, totalReviews, approvedReviews, pendingReviews, promoReviews] = await Promise.all([
        getGrowthSummary(30),
        prisma.review.count(),
        prisma.review.count({ where: { isApproved: true } }),
        prisma.review.count({ where: { isApproved: false } }),
        prisma.review.count({ where: { isPromoUser: true } }),
    ]);

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,196,81,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_26%),linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <OpsNav active="hub" />

                <OpsCommandCenter
                    summary={summary}
                    reviews={{
                        totalReviews,
                        approvedReviews,
                        pendingReviews,
                        promoReviews,
                    }}
                />
            </div>
        </main>
    );
}
