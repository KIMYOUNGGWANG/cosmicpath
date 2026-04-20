'use client';

const WHATS_INCLUDED = [
    { icon: '🗂', title: 'Full Four Pillars analysis', desc: 'Year, Month, Day, Hour pillars decoded in plain English' },
    { icon: '📅', title: 'Your 10-year Destiny Cycle (대운)', desc: 'The macro energy shaping your current life phase' },
    { icon: '⚡', title: 'Timing verdicts', desc: 'Exact windows for action in career, love, and wealth' },
    { icon: '🎴', title: 'Tarot cross-confirmation', desc: 'Korean oracle cross-checked with a Tarot reading' },
    { icon: '⭐', title: 'Western natal chart overlay', desc: 'East meets West — your Saju and birth chart unified' },
    { icon: '🔥', title: 'Decisive action plan', desc: '"Do this by X date" — no vague horoscope language' },
];

interface SajuCheckoutCTAProps {
    isStarting: boolean;
    onStart: () => void;
}

export function SajuCheckoutCTA({ isStarting, onStart }: SajuCheckoutCTAProps) {
    return (
        <section className="py-20 px-6">
            <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>✦ What you receive</p>
                <h2 className="font-serif text-3xl sm:text-4xl mb-10" style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}>
                    Your complete Saju Destiny Report
                </h2>

                <div className="grid sm:grid-cols-2 gap-3 mb-12 text-left">
                    {WHATS_INCLUDED.map(({ icon, title, desc }) => (
                        <div
                            key={title}
                            className="flex items-start gap-3 rounded-xl p-4"
                            style={{
                                background: 'rgba(18,18,20,0.6)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                            <div>
                                <p className="text-sm font-semibold mb-0.5" style={{ color: '#E4E4E7' }}>{title}</p>
                                <p className="text-xs leading-relaxed" style={{ color: '#71717A' }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    className="rounded-3xl p-8"
                    style={{
                        background: 'rgba(212,175,55,0.04)',
                        border: '1px solid rgba(212,175,55,0.2)',
                    }}
                >
                    <p className="text-sm mb-1" style={{ color: '#A1A1AA' }}>Start free · Unlock the full reading when you&apos;re ready</p>
                    <p className="font-serif text-4xl mb-2" style={{ color: '#D4AF37' }}>Free → Premium</p>
                    <p className="text-xs mb-8" style={{ color: '#52525B' }}>
                        Same flow as our Korean readers · Secure upgrade via Stripe
                    </p>

                    <button
                        id="saju-final-start-btn"
                        type="button"
                        onClick={onStart}
                        disabled={isStarting}
                        className="w-full sm:w-auto px-12 py-4 rounded-full font-bold text-black text-lg transition-all duration-300 disabled:opacity-60"
                        style={{
                            background: isStarting
                                ? 'rgba(212,175,55,0.6)'
                                : 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                            boxShadow: isStarting ? 'none' : '0 0 40px rgba(212,175,55,0.35)',
                        }}
                    >
                        {isStarting ? 'Opening your oracle...' : 'Start My Free Reading →'}
                    </button>

                    <p className="mt-4 text-xs" style={{ color: '#52525B' }}>
                        🔒 No card required to start · Your birth data is never sold or shared
                    </p>
                </div>
            </div>
        </section>
    );
}
