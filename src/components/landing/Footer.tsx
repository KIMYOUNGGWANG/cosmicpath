import Link from 'next/link';

interface FooterProps {
    language?: 'ko' | 'en';
}

export function Footer({ language = 'ko' }: FooterProps) {
    const isEnglish = language === 'en';

    return (
        <footer className="py-12 bg-void border-t border-white/5">
            <div className="container-cosmic flex flex-col items-center gap-8 text-center">
                {/* Logo & Links */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                    <div className="font-cinzel text-starlight text-lg tracking-widest">
                        COSMIC PATH
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-xs text-dim tracking-widest uppercase">
                        {isEnglish ? <Link href="/guides" className="hover:text-white transition-colors">Starter Guides</Link> : null}
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>

                {/* Business Info (Korea Compliance) */}
                <div className="w-full border-t border-white/5 pt-8 text-[10px] text-white/30 font-light leading-relaxed tracking-wider flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <span>{isEnglish ? 'Company: Tony\'s Company' : '상호명: 토니스컴퍼니'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'CEO: Kim Young Gwang' : '대표: 김영광'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'Business Registration: 832-56-01010' : '사업자등록번호: 832-56-01010'}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <span>{isEnglish ? 'Address: 253 Ojeong-ro, Bucheon-si, Gyeonggi-do, Korea' : '주소: 경기도 부천시 오정로253'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'E-Commerce License: [Korea Registration]' : '통신판매업신고: [E-Commerce License]'}</span>
                    </div>
                    <div className="mt-2">
                        © 2025 CosmicPath ({'Tony\'s Company'}). All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
