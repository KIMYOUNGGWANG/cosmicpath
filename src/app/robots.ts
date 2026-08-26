import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.cosmicpath.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/llms.txt', '/llms-full.txt'],
                disallow: ['/api/', '/private/', '/admin/'],
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'PerplexityBot',
                    'ClaudeBot',
                    'Claude-Web',
                    'Applebot-Extended',
                    'Google-Extended',
                    'cohere-ai',
                ],
                allow: ['/', '/llms.txt', '/llms-full.txt'],
                disallow: ['/api/', '/private/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
