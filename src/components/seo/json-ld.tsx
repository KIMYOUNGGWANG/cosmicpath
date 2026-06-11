export default function JsonLd() {
    const siteUrl = 'https://www.cosmicpath.app';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'CosmicPath',
                legalName: "Tony's Company",
                url: siteUrl,
                logo: `${siteUrl}/og-image.png`,
                contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'support@cosmicpath.app',
                    availableLanguage: ['ko', 'en'],
                },
            },
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                name: 'CosmicPath',
                url: siteUrl,
                inLanguage: ['ko-KR', 'en'],
                publisher: { '@id': `${siteUrl}/#organization` },
                description: '사주, 점성술, 타로를 교차해 막힌 질문의 첫 판정과 다음 행동을 정리하는 3단분석 서비스.',
            },
            {
                '@type': 'Service',
                '@id': `${siteUrl}/#three-layer-reading`,
                name: 'Decision Note',
                alternateName: 'Detailed Decision Note',
                serviceType: 'Saju, astrology, and tarot decision reading',
                provider: { '@id': `${siteUrl}/#organization` },
                areaServed: ['KR', 'US'],
                audience: {
                    '@type': 'Audience',
                    audienceType: 'People with relationship, career, money, or life-direction questions',
                },
                description: '질문 하나를 사주, 점성술, 타로 세 근거로 대조해 첫 판정, 근거, 다음 행동을 제시합니다.',
                offers: [
                    {
                        '@type': 'Offer',
                        name: 'First Decision Note',
                        price: '0',
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${siteUrl}/start?reset=true&entry=decision_timing_rebuild_v1`,
                    },
                    {
                        '@type': 'Offer',
                        name: 'Detailed Decision Note',
                        price: '9.99',
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${siteUrl}/start?reset=true&entry=decision_timing_rebuild_v1`,
                    },
                ],
            },
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
