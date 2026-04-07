import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    GrowthEventTracker,
    GrowthTrackedLink,
} from '@/components/common/GrowthTracking';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { StructuredData } from '@/components/seo/StructuredData';
import { ENGLISH_GUIDES, getEnglishGuideBySlug, getEnglishGuideSlugs } from '@/lib/english-guides';
import { getLandingVariant } from '@/lib/language-preference';

interface EnglishGuidePageProps {
    params: Promise<{ slug: string }>;
}

const accentBorderMap = {
    gold: 'border-[#D4AF37]/22',
    indigo: 'border-[#6366F1]/22',
    rose: 'border-[#FB7185]/22',
} as const;

const accentGlowMap = {
    gold: 'bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
    indigo: 'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
    rose: 'bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_36%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
    return getEnglishGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: EnglishGuidePageProps): Promise<Metadata> {
    const { slug } = await params;
    const guide = getEnglishGuideBySlug(slug);

    if (!guide) {
        return {
            title: 'Guide Not Found | CosmicPath',
        };
    }

    return {
        title: `${guide.title} | CosmicPath`,
        description: guide.seoDescription,
        keywords: guide.keywords,
        alternates: {
            canonical: `/guides/${guide.slug}`,
        },
        openGraph: {
            title: guide.title,
            description: guide.seoDescription,
            url: `https://cosmicpath.app/guides/${guide.slug}`,
            type: 'article',
            images: ['/og-image.png'],
        },
        twitter: {
            card: 'summary_large_image',
            title: guide.title,
            description: guide.seoDescription,
            images: ['/og-image.png'],
        },
    };
}

