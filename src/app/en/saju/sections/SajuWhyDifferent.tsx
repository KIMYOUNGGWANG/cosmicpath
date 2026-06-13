'use client';

const COMPARISON_ITEMS = [
    {
        western: 'You are a passionate Scorpio.',
        saju: '"Consider a move around early November. Your Fire Pillar points to a 90-day career window."',
        icon: '🌑',
    },
    {
        western: 'Venus rules your love life this month.',
        saju: '"This relationship may drain your Metal element. Review your boundary before Spring."',
        icon: '🌕',
    },
    {
        western: 'Mercury retrograde may cause delays.',
        saju: '"Your Water Year supports wealth planning. Validate the business before your 32nd birthday."',
        icon: '⚡',
    },
];

const SYSTEM_PILLARS = [
    {
        symbol: '年',
        romanized: 'Year Pillar',
        description: 'The broad energy of your birth year — your long-range life structure.',
    },
    {
        symbol: '月',
        romanized: 'Month Pillar',
        description: 'The social forces shaping your relationships and career path.',
    },
    {
        symbol: '日',
        romanized: 'Day Pillar',
        description: 'Your inner self — the identity pattern the reading centers on.',
    },
    {
        symbol: '時',
        romanized: 'Hour Pillar',
        description: 'The hidden potential and the legacy you leave behind.',
    },
];

export function SajuWhyDifferent() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto">

                {/* Section header */}
                <div className="text-center mb-16">
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>
                        ✦ Why Saju is different
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl" style={{ color: '#E4E4E7', letterSpacing: '-0.03em' }}>
                        Astrology describes.<br />
                        <span style={{ color: '#D4AF37' }}>Saju maps structure.</span>
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: '#A1A1AA' }}>
                        The Four Pillars of Destiny — born in Korea 5,000 years ago — map
                        elemental patterns that may shape your timing and choices. Less generic archetyping. More practical decision structure.
                    </p>
                </div>

                {/* Comparison cards */}
                <div className="grid gap-4 mb-20">
                    {COMPARISON_ITEMS.map(({ western, saju, icon }) => (
                        <div
                            key={icon}
                            className="grid sm:grid-cols-2 gap-0 rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {/* Western side */}
                            <div className="p-5 sm:p-6" style={{ background: 'rgba(18,18,20,0.5)' }}>
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#52525B' }}>
                                    Western Astrology
                                </p>
                                <p className="text-sm sm:text-base italic" style={{ color: '#71717A' }}>
                                    &ldquo;{western}&rdquo;
                                </p>
                            </div>

                            {/* Saju side */}
                            <div
                                className="p-5 sm:p-6 relative"
                                style={{
                                    background: 'rgba(212,175,55,0.05)',
                                    borderLeft: '1px solid rgba(212,175,55,0.15)',
                                }}
                            >
                                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#D4AF37' }}>
                                    {icon} Saju Signal
                                </p>
                                <p className="text-sm sm:text-base font-semibold" style={{ color: '#E4E4E7' }}>
                                    {saju}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Four Pillars explainer */}
                <div
                    className="rounded-3xl p-8 sm:p-10"
                    style={{
                        background: 'rgba(18,18,20,0.7)',
                        border: '1px solid rgba(212,175,55,0.12)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <p className="text-xs uppercase tracking-widest mb-2 text-center" style={{ color: '#D4AF37' }}>
                        The System
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl text-center mb-8" style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}>
                        사주 — Four Pillars of Destiny
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SYSTEM_PILLARS.map(({ symbol, romanized, description }) => (
                            <div
                                key={symbol}
                                className="rounded-xl p-4 text-center"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div
                                    className="font-serif text-4xl sm:text-5xl mb-2"
                                    style={{
                                        color: '#D4AF37',
                                        textShadow: '0 0 20px rgba(212,175,55,0.4)',
                                    }}
                                >
                                    {symbol}
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#A1A1AA' }}>
                                    {romanized}
                                </p>
                                <p className="text-xs leading-relaxed" style={{ color: '#52525B' }}>
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
