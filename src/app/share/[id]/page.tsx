import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getReadingShareSummary } from '@/lib/reading-share';
import { stripPrivateReadingMetadata } from '@/lib/reading-access';

import { SharedPageClient } from './SharedPageClient';

interface SharedPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export default async function SharedPage({ params, searchParams }: SharedPageProps) {
  const { id } = await params;
  if (searchParams) {
    await searchParams;
  }

  const reading = await prisma.readingResult.findUnique({
    where: { id },
    select: {
      id: true,
      data: true,
      metadata: true,
      userId: true,
    },
  });

  if (!reading) {
    notFound();
  }

  const share = getReadingShareSummary(reading);
  const session = await auth();
  const sessionUserId = session?.user?.id ?? null;
  const hasSessionOwnerAccess = Boolean(
    reading.userId &&
    sessionUserId &&
    reading.userId === sessionUserId
  );
  const initialReportData = hasSessionOwnerAccess ? JSON.parse(reading.data) : null;
  const initialMetadata = hasSessionOwnerAccess
    ? stripPrivateReadingMetadata(reading.metadata)
    : null;

  return (
    <SharedPageClient
      id={id}
      initialReportData={initialReportData}
      initialMetadata={initialMetadata}
      shareSummary={share}
      readingOwnerUserId={reading.userId}
    />
  );
}
