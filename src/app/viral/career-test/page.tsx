import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '내 팔자에 맞는 진짜 직업은? - CosmicPath',
  description: '사주 오행으로 보는 나의 진짜 직장 생존 타입. 월급루팡인지 명예퇴직러인지 지금 바로 확인하세요!',
};

export default function SajuCareerViralTestPage() {
  return (
    <main className="min-h-screen bg-void text-starlight flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.15)_0%,transparent_70%)]" />
      
      <div className="max-w-md w-full text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold font-sans tracking-tight break-keep">
            내 팔자에 맞는<br/>진짜 직업은?
          </h1>
          <p className="text-moonlight text-lg break-keep px-4">
            MBTI는 변해도 사주는 변하지 않으니까.<br/>오행으로 뼈 때리는 직업 처방을 받아보세요.
          </p>
        </div>
        
        {/* Placeholder for Client Component (Form -> Loading -> Result) */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl">
           <p className="text-dim mb-6 font-medium">생년월일을 입력하는 폼이 곧 연결됩니다.</p>
           
           <button className="w-full py-4 bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] animate-pulse-slow text-deep-navy font-bold text-lg tracking-tight rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-300">
              🔥 사주 풀이 시작하기
           </button>
        </div>

        <Link href="/" className="inline-block text-sm text-dim underline mt-8 hover:text-acc-gold transition-colors">
          오라클에게 지금 내 결정 물어보기 (본진가기)
        </Link>
      </div>
    </main>
  );
}
