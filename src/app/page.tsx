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
            title: 'Next Move Report | 미뤄둔 선택 끝내기',
            description: '찝찝하게 미뤄둔 선택 하나를 오늘 보낼 말과 다음 행동으로 정리합니다. 첫 판정은 무료, 풀 리포트는 $9입니다.',
            openGraph: {
                title: 'Next Move Report | 미뤄둔 선택 끝내기',
                description: '찝찝하게 미뤄둔 선택 하나를 오늘 보낼 말과 다음 행동으로 정리합니다. 첫 판정은 무료, 풀 리포트는 $9입니다.',
                images: ['/og-image.png'],
            },
        };
    }

    return {
        title: 'Next Move Report | End One Delayed Choice',
        description: "Turn one decision you have been putting off into today's next move. First verdict free, full report $9.",
        openGraph: {
            title: 'Next Move Report | End One Delayed Choice',
            description: "Turn one decision you have been putting off into today's next move. First verdict free, full report $9.",
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
