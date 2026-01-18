'use client';

import Link from 'next/link';
import { ChevronLeft, Menu, X, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';

interface GlobalHeaderProps {
    language?: 'ko' | 'en';
    showBackButton?: boolean;
}

export function GlobalHeader({ language = 'ko', showBackButton = true }: GlobalHeaderProps) {
    const pathname = usePathname();
    const isEn = language === 'en';
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const toggleOrderModal = () => {
        setIsOrderModalOpen(true);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 z-[9000] px-4 md:px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]"
            >
                {/* Background Layers */}
                <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md border-b border-white/5" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-soft-light"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                <div className="relative max-w-7xl mx-auto flex items-center justify-between h-10">
                    {/* Left: Logo & Back Button */}
                    <div className="flex items-center gap-2 md:gap-4 z-20">
                        {showBackButton && (
                            <Link
                                href="/"
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <ChevronLeft size={20} />
                            </Link>
                        )}
                        <Link href="/" className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-starlight hover:opacity-80 transition-opacity pt-1 truncate">
                            COSMIC PATH
                        </Link>
                    </div>

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleOrderModal}
                            className="text-xs text-gray-400 hover:text-white transition-colors tracking-wider uppercase hover:underline underline-offset-4"
                        >
                            {isEn ? 'Find My Orders' : '내 결과 찾기'}
                        </button>

                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center pt-[10px] pb-[6px] px-5 bg-white/10 border border-white/20 text-xs font-bold tracking-[0.1em] text-starlight hover:bg-acc-gold hover:text-deep-navy hover:border-acc-gold transition-all duration-300 uppercase backdrop-blur-sm rounded-full leading-none"
                        >
                            {isEn ? 'New Journey' : '다시 시작하기'}
                        </Link>
                    </div>

                    {/* Mobile Navigation (Visible on Mobile) */}
                    <div className="flex md:hidden items-center gap-2 z-20">
                        {/* Primary CTA on Mobile Header - Premium Design */}
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center px-4 py-1.5 font-cinzel font-bold text-[10px] text-white border border-white/20 rounded-full transition-all duration-300 hover:border-acc-gold hover:text-acc-gold bg-white/5 backdrop-blur-sm mr-1 tracking-widest uppercase gap-1"
                        >
                            <Sparkles size={12} className="text-gold" />
                            {isEn ? 'Start' : '시작'}
                        </Link>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-[#0f0f15] border-l border-white/10 shadow-2xl z-[9999] md:hidden flex flex-col"
                        >
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <span className="font-cinzel font-bold text-lg text-white">MENU</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 py-8 px-6 flex flex-col gap-6">
                                <button
                                    onClick={toggleOrderModal}
                                    className="flex items-center gap-4 text-left group"
                                >
                                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-purple-500/20 text-gray-400 group-hover:text-purple-300 transition-colors">
                                        <Search size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white group-hover:text-purple-300 transition-colors">
                                            {isEn ? 'Find My Orders' : '내 결과 찾기'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {isEn ? 'Lookup past readings' : '지난 점사 기록 조회'}
                                        </div>
                                    </div>
                                </button>

                                <Link
                                    href="/start?reset=true"
                                    className="flex items-center gap-4 text-left group"
                                >
                                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-gold/20 text-gray-400 group-hover:text-gold transition-colors">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white group-hover:text-gold transition-colors">
                                            {isEn ? 'New Journey' : '운세 다시보기'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {isEn ? 'Start a new analysis' : '새로운 운세 분석 시작'}
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            {/* Menu Footer */}
                            <div className="p-6 border-t border-white/5 bg-black/20">
                                <p className="text-[10px] text-gray-600 text-center font-cinzel">
                                    © 2026 COSMIC PATH
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Order Lookup Modal */}
            <OrderLookupModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </>
    );
}
