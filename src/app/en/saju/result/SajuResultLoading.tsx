'use client';

const LOADING_PHASES_TOTAL = 8;

interface SajuResultLoadingProps {
    phase: number;
    label: string;
}

export function SajuResultLoading({ phase, label }: SajuResultLoadingProps) {
    const progress = phase === 0 ? 5 : Math.round((phase / LOADING_PHASES_TOTAL) * 100);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#050505' }}>
            {/* Pulsing oracle icon */}
            <div className="relative mb-10">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                        background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                        border: '1px solid rgba(212,175,55,0.2)',
                        animation: 'corePulse 2s ease-in-out infinite',
                    }}
                >
                    <span className="font-serif text-4xl" style={{ color: '#D4AF37' }}>命</span>
                </div>
                {/* Orbiting ring */}
                <div
                    className="absolute inset-0 rounded-full border"
                    style={{
                        borderColor: 'rgba(212,175,55,0.15)',
                        animation: 'spinSlow 8s linear infinite',
                        borderTopColor: 'rgba(212,175,55,0.5)',
                    }}
                />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl mb-3 text-center" style={{ color: '#E4E4E7', letterSpacing: '-0.02em' }}>
                The oracle is reading your destiny
            </h2>

            <p className="text-sm mb-10 text-center max-w-sm" style={{ color: '#A1A1AA' }}>
                {label || 'Preparing your reading...'}
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs mb-2" style={{ color: '#52525B' }}>
                    <span>Phase {Math.max(phase, 1)} of {LOADING_PHASES_TOTAL}</span>
                    <span>{progress}%</span>
                </div>
                <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #B8962E, #D4AF37)',
                            boxShadow: '0 0 8px rgba(212,175,55,0.5)',
                        }}
                    />
                </div>
            </div>

            <p className="mt-8 text-xs text-center" style={{ color: '#3F3F46' }}>
                Please keep this window open · Your reading is being generated live
            </p>
        </div>
    );
}
