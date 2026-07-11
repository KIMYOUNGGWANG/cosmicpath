import { auth } from '@/lib/auth';
import { getGrowthSummary } from '@/lib/growth-metrics';
import { GrowthDashboard } from '@/components/ops/GrowthDashboard';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { OpsNav } from '@/components/ops/OpsNav';

export default async function GrowthOpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="사용자 흐름"
                title="로그인이 필요합니다"
                description="이 페이지는 운영자만 볼 수 있습니다. 먼저 로그인해 주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="사용자 흐름"
                title="관리자 전용 페이지입니다"
                description="현재 계정으로는 이 페이지를 볼 수 없습니다. 관리자 계정으로 로그인해 주세요."
                currentRole={session.user.role}
            />
        );
    }

    const summary = await getGrowthSummary(30);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <OpsNav active="growth" />

                <div className="mb-10 rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                                사용자 흐름
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                결과부터 결제까지 보기
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                최근 {summary.dateRange.days}일 동안 사람들이 무료 결과를 보고, 추가 질문을 하고, 다시 돌아오고, 결제까지 갔는지를 먼저 봅니다.
                                자체 GrowthEvent에 기록된 고유 추적 ID도 함께 보여서 제품 흐름을 읽을 수 있습니다.
                                주 추적기는 저장소에 유지되지만 일부 경로는 별도 ID를 사용합니다. 이 값은 이벤트가 남은 ID만 세며, 저장소 초기화와 복수 추적 ID의 영향을 받습니다. Vercel Analytics의 필터링된 Visitors와는 정의가 달라 직접 비교하지 않습니다.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">기간</span>
                                <strong className="ml-2 text-white">{summary.dateRange.days}일</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">기준</span>
                                <strong className="ml-2 text-white">중요한 행동 먼저</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <GrowthDashboard summary={summary} />
            </div>
        </main>
    );
}
