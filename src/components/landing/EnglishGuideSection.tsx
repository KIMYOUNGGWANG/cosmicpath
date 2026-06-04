import { GrowthTrackedLink } from '@/components/common/GrowthTracking';
import { ENGLISH_GUIDES } from '@/lib/english-guides';
import { getLandingVariant } from '@/lib/language-preference';

const accentMap = {
    gold: 'from-[#D4AF37]/28 via-[#D4AF37]/10 to-transparent border-[#D4AF37]/24 shadow-[0_24px_80px_rgba(212,175,55,0.12)]',
    indigo: 'from-[#6366F1]/24 via-[#6366F1]/10 to-transparent border-[#6366F1]/24 shadow-[0_24px_80px_rgba(99,102,241,0.12)]',
    rose: 'from-[#FB7185]/22 via-[#FB7185]/10 to-transparent border-[#FB7185]/24 shadow-[0_24px_80px_rgba(251,113,133,0.12)]',
} as const;

export function EnglishGuideSection() {
    const landingVariant = getLandingVariant('en');

    return (
        <section className="relative px-6 py-20 md:py-28">
            <div className="container-cosmic relative">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.28)] md:p-9">
                        <div className="absolute right-6 top-6 hidden rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/45 md:block">
                            English Entry Layer
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                            Starter Guides
                        </p>
                        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
                            New to Korean saju?
                            <br />
                            Start with the route that matches your question.
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                            English-speaking users do not need a full metaphysics lesson first. These guides explain the category,
                            bridge the BaZi overlap, and keep Next Move Report focused on a real delayed choice.
                        </p>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">01</p>
                                <p className="mt-3 text-sm font-semibold text-white">Understand the lens</p>
                                <p className="mt-2 text-sm leading-6 text-white/58">
                                    Learn what Korean saju actually reads and why it works best around a live decision.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">02</p>
                                <p className="mt-3 text-sm font-semibold text-white">Bridge the category</p>
                                <p className="mt-2 text-sm leading-6 text-white/58">
                                    Connect Korean saju with BaZi and Four Pillars without losing the Korean identity.
                                </p>
                            </div>
                            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">03</p>
                                <p className="mt-3 text-sm font-semibold text-white">Ask a real question</p>
                                <p className="mt-2 text-sm leading-6 text-white/58">
                                    Frame your first reading around move now, wait longer, protect, or commit.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <GrowthTrackedLink
                                href="/start?reset=true&entry=decision_timing_rebuild_v1&lang=en"
                                trackingEvent={{
                                    event: 'decision_timing_prompt_clicked',
                                    source: 'landing_english_guide_section',
                                    step: 'cta',
                                    language: 'en',
                                    context: 'general',
                                    metadata: {
                                        landingVariant,
                                        ctaLocation: 'section_primary',
                                        ctaTarget: 'decision_timing_rebuild_v1',
                                    },
                                }}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D88A] to-[#D4AF37] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:scale-[1.02]"
                            >
                                Open Next Move Report
                            </GrowthTrackedLink>
                            <GrowthTrackedLink
                                href="/guides"
                                trackingEvent={{
                                    event: 'guide_cta_clicked',
                                    source: 'landing_english_guide_section',
                                    step: 'cta',
                                    language: 'en',
                                    context: 'guide',
                                    metadata: {
                                        landingVariant,
                                        ctaLocation: 'section_secondary',
                                        ctaTarget: 'guides_hub',
                                    },
                                }}
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                            >
                                Browse English Guides
                            </GrowthTrackedLink>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ENGLISH_GUIDES.map((guide) => (
                            <GrowthTrackedLink
                                key={guide.slug}
                                href={`/guides/${guide.slug}`}
                                trackingEvent={{
                                    event: 'guide_card_clicked',
                                    source: 'landing_english_guide_section',
                                    step: 'discovery',
                                    language: 'en',
                                    context: 'guide',
                                    metadata: {
                                        landingVariant,
                                        ctaLocation: 'landing_guide_grid',
                                        guideSlug: guide.slug,
                                        guideTitle: guide.title,
                                    },
                                }}
                                className={`group relative block overflow-hidden rounded-[30px] border bg-gradient-to-br p-6 transition-transform duration-300 hover:-translate-y-1 ${accentMap[guide.accent]}`}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">
                                            {guide.eyebrow}
                                        </p>
                                        <span className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/55">
                                            {guide.readTime}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                                        {guide.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-white/68">
                                        {guide.description}
                                    </p>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {guide.keywords.slice(0, 2).map((keyword) => (
                                            <span
                                                key={keyword}
                                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </GrowthTrackedLink>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
