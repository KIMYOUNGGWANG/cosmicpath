import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '직업 타입 실험실 | CosmicPath',
  description: '현재 메인 여정 밖에서 보관 중인 CosmicPath 실험 페이지입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SajuCareerViralTestPage() {
  return (
    <main className="min-h-screen bg-void text-starlight flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.15)_0%,transparent_70%)]" />
      
      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold font-sans tracking-tight break-keep">
            직업 타입 실험실은
            <br />지금 보관 중입니다
          </h1>
          <p className="text-moonlight text-lg break-keep px-4">
            현재 CosmicPath의 메인 경험은 오라클 리딩과 데일리 루틴입니다.
            <br />이 실험 페이지는 직접 링크로만 유지되고 있습니다.
          </p>
        </div>
        
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl">
           <p className="text-dim mb-6 font-medium">필요하면 메인 오라클 리딩이나 오늘의 운세로 바로 이동할 수 있습니다.</p>

           <div className="space-y-3">
             <Link
               href="/start?reset=true"
               className="block w-full rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold px-6 py-4 text-center text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.02]"
             >
               오라클 리딩 시작하기
             </Link>
             <Link
               href="/daily"
               className="block w-full rounded-full border border-white/15 bg-white/5 px-6 py-4 text-center text-base font-semibold text-starlight transition-all duration-300 hover:border-white/30 hover:bg-white/10"
             >
               오늘의 운세 보기
             </Link>
           </div>
        </div>

        <Link href="/" className="inline-block text-sm text-dim underline mt-8 hover:text-acc-gold transition-colors">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
