import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, MessageCircle, ShieldAlert } from 'lucide-react';

import { GrowthEventTracker, GrowthTrackedLink } from '@/components/common/GrowthTracking';

const RELATIONSHIP_CONTACT_SOURCE = 'next_move_report_mvp_v1';
const RELATIONSHIP_CONTACT_ENTRY = 'next_move_report_mvp_v1';
const PRIMARY_CONTACT_QUESTION = '지금 먼저 연락하는 게 맞을까, 조금 더 기다리는 게 맞을까?';

type RelationshipContactSearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: '연락 결정 정리',
  description: '상대에게 지금 연락할지 기다릴지 먼저 판정하고, 사주·점성술·타로는 선택적 근거 레이어로만 참고합니다.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/relationship/contact-timing',
  },
  openGraph: {
    title: '연락 결정 정리',
    description: '첫 정리 무료. 자세한 기록에서는 판단 근거, 연락 타이밍, 메시지 리스크를 엽니다.',
    url: '/relationship/contact-timing',
    siteName: '오늘의 결정 정리',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '연락 결정 정리',
    description: '상대에게 지금 움직여도 되는지 먼저 보는 관계/DM 결정 정리.',
    images: ['/og-image.png'],
  },
};

const PROMPT_CARDS = [
  {
    id: 'contact_or_wait',
    title: '먼저 연락할까',
    summary: '지금 움직일지, 조금 더 기다릴지 먼저 봅니다.',
    question: PRIMARY_CONTACT_QUESTION,
    Icon: MessageCircle,
  },
  {
    id: 'response_timing',
    title: '반응이 올까',
    summary: '상대가 다시 반응할 가능성이 있다면 타이밍이 맞는지 봅니다.',
    question: '상대가 다시 반응할 가능성이 있다면 내가 먼저 움직여야 할 타이밍일까?',
    Icon: Clock3,
  },
  {
    id: 'message_risk',
    title: '뭐라고 보내야 할까',
    summary: '보내도 되는 말과 피해야 할 메시지를 나눠 봅니다.',
    question: '이 관계에서 지금 보내면 안 되는 메시지와 해도 되는 행동은 뭐야?',
    Icon: ShieldAlert,
  },
] as const;

function startHref(question: string) {
  return {
    pathname: '/start',
    query: {
      reset: 'true',
      context: 'love',
      question,
      entry: RELATIONSHIP_CONTACT_ENTRY,
    },
  };
}

function getSearchParam(searchParams: RelationshipContactSearchParams, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function buildCampaignMetadata(searchParams: RelationshipContactSearchParams) {
  const utmSource = getSearchParam(searchParams, 'utm_source');
  const utmCampaign = getSearchParam(searchParams, 'utm_campaign');
  const utmContent = getSearchParam(searchParams, 'utm_content');

  return {
    experiment: RELATIONSHIP_CONTACT_ENTRY,
    ...(utmSource ? { utmSource } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(utmContent ? { utmContent } : {}),
  };
}

interface RelationshipContactTimingPageProps {
  searchParams?: Promise<RelationshipContactSearchParams>;
}

export default async function RelationshipContactTimingPage({
  searchParams,
}: RelationshipContactTimingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const campaignMetadata = buildCampaignMetadata(resolvedSearchParams);

  return (
    <main className="min-h-screen bg-[#090b10] px-4 py-6 text-starlight md:px-8">
      <GrowthEventTracker
        trackingEvent={{
          event: 'landing_view',
          source: RELATIONSHIP_CONTACT_SOURCE,
          language: 'ko',
          context: 'love',
          metadata: campaignMetadata,
        }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
            오늘의 결정 정리
          </Link>
          <span className="text-sm text-white/42">첫 정리 무료 · 자세한 기록 결제</span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#f1c66b]">연락 결정 정리</p>
            <h1 className="mt-4 break-keep text-5xl font-bold leading-[1.03] text-white md:text-7xl">
              연락할까,
              <br />
              기다릴까
            </h1>
            <p className="mt-6 max-w-xl break-keep text-base leading-8 text-white/68 md:text-lg">
              지금은 연락, 대기, 축소, 보류 중 어디에 가까운지 먼저 정리합니다.
              사주·점성술·타로는 선택적 근거 레이어로만 쓰고, 상대 마음이나 답장을 보장하지 않습니다.
            </p>

            <div className="mt-8">
              <GrowthTrackedLink
                href={startHref(PRIMARY_CONTACT_QUESTION)}
                trackingEvent={{
                  event: 'relationship_contact_prompt_clicked',
                  source: RELATIONSHIP_CONTACT_SOURCE,
                  step: 'primary_cta',
                  language: 'ko',
                  context: 'love',
                  metadata: {
                    ...campaignMetadata,
                    promptId: 'primary',
                    hasPrefilledQuestion: true,
                  },
                }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#f1c66b] px-6 py-3 text-base font-bold text-[#14100a] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                이 질문으로 먼저 보기
                <ArrowRight className="h-5 w-5" />
              </GrowthTrackedLink>
            </div>
          </div>

          <div className="mt-10 grid gap-3">
            {PROMPT_CARDS.map((card) => {
              const Icon = card.Icon;

              return (
                <GrowthTrackedLink
                  key={card.id}
                  href={startHref(card.question)}
                  trackingEvent={{
                    event: 'relationship_contact_prompt_clicked',
                    source: RELATIONSHIP_CONTACT_SOURCE,
                    step: 'prompt_card',
                    language: 'ko',
                    context: 'love',
                    metadata: {
                      ...campaignMetadata,
                      promptId: card.id,
                      hasPrefilledQuestion: true,
                    },
                  }}
                  className="group grid gap-4 rounded-md border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-[#f1c66b]/45 hover:bg-white/[0.06] sm:grid-cols-[40px_1fr_auto] sm:items-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#f1c66b]/20 bg-[#f1c66b]/8 text-[#f1c66b]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                    <p className="mt-1 break-keep text-sm leading-6 text-white/58">{card.summary}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#f1c66b] transition-transform group-hover:translate-x-1">
                    선택
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </GrowthTrackedLink>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-3 pb-2 text-sm leading-6 text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <span>자세한 기록에서는 왜 이 방향인지, 연락 타이밍, 피해야 할 메시지 리스크를 엽니다.</span>
          <span className="flex gap-4 text-xs uppercase tracking-widest">
            <Link href="/terms" className="transition-colors hover:text-white">
              이용약관
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              개인정보처리방침
            </Link>
          </span>
        </footer>
      </div>
    </main>
  );
}
