'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpRight,
    Copy,
    LoaderCircle,
    Palette,
    Sparkles,
    WandSparkles,
} from 'lucide-react';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

type AuraLanguage = 'en' | 'ko';

interface AuraResponse {
    auraColorHex: [string, string];
    keywords: [string, string, string];
    catchphrase: string;
    summary: string;
    ogImageUrl: string;
}

interface AuraErrorResponse {
    error?: {
        code?: string;
        message?: string;
    };
}

interface FormState {
    name: string;
    birthDate: string;
    birthTime: string;
    timezone: string;
    language: AuraLanguage;
}

const COMMON_TIMEZONES = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Seoul',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
] as const;

const DEFAULT_FORM_STATE: FormState = {
    name: '',
    birthDate: '',
    birthTime: '12:00',
    timezone: 'Asia/Seoul',
    language: 'en',
};

const SAMPLE_RESULT: AuraResponse = {
    auraColorHex: ['#0F8A5F', '#2D7FF9'],
    keywords: ['verdant', 'lucid', 'pioneer'],
    catchphrase: 'Verdant aura with lucid, pioneer gravity.',
    summary:
        'A calm but kinetic aura sits at the center of this card. It feels grounded first, then suddenly brightens with social momentum. The overall vibe reads fresh, intuitive, and quietly magnetic.',
    ogImageUrl:
        '/api/og/aura?name=Cosmic%20Aura&colors=%230F8A5F%2C%232D7FF9&keywords=verdant%2Clucid%2Cpioneer&catchphrase=Verdant%20aura%20with%20lucid%2C%20pioneer%20gravity.',
};