export default async function EnglishGuidePage({ params }: EnglishGuidePageProps) {
    const { slug } = await params;
    const guide = getEnglishGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    const relatedGuides = ENGLISH_GUIDES.filter((candidate) => candidate.slug !== guide.slug);
    const landingVariant = getLandingVariant('en');
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: guide.seoDescription,
        inLanguage: 'en-US',
        url: `https://cosmicpath.app/guides/${guide.slug}`,
        author: {
            '@type': 'Organization',
            name: 'CosmicPath',
        },
        publisher: {
            '@type': 'Organization',
            name: 'CosmicPath',
            logo: {
                '@type': 'ImageObject',
                url: 'https://cosmicpath.app/og-image.png',
            },
        },
        keywords: guide.keywords.join(', '),
    };

    return (
        <main className="min-h-screen bg-void text-starlight">
            <StructuredData data={structuredData} />
            <GrowthEventTracker
                trackingEvent={{
                    event: 'guide_article_view',
                    source: 'english_guide_article',
                    step: 'content',
                    language: 'en',
                    context: 'guide',
                    metadata: {
                        landingVariant,
                        guideSurface: 'article',
                        guideSlug: guide.slug,
                        guideTitle: guide.title,
                    },
                }}
            />
            <Navigation language="en" />
            <div className="cosmic-dust" />

            <section className="px-6 pb-12 pt-28 md:pt-36">
                <div className="container-cosmic">
                    <Link
                        href="/guides"
                        className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
                    >
                        ← Back to English guides
                    </Link>

                    <div className={`mt-6 overflow-hidden rounded-[38px] border p-8 shadow-[0_36px_120px_rgba(0,0,0,0.32)] md:p-10 ${accentBorderMap[guide.accent]} ${accentGlowMap[guide.accent]}`}>
                        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                    {guide.eyebrow}
                                </p>
                                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                                    {guide.title}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 md:text-lg">
                                    {guide.description}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {guide.keywords.map((keyword) => (
                                        <span
                                            key={keyword}
                                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/48"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 self-start">
                                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Guide Note</p>
                                    <p className="mt-3 text-sm leading-7 text-white/72">
                                        {guide.heroNote}
                                    </p>
                                </div>
                                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Quick Facts</p>
                                    <div className="mt-4 grid gap-3">
                                        {guide.quickFacts.map((fact) => (
                                            <div
                                                key={fact.label}
                                                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                                            >
                                                <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                                                    {fact.label}
                                                </p>
                                                <p className="mt-2 text-sm leading-7 text-white/75">
                                                    {fact.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-6 md:py-10">
                <div className="container-cosmic grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <article className="space-y-6">
                        {guide.sections.map((section) => (
                            <section
                                key={section.title}
                                className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.18)] md:p-7"
                            >
                                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                                    {section.title}
                                </h2>
                                <div className="mt-4 space-y-4">
                                    {section.body.map((paragraph) => (
                                        <p
                                            key={paragraph}
                                            className="text-sm leading-8 text-white/72 md:text-base"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                                {section.bullets?.length ? (
                                    <ul className="mt-5 space-y-3">
                                        {section.bullets.map((bullet) => (
                                            <li
                                                key={bullet}
                                                className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white/74"
                                            >
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </section>
                        ))}

                        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.18)] md:p-7">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Starter Questions
                            </p>
                            <div className="mt-5 grid gap-3">
                                {guide.questionExamples.map((example) => (
                                    <div
                                        key={example}
                                        className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white/74"
                                    >
                                        {example}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.18)] md:p-7">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                FAQ
                            </p>
                            <div className="mt-5 space-y-4">
                                {guide.faq.map((item) => (
                                    <div
                                        key={item.question}
                                        className="rounded-[22px] border border-white/10 bg-black/20 p-4"
                                    >
                                        <h3 className="text-lg font-semibold text-white">
                                            {item.question}
                                        </h3>
                                        <p className="mt-3 text-sm leading-7 text-white/72">
                                            {item.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>

                    <aside className="space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Next Step
                            </p>
                            <h2 className="mt-4 text-2xl font-semibold text-white">
                                {guide.ctaTitle}
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-white/68">
                                {guide.ctaBody}
                            </p>
                            <div className="mt-6 grid gap-3">
                                <GrowthTrackedLink
                                    href="/start?reset=true"
                                    trackingEvent={{
                                        event: 'guide_cta_clicked',
                                        source: 'english_guide_article',
                                        step: 'cta',
                                        language: 'en',
                                        context: 'guide',
                                        metadata: {
                                            landingVariant,
                                            guideSurface: 'article',
                                            guideSlug: guide.slug,
                                            guideTitle: guide.title,
                                            ctaLocation: 'sidebar_primary',
                                            ctaTarget: 'start_reading',
                                        },
                                    }}
                                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D88A] to-[#D4AF37] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:scale-[1.02]"
                                >
                                    Open Free Reading
                                </GrowthTrackedLink>
                                <Link
                                    href="/guides"
                                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                                >
                                    Compare All Guides
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Related Routes
                            </p>
                            <div className="mt-5 space-y-3">
                                {relatedGuides.map((relatedGuide) => (
                                    <GrowthTrackedLink
                                        key={relatedGuide.slug}
                                        href={`/guides/${relatedGuide.slug}`}
                                        trackingEvent={{
                                            event: 'guide_card_clicked',
                                            source: 'english_guide_article',
                                            step: 'discovery',
                                            language: 'en',
                                            context: 'guide',
                                            metadata: {
                                                landingVariant,
                                                guideSurface: 'article_related',
                                                guideSlug: relatedGuide.slug,
                                                guideTitle: relatedGuide.title,
                                                referrerGuideSlug: guide.slug,
                                            },
                                        }}
                                        className="block rounded-[22px] border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                                    >
                                        <p className="text-[10px] uppercase tracking-[0.26em] text-white/42">
                                            {relatedGuide.eyebrow}
                                        </p>
                                        <h3 className="mt-2 text-base font-semibold text-white">
                                            {relatedGuide.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-white/60">
                                            {relatedGuide.description}
                                        </p>
                                    </GrowthTrackedLink>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="px-6 pb-24 pt-10">
                <div className="container-cosmic">
                    <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_34%),linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 text-center shadow-[0_34px_120px_rgba(0,0,0,0.28)] md:p-12">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                            Move From Reading About It To Using It
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
                            The category matters.
                            <br />
                            The question matters more.
                        </h2>
                        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                            Once the framework makes sense, the next step is to test it against a real decision. That is where the
                            timing layer becomes useful instead of theoretical.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <GrowthTrackedLink
                                href="/start?reset=true"
                                trackingEvent={{
                                    event: 'guide_cta_clicked',
                                    source: 'english_guide_article',
                                    step: 'cta',
                                    language: 'en',
                                    context: 'guide',
                                    metadata: {
                                        landingVariant,
                                        guideSurface: 'article',
                                        guideSlug: guide.slug,
                                        guideTitle: guide.title,
                                        ctaLocation: 'closing_primary',
                                        ctaTarget: 'start_reading',
                                    },
                                }}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D88A] to-[#D4AF37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:scale-[1.02]"
                            >
                                Start the Oracle
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
