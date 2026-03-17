import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getReadingShareSummary } from '@/lib/reading-share';
import { SharedPageRedirect } from '@/components/reading/shared-page-redirect';

import { SharedPageClient } from './SharedPageClient';

interface SharedPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SharedPageProps): Promise<Metadata> {
  const { id } = await params;

  const reading = await prisma.readingResult.findUnique({
    where: { id },
    select: {
      data: true,
      metadata: true,
    },
  });

  if (!reading) {
    return {
      title: 'CosmicPath',
      description: 'AI oracle reading platform',
    };
  }

  const share = getReadingShareSummary(reading);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app';
  const ogImageUrl = `${baseUrl}/api/og/reading/${id}`;
  const canonicalUrl = `${baseUrl}/share/${id}`;

  return {
    title: `${share.title} | CosmicPath`,
    description: share.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${share.title} | CosmicPath`,
      description: share.description,
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
  };
}

export default async function SharedPage({ params }: SharedPageProps) {
  const { id } = await params;

  const reading = await prisma.readingResult.findUnique({
    where: { id },
    select: {
      id: true,
      data: true,
      metadata: true,
    },
  });

  if (!reading) {
    notFound();
  }

  const reportData = JSON.parse(reading.data);
  const metadata = reading.metadata ? JSON.parse(reading.metadata) : {};
  const share = getReadingShareSummary(reading);

  return (
    <>
      <SharedPageRedirect id={id} />
      <SharedPageClient
        id={id}
        reportData={reportData}
        metadata={metadata}
        shareSummary={share}
      />
    </>
  );
}
