import type { Metadata } from 'next';

import { Footer } from '@/components/landing/Footer';
import { Navigation } from '@/components/landing/Navigation';

import { KDestinyExperience } from './KDestinyExperience';

export const metadata: Metadata = {
    title: 'K-Destiny Aura Card | CosmicPath',
    description:
        'Generate a global-ready K-Astrology aura card with Saju, astrology, and numerology-based colors, keywords, and OG sharing.',
    openGraph: {
        title: 'K-Destiny Aura Card | CosmicPath',
        description:
            'Generate a global-ready K-Astrology aura card with Saju, astrology, and numerology-based colors, keywords, and OG sharing.',
        images: ['/api/og/aura?name=Cosmic%20Aura&colors=%230F8A5F%2C%232D7FF9&keywords=verdant%2Clucid%2Cpioneer&catchphrase=Your%20K-Astrology%20identity%2C%20distilled.'],
    },
};

export default function KDestinyPage() {
    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void">
            <Navigation />
            <KDestinyExperience />
            <Footer />
        </main>
    );
}
