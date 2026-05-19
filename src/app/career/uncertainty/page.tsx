import { Metadata } from 'next';
import Link from 'next/link';

import { GrowthEventTracker, GrowthTrackedLink } from '@/components/common/GrowthTracking';

const CAREER_TIMING_SOURCE = 'career_timing_wedge_399';
const CAREER_TIMING_ENTRY = 'career_timing_wedge_399';
const PRIMARY_CAREER_QUESTION = '지금 내 커리어에서 더 버텨야 할까, 아니면 방향을 바꿔야 할까?';

export const metadata: Metadata = {
  title: '버틸지 옮길지 먼저 보기 | $3.99 커리어 타이밍 리딩 | CosmicPath',
  description: '이직, 퇴사, 승진, 번아웃이 헷갈릴 때 지금 움직일지 더 기다릴지 먼저 보는 커리어 타이밍 리딩입니다. 첫 결과 무료, 전체 리딩 $3.99.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/career/uncertainty',
  },
  openGraph: {
    title: '버틸지 옮길지 먼저 보기 | CosmicPath',
    description: '첫 결과 무료, 전체 커리어 타이밍 리딩 $3.99.',
    url: '/career/uncertainty',
    siteName: 'CosmicPath',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '버틸지 옮길지 먼저 보기 | CosmicPath',
    description: '첫 결과 무료, 전체 커리어 타이밍 리딩 $3.99.',
    images: ['/og-image.png'],
  },
};

const PROMPT_CARDS = [
  {
    title: '지금 옮겨도 될까',
    summary: '괜히 조급한 건지, 진짜 타이밍이 온 건지부터 봅니다.',
    question: '지금 이직을 준비해야 할까, 아니면 지금 자리에서 더 버텨야 할까?',
    slug: 'move_or_hold',
  },
  {
    title: '6개월 안에 뭘 먼저 할까',
    summary: '불안할수록 해야 할 일을 늘리기보다 먼저 챙길 한 가지를 좁혀봅니다.',
    question: '앞으로 6개월 안에 내 커리어에서 가장 먼저 준비해야 할 것은 무엇일까?',
    slug: 'next_six_months',
  },
  {
    title: '이 일, 나랑 맞을까',
    summary: '열심히 하는데도 자꾸 안 맞는 느낌이 드는 이유를 봅니다.',
    question: '지금 하고 있는 일이 내 강점을 제대로 쓰고 있는 걸까, 아니면 방향이 어긋난 걸까?',
    slug: 'role_fit',
  },
] as const;

