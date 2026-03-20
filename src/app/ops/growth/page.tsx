import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getGrowthSummary } from '@/lib/growth-metrics';
import { GrowthDashboard } from '@/components/ops/GrowthDashboard';

export default async function GrowthOpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/');
    }

    if (session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const summary = await getGrowthSummary(30);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                        Growth Command
                    </p>
                    <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                        MAU / Viral / Revenue KPI Dashboard
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/64">
                        최근 {summary.dateRange.days}일 기준 install, active, share, invite, paid conversion, retention 흐름을 한 화면에서 확인합니다.
                        수집은 내부 GrowthEvent를 기준으로 하고, PostHog/Mixpanel 키가 있으면 같은 이벤트를 외부에도 미러 전송합니다.
                    </p>
                </div>

                <GrowthDashboard summary={summary} />
            </div>
        </main>
    );
}
