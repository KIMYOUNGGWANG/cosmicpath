'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, ExternalLink, Share2, Sparkles, Users } from 'lucide-react';
import { CareerKeywordsResult } from '@/components/career/CareerKeywordsResult';
import { ProxyReadingModal } from '@/components/career/ProxyReadingModal';
import {
  CAREER_WORRY_OPTIONS,
  CareerKeywordsReport,
  CareerReadingMetadata,
} from '@/types/career';

interface CareerResultExperienceProps {
  readingId: string;
  report: CareerKeywordsReport;
  metadata: CareerReadingMetadata;
  createdAt: string;
  proxyReadingCount: number;
  maxProxyCount: number;
}

function findWorryLabel(value: CareerReadingMetadata['worryType']) {
  return CAREER_WORRY_OPTIONS.find((option) => option.value === value)?.label ?? 'Career Reading';
}

function formatReadingDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildSnapshotUrl(readingId: string) {
  return `/api/career/snapshot?readingId=${readingId}`;
}

function BackgroundLayers() {
  return (
    <>
      <div className="cosmic-dust opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),transparent_22%)]" />
      <div className="absolute left-12 top-16 h-48 w-48 rounded-full bg-cyan-300/10 blur-[110px]" />
    </>
  );
}

function TopBar({ readingId }: { readingId: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100/70"><Sparkles className="h-4 w-4 text-amber-200" />Career Oracle Result</span>
      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/50">Reading ID {readingId.slice(0, 8)}</span>
    </div>
  );
}

function SummaryCard({
  createdAt,
  metadata,
}: {
  createdAt: string;
  metadata: CareerReadingMetadata;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
      <p className="text-xs uppercase tracking-[0.22em] text-white/45">Result Summary</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/70">
        <span className="rounded-full border border-white/10 px-3 py-1.5">{findWorryLabel(metadata.worryType)}</span>
        <span className="rounded-full border border-white/10 px-3 py-1.5">{formatReadingDate(createdAt)}</span>
        <span className="rounded-full border border-white/10 px-3 py-1.5">{metadata.birthDate ?? 'Birth date hidden'}</span>
      </div>
    </div>
  );
}

function KeywordPreviewCard({
  rank,
  keyword,
  compatibility,
}: {
  rank: number;
  keyword: string;
  compatibility: number;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">Soul Match #{rank}</p>
      <p className="mt-3 text-xl font-semibold text-white">{keyword}</p>
      <p className="mt-3 text-sm text-cyan-100/70">Compatibility {compatibility}%</p>
    </div>
  );
}

function KeywordPreviewGrid({ report }: { report: CareerKeywordsReport }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {report.keywords.map((keyword) => (
        <KeywordPreviewCard key={keyword.keyword} rank={keyword.rank} keyword={keyword.keyword} compatibility={keyword.compatibility} />
      ))}
    </div>
  );
}

function ShareCard({
  onShare,
  onCopy,
  shareState,
}: {
  onShare: () => void;
  onCopy: () => void;
  shareState: string | null;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Sharing Area</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Share to Instagram / Threads</h3>
        </div>
        <Share2 className="h-5 w-5 text-cyan-100/70" />
      </div>
      <p className="mb-5 text-sm text-white/62">The snapshot route generates a tall OG card you can post directly after opening it.</p>
      <div className="flex flex-wrap gap-3">
        <button onClick={onShare} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"><ExternalLink className="h-4 w-4" />Share to Instagram / Threads</button>
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"><Copy className="h-4 w-4" />Copy snapshot URL</button>
      </div>
      {shareState && <p className="mt-4 text-sm text-cyan-100/70">{shareState}</p>}
    </section>
  );
}

function ProxyCard({
  remainingSlots,
  maxProxyCount,
  onOpen,
}: {
  remainingSlots: number;
  maxProxyCount: number;
  onOpen: () => void;
}) {
  const isDisabled = remainingSlots <= 0;

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Viral Loop Trigger</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">You have {maxProxyCount} free reading slots for friends.</h3>
        </div>
        <Users className="h-5 w-5 text-cyan-100/70" />
      </div>
      <div className="mb-5 inline-flex rounded-full border border-amber-300/25 bg-amber-200/10 px-4 py-2 text-sm text-amber-50/85">Remaining friend slots: {remainingSlots}</div>
      <p className="mb-5 text-sm text-white/62">Each friend check runs a new premium-style career keyword reading through the proxy API.</p>
      <button onClick={onOpen} disabled={isDisabled} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/15 disabled:cursor-not-allowed disabled:opacity-45"><ArrowRight className="h-4 w-4" />Check Friend&apos;s Fate</button>
    </section>
  );
}

function FooterLink() {
  return (
    <Link href="/career" className="inline-flex items-center gap-2 text-sm text-cyan-100/70 transition hover:text-white">
      <span>Run another career reading</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function CareerResultExperience({
  readingId,
  report,
  metadata,
  createdAt,
  proxyReadingCount,
  maxProxyCount,
}: CareerResultExperienceProps) {
  const [usedProxyCount, setUsedProxyCount] = useState(proxyReadingCount);
  const [shareState, setShareState] = useState<string | null>(null);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const remainingSlots = useMemo(() => Math.max(0, maxProxyCount - usedProxyCount), [maxProxyCount, usedProxyCount]);

  const handleShare = useCallback(() => {
    const snapshotUrl = buildSnapshotUrl(readingId);
    window.open(snapshotUrl, '_blank', 'noopener,noreferrer');
    setShareState('Snapshot opened in a new tab.');
  }, [readingId]);

  const handleCopy = useCallback(async () => {
    try {
      const snapshotUrl = `${window.location.origin}${buildSnapshotUrl(readingId)}`;
      await navigator.clipboard.writeText(snapshotUrl);
      setShareState('Snapshot URL copied.');
    } catch {
      setShareState('Clipboard permission was denied.');
    }
  }, [readingId]);

  const handleProxySuccess = useCallback((usedCount: number) => {
    setUsedProxyCount(usedCount);
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#040915] text-white">
      <BackgroundLayers />
      <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-14">
        <TopBar readingId={readingId} />
        <SummaryCard createdAt={createdAt} metadata={metadata} />
        <CareerKeywordsResult report={report} />
        <KeywordPreviewGrid report={report} />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ShareCard onShare={handleShare} onCopy={handleCopy} shareState={shareState} />
          <ProxyCard remainingSlots={remainingSlots} maxProxyCount={maxProxyCount} onOpen={() => setIsProxyModalOpen(true)} />
        </div>
        <FooterLink />
      </div>
      <ProxyReadingModal isOpen={isProxyModalOpen} readingId={readingId} remainingSlots={remainingSlots} onClose={() => setIsProxyModalOpen(false)} onSuccess={handleProxySuccess} />
    </main>
  );
}
