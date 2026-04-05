import type { Metadata } from 'next';

import { StructuredData } from '@/components/seo/StructuredData';

import MatchNewClient from './MatchNewClient';

const pageUrl = 'https://cosmicpath.app/match/new';

export const metadata: Metadata = {
    title: '궁합 초대 링크 만들기 | CosmicPath',
    description: '이름과 생년월일로 궁합 초대 링크를 만들고 상대방과 공유하세요. 사주, 타로, 관계 시그널을 함께 보는 궁합 진입 페이지입니다.',
    keywords: ['궁합', '궁합 테스트', '사주 궁합', '연애 궁합', '커플 궁합', '타로 궁합', '운세 궁합'],
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/match/new',
    },
    openGraph: {
        title: '궁합 초대 링크 만들기 | CosmicPath',
        description: '상대방에게 바로 보낼 수 있는 궁합 초대 링크를 만들고, 함께 사주와 타로 기반 궁합 분석을 시작하세요.',
        url: pageUrl,
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: '궁합 초대 링크 만들기 | CosmicPath',
        description: '사주와 타로 기반 궁합 분석을 시작하는 가장 빠른 초대 링크 생성 페이지.',
        images: ['/og-image.png'],
    },
};

export default function MatchNewPage() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '궁합 초대 링크 만들기',
        url: pageUrl,
        description: '상대방에게 보낼 수 있는 궁합 초대 링크를 만들고 관계 궁합 분석을 시작하는 페이지.',
        inLanguage: 'ko-KR',
        about: ['궁합', '사주 궁합', '타로 궁합', '연애 궁합'],
    };

    return (
        <>
            <StructuredData data={structuredData} />
            <MatchNewClient />
        </>
    );
}
