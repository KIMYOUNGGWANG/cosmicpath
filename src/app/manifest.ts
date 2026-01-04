import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CosmicPath | AI Driven Destiny Navigation',
        short_name: 'CosmicPath',
        description: 'Navigate your destiny with AI-powered Saju, Astrology, and Tarot analysis.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
