import type { Metadata } from 'next';
import Link from 'next/link';

import {
    GrowthEventTracker,
    GrowthTrackedLink,
} from '@/components/common/GrowthTracking';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { StructuredData } from '@/components/seo/StructuredData';
import { ENGLISH_GUIDES } from '@/lib/english-guides';
import { getLandingVariant } from '@/lib/language-preference';

export const metadata: Metadata = {
    title: 'English Starter Guides | CosmicPath',
    description:
        'Learn what Korean saju is, how it relates to BaZi, and how CosmicPath turns it into a decision timing reading.',
    keywords: [
        'Korean Saju guide',
        'Saju vs BaZi',
        'decision timing reading',
        'Four Pillars guide',
    ],
    alternates: {
        canonical: '/guides',
    },
    openGraph: {
        title: 'English Starter Guides | CosmicPath',
        description:
            'Learn what Korean saju is, how it relates to BaZi, and how CosmicPath turns it into a decision timing reading.',
        url: 'https://www.cosmicpath.app/guides',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'English Starter Guides | CosmicPath',
        description:
            'Learn what Korean saju is, how it relates to BaZi, and how CosmicPath turns it into a decision timing reading.',
        images: ['/og-image.png'],
    },
};

const accentMap = {
    gold: 'border-[#D4AF37]/24 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
    indigo: 'border-[#6366F1]/24 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
    rose: 'border-[#FB7185]/24 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]',
} as const;

const differentiators = [
    {
        eyebrow: 'Owned Lens',
        title: 'Korean saju stays visible',
        description:
            'The product does not flatten itself into generic astrology. It keeps the Korean category identity, then translates it for English-speaking users.',
    },
    {
        eyebrow: 'Bridge Layer',
        title: 'BaZi is used as a category bridge',
        description:
            'Users who already know Four Pillars or BaZi can orient faster, while new users still learn why the Korean framing is distinct.',
    },
    {
        eyebrow: 'User Promise',
        title: 'The reading is framed around decisions',
        description:
            'The point is not endless chart decoding. The point is whether to move now, wait longer, protect your energy, or commit with better timing.',
    },
];

const flowSteps = [
    'Choose the domain before the symbols take over the experience.',
    'Write one live question with a real timing problem inside it.',
    'Open the free focus block and decide whether the signal is sharp enough.',
    'Go deeper only when you want stronger timing, evidence, and action guidance.',
];

