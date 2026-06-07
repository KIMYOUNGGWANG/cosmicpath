import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CosmicPath',
        short_name: 'CosmicPath',
        description: '사주, 점성술, 타로를 교차해 막힌 질문의 첫 판정과 다음 행동을 정리하는 3단분석 서비스.',
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
