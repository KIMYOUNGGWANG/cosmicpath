'use client';

interface SajuResultErrorProps {
    message: string;
}

export function SajuResultError({ message }: SajuResultErrorProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#050505' }}>
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
                <span className="text-2xl">⚠</span>
            </div>
            <h2 className="font-serif text-2xl mb-3" style={{ color: '#E4E4E7' }}>
                The oracle needs a moment
            </h2>
            <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: '#A1A1AA' }}>
                {message}
            </p>
            <a
                href="/en/saju"
                className="px-8 py-3 rounded-full font-semibold text-black transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' }}
            >
                Return to reading page
            </a>
            <p className="mt-4 text-xs" style={{ color: '#52525B' }}>
                If you were charged and see this screen, please email us at support@cosmicpath.app
            </p>
        </div>
    );
}