export default function EnglishGuidesPage() {
    const landingVariant = getLandingVariant('en');
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'CosmicPath English Starter Guides',
        url: 'https://www.cosmicpath.app/guides',
        inLanguage: 'en-US',
        description:
            'English starter guides that explain Korean saju, the BaZi bridge, and decision timing readings.',
        hasPart: ENGLISH_GUIDES.map((guide) => ({
            '@type': 'Article',
            headline: guide.title,
            url: `https://www.cosmicpath.app/guides/${guide.slug}`,
            description: guide.seoDescription,
        })),
    };

    return (
        <main className="min-h-screen bg-void text-starlight">
            <StructuredData data={structuredData} />
            <GrowthEventTracker
                trackingEvent={{
                    event: 'guide_hub_view',
                    source: 'english_guides_hub',
                    step: 'landing',
                    language: 'en',
                    context: 'guide',
                    metadata: {
                        landingVariant,
                        guideSurface: 'hub',
                        guideCount: ENGLISH_GUIDES.length,
                    },
                }}
            />
            <Navigation language="en" />
            <div className="cosmic-dust" />

            <section className="relative overflow-hidden px-6 pb-16 pt-28 md:pb-24 md:pt-36">
                <div className="container-cosmic">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                        <div className="relative rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.32)] md:p-10">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                English Acquisition Layer
                            </p>
                            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                                Learn Korean saju
                                <br />
                                without getting lost in translation.
                            </h1>
                            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 md:text-lg">
                                These pages are the narrow English-speaking entry routes for CosmicPath. They explain what Korean
                                saju is, how it overlaps with BaZi, and how the product turns that category into a decision timing
                                reading for relationships, career moves, money pressure, and life transitions.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <GrowthTrackedLink
                                    href="/start?reset=true"
                                    trackingEvent={{
                                        event: 'guide_cta_clicked',
                                        source: 'english_guides_hub',
                                        step: 'cta',
                                        language: 'en',
                                        context: 'guide',
                                        metadata: {
                                            landingVariant,
                                            guideSurface: 'hub',
                                            ctaLocation: 'hero_primary',
                                            ctaTarget: 'start_reading',
                                        },
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D88A] to-[#D4AF37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:scale-[1.02]"
                                >
                                    Start the Reading
                                </GrowthTrackedLink>
                                <Link
                                    href="/daily"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                                >
                                    Explore Daily Signals
                                </Link>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)),radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_40%)] p-7 md:p-9">
                            <div className="absolute inset-y-8 left-8 hidden w-px bg-gradient-to-b from-[#D4AF37]/40 via-white/10 to-transparent lg:block" />
                            <div className="lg:pl-6">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
                                    How the Path Works
                                </p>
                                <div className="mt-6 space-y-4">
                                    {flowSteps.map((step, index) => (
                                        <div
                                            key={step}
                                            className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                                        >
                                            <p className="text-[10px] uppercase tracking-[0.28em] text-[#F4D88A]">
                                                Step 0{index + 1}
                                            </p>
                                            <p className="mt-3 text-sm leading-7 text-white/70">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-8 md:py-12">
                <div className="container-cosmic">
                    <div className="grid gap-5 lg:grid-cols-3">
                        {differentiators.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.18)]"
                            >
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#F4D88A]">
                                    {item.eyebrow}
                                </p>
                                <h2 className="mt-4 text-2xl font-semibold text-white">
                                    {item.title}
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-white/68">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 md:py-20">
                <div className="container-cosmic">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Choose Your Entry Route
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                                Three guides, one product promise.
                            </h2>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-white/62 md:text-base">
                            Each route explains the same product from a different angle: the Korean category, the BaZi bridge, or the
                            decision timing use case.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
                        <GrowthTrackedLink
                            href={`/guides/${ENGLISH_GUIDES[0].slug}`}
                            trackingEvent={{
                                event: 'guide_card_clicked',
                                source: 'english_guides_hub',
                                step: 'discovery',
                                language: 'en',
                                context: 'guide',
                                metadata: {
                                    landingVariant,
                                    guideSurface: 'hub',
                                    ctaLocation: 'featured_guide_card',
                                    guideSlug: ENGLISH_GUIDES[0].slug,
                                    guideTitle: ENGLISH_GUIDES[0].title,
                                },
                            }}
                            className={`group relative overflow-hidden rounded-[34px] border p-7 transition-transform duration-300 hover:-translate-y-1 ${accentMap[ENGLISH_GUIDES[0].accent]}`}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="relative">
                                <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">
                                    {ENGLISH_GUIDES[0].eyebrow}
                                </p>
                                <h3 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                                    {ENGLISH_GUIDES[0].title}
                                </h3>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                                    {ENGLISH_GUIDES[0].description}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {ENGLISH_GUIDES[0].keywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/48"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </GrowthTrackedLink>

                        <div className="grid gap-6">
                            {ENGLISH_GUIDES.slice(1).map((guide) => (
                                <GrowthTrackedLink
                                    key={guide.slug}
                                    href={`/guides/${guide.slug}`}
                                    trackingEvent={{
                                        event: 'guide_card_clicked',
                                        source: 'english_guides_hub',
                                        step: 'discovery',
                                        language: 'en',
                                        context: 'guide',
                                        metadata: {
                                            landingVariant,
                                            guideSurface: 'hub',
                                            ctaLocation: 'guide_card_grid',
                                            guideSlug: guide.slug,
                                            guideTitle: guide.title,
                                        },
                                    }}
                                    className={`group relative overflow-hidden rounded-[30px] border p-6 transition-transform duration-300 hover:-translate-y-1 ${accentMap[guide.accent]}`}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
                                                {guide.eyebrow}
                                            </p>
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                                                {guide.readTime}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 text-2xl font-semibold text-white">
                                            {guide.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-white/68">
                                            {guide.description}
                                        </p>
                                    </div>
                                </GrowthTrackedLink>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 pb-24">
                <div className="container-cosmic">
                    <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_34%),linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 text-center shadow-[0_34px_120px_rgba(0,0,0,0.28)] md:p-12">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                            Ready to Test the Signal?
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
                            Do not stop at theory.
                            <br />
                            Bring one real question into the oracle.
                        </h2>
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                            The English guides are here to make the category legible. The actual proof comes from the free first
                            reading and whether the action conclusion feels sharper than your current mental loop.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <GrowthTrackedLink
                                href="/start?reset=true"
                                trackingEvent={{
                                    event: 'guide_cta_clicked',
                                    source: 'english_guides_hub',
                                    step: 'cta',
                                    language: 'en',
                                    context: 'guide',
                                    metadata: {
                                        landingVariant,
                                        guideSurface: 'hub',
                                        ctaLocation: 'closing_primary',
                                        ctaTarget: 'start_reading',
                                    },
                                }}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D88A] to-[#D4AF37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:scale-[1.02]"
                            >
                                Open My First Reading
                            </GrowthTrackedLink>
                            <Link
                                href="/"
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                            >
                                Return to Landing
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer language="en" />
        </main>
    );
}
