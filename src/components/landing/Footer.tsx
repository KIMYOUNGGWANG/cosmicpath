import Link from 'next/link';

interface FooterProps {
    language?: 'ko' | 'en';
}

export function Footer({ language = 'ko' }: FooterProps) {
    const isEnglish = language === 'en';

    return (
        <footer className="bg-void py-12 border-t border-white/5">
            <div className="container-cosmic flex flex-col items-center gap-8 text-center">
                <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="font-cinzel text-lg tracking-widest text-starlight">
                        NEXT MOVE REPORT
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest text-dim">
                        {isEnglish ? (
                            <Link href="/guides" className="transition-colors hover:text-white">
                                Starter Guides
                            </Link>
                        ) : null}
                        <Link href="/terms" className="transition-colors hover:text-white">
                            {isEnglish ? 'Terms of Service' : '이용약관'}
                        </Link>
                        <Link href="/privacy" className="transition-colors hover:text-white">
                            {isEnglish ? 'Privacy Policy' : '개인정보처리방침'}
                        </Link>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-1 border-t border-white/5 pt-8 text-center text-[10px] font-light leading-relaxed tracking-wider text-white/30 md:items-start md:text-left">
                    <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                        <span>{isEnglish ? 'Company: Tony\'s Company' : '상호명: 토니스컴퍼니'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'CEO: Kim Young Gwang' : '대표: 김영광'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'Business Registration: 832-56-01010' : '사업자등록번호: 832-56-01010'}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                        <span>{isEnglish ? 'Address: 253 Ojeong-ro, Bucheon-si, Gyeonggi-do, Korea' : '주소: 경기도 부천시 오정로253'}</span>
                        <span className="hidden md:inline">|</span>
                        <span>{isEnglish ? 'E-Commerce License: 2025-GyeonggiBucheon-0123' : '통신판매업신고: 2025-경기부천-0123'}</span>
                    </div>
                    <div className="mt-2">
                        © 2026 Next Move Report by {isEnglish ? 'Tony\'s Company' : '토니스컴퍼니'}. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
