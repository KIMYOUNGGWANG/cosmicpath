import { notFound } from 'next/navigation';
import { CareerResultExperience } from '@/components/career/CareerResultExperience';
import { prisma } from '@/lib/prisma';
import {
  parseCareerReadingMetadata,
  parseCareerReadingReport,
} from '@/lib/career/report-parser';

interface CareerResultPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

async function findCareerReading(id: string) {
  return prisma.readingResult.findUnique({ where: { id } });
}

export default async function CareerResultPage({
  params,
}: CareerResultPageProps) {
  const { id } = await params;
  const reading = await findCareerReading(id);
  const report = reading ? parseCareerReadingReport(reading.data) : null;

  if (!reading || !report) notFound();

  return (
    <CareerResultExperience
      readingId={reading.id}
      report={report}
      createdAt={reading.createdAt.toISOString()}
      proxyReadingCount={reading.proxyReadingCount}
      maxProxyCount={reading.maxProxyCount}
      metadata={parseCareerReadingMetadata(reading.metadata)}
    />
  );
}
