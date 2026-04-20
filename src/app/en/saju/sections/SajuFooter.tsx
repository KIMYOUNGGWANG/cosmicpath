'use client';

export function SajuFooter() {
    return (
        <footer
            className="py-12 px-6 text-center border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
            <p className="font-serif text-lg mb-2" style={{ color: '#D4AF37' }}>CosmicPath</p>
            <p className="text-sm mb-6" style={{ color: '#52525B' }}>
                East meets West · Korean Saju in English
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs mb-6" style={{ color: '#52525B' }}>
                <a href="/privacy" className="hover:text-[#A1A1AA] transition-colors">Privacy Policy</a>
                <span>·</span>
                <a href="/terms" className="hover:text-[#A1A1AA] transition-colors">Terms of Service</a>
                <span>·</span>
                <a href="/start" className="hover:text-[#A1A1AA] transition-colors">한국어 버전</a>
            </div>

            <p className="text-xs" style={{ color: '#3F3F46' }}>
                © {new Date().getFullYear()} CosmicPath · Payments processed securely by Stripe
            </p>
        </footer>
    );
}
