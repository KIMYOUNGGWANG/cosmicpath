import Link from 'next/link';

export default function BillingCancelPage() {
    return (
        <main className="min-h-screen bg-[#04060d] px-6 pb-16 pt-28 text-white">
            <div className="mx-auto max-w-3xl rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                        Checkout Cancelled
                    </p>
                    <h1 className="mt-5 text-3xl font-semibold md:text-4xl">
                        구독 결제가 취소되었습니다.
                    </h1>
                    <p className="mt-4 text-base leading-8 text-white/70">
                        아직 결제는 완료되지 않았습니다. 다시 비교해보고 싶다면 구독 모달에서 연간 할인과
                        월간 플랜을 다시 확인할 수 있습니다.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                        >
                            홈으로 돌아가기
                        </Link>
                        <Link
                            href="/daily"
                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                        >
                            Daily Fortune 보기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
