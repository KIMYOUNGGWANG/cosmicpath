import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock3, MessageCircle, ShieldAlert } from 'lucide-react';

import { GrowthEventTracker, GrowthTrackedLink } from '@/components/common/GrowthTracking';

const EN_CONTACT_SOURCE = 'en_relationship_contact_timing_v1';
const EN_CONTACT_ENTRY = 'en_relationship_contact_timing_v1';
const LANDING_VARIANT = 'en_contact_timing_v1';
const PRIMARY_CONTACT_QUESTION = 'Should I text them now, or wait a little longer?';

export const metadata: Metadata = {
  title: 'Next Move Report | Contact or Wait',
  description:
    'Get a first contact-or-wait verdict for a relationship or DM decision. First verdict free, full report $9.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/en/contact-timing',
  },
  openGraph: {
    title: 'Next Move Report | Contact or Wait',
    description:
      'First verdict free. Unlock why this contact timing verdict was chosen, when to move, and what message can backfire.',
    url: '/en/contact-timing',
    siteName: 'Next Move Report',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next Move Report | Contact or Wait',
    description: 'Decision support for the moment before you send the message.',
    images: ['/og-image.png'],
  },
};

const PROMPT_CARDS = [
  {
    id: 'text_now_or_wait',
    title: 'Text now or wait',
    summary: 'Check whether this moment supports a first move or a pause.',
    question: PRIMARY_CONTACT_QUESTION,
    Icon: MessageCircle,
  },
  {
    id: 'right_moment_to_move',
    title: 'Is the timing open',
    summary: 'Read whether moving first helps or adds pressure too early.',
    question: 'If there is still a chance, is this the right moment to move first?',
    Icon: Clock3,
  },
  {
    id: 'message_to_avoid',
    title: 'Avoid the wrong message',
    summary: 'Find the kind of text that can make a fragile opening close.',
    question: 'What message should I avoid sending right now?',
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
      entry: EN_CONTACT_ENTRY,
      lang: 'en',
      language: 'en',
    },
  };
}

export default function EnglishContactTimingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090f] text-starlight">
      <GrowthEventTracker
        trackingEvent={{
          event: 'landing_view',
          source: EN_CONTACT_SOURCE,
          language: 'en',
          context: 'love',
          metadata: {
            landingVariant: LANDING_VARIANT,
            experiment: EN_CONTACT_ENTRY,
          },
        }}
      />

      <section className="relative flex min-h-screen flex-col px-4 py-6 md:px-8">
        <Image
          src="/og-image.png"
          alt="Next Move Report decision timing visual"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,15,0.96),rgba(7,9,15,0.82)_44%,rgba(7,9,15,0.58)),linear-gradient(180deg,rgba(7,9,15,0.3),rgba(7,9,15,0.95))]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
          <header className="flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-white/72 transition-colors hover:text-white">
              Next Move Report
            </Link>
            <span className="text-sm text-white/48">First verdict free · Full report $9</span>
          </header>

          <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f1c66b]">
                Relationship decision timing
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] text-white md:text-7xl">
                Should I text them or wait?
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                Before you send the message, get a contact timing verdict: text now, wait, narrow the move, or hold.
                Saju, Astrology, and Tarot are optional evidence layers, not the product name or a guarantee that someone will respond.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <GrowthTrackedLink
                  href={startHref(PRIMARY_CONTACT_QUESTION)}
                  trackingEvent={{
                    event: 'english_contact_prompt_clicked',
                    source: EN_CONTACT_SOURCE,
                    step: 'primary_cta',
                    language: 'en',
                    context: 'love',
                    metadata: {
                      landingVariant: LANDING_VARIANT,
                      promptId: 'primary',
                      hasPrefilledQuestion: true,
                    },
                  }}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f1c66b] px-6 py-3 text-base font-bold text-[#14100a] transition-transform hover:-translate-y-0.5"
                >
                  See whether to text or wait
                  <ArrowRight className="h-5 w-5" />
                </GrowthTrackedLink>
                <Link
                  href="/guides/what-is-korean-saju"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-6 py-3 text-base font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  What is Saju?
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {PROMPT_CARDS.map((card) => {
                const Icon = card.Icon;

                return (
                  <GrowthTrackedLink
                    key={card.id}
                    href={startHref(card.question)}
                    trackingEvent={{
                      event: 'english_contact_prompt_clicked',
                      source: EN_CONTACT_SOURCE,
                      step: 'prompt_card',
                      language: 'en',
                      context: 'love',
                      metadata: {
                        landingVariant: LANDING_VARIANT,
                        promptId: card.id,
                        hasPrefilledQuestion: true,
                      },
                    }}
                    className="group grid gap-4 rounded-md border border-white/10 bg-black/25 p-4 backdrop-blur-md transition-colors hover:border-[#f1c66b]/40 hover:bg-black/40 sm:grid-cols-[40px_1fr_auto] sm:items-center lg:grid-cols-[40px_1fr]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#f1c66b]/20 bg-[#f1c66b]/10 text-[#f1c66b]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-white/58">{card.summary}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#f1c66b] transition-transform group-hover:translate-x-1 sm:col-span-2 lg:col-span-2">
                      Start with this
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </GrowthTrackedLink>
                );
              })}
            </div>
          </div>

          <footer className="relative z-10 pb-2 text-sm leading-6 text-white/42">
            Next Move Report decision support only. No guaranteed relationship outcome, no pressure tactics, no unsafe advice.
          </footer>
        </div>
      </section>
    </main>
  );
}
