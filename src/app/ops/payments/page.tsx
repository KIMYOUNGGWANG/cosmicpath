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
                eyebrow="결제 상태"
                title="로그인이 필요합니다"
                description="이 페이지는 운영자만 볼 수 있습니다. 먼저 로그인해 주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="결제 상태"
                title="관리자 전용 페이지입니다"
                description="현재 계정으로는 이 페이지를 볼 수 없습니다. 관리자 계정으로 로그인해 주세요."
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
                                결제 상태
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                결제가 잘 되고 있는지 보기
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                결제, 구독, 할인 코드 사용, 그리고 유료 처리가 제대로 됐는지를 한 화면에서 봅니다.
                                매출보다 먼저 어디에서 막히는지를 찾기 쉽게 정리했습니다.
                            </p>
                        </div>
                    </div>
                </div>

                <PaymentOpsDashboard summary={summary} />
            </div>
        </main>
    );
}
