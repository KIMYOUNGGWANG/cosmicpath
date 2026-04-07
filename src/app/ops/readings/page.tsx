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
                eyebrow="리딩 확인"
                title="로그인이 필요합니다"
                description="이 페이지는 운영자만 볼 수 있습니다. 먼저 로그인해 주세요."
            />
        );
    }

    if (session.user.role !== 'ADMIN') {
        return (
            <OpsAccessState
                eyebrow="리딩 확인"
                title="관리자 전용 페이지입니다"
                description="현재 계정으로는 이 페이지를 볼 수 없습니다. 관리자 계정으로 로그인해 주세요."
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
                                리딩 확인
                            </p>
                            <h1 className="mt-4 font-[var(--font-outfit)] text-4xl font-semibold tracking-[-0.05em] text-white">
                                리딩 문제를 찾는 화면
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/64">
                                누가 이 리딩의 주인인지, 유료가 제대로 풀렸는지, 추가 질문이 가능한지를 같이 봅니다.
                                리딩 ID, 유저 ID, 이메일 일부로 바로 찾을 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                <ReadingSupportDashboard summary={summary} />
            </div>
        </main>
    );
}
