import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Decision Note',
        short_name: 'Decision Note',
        description: 'A quiet note for turning one delayed decision into a clear next action.',
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
