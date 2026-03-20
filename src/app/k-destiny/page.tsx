import type { Metadata } from 'next';

import { Footer } from '@/components/landing/Footer';
import { Navigation } from '@/components/landing/Navigation';

import { KDestinyExperience } from './KDestinyExperience';

export const metadata: Metadata = {
    title: 'K-Destiny Social Aura Card | CosmicPath',
    description:
        'Generate a share-ready K-Astrology aura card with Saju, astrology, and numerology-driven colors, keywords, and viral OG framing.',
    openGraph: {
        title: 'K-Destiny Social Aura Card | CosmicPath',
        description:
            'Generate a share-ready K-Astrology aura card with Saju, astrology, and numerology-driven colors, keywords, and viral OG framing.',
        images: ['/api/og/aura?name=K-Destiny%20Aura&colors=%230F8A5F%2C%232D7FF9&keywords=magnetic%2Clucid%2Ciconic&catchphrase=Share%20your%20K-Astrology%20identity%20with%20a%20card%20built%20to%20travel.'],
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
