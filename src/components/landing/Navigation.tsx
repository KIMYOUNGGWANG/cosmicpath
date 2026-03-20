'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, Sparkles, Heart, Palette, BookOpen } from 'lucide-react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import { User } from 'lucide-react';
import UserMenu from '@/components/layout/UserMenu';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { useSession } from 'next-auth/react';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

export function Navigation() {
    const { status } = useSession();
    const { openLoginModal } = useLoginModal();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [prevScroll, setPrevScroll] = useState(0);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

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

    const trackKDestinyNavClick = (context: 'desktop' | 'mobile') => {
        void trackClientGrowthEvent({
            event: 'k_destiny_nav_click',
            source: 'navigation',
            context,
            metadata: {
                authenticated: status === 'authenticated',
            },
        });
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
                className="fixed top-0 left-0 right-0 z-[9999] px-3 sm:px-4 md:px-5 xl:px-6 py-4 text-white"
            >
                <div className="absolute inset-0 backdrop-blur-md bg-[#050505]/80 border-b border-white/5 noise-overlay" />

                <div className="relative mx-auto flex max-w-7xl items-center justify-between">
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
                            href="/match/new"
                            className="shrink-0 whitespace-nowrap text-[11px] font-medium text-starlight transition-colors hover:text-acc-gold 2xl:text-xs font-cinzel tracking-[0.22em]"
                        >
                            COMPATIBILITY
                        </Link>
                        <Link
                            href="/daily"
                            className="shrink-0 whitespace-nowrap text-[11px] font-medium text-starlight transition-colors hover:text-acc-gold 2xl:text-xs font-cinzel tracking-[0.22em] uppercase"
                        >
                            오늘의 운세
                        </Link>
                        <Link
                            href="/blog"
                            className="shrink-0 whitespace-nowrap text-[11px] font-medium text-starlight transition-colors hover:text-acc-gold 2xl:text-xs font-cinzel tracking-[0.22em] uppercase"
                        >
                            BLOG
                        </Link>
                        <Link
                            href="/k-destiny"
                            onClick={() => trackKDestinyNavClick('desktop')}
                            className="shrink-0 whitespace-nowrap text-[11px] font-medium text-[#7FDBFF] transition-colors hover:text-[#FFD166] 2xl:text-xs font-cinzel tracking-[0.22em] uppercase"
                        >
                            K-DESTINY
                        </Link>
                        <button
                            onClick={toggleOrderModal}
                            className="shrink-0 whitespace-nowrap text-[11px] font-medium text-starlight transition-colors hover:text-acc-gold 2xl:text-xs font-cinzel tracking-[0.22em] uppercase"
                        >
                            FIND ORDERS
                        </button>

                        <div className="mx-1 h-4 w-px bg-white/10 2xl:mx-2" /> {/* Divider */}

                        <UserMenu />
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-4 py-2 font-cinzel text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] 2xl:px-5 2xl:text-xs"
                        >
                            <Sparkles size={14} className="fill-current" />
                            PRO
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 font-cinzel text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-acc-gold hover:bg-acc-gold hover:text-deep-navy 2xl:px-5 2xl:text-xs"
                        >
                            Start Analysis
                        </Link>
                    </div>

                    {/* Compact Navigation */}
                    <div className="z-20 flex items-center gap-2 xl:hidden">
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-3 py-1.5 font-cinzel text-[10px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] sm:px-4 sm:tracking-[0.26em]"
                        >
                            <Sparkles size={12} className="fill-current" />
                            PRO
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-cinzel text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-acc-gold hover:text-acc-gold sm:px-4 sm:tracking-[0.26em]"
                        >
                            Start
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                            aria-label="메뉴 열기"
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
                        subLabel: 'Lookup past readings',
                        onClick: () => setIsOrderModalOpen(true),
                    },
                    {
                        type: 'link',
                        icon: Heart,
                        iconColorClass: 'group-hover:bg-pink-500/20 group-hover:text-pink-300',
                        label: 'COMPATIBILITY',
                        subLabel: 'Check relationship compatibility',
                        href: '/match/new',
                    },
                    {
                        type: 'link',
                        icon: BookOpen,
                        iconColorClass: 'group-hover:bg-amber-500/20 group-hover:text-amber-300',
                        label: 'BLOG',
                        subLabel: 'SEO guides and cosmic insights',
                        href: '/blog',
                    },
                    {
                        type: 'link',
                        icon: Palette,
                        iconColorClass: 'group-hover:bg-cyan-500/20 group-hover:text-cyan-300',
                        label: 'K-DESTINY',
                        subLabel: 'Generate your aura card',
                        href: '/k-destiny',
                        onClick: () => trackKDestinyNavClick('mobile'),
                    },
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: '오늘의 운세',
                        subLabel: '생년월일 기반 데일리 운세',
                        href: '/daily',
                    },
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: 'START ANALYSIS',
                        subLabel: 'Begin your cosmic journey',
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
            />
        </>
    );
}
