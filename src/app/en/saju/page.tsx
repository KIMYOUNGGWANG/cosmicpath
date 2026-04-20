import type { Metadata } from 'next';
import { SajuLandingExperience } from './SajuLandingExperience';

export const metadata: Metadata = {
    title: 'Korean Saju Reading — Decode Your Destiny | CosmicPath',
    description:
        'Western astrology tells you who you are. Korean Saju tells you what to do next. Get your premium East-meets-West destiny reading — clear, decisive, and deeply personal.',
    keywords: [
        'Korean Saju',
        'K-Astrology',
        'Saju reading',
        'destiny reading',
        'Korean fortune telling',
        'East meets West astrology',
        'Bazi chart',
        'Four Pillars of Destiny',
        'K-occult',
        'spiritual reading',
    ],
    alternates: {
        canonical: '/en/saju',
    },
    openGraph: {
        title: 'Korean Saju Reading — What Should You Do Next?',
        description:
            'Your birth date holds a cosmic blueprint. Korean Saju reveals decisive timings for career, love, and life — not vague affirmations, but clear verdicts.',
        url: 'https://cosmicpath.app/en/saju',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: '/api/og/saju-en',
                width: 1200,
                height: 630,
                alt: 'CosmicPath — Korean Saju Reading in English',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Korean Saju Reading — Decode Your Destiny',
        description:
            'Not your usual astrology. Korean Saju gives you a verdict, not a horoscope. Try it now.',
    },
};

export default function EnSajuPage() {
    return <SajuLandingExperience />;
}
