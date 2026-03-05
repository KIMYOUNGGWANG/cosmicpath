import type { Metadata } from 'next';

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

export const metadata: Metadata = {
    title: 'CosmicPath | AI Astrology, Saju & Tarot',
    description:
        'Get your personalized destiny analysis with Saju, astrology, and tarot, powered by AI.',
    openGraph: {
        title: 'CosmicPath | AI Astrology, Saju & Tarot',
        description:
            'Get your personalized destiny analysis with Saju, astrology, and tarot, powered by AI.',
        images: ['/og-image.png'],
    },
};

export default function Home() {
    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void">
            <Navigation />
            <div className="cosmic-dust" />

            <HeroSection />
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
