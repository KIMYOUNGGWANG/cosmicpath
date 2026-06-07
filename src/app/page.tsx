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

const SITE_URL = 'https://www.cosmicpath.app';
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const KOREAN_TITLE = 'CosmicPath | 사주·점성술·타로 3단분석';
const KOREAN_DESCRIPTION = '막힌 관계·일·돈 질문을 사주, 점성술, 타로로 대조해 첫 판정과 다음 행동을 정리합니다.';
const ENGLISH_TITLE = 'CosmicPath | Saju, Astrology, Tarot 3-Layer Reading';
const ENGLISH_DESCRIPTION = 'A 3-layer reading that cross-checks saju, astrology, and tarot to clarify one stuck question and the next action.';

async function getLandingLanguage(): Promise<'ko' | 'en'> {
    const headersList = await headers();
    const acceptLang = headersList.get('accept-language') || '';
    if (acceptLang.includes('en') && !acceptLang.includes('ko')) {
        return 'en';
    }
    return 'ko';
}

export async function generateMetadata(): Promise<Metadata> {
    const language = await getLandingLanguage();
    const isKorean = language === 'ko';

    if (isKorean) {
        return {
            title: KOREAN_TITLE,
            description: KOREAN_DESCRIPTION,
            openGraph: {
                title: KOREAN_TITLE,
                description: KOREAN_DESCRIPTION,
                images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: 'CosmicPath 사주·점성술·타로 3단분석 미리보기' }],
            },
            twitter: {
                card: 'summary_large_image',
                title: KOREAN_TITLE,
                description: KOREAN_DESCRIPTION,
                images: [OG_IMAGE_URL],
            },
        };
    }

    return {
        title: ENGLISH_TITLE,
        description: ENGLISH_DESCRIPTION,
        openGraph: {
            title: ENGLISH_TITLE,
            description: ENGLISH_DESCRIPTION,
            images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: 'CosmicPath saju, astrology, and tarot 3-layer reading preview' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: ENGLISH_TITLE,
            description: ENGLISH_DESCRIPTION,
            images: [OG_IMAGE_URL],
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
