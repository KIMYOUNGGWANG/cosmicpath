import { auth } from '@/lib/auth';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { OpsNav } from '@/components/ops/OpsNav';
import { PaymentOpsDashboard } from '@/components/ops/PaymentOpsDashboard';
import { getPaymentOpsSummary } from '@/lib/ops-metrics';

export default async function PaymentOpsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="Payment Command"
                title="로그인이 필요합니다"
                description="Payment Ops 대시보드는 운영용 보호 페이지입니다. 먼저 로그인한 뒤 권한을 확인해주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="Payment Command"
                title="관리자 전용 페이지입니다"
                description="현재 계정은 Payment Ops 대시보드 접근 권한이 없습니다. ADMIN 권한 계정으로 로그인해야 이 페이지를 볼 수 있습니다."
                currentRole={session.user.role}
            />
        );
    }

    const summary = await getPaymentOpsSummary(30);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <OpsNav active="payments" />

                <div className="mb-10 rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                                Payment Command
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                Payment Ops Dashboard
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                결제, 구독, promo, reconciliation 상태를 한 화면에서 읽는 운영 패널입니다.
                                revenue보다 먼저 recovery 지점과 unresolved premium 상태를 읽도록 구성했습니다.
                            </p>
                        </div>
                    </div>
                </div>

                <PaymentOpsDashboard summary={summary} />
            </div>
        </main>
    );
}
