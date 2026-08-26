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
                description: 'CosmicPath Decision Note는 질문 하나를 먼저 판정합니다. Saju = structure, astrology = timing, ziwei & numerology = strategic cycles.',
            },
            {
                '@type': 'WebApplication',
                '@id': `${siteUrl}/#app`,
                name: 'CosmicPath',
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'All',
                browserRequirements: 'Requires JavaScript. Requires HTML5.',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                },
                description: '5-Engine Strategic Decision Dossier combining Saju, Western Astrology, Ziwei Doushu, Thai Royal Astrology, and Numerology.',
            },
            {
                '@type': 'FAQPage',
                '@id': `${siteUrl}/#faq`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: '코스믹패스(CosmicPath)는 어떤 원리로 의사결정을 판정하나요?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: '코스믹패스는 막연한 운세나 타로 대신 5대 결정론적 계산 엔진(사주 4주 원국, 서양 점성술 천체도, 자미두수 12궁 명반, 태국 왕실 점성술 마하탁사 108년 주기, 피타고라스 수비학)의 수학적 계산 데이터를 교차 검증하여, 지금 움직이기(Move Now), 기한 두고 기다리기(Wait with Deadline), 선택지 좁히기(Narrow First), 보류/중단(Hold or Stop)의 4가지 명확한 결단 방향을 도출합니다.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: '사주와 서양 점성술, 자미두수를 함께 분석하는 이유는 무엇인가요?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: '사주는 타고난 기질과 10년 대운의 구조적 뼈대를 제공하고, 서양 점성술은 현재 행성 트랜짓을 통해 시기적 압박과 골든타임을 포착하며, 자미두수 12궁은 사회적 관계와 직업·재물 궁위를 정밀하게 조명합니다. 동서양 엔진의 합의 신호(Consensus Signal)를 분석하여 한쪽 관점에 치우치지 않는 입체적인 의사결정 근거를 제공합니다.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: '태국 왕실 점성술(마하탁사 108년 주기)은 어떤 정보를 제공하나요?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: '태국 호라삿(Horasat) 왕실 점성술은 출생 시 태양과 행성의 각도를 통해 사회적 가면(타누셋)과 본래 자아(타누락)의 갭을 진단하고, 108년에 걸친 8대 마하탁사 행성 지배기 타임라인을 통해 현재 인생의 황금기와 방어기를 정밀하게 제시합니다.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: 'VIP 의사결정 마스터 리포트에는 어떤 내용이 포함되나요?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'VIP 리포트는 4대 도메인 체계로 구성됩니다: (1) 30초 결단 브리프 및 3단계 실천 액션 플랜, 길일/흉일 캘린더, (2) 10년 대운 타임라인, 12개월 운세 실행 장부, 48주 주간 골든타임 히트맵, (3) 자미두수 12궁 명반, 오행 개운법, 신살(도화/현침 등)의 고수익 프로페셔널 무기 승화법, (4) 4대 인생영역(커리어/재물/애정/건강) 점수 및 천을귀인 조력자 분석, 1:1 오라클 AI 추가 상담 기능을 제공합니다.',
                        },
                    },
                    {
                        '@type': 'Question',
                        name: '개인정보와 출생 시각 데이터는 안전하게 보호되나요?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: '사용자의 생년월일, 태어난 시간, 고민 질문은 엄격한 암호화 및 비공개 세션 저장소에 안전하게 보호되며, 공개 검색엔진이나 공유 링크에 개인정보가 절대 노출되지 않습니다.',
                        },
                    },
                ],
            },
            {
                '@type': 'Service',
                '@id': `${siteUrl}/#decision-note`,
                name: 'CosmicPath Decision Dossier',
                alternateName: 'VIP 5-Engine Decision Dossier',
                serviceType: 'Decision Support Dossier with 5-Engine deterministic calculations',
                provider: { '@id': `${siteUrl}/#organization` },
                areaServed: ['KR', 'US', 'GLOBAL'],
                audience: {
                    '@type': 'Audience',
                    audienceType: 'People facing critical career, relationship, financial, or life decisions',
                },
                description: 'VIP Decision Dossier explains why this verdict was chosen, using 5-Engine synthesis combining Saju, Western Astrology, Ziwei Doushu, Thai Astrology, and Numerology.',
                offers: [
                    {
                        '@type': 'Offer',
                        name: 'Free Executive Decision Brief',
                        price: '0',
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${siteUrl}/start`,
                    },
                    {
                        '@type': 'Offer',
                        name: 'VIP Decision Master Report',
                        price: '3.99',
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${siteUrl}/start`,
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
