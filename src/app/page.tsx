import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { RitualSection } from '@/components/landing/RitualSection';
import { DiagnosisSection } from '@/components/landing/DiagnosisSection';
import { GapSection } from '@/components/landing/GapSection';
import { BlueprintSection } from '@/components/landing/BlueprintSection';
import { EngineSection } from '@/components/landing/EngineSection';
import { VerdictSection } from '@/components/landing/VerdictSection';
import { ReviewCarousel } from '@/components/landing/ReviewCarousel';
import { CrossroadsSection } from '@/components/landing/CrossroadsSection';
import { Footer } from '@/components/landing/Footer';

async function getLandingLanguage(): Promise<'ko' | 'en'> {
    const headersList = await headers();
    return (headersList.get('accept-language') || '').includes('ko') ? 'ko' : 'en';
}

export async function generateMetadata(): Promise<Metadata> {
    const language = await getLandingLanguage();
    const isKorean = language === 'ko';

    if (isKorean) {
        return {
            title: 'CosmicPath | 1:1 한국형 오라클 & 데이터 기반 사주·타로',
            description: '애매한 선택을 앞둔 순간, 가장 정확한 타이밍과 행동을 제안합니다. 사주·별자리·타로 교차 검증 오라클.',
            openGraph: {
                title: 'CosmicPath | 1:1 한국형 오라클 & 데이터 기반 사주·타로',
                description: '애매한 선택을 앞둔 순간, 가장 정확한 타이밍과 행동을 제안합니다. 사주·별자리·타로 교차 검증 오라클.',
                images: ['/og-image.png'],
            },
        };
    }

    return {
        title: 'CosmicPath | Decision Timing Oracle',
        description: 'Read the timing, risk, and next move behind your relationship, career, wealth, or daily decisions.',
        openGraph: {
            title: 'CosmicPath | Decision Timing Oracle',
            description: 'Read the timing, risk, and next move behind your relationship, career, wealth, or daily decisions.',
            images: ['/og-image.png'],
        },
    };
}

export default async function Home() {
    const language = await getLandingLanguage();

    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void">
            <Navigation />
            <div className="cosmic-dust" />

            <HeroSection language={language} />
            <RitualSection />
            <DiagnosisSection />
            <ReviewCarousel />
            <GapSection />
            <BlueprintSection />
            <EngineSection />
            <VerdictSection />
            <CrossroadsSection />

            <Footer />
        </main>
    );
}
