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
                eyebrow="Growth Command"
                title="로그인이 필요합니다"
                description="Growth Ops 대시보드는 운영용 보호 페이지입니다. 먼저 로그인한 뒤 권한을 확인해주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="Growth Command"
                title="관리자 전용 페이지입니다"
                description="현재 계정은 Growth Ops 대시보드 접근 권한이 없습니다. ADMIN 권한 계정으로 로그인해야 이 페이지를 볼 수 있습니다."
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
                                Growth Command
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                Core Growth Dashboard
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                최근 {summary.dateRange.days}일 기준 오라클 코어 루프의 핵심 4지표인 first result, follow-up, daily return, paid conversion을 먼저 봅니다.
                                브라우저 단위 유입 신호는 보조 레이어로 내리고, 실제 제품 경험이 이어지는 신호를 위로 올렸습니다.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Range</span>
                                <strong className="ml-2 text-white">{summary.dateRange.days} days</strong>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                                <span className="text-white/44">Mode</span>
                                <strong className="ml-2 text-white">Core Signals</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <GrowthDashboard summary={summary} />
            </div>
        </main>
    );
}
