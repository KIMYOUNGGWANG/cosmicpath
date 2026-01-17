import { prisma } from '@/lib/prisma';
import { PremiumReport } from '@/components/reading/premium-report';
import { SharedPageRedirect } from '@/components/reading/shared-page-redirect';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';
import { GlobalHeader } from '@/components/common/GlobalHeader';
import { ChatInterface } from '@/components/oracle-chat/ChatInterface';

// ... (previous imports)

interface SharedPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: SharedPageProps): Promise<Metadata> {
    const { id } = await params;
    const result = await prisma.readingResult.findUnique({
        where: { id },
    });

    const isKo = result?.metadata && JSON.parse(result.metadata).language === 'ko';

    // Default fallback
    let title = 'CosmicPath Reading Result';
    let description = 'Your Sacred Narrative woven through Saju, Astrology, and Tarot';

    if (result) {
        const reportData = JSON.parse(result.data);
        title = reportData.summary?.title || title;
        // Truncate description for URL safety and display
        description = reportData.summary?.content?.slice(0, 100) + '...' || description;
    }

    // Construct Dynamic OG Image URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app';
    const ogImageUrl = new URL('/api/og', baseUrl);
    ogImageUrl.searchParams.set('title', title);
    ogImageUrl.searchParams.set('desc', description);

    return {
        title: `${title} | CosmicPath`,
        description: description,
        alternates: {
            canonical: `${baseUrl}/share/${id}`,
        },
        openGraph: {
            title: `${title} | CosmicPath`,
            description: description,
            url: `${baseUrl}/share/${id}`,
            images: [{
                url: ogImageUrl.toString(),
                width: 1200,
                height: 630,
                alt: title
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | CosmicPath`,
            description: description,
            images: [ogImageUrl.toString()],
        },
    };
}

export default async function SharedPage({ params }: SharedPageProps) {
    const { id } = await params;
    const result = await prisma.readingResult.findUnique({
        where: { id },
    });

    if (!result) {
        notFound();
    }

    const reportData = JSON.parse(result.data);
    const metadata = result.metadata ? JSON.parse(result.metadata) : undefined;
    const language = metadata?.language || 'ko';

    return (
        <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-star-yellow selection:text-deep-navy font-outfit">
            <SharedPageRedirect id={id} />


            {/* Refined Cosmic Atmosphere - Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-saju-blue/10 rounded-full blur-[80px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-tarot-purple/10 rounded-full blur-[80px] mix-blend-screen animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-deep-navy/20 rounded-full blur-[60px]" />
            </div>

            <GlobalHeader language={language} />


            <div className="pt-32 pb-20">
                <PremiumReport
                    report={reportData}
                    metadata={metadata}
                    language={language}
                    isPremium={metadata?.isPremium}
                    shareUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app'}/share/${id}`}
                />

                {/* Oracle Chat Integration */}
                <div className="container mx-auto px-4 mt-12 mb-20">
                    <ChatInterface readingId={id} />
                </div>
            </div>
        </main>
    );
}

