import { auth } from '@/lib/auth';
import { OpsAccessState } from '@/components/ops/OpsAccessState';
import { OpsNav } from '@/components/ops/OpsNav';
import { ReadingSupportDashboard } from '@/components/ops/ReadingSupportDashboard';
import { getReadingSupportSummary } from '@/lib/ops-metrics';

interface ReadingSupportPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getQueryValue(input: string | string[] | undefined): string | null {
    if (!input) return null;
    return Array.isArray(input) ? input[0] ?? null : input;
}

export default async function ReadingSupportPage({ searchParams }: ReadingSupportPageProps) {
    const params = searchParams ? await searchParams : {};
    const query = getQueryValue(params.q);
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <OpsAccessState
                eyebrow="Support Command"
                title="로그인이 필요합니다"
                description="Reading Support 대시보드는 운영용 보호 페이지입니다. 먼저 로그인한 뒤 권한을 확인해주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="Support Command"
                title="관리자 전용 페이지입니다"
                description="현재 계정은 Reading Support 대시보드 접근 권한이 없습니다. ADMIN 권한 계정으로 로그인해야 이 페이지를 볼 수 있습니다."
                currentRole={session.user.role}
            />
        );
    }

    const summary = await getReadingSupportSummary(30, query);

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#050816_0%,#0B1023_42%,#120C29_100%)] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <OpsNav active="readings" />

                <div className="mb-10 rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_90px_rgba(2,6,23,0.34)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[hsl(42_79%_74%)]">
                                Support Command
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                Reading Support Dashboard
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                reading owner proof, premium unlock, access key, follow-up credits를 함께 보는 운영 패널입니다.
                                검색 모드에서는 reading id, user id, email 일부로 바로 조회할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                <ReadingSupportDashboard summary={summary} />
            </div>
        </main>
    );
}