export default function CareerUncertaintyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void px-4 py-20 text-starlight">
      <GrowthEventTracker
        trackingEvent={{
          event: 'landing_view',
          source: CAREER_TIMING_SOURCE,
          language: 'ko',
          context: 'career',
          metadata: {
            experiment: CAREER_TIMING_ENTRY,
          },
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16)_0%,transparent_38%),radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12)_0%,transparent_30%),radial-gradient(circle_at_80%_30%,rgba(74,14,14,0.22)_0%,transparent_42%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-acc-gold/25 bg-acc-gold/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-acc-gold">
              커리어 타이밍 리딩
            </div>
            <h1 className="mt-6 break-keep text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              버텨야 할지, 옮겨야 할지
              <br />
              요즘 계속 헷갈리죠
            </h1>
            <p className="mt-6 max-w-3xl break-keep text-base leading-8 text-moonlight md:text-xl">
              이직이 맞는 건지, 그냥 지금이 너무 지쳐서 흔들리는 건지, 아니면 아예 방향이 안 맞는 건지 혼자선 잘 안 보일 때가 있습니다.
              CosmicPath는 그 찝찝함을 &ldquo;지금 움직여도 되는지, 더 쌓아야 하는지, 무엇부터 준비해야 하는지&rdquo; 같은 커리어 질문으로 바꿔 읽습니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/72">
                지금 옮겨도 될까
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/72">
                뭘 먼저 준비할까
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/72">
                이 일이 나랑 맞을까
              </span>
              <span className="rounded-full border border-acc-gold/25 bg-acc-gold/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-acc-gold">
                첫 결과 무료 · 전체 $3.99
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {PROMPT_CARDS.map((card) => (
            <GrowthTrackedLink
              key={card.slug}
              href={{
                pathname: '/start',
                query: {
                  reset: 'true',
                  context: 'career',
                  question: card.question,
                  entry: CAREER_TIMING_ENTRY,
                },
              }}
              trackingEvent={{
                event: 'career_uncertainty_cta_clicked',
                source: CAREER_TIMING_SOURCE,
                step: 'prompt_card',
                language: 'ko',
                context: 'career',
                metadata: {
                  promptSlug: card.slug,
                },
              }}
              className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-acc-gold/40 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_rgba(212,175,55,0.12)]"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-acc-gold">많이 하는 질문</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{card.title}</h2>
              <p className="mt-4 break-keep text-sm leading-7 text-white/72">{card.summary}</p>
              <p className="mt-6 break-keep text-sm leading-7 text-moonlight">{`"${card.question}"`}</p>
              <p className="mt-5 break-keep text-xs leading-6 text-white/52">
                첫 결과를 무료로 보고, 근거·타이밍·행동 순서는 $3.99로 엽니다.
              </p>
              <div className="mt-8 inline-flex items-center text-sm font-semibold text-acc-gold transition-transform duration-300 group-hover:translate-x-1">
                이 질문으로 먼저 보기
              </div>
            </GrowthTrackedLink>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/25 p-6 backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-acc-gold">여기서 볼 수 있어요</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">막연한 불안으로 두지 않기</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-white/68">
                  &ldquo;요즘 일하기 싫다&rdquo;에서 멈추지 않고, 정확히 뭐가 걸리는지 질문으로 좁혀 봅니다.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">정답보다 타이밍 보기</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-white/68">
                  무조건 나가야 하느냐 버텨야 하느냐보다, 언제 움직이고 무엇부터 준비해야 하는지에 더 집중합니다.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">사주를 커리어 질문에 맞게</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-white/68">
                  어렵고 추상적인 말 대신, 지금 일의 방향과 적합도를 읽는 데 필요한 쪽으로 봅니다.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-semibold text-white">읽고 나서 다음 행동까지</h3>
                <p className="mt-3 break-keep text-sm leading-7 text-white/68">
                  답답함만 정리하고 끝내지 않게, 지금 뭘 먼저 해야 할지 한 단계 더 좁혀봅니다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-acc-gold">여기서 시작</p>
            <h2 className="mt-4 break-keep text-2xl font-semibold text-white">
              질문 하나만 정하면
              <br />
              바로 첫 리딩까지 갑니다
            </h2>
            <p className="mt-4 break-keep text-sm leading-7 text-white/72">
              커리어 맥락이 이미 들어가 있어서, 뜬구름 잡는 설명 없이 지금 내 상황부터 바로 볼 수 있습니다.
              무료 결과로 방향을 먼저 확인하고, 전체 리딩에서는 근거·타이밍·행동 순서를 엽니다.
            </p>

            <div className="mt-8 space-y-3">
              <GrowthTrackedLink
                href={{
                  pathname: '/start',
                  query: {
                    reset: 'true',
                    context: 'career',
                    question: PRIMARY_CAREER_QUESTION,
                    entry: CAREER_TIMING_ENTRY,
                  },
                }}
                trackingEvent={{
                  event: 'career_uncertainty_cta_clicked',
                  source: CAREER_TIMING_SOURCE,
                  step: 'primary_cta',
                  language: 'ko',
                  context: 'career',
                  metadata: {
                    promptSlug: 'primary',
                  },
                }}
                className="block w-full rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold px-6 py-4 text-center text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-[1.01]"
              >
                버틸지 옮길지 먼저 보기
              </GrowthTrackedLink>

              <GrowthTrackedLink
                href="/daily"
                trackingEvent={{
                  event: 'career_uncertainty_secondary_clicked',
                  source: CAREER_TIMING_SOURCE,
                  step: 'secondary_cta',
                  language: 'ko',
                  context: 'career',
                }}
                className="block w-full rounded-full border border-white/15 bg-white/5 px-6 py-4 text-center text-base font-semibold text-starlight transition-all duration-300 hover:border-white/30 hover:bg-white/10"
              >
                오늘 일 흐름 먼저 보기
              </GrowthTrackedLink>
            </div>

            <Link
              href="/"
              className="mt-6 inline-block text-sm text-dim underline transition-colors hover:text-acc-gold"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
