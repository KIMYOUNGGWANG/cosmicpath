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
const KOREAN_TITLE = 'CosmicPath Decision Note | 미뤄둔 선택 하나를 판정';
const KOREAN_DESCRIPTION = '사주로 구조를 보고, 점성으로 타이밍을 보고, 타로로 지금 질문의 즉각 신호를 확인해 하나의 질문을 판정합니다.';
const ENGLISH_TITLE = 'CosmicPath Decision Note | One delayed choice, one verdict';
const ENGLISH_DESCRIPTION = "CosmicPath Decision Note cross-checks Saju structure, astrology timing, and tarot's immediate signal before naming the next move.";

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
                images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: 'CosmicPath Decision Note 미리보기' }],
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
            images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: 'CosmicPath Decision Note preview' }],
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
