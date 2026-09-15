import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CosmicPath | 5대 엔진 의사결정 도시에',
        short_name: 'CosmicPath',
        description: '사주·점성술·자미두수·태국호라삿·수비학 5대 결정론적 엔진을 교차 검증해 하나의 질문을 판정하는 Decision Note 서비스.',
        start_url: '/',
        display: 'standalone',
        background_color: '#11100d',
        theme_color: '#11100d',
        categories: ['lifestyle', 'productivity', 'utilities'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
