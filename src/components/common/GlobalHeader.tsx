'use client';

import Link from 'next/link';
import { ChevronLeft, Menu, PenLine, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import UserMenu from '@/components/layout/UserMenu';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { useSession } from 'next-auth/react';
import { useDocumentScrollLock } from '@/hooks/useDocumentScrollLock';

interface GlobalHeaderProps {
    language?: 'ko' | 'en';
    showBackButton?: boolean;
}

export function GlobalHeader({ language = 'ko', showBackButton = true }: GlobalHeaderProps) {
    const isEn = language === 'en';
    const { status } = useSession();
    const { openLoginModal } = useLoginModal();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const decisionStartHref = '/start?reset=true&entry=decision_timing_rebuild_v1';

    useDocumentScrollLock(isMobileMenuOpen);

    const toggleOrderModal = () => {
        setIsOrderModalOpen(true);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-0 left-0 right-0 z-[9000] px-3 sm:px-4 md:px-5 xl:px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]"
            >
                {/* Background Layers */}
                <div className="absolute inset-0 bg-[#11100d]/95 backdrop-blur-md border-b border-white/8" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-soft-light"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                <div className="relative mx-auto flex h-10 max-w-7xl items-center justify-between">
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
                        <Link
                            href="/"
                            className="shrink-0 pt-1 font-cinzel text-base tracking-[0.18em] text-starlight transition-opacity hover:opacity-80 sm:text-lg xl:text-xl"
                        >
                            <span className="hidden sm:inline">{isEn ? 'DECISION NOTE' : '오늘의 결정 정리'}</span>
                            <span className="sm:hidden">{isEn ? 'NOTE' : '결정'}</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex items-center gap-3 2xl:gap-4">
                        <UserMenu />

                        <button
                            onClick={toggleOrderModal}
                            className="shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-gray-400 transition-colors hover:text-white hover:underline underline-offset-4 2xl:text-xs"
                        >
                            {isEn ? 'Find My Orders' : '비회원 주문 조회'}
                        </button>

                        <a
                            href={decisionStartHref}
                            className="inline-flex shrink-0 items-center justify-center border border-white/18 bg-white/5 px-4 pb-[6px] pt-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-starlight transition-all duration-300 hover:border-acc-gold/50 hover:bg-white/10 2xl:px-5 text-[11px] 2xl:text-xs backdrop-blur-sm"
                        >
                            {isEn ? 'Write' : '선택 정리'}
                        </a>
                    </div>

                    {/* Compact Navigation */}
                    <div className="z-20 flex items-center gap-2 xl:hidden">
                        <a
                            href={decisionStartHref}
                            className="mr-1 inline-flex items-center justify-center border border-white/18 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:border-acc-gold/50 hover:text-acc-gold sm:px-4 backdrop-blur-sm"
                        >
                            <PenLine size={12} className="text-gold" />
                            {isEn ? 'Write' : '정리'}
                        </a>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                            aria-label={isEn ? 'Open menu' : '메뉴 열기'}
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
                        subLabel: isEn ? 'Save your notes' : '정리 기록 저장',
                        onClick: openLoginModal,
                    }] : []),
                    {
                        type: 'button',
                        icon: Search,
                        iconColorClass: 'group-hover:bg-white/10 group-hover:text-white',
                        label: isEn ? 'Find My Orders' : '비회원 주문 조회',
                        subLabel: isEn ? 'Lookup past notes' : '지난 정리 기록 조회',
                        onClick: () => setIsOrderModalOpen(true),
                    },
                    {
                        type: 'button',
                        icon: PenLine,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: isEn ? 'Decision Note' : '오늘의 결정 정리',
                        subLabel: isEn ? 'Write one delayed choice' : '미뤄둔 선택 정리하기',
                        onClick: () => {
                            window.location.href = decisionStartHref;
                        },
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
