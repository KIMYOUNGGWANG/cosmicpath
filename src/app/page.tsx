import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { Navigation } from '@/components/landing/Navigation';
import { EnglishGuideSection } from '@/components/landing/EnglishGuideSection';
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
    try {
        const headersList = await headers();
        const acceptLang = headersList.get('accept-language') || '';
        if (acceptLang.includes('en') && !acceptLang.includes('ko')) {
            return 'en';
        }
        return 'ko';
    } catch {
        return 'ko';
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const language = await getLandingLanguage();
    const isKorean = language === 'ko';

    if (isKorean) {
        return {
            title: 'CosmicPath | 지금 움직여도 될지 읽어주는 사주 리딩',
            description: '연애, 커리어, 재물, 일상. 애매한 선택 앞에서 지금 움직일지 더 기다릴지, 사주·타로·별자리로 읽어드립니다.',
            openGraph: {
                title: 'CosmicPath | 지금 움직여도 될지 읽어주는 사주 리딩',
                description: '연애, 커리어, 재물, 일상. 애매한 선택 앞에서 지금 움직일지 더 기다릴지, 사주·타로·별자리로 읽어드립니다.',
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
            <Navigation language={language} />
            <div className="cosmic-dust" />

            <HeroSection language={language} />
            {language === 'en' ? <EnglishGuideSection /> : null}
            <RitualSection />
            <DiagnosisSection />
            <ReviewCarousel />
            <GapSection />
            <BlueprintSection />
            <EngineSection />
            <VerdictSection />
            <CrossroadsSection />

            <Footer language={language} />
        </main>
    );
}