export function KDestinyExperience() {
    const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
    const [result, setResult] = useState<AuraResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPending, startTransition] = useTransition();
    const hasTrackedView = useRef(false);

    useEffect(() => {
        try {
            const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (browserTimeZone) {
                setForm((current) => ({ ...current, timezone: browserTimeZone }));
            }
        } catch {
            // Keep the default timezone if the browser does not expose a valid IANA zone.
        }
    }, []);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(timeout);
    }, [copied]);

    useEffect(() => {
        if (hasTrackedView.current) {
            return;
        }

        hasTrackedView.current = true;
        void trackClientGrowthEvent({
            event: 'k_destiny_view',
            source: 'k_destiny_page',
            step: 'landing',
            language: form.language,
            metadata: {
                timezone: form.timezone,
            },
        });
    }, [form.language, form.timezone]);

    const activeResult = result ?? SAMPLE_RESULT;
    const previewStyle = {
        background: `radial-gradient(circle at 18% 16%, ${activeResult.auraColorHex[0]}66 0%, transparent 35%), radial-gradient(circle at 85% 20%, ${activeResult.auraColorHex[1]}66 0%, transparent 40%), linear-gradient(145deg, #070b17 10%, #111a2e 55%, #0f1422 100%)`,
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        void trackClientGrowthEvent({
            event: 'aura_generate_start',
            source: 'k_destiny_page',
            step: 'submit',
            language: form.language,
            metadata: {
                timezone: form.timezone.trim(),
                hasBirthTime: Boolean(form.birthTime),
            },
        });

        try {
            const response = await fetch('/api/aura/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    birthDate: form.birthDate,
                    birthTime: form.birthTime || undefined,
                    timezone: form.timezone.trim(),
                    language: form.language,
                }),
            });

            const payload = (await response.json()) as AuraResponse | AuraErrorResponse;

            if (!response.ok) {
                const message =
                    'error' in payload && payload.error?.message
                        ? payload.error.message
                        : 'Failed to generate your aura card.';
                throw new Error(message);
            }

            void trackClientGrowthEvent({
                event: 'aura_generate_success',
                source: 'k_destiny_page',
                step: 'result',
                language: form.language,
                metadata: {
                    timezone: form.timezone.trim(),
                    keywords: (payload as AuraResponse).keywords,
                },
            });

            startTransition(() => {
                setResult(payload as AuraResponse);
            });
        } catch (submitError) {
            const message =
                submitError instanceof Error
                    ? submitError.message
                    : 'Failed to generate your aura card.';
            setError(message);
            void trackClientGrowthEvent({
                event: 'aura_generate_failure',
                source: 'k_destiny_page',
                step: 'submit',
                language: form.language,
                metadata: {
                    timezone: form.timezone.trim(),
                    message,
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleCopy() {
        if (!result) {
            return;
        }

        const shareText = [
            result.catchphrase,
            result.summary,
            result.ogImageUrl,
        ].join('\n\n');

        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        void trackClientGrowthEvent({
            event: 'aura_share_copy',
            source: 'k_destiny_page',
            step: 'result',
            language: form.language,
            metadata: {
                keywords: result.keywords,
            },
        });
    }

    return (
        <div className="relative flex-1 overflow-hidden pt-28 pb-24">
            <div className="absolute inset-0 cosmic-dust opacity-35 pointer-events-none" />
            <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#FF7A59]/10 blur-[110px] pointer-events-none" />
            <div className="absolute top-1/3 right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#4CC9F0]/10 blur-[120px] pointer-events-none" />

            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 md:px-6">
                <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-starlight/75">
                            <Sparkles className="h-3.5 w-3.5 text-[#FFB26B]" />
                            Global Drop / K-Aura Card
                        </div>
                        <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] text-transparent bg-gradient-to-b from-white via-[#FFF1CF] to-[#7FDBFF] bg-clip-text md:text-7xl">
                            Decode your
                            <br />
                            K-Destiny Aura.
                        </h1>
                        <p className="max-w-2xl text-lg leading-8 text-starlight/68 md:text-xl">
                            A global-first aura card built from Saju, astrology, and numerology.
                            Enter your birth data, get a share-ready color system, and export a
                            vertical-social-friendly identity card in seconds.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.045] p-4 backdrop-blur-sm">
                                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-starlight/45">
                                    Signal Mix
                                </div>
                                <div className="text-xl font-semibold text-white">
                                    Saju x Stars x Path
                                </div>
                            </div>
                            <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.045] p-4 backdrop-blur-sm">
                                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-starlight/45">
                                    Output
                                </div>
                                <div className="text-xl font-semibold text-white">
                                    Colors + Keywords + OG
                                </div>
                            </div>
                            <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.045] p-4 backdrop-blur-sm">
                                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-starlight/45">
                                    Language
                                </div>
                                <div className="text-xl font-semibold text-white">
                                    EN by default, KO optional
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
                        style={previewStyle}
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="text-[11px] uppercase tracking-[0.24em] text-starlight/65">
                                Live Preview
                            </div>
                            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-starlight/70">
                                {result ? 'Generated' : 'Sample'}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex flex-wrap gap-2">
                                {activeResult.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-starlight/80"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>

                            <div className="font-serif text-3xl leading-tight text-white md:text-4xl">
                                {result ? form.name || 'Your Aura' : 'Cosmic Aura'}
                            </div>

                            <p className="max-w-xl text-base leading-7 text-starlight/82 md:text-lg">
                                {activeResult.catchphrase}
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {activeResult.auraColorHex.map((color) => (
                                    <div
                                        key={color}
                                        className="rounded-[1.4rem] border border-white/10 p-4"
                                        style={{ backgroundColor: `${color}22` }}
                                    >
                                        <div
                                            className="mb-3 h-12 rounded-full border border-white/10"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                            Aura Color
                                        </div>
                                        <div className="mt-1 font-mono text-sm text-white">
                                            {color}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm leading-7 text-starlight/72 md:text-base">
                                {activeResult.summary}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
                    <form
                        onSubmit={handleSubmit}
                        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl md:p-8"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-starlight/45">
                                    Generate
                                </div>
                                <h2 className="mt-2 font-serif text-3xl text-white">
                                    Build your card
                                </h2>
                            </div>
                            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-starlight/65">
                                No birthplace needed in MVP
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                    Name
                                </span>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FFB26B]"
                                    placeholder="Avery"
                                />
                            </label>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                        Birth Date
                                    </span>
                                    <input
                                        required
                                        type="date"
                                        max="9999-12-31"
                                        value={form.birthDate}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                birthDate: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors focus:border-[#7FDBFF]"
                                    />
                                </label>

                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                        Birth Time
                                    </span>
                                    <input
                                        type="time"
                                        value={form.birthTime}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                birthTime: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors focus:border-[#7FDBFF]"
                                    />
                                </label>
                            </div>

                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                    Timezone
                                </span>
                                <input
                                    required
                                    list="k-destiny-timezones"
                                    value={form.timezone}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            timezone: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#FFB26B]"
                                    placeholder="America/New_York"
                                />
                                <datalist id="k-destiny-timezones">
                                    {COMMON_TIMEZONES.map((timezone) => (
                                        <option key={timezone} value={timezone} />
                                    ))}
                                </datalist>
                            </label>

                            <div className="space-y-3">
                                <span className="text-xs uppercase tracking-[0.18em] text-starlight/48">
                                    Summary Language
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['en', 'ko'] as const).map((language) => (
                                        <button
                                            key={language}
                                            type="button"
                                            onClick={() =>
                                                setForm((current) => ({
                                                    ...current,
                                                    language,
                                                }))
                                            }
                                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-colors ${
                                                form.language === language
                                                    ? 'border-[#FFB26B] bg-[#FFB26B]/12 text-white'
                                                    : 'border-white/10 bg-black/20 text-starlight/60 hover:border-white/25'
                                            }`}
                                        >
                                            {language === 'en' ? 'English' : 'Korean'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error ? (
                                <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                    {error}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isSubmitting || isPending}
                                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFB26B] via-[#FFD166] to-[#7FDBFF] px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#0B1220] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting || isPending ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Brewing your aura
                                    </>
                                ) : (
                                    <>
                                        <WandSparkles className="h-4 w-4" />
                                        Generate Aura Card
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[1.75rem] border border-white/10 bg-[#FFB26B]/8 p-5">
                                <Palette className="mb-4 h-5 w-5 text-[#FFD166]" />
                                <div className="mb-2 text-lg font-semibold text-white">
                                    Color system
                                </div>
                                <p className="text-sm leading-6 text-starlight/65">
                                    Two aura tones generated from your dominant Saju and chart
                                    undertones.
                                </p>
                            </div>
                            <div className="rounded-[1.75rem] border border-white/10 bg-[#7FDBFF]/8 p-5">
                                <Sparkles className="mb-4 h-5 w-5 text-[#7FDBFF]" />
                                <div className="mb-2 text-lg font-semibold text-white">
                                    Social keywords
                                </div>
                                <p className="text-sm leading-6 text-starlight/65">
                                    Three English descriptors tuned for TikTok, Reels, and Threads.
                                </p>
                            </div>
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5">
                                <WandSparkles className="mb-4 h-5 w-5 text-[#FF7A59]" />
                                <div className="mb-2 text-lg font-semibold text-white">
                                    OG export
                                </div>
                                <p className="text-sm leading-6 text-starlight/65">
                                    Instant card image URL generated for one-tap sharing and reposts.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045]">
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.18em] text-starlight/45">
                                        Share Output
                                    </div>
                                    <div className="mt-1 text-lg font-semibold text-white">
                                        Aura card result
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={!result}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-starlight/75 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copied ? 'Copied' : 'Copy share text'}
                                    </button>
                                    <Link
                                        href={activeResult.ogImageUrl}
                                        target="_blank"
                                        onClick={() => {
                                            void trackClientGrowthEvent({
                                                event: 'aura_og_open',
                                                source: 'k_destiny_page',
                                                step: 'result',
                                                language: form.language,
                                                metadata: {
                                                    mode: result ? 'generated' : 'sample',
                                                },
                                            });
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/15"
                                    >
                                        Open OG
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>

                            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                                <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                                    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
                                        <Image
                                            src={activeResult.ogImageUrl}
                                            alt="Aura card preview"
                                            width={1200}
                                            height={630}
                                            unoptimized
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-5 p-6">
                                    <div>
                                        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-starlight/45">
                                            Catchphrase
                                        </div>
                                        <div className="font-serif text-2xl leading-tight text-white">
                                            {activeResult.catchphrase}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 text-xs uppercase tracking-[0.18em] text-starlight/45">
                                            Summary
                                        </div>
                                        <p className="text-sm leading-7 text-starlight/70">
                                            {activeResult.summary}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {activeResult.keywords.map((keyword) => (
                                            <div
                                                key={keyword}
                                                className="rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white"
                                            >
                                                {keyword}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
