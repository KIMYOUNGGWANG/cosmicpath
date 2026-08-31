import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CosmicPath',
        short_name: 'CosmicPath',
        description: '사주로 구조를 보고, 점성으로 타이밍을 보고, 5대 계산 엔진을 교차 검증해 하나의 질문을 판정하는 Decision Note 서비스.',
        start_url: '/',
        display: 'standalone',
        background_color: '#11100d',
        theme_color: '#11100d',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
