import { prisma } from '@/lib/prisma';
import { PremiumReport } from '@/components/reading/premium-report';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

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

    if (!result) return { title: 'Not Found' };

    const reportData = JSON.parse(result.data);
    const title = reportData.summary?.title || 'CosmicPath Reading Result';

    return {
        title: `${title} | CosmicPath`,
        description: 'Shared reading result from CosmicPath AI.',
        openGraph: {
            title: `${title} | CosmicPath`,
            description: 'Your Sacred Narrative woven through Saju, Astrology, and Tarot',
            images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | CosmicPath`,
            images: ['/og-image.png'],
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


            {/* Refined Cosmic Atmosphere - Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-saju-blue/10 rounded-full blur-[80px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-tarot-purple/10 rounded-full blur-[80px] mix-blend-screen animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-deep-navy/20 rounded-full blur-[60px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 px-6 py-4 glass-panel border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                        <span className="font-cinzel text-lg">CosmicPath</span>
                    </Link>
                    <Link href="/" className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium hover:bg-purple-600/30 transition-all border border-purple-500/30">
                        {language === 'en' ? 'Get Your Reading' : '내 운세 보기'}
                    </Link>
                </div>
            </header>

            <div className="pt-28 pb-20">
                <PremiumReport
                    report={reportData}
                    metadata={metadata}
                    language={language}
                    shareUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.vercel.app'}/share/${id}`}
                />
            </div>
        </main>
    );
}
