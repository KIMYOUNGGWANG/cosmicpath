'use client';

import { useState, useRef, useEffect } from 'react';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';
import { SajuHero } from './sections/SajuHero';
import { SajuWhyDifferent } from './sections/SajuWhyDifferent';
import { SajuTestimonials } from './sections/SajuTestimonials';
import { SajuCheckoutCTA } from './sections/SajuCheckoutCTA';
import { SajuFooter } from './sections/SajuFooter';

export function SajuLandingExperience() {
    const [isStarting, setIsStarting] = useState(false);
    const hasTrackedView = useRef(false);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hasTrackedView.current) return;
        hasTrackedView.current = true;
        void trackClientGrowthEvent({
            event: 'landing_view',
            source: 'us_obt',
            language: 'en',
            metadata: { landingVariant: 'saju_en_v1' },
        });
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    /**
     * Mirror the exact same flow as Korean /start,
     * just with English language locked in localStorage.
     */
    const handleStartReading = () => {
        setIsStarting(true);

        void trackClientGrowthEvent({
            event: 'start_reading_click',
            source: 'us_obt',
            language: 'en',
            metadata: { landingVariant: 'saju_en_v1' },
        });

        // Lock language to English — /start reads this from localStorage
        localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, 'en');

        // Redirect to the shared reader — same free → paywall → premium flow as Korean
        window.location.href = '/start?source=us_obt&lang=en';
    };

    return (
        <main className="w-full min-h-screen bg-[#050505] text-[#E4E4E7] overflow-x-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at 20% 15%, rgba(212,175,55,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 85%, rgba(139,92,246,0.07) 0%, transparent 50%), #050505',
                    }}
                />
                <div className="cosmic-dust opacity-20" />
            </div>

            <div className="relative z-10">
                <SajuHero onScrollToForm={scrollToForm} />
                <SajuWhyDifferent />

                {/* CTA anchor */}
                <div ref={formRef} className="py-20 px-6 text-center">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>
                        ✦ Ready to begin?
                    </p>
                    <h2
                        className="font-serif text-3xl sm:text-4xl mb-6"
                        style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}
                    >
                        Start your free Saju reading
                    </h2>
                    <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: '#A1A1AA' }}>
                        Enter your birth details, get your free core reading instantly — then unlock
                        the full verdict when you&apos;re ready.
                    </p>

                    <button
                        id="saju-start-reading-btn"
                        type="button"
                        onClick={handleStartReading}
                        disabled={isStarting}
                        className="px-10 py-4 rounded-full font-bold text-black text-lg transition-all duration-300 disabled:opacity-60"
                        style={{
                            background: isStarting
                                ? 'rgba(212,175,55,0.6)'
                                : 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                            boxShadow: isStarting ? 'none' : '0 0 40px rgba(212,175,55,0.35)',
                        }}
                    >
                        {isStarting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Opening your oracle...
                            </span>
                        ) : (
                            'Start My Free Reading →'
                        )}
                    </button>

                    <p className="mt-4 text-xs" style={{ color: '#52525B' }}>
                        Free reading · No card required · Upgrade when you want the full verdict
                    </p>
                </div>

                <SajuTestimonials />
                <SajuCheckoutCTA isStarting={isStarting} onStart={handleStartReading} />
                <SajuFooter />
            </div>
        </main>
    );
}
