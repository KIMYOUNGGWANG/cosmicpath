'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, Sparkles } from 'lucide-react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import { User } from 'lucide-react';
import UserMenu from '@/components/layout/UserMenu';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { useSession } from 'next-auth/react';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';

interface NavigationProps {
    language?: 'ko' | 'en';
}

export function Navigation({ language = 'ko' }: NavigationProps) {
    const { status } = useSession();
    const { openLoginModal } = useLoginModal();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [prevScroll, setPrevScroll] = useState(0);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const isEnglish = language === 'en';

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = prevScroll;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setPrevScroll(latest);
    });

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
            <motion.nav
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed left-0 right-0 top-0 z-[9999] px-3 py-4 text-white sm:px-4 md:px-5 xl:px-6"
            >
                <div className="relative mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-[#050816]/72 px-4 py-3 shadow-[0_20px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:px-5 xl:px-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="z-20 shrink-0 font-cinzel text-base font-bold tracking-[0.24em] text-starlight transition-opacity hover:opacity-80 sm:text-lg xl:text-xl"
                    >
                        <span className="hidden sm:inline">COSMIC PATH</span>
                        <span className="sm:hidden">COSMIC</span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden xl:flex items-center gap-3 2xl:gap-5">
                        <Link
                            href="/daily"
                            className="shrink-0 whitespace-nowrap rounded-full border border-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-starlight transition-colors hover:text-acc-gold 2xl:text-xs"
                        >
                            {isEnglish ? 'Daily Signals' : '오늘의 운세'}
                        </Link>
                        {isEnglish ? (
                            <Link
                                href="/guides"
                                className="shrink-0 whitespace-nowrap rounded-full border border-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-starlight transition-colors hover:text-acc-gold 2xl:text-xs"
                            >
                                Starter Guides
                            </Link>
                        ) : null}
                        <button
                            onClick={toggleOrderModal}
                            className="shrink-0 whitespace-nowrap rounded-full border border-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-starlight transition-colors hover:text-acc-gold 2xl:text-xs"
                        >
                            FIND ORDERS
                        </button>

                        <div className="mx-1 h-4 w-px bg-white/10 2xl:mx-2" />

                        <UserMenu />
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] 2xl:px-5 2xl:text-xs"
                        >
                            <Sparkles size={14} className="fill-current" />
                            Membership
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-acc-gold hover:bg-acc-gold hover:text-deep-navy 2xl:px-5 2xl:text-xs"
                        >
                            Start Oracle
                        </Link>
                    </div>

                    {/* Compact Navigation */}
                    <div className="z-20 flex items-center gap-2 xl:hidden">
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] sm:px-4 sm:tracking-[0.26em]"
                        >
                            <Sparkles size={12} className="fill-current" />
                            Pro
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-acc-gold hover:text-acc-gold sm:px-4 sm:tracking-[0.26em]"
                        >
                            Oracle
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                            aria-label={isEnglish ? 'Open menu' : '메뉴 열기'}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                menuItems={[
                    ...(status === 'unauthenticated' ? [{
                        type: 'button' as const,
                        icon: User,
                        iconColorClass: 'group-hover:bg-white/10 group-hover:text-white',
                        label: 'LOGIN',
                        subLabel: 'Save your destiny',
                        onClick: openLoginModal,
                    }] : []),
                    {
                        type: 'button',
                        icon: Search,
                        iconColorClass: 'group-hover:bg-purple-500/20 group-hover:text-purple-300',
                        label: 'FIND ORDERS',
                        subLabel: isEnglish ? 'Lookup past readings' : '지난 리딩 찾아보기',
                        onClick: () => setIsOrderModalOpen(true),
                    },
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: isEnglish ? 'DAILY SIGNALS' : '오늘의 운세',
                        subLabel: isEnglish ? 'Birth-based daily guidance' : '생년월일 기반 데일리 운세',
                        href: '/daily',
                    },
                    ...(isEnglish ? [{
                        type: 'link' as const,
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: 'STARTER GUIDES',
                        subLabel: 'Learn Korean Saju first',
                        href: '/guides',
                    }] : []),
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: 'START ANALYSIS',
                        subLabel: isEnglish ? 'Begin your cosmic journey' : '오라클 리딩 시작하기',
                        href: '/start?reset=true',
                    },
                ]}
            />

            <OrderLookupModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
            <LoginModal />
            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                source="landing"
            />
        </>
    );
}
