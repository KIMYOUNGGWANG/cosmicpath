'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface GlobalHeaderProps {
    language?: 'ko' | 'en';
    showBackButton?: boolean;
}

export function GlobalHeader({ language = 'ko', showBackButton = true }: GlobalHeaderProps) {
    const pathname = usePathname();
    const isResultPage = pathname.includes('/start') || pathname.includes('/share');
    const isEn = language === 'en';

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            {/* Glass Background */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/40 border-b border-white/5 noise-overlay" />

            <div className="relative max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo & Back Button */}
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <Link
                            href="/"
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </Link>
                    )}
                    <Link href="/" className="font-cinzel text-xl font-bold tracking-widest text-starlight hover:opacity-80 transition-opacity">
                        COSMIC PATH
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {pathname === '/' ? (
                        <Link
                            href="/start?reset=true"
                            className="px-5 py-2 bg-white/10 border border-white/20 text-[10px] md:text-xs font-bold tracking-[0.1em] text-starlight hover:bg-acc-gold hover:text-deep-navy hover:border-acc-gold transition-all duration-300 uppercase backdrop-blur-sm rounded-full"
                        >
                            {isEn ? 'Start Analysis' : '분석 시작하기'}
                        </Link>
                    ) : (
                        <Link
                            href="/start?reset=true"
                            className="px-5 py-2 bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold tracking-[0.1em] text-white/50 hover:bg-white/10 hover:text-white transition-all duration-300 uppercase backdrop-blur-sm rounded-full"
                        >
                            {isEn ? 'New Journey' : '다시 시작하기'}
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
