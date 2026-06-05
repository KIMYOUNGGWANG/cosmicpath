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
            title: '오늘의 결정 정리',
            description: '미뤄둔 선택 하나를 질문, 기준, 오늘 할 일로 차분하게 정리합니다. 첫 정리는 무료로 시작할 수 있습니다.',
            openGraph: {
                title: '오늘의 결정 정리',
                description: '미뤄둔 선택 하나를 질문, 기준, 오늘 할 일로 차분하게 정리합니다. 첫 정리는 무료로 시작할 수 있습니다.',
                images: ['/og-image.png'],
            },
        };
    }

    return {
        title: 'Decision Note',
        description: 'Turn one delayed decision into a clear question, criteria, and a next action. Start the first note for free.',
        openGraph: {
            title: 'Decision Note',
            description: 'Turn one delayed decision into a clear question, criteria, and a next action. Start the first note for free.',
            images: ['/og-image.png'],
        },
    };
}

export default async function Home() {
    const language = await getLandingLanguage();

    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void">
            <Navigation language={language} />

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
