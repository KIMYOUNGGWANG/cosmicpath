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
                description: 'CosmicPath Decision Note는 질문 하나를 먼저 판정합니다. Saju = structure, astrology = timing, tarot = immediate signal.',
            },
            {
                '@type': 'Service',
                '@id': `${siteUrl}/#decision-note`,
                name: 'CosmicPath Decision Note',
                alternateName: 'Detailed 3-Layer Decision Report',
                serviceType: 'Decision Note with Saju structure, astrology timing, and tarot immediate signal',
                provider: { '@id': `${siteUrl}/#organization` },
                areaServed: ['KR', 'US'],
                audience: {
                    '@type': 'Audience',
                    audienceType: 'People with relationship, career, money, or life-direction questions',
                },
                description: 'Detailed 3-Layer Decision Report explains why this verdict was chosen, using Saju as structure, astrology as timing, and tarot as immediate signal.',
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
                        name: 'Detailed 3-Layer Decision Report',
                        price: '3.99',
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
