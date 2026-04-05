import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { getMatchShareSummary } from '@/lib/match-share';

interface MatchLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: MatchLayoutProps): Promise<Metadata> {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app';

    const session = await prisma.matchSession.findUnique({
        where: { id },
        select: {
            hostName: true,
            guestName: true,
            score: true,
            metadata: true,
        },
    });

    if (!session) {
        return {
            title: 'CosmicPath Match',
            description: 'Compatibility reading powered by Saju, astrology, and tarot.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const share = getMatchShareSummary(session);
    const imageUrl = `${baseUrl}/api/og/match/${id}`;
    const canonicalUrl = `${baseUrl}/match/${id}/${share.status === 'invite' ? 'join' : 'result'}`;

    return {
        title: `${share.title} | CosmicPath`,
        description: share.description,
        robots: {
            index: false,
            follow: false,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${share.title} | CosmicPath`,
            description: share.description,
            url: canonicalUrl,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: share.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${share.title} | CosmicPath`,
            description: share.description,
            images: [imageUrl],
        },
    };
}

export default function MatchLayout({ children }: MatchLayoutProps) {
    return children;
}
