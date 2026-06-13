'use client';

import { useEffect, useRef, useState } from 'react';

interface SajuHeroProps {
    onScrollToForm: () => void;
}

const ROTATING_VERDICTS = [
    '"Consider the job change. October may be your window."',
    '"Use the next 40 days as a timing checkpoint."',
    '"This relationship shows strain in the chart. Review it before committing further."',
    '"The Wood element marks a more supportive window for planning."',
];

export function SajuHero({ onScrollToForm }: SajuHeroProps) {
    const [currentVerdict, setCurrentVerdict] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(() => {
        // Entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);

        // Rotate verdict quotes
        intervalRef.current = setInterval(() => {
            setCurrentVerdict(previous => (previous + 1) % ROTATING_VERDICTS.length);
        }, 3200);

        return () => {
            clearTimeout(timer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">

            {/* Pill badge */}
            <div
                className={`
                    inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border text-xs font-medium tracking-widest uppercase
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{
                    borderColor: 'rgba(212,175,55,0.35)',
                    background: 'rgba(212,175,55,0.06)',
                    color: '#D4AF37',
                    transitionDelay: '0ms',
                }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                5,000-year-old Korean wisdom · Now in English
            </div>

            {/* Main headline */}
            <h1
                className={`
                    font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-tight max-w-4xl
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
                style={{
                    letterSpacing: '-0.03em',
                    transitionDelay: '120ms',
                    background: 'linear-gradient(160deg, #E4E4E7 30%, #A1A1AA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                Your birthdate can reveal a pattern.
                <br />
                <span style={{ WebkitTextFillColor: '#D4AF37', color: '#D4AF37' }}>
                    Ready to read the timing?
                </span>
            </h1>

            {/* Sub headline */}
            <p
                className={`
                    mt-6 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
                style={{ color: '#A1A1AA', transitionDelay: '200ms' }}
            >
                Western astrology describes your personality.{' '}
                <strong style={{ color: '#E4E4E7' }}>Korean Saju maps structure, timing, and practical next steps.</strong>
                {' '}Built from 5,000 years of East Asian wisdom, translated into a clearer decision note.
            </p>

            {/* Rotating verdict display */}
            <div
                className={`
                    mt-10 w-full max-w-lg rounded-2xl px-6 py-5 text-left
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
                style={{
                    background: 'rgba(18,18,20,0.7)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    backdropFilter: 'blur(12px)',
                    transitionDelay: '320ms',
                }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                        ✦ Sample Decision Note
                    </span>
                    <span className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
                    <span className="text-xs" style={{ color: '#52525B' }}>Saju Signal</span>
                </div>
                <p
                    key={currentVerdict}
                    className="text-base sm:text-lg font-serif italic"
                    style={{
                        color: '#E4E4E7',
                        animation: 'fadeInUp 0.5s ease-out forwards',
                    }}
                >
                    {ROTATING_VERDICTS[currentVerdict]}
                </p>
            </div>

            {/* CTA Button */}
            <div
                className={`
                    mt-10 flex flex-col sm:flex-row items-center gap-4
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
                style={{ transitionDelay: '400ms' }}
            >
                <button
                    id="saju-hero-cta"
                    onClick={onScrollToForm}
                    className="relative overflow-hidden px-8 py-4 rounded-full font-semibold text-black text-base sm:text-lg transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                        boxShadow: '0 0 30px rgba(212,175,55,0.35)',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(212,175,55,0.55)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(212,175,55,0.35)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                >
                    Start My Free Reading →
                </button>

                <span className="text-sm" style={{ color: '#52525B' }}>
                    Free reading · No card required · Upgrade anytime
                </span>
            </div>

            {/* Social proof strip */}
            <div
                className={`
                    mt-12 flex flex-wrap items-center justify-center gap-6 text-sm
                    transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
                style={{ color: '#52525B', transitionDelay: '520ms' }}
            >
                {[
                    { icon: '✦', label: '12,000+ readings delivered' },
                    { icon: '✦', label: 'Built on 5,000 yrs of Saju tradition' },
                    { icon: '✦', label: 'Secure checkout via Stripe' },
                ].map(({ icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                        <span style={{ color: '#D4AF37' }}>{icon}</span>
                        {label}
                    </span>
                ))}
            </div>

            {/* Scroll hint */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                style={{ color: '#52525B' }}
            >
                <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
                <div
                    className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
                    style={{ borderColor: 'rgba(82,82,91,0.5)' }}
                >
                    <div
                        className="w-1 h-2 rounded-full"
                        style={{
                            background: '#D4AF37',
                            animation: 'fadeInUp 1.5s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
