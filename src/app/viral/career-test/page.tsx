import { Metadata } from 'next';
import Link from 'next/link';
import CareerTestClient from './CareerTestClient';

type Props = {
  searchParams: { jobId?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // baseUrl 처리를 위해 도메인이 필요할 수 있지만, 상대 경로나 환경변수를 활용합니다.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.com';
  const jobId = searchParams?.jobId;
  const ogImageUrl = jobId 
    ? `${baseUrl}/api/og/career-test?jobId=${jobId}`
    : `${baseUrl}/api/og/career-test`;
  
  return {
    title: '내 팔자에 맞는 진짜 직업은? - CosmicPath',
    description: '사주 오행으로 보는 나의 진짜 직장 생존 타입. 월급루팡인지 명예퇴직러인지 지금 바로 확인하세요!',
    openGraph: {
      title: '내 팔자에 맞는 진짜 직업은? - CosmicPath',
      description: '사주 오행으로 보는 나의 진짜 직장 생존 타입. 지금 바로 확인하세요!',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: '사주 직장 타입 결과'
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '내 팔자에 맞는 진짜 직업은?',
      description: '오행으로 보는 진짜 직장 생존 타입',
      images: [ogImageUrl],
    }
  };
}

export default function SajuCareerViralTestPage() {
  return (
    <main className="min-h-screen bg-void text-starlight flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="noise-overlay" />
      <div className="cosmic-dust" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.15)_0%,transparent_70%)]" />
      
      <div className="max-w-md w-full text-center space-y-10 relative z-10 fade-in-up">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold font-cinzel text-glow-yellow tracking-tight break-keep">
            내 팔자에 맞는<br/>진짜 직업은?
          </h1>
          <p className="text-moonlight text-lg break-keep px-4 mt-4">
            MBTI는 변해도 사주는 변하지 않으니까.<br/>오행으로 뼈 때리는 직장 생존 타입을 확인하세요.
          </p>
        </div>
        
        <CareerTestClient />

        <Link href="/" className="inline-block text-sm text-dim underline mt-8 hover:text-acc-gold transition-colors">
          오라클에게 지금 내 결정 물어보기 (본진가기)
        </Link>
      </div>
    </main>
  );
}
