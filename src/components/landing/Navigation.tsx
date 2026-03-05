'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, Sparkles, Heart } from 'lucide-react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import { User } from 'lucide-react';
import UserMenu from '@/components/layout/UserMenu';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { useSession } from 'next-auth/react';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';

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

    return (
        <>
            <motion.nav
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed top-0 left-0 right-0 z-[9999] px-4 md:px-6 py-4 text-white"
            >
                <div className="absolute inset-0 backdrop-blur-md bg-[#050505]/80 border-b border-white/5 noise-overlay" />

                <div className="relative max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-starlight hover:opacity-80 transition-opacity truncate z-20">
                        COSMIC PATH
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            href="/match/new"
                            className="text-xs font-medium text-starlight hover:text-acc-gold transition-colors font-cinzel tracking-widest"
                        >
                            COMPATIBILITY
                        </Link>
                        <Link
                            href="/daily"
                            className="text-xs font-medium text-starlight hover:text-acc-gold transition-colors font-cinzel tracking-widest uppercase"
                        >
                            오늘의 운세
                        </Link>
                        <button
                            onClick={toggleOrderModal}
                            className="text-xs font-medium text-starlight hover:text-acc-gold transition-colors font-cinzel tracking-widest uppercase"
                        >
                            FIND ORDERS
                        </button>

                        <div className="w-px h-4 bg-white/10 mx-2" /> {/* Divider */}

                        <UserMenu />
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex items-center justify-center px-5 py-2 font-cinzel font-bold text-xs text-black bg-gradient-to-r from-[#D4AF37] to-[#F2D479] rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-105 tracking-widest uppercase gap-2"
                        >
                            <Sparkles size={14} className="fill-current" />
                            PRO ✨
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center px-5 py-2 font-cinzel font-bold text-xs text-white border border-white/20 rounded-full transition-all duration-300 hover:border-acc-gold hover:text-deep-navy hover:bg-acc-gold tracking-widest uppercase gap-2"
                        >
                            Start Analysis
                        </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center gap-2 z-20">
                        {/* Primary CTA on Mobile Header - Premium Design */}
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex items-center justify-center px-4 py-1.5 font-cinzel font-bold text-[10px] text-black bg-gradient-to-r from-[#D4AF37] to-[#F2D479] rounded-full transition-all duration-300 hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] mr-1 tracking-widest uppercase gap-1"
                        >
                            <Sparkles size={12} className="fill-current" />
                            PRO
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center px-4 py-1.5 font-cinzel font-bold text-[10px] text-white border border-white/20 rounded-full transition-all duration-300 hover:border-acc-gold hover:text-acc-gold bg-white/5 backdrop-blur-sm tracking-widest uppercase gap-1"
                        >
                            Start
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
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
