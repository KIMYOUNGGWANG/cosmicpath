import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/start`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/daily`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.85,
        },
        {
            url: `${baseUrl}/career/uncertainty`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/relationship/contact-timing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.82,
        },
        {
            url: `${baseUrl}/en/contact-timing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.82,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}
