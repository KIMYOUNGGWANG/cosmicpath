'use client';

const TESTIMONIALS = [
    {
        quote: 'I\'ve done every astrology reading on the internet. Nothing came close to this. It told me to quit my agency job before March — I did it, and I\'m now freelancing at 2x my old salary.',
        name: 'Kayla R.',
        location: 'Los Angeles, CA',
        stars: 5,
        tag: 'Career pivot',
    },
    {
        quote: 'My therapist told me to stay. My Saju reading told me to leave. I left. Three months later — best decision of my life. This thing reads your life like a book.',
        name: 'Jess T.',
        location: 'Brooklyn, NY',
        stars: 5,
        tag: 'Relationship',
    },
    {
        quote: 'I\'m a Co-Star addict and was skeptical going in. But this gave me specific dates, not vibes. The October timing prediction came true to the exact week.',
        name: 'Mia K.',
        location: 'Austin, TX',
        stars: 5,
        tag: 'Skeptic → Believer',
    },
];

export function SajuTestimonials() {
    return (
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#D4AF37' }}>✦ From real readers</p>
                    <h2 className="font-serif text-3xl sm:text-4xl" style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}>
                        What happens when you hear your verdict
                    </h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                    {TESTIMONIALS.map(({ quote, name, location, stars, tag }) => (
                        <div
                            key={name}
                            className="rounded-2xl p-6"
                            style={{
                                background: 'rgba(18,18,20,0.7)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {/* Tag */}
                            <span
                                className="inline-block text-xs px-2.5 py-1 rounded-full mb-4 font-medium"
                                style={{
                                    background: 'rgba(212,175,55,0.1)',
                                    color: '#D4AF37',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                }}
                            >
                                {tag}
                            </span>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-3">
                                {Array.from({ length: stars }).map((_, index) => (
                                    <span key={index} style={{ color: '#D4AF37' }}>★</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>
                                &ldquo;{quote}&rdquo;
                            </p>

                            {/* Attribution */}
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#E4E4E7' }}>{name}</p>
                                <p className="text-xs" style={{ color: '#52525B' }}>{location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
