'use client';

import Link from 'next/link';
import { ChevronLeft, Menu, Search, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu, MenuItem } from '@/components/common/MobileMenu';
import UserMenu from '@/components/layout/UserMenu';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { useSession } from 'next-auth/react';

interface GlobalHeaderProps {
    language?: 'ko' | 'en';
    showBackButton?: boolean;
}

export function GlobalHeader({ language = 'ko', showBackButton = true }: GlobalHeaderProps) {
    const pathname = usePathname();
    const isEn = language === 'en';
    const { status } = useSession();
    const { openLoginModal } = useLoginModal();
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
                        <UserMenu />

                        <button
                            onClick={toggleOrderModal}
                            className="text-xs text-gray-400 hover:text-white transition-colors tracking-wider uppercase hover:underline underline-offset-4"
                        >
                            {isEn ? 'Find My Orders' : '비회원 주문 조회'}
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

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                menuItems={[
                    ...(status === 'unauthenticated' ? [{
                        type: 'button' as const,
                        icon: User,
                        iconColorClass: 'group-hover:bg-white/10 group-hover:text-white',
                        label: isEn ? 'Login / Sign Up' : '로그인 / 회원가입',
                        subLabel: isEn ? 'Save your destiny' : '기록 저장 및 연동',
                        onClick: openLoginModal,
                    }] : []),
                    {
                        type: 'button',
                        icon: Search,
                        iconColorClass: 'group-hover:bg-purple-500/20 group-hover:text-purple-300',
                        label: isEn ? 'Find My Orders' : '비회원 주문 조회',
                        subLabel: isEn ? 'Lookup past readings' : '지난 점사 기록 조회',
                        onClick: () => setIsOrderModalOpen(true),
                    },
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: isEn ? 'New Journey' : '운세 다시보기',
                        subLabel: isEn ? 'Start a new analysis' : '새로운 운세 분석 시작',
                        href: '/start?reset=true',
                    },
                ]}
            />

            {/* Order Lookup Modal */}
            <OrderLookupModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />

            {/* Login Modal */}
            <LoginModal />
        </>
    );
}
