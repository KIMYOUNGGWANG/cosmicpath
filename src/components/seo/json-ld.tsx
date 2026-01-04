export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CosmicPath',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app',
        logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app'}/favicon.ico`, // Ideally use a high-res logo
        sameAs: [
            // 'https://twitter.com/cosmicpath', // Add social profiles here
            // 'https://instagram.com/cosmicpath',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'support@cosmicpath.app',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
