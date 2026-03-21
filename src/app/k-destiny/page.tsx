import type { Metadata } from 'next';

import { Footer } from '@/components/landing/Footer';
import { Navigation } from '@/components/landing/Navigation';
import { StructuredData } from '@/components/seo/StructuredData';

import { KDestinyExperience } from './KDestinyExperience';

export const metadata: Metadata = {
    title: 'K-Destiny 소셜 아우라 카드 | CosmicPath',
    description:
        '사주, 점성술, 수비학 기반의 K-Destiny 소셜 아우라 카드를 만들고 카카오톡, Threads, X에 바로 공유하세요.',
    keywords: ['K-Destiny', '아우라 카드', '소셜 운세 카드', '사주 카드', '카카오 공유 카드', '운세 OG 이미지'],
    alternates: {
        canonical: '/k-destiny',
    },
    openGraph: {
        title: 'K-Destiny 소셜 아우라 카드 | CosmicPath',
        description:
            '사주와 점성술 기반의 K-Destiny 아우라 카드를 만들고 공유용 OG 이미지로 바로 내보내세요.',
        url: 'https://cosmicpath.app/k-destiny',
        type: 'website',
        images: ['/api/og/aura?name=K-Destiny%20Aura&colors=%230F8A5F%2C%232D7FF9&keywords=magnetic%2Clucid%2Ciconic&catchphrase=Share%20your%20K-Astrology%20identity%20with%20a%20card%20built%20to%20travel.'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'K-Destiny 소셜 아우라 카드 | CosmicPath',
        description: '공유하기 좋은 K-Destiny 아우라 카드 생성 페이지.',
        images: ['/api/og/aura?name=K-Destiny%20Aura&colors=%230F8A5F%2C%232D7FF9&keywords=magnetic%2Clucid%2Ciconic&catchphrase=Share%20your%20K-Astrology%20identity%20with%20a%20card%20built%20to%20travel.'],
    },
};

export default function KDestinyPage() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'K-Destiny 소셜 아우라 카드',
        url: 'https://cosmicpath.app/k-destiny',
        description: '사주, 점성술, 수비학 기반으로 공유용 아우라 카드를 생성하는 페이지.',
        inLanguage: 'ko-KR',
        about: ['사주', '아우라 카드', '소셜 공유', '운세 이미지'],
    };

    return (
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void">
            <StructuredData data={structuredData} />
            <Navigation />
            <KDestinyExperience />
            <Footer />
        </main>
    );
}
