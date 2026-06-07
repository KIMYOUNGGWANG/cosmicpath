import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.cosmicpath.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/', // Example of disallowed path
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
