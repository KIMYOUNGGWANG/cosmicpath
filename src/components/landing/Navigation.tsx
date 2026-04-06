'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, Sparkles, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import UserMenu from '@/components/layout/UserMenu';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
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

    useMotionValueEvent(scrollY, 'change', (latest) => {
        const previous = prevScroll;

        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        setPrevScroll(latest);
    });

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';

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
                    hidden: { y: '-100%' },
                }}
                animate={hidden ? 'hidden' : 'visible'}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="fixed left-0 right-0 top-0 z-[9999] px-4 py-4 text-white sm:px-4 md:px-5 xl:px-6"
            >
                <div className="absolute inset-0 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md noise-overlay" />

                <div className="relative mx-auto flex max-w-7xl items-center justify-between">
                    <Link
                        href="/"
                        className="z-20 shrink-0 truncate font-cinzel text-lg font-bold tracking-widest text-starlight transition-opacity hover:opacity-80 md:text-xl"
                    >
                        <span className="hidden sm:inline">COSMIC PATH</span>
                        <span className="sm:hidden">COSMIC</span>
                    </Link>

                    <div className="hidden items-center gap-4 md:flex xl:gap-6">
                        <Link
                            href="/daily"
                            className="shrink-0 whitespace-nowrap font-cinzel text-xs font-medium uppercase tracking-widest text-starlight transition-colors hover:text-acc-gold"
                        >
                            {isEnglish ? 'Daily Signals' : '오늘의 운세'}
                        </Link>
                        {isEnglish ? (
                            <Link
                                href="/guides"
                                className="shrink-0 whitespace-nowrap font-cinzel text-xs font-medium uppercase tracking-widest text-starlight transition-colors hover:text-acc-gold"
                            >
                                Starter Guides
                            </Link>
                        ) : null}
                        <button
                            onClick={toggleOrderModal}
                            className="shrink-0 whitespace-nowrap font-cinzel text-xs font-medium uppercase tracking-widest text-starlight transition-colors hover:text-acc-gold"
                        >
                            {isEnglish ? 'Find Orders' : '결제 내역 조회'}
                        </button>

                        <div className="mx-2 h-4 w-px bg-white/10" />

                        <UserMenu />
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-5 py-2 font-cinzel text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        >
                            <Sparkles size={14} className="fill-current" />
                            PRO
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 px-5 py-2 font-cinzel text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:border-acc-gold hover:bg-acc-gold hover:text-deep-navy"
                        >
                            {isEnglish ? 'Start Oracle' : '오라클 시작'}
                        </Link>
                    </div>

                    <div className="z-20 flex items-center gap-2 md:hidden">
                        <button
                            onClick={() => setIsSubscriptionModalOpen(true)}
                            className="mr-1 inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-4 py-1.5 font-cinzel text-[10px] font-bold uppercase tracking-widest text-black transition-all duration-300 hover:shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                        >
                            <Sparkles size={12} className="fill-current" />
                            PRO
                        </button>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center gap-1 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-cinzel text-[10px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:border-acc-gold hover:text-acc-gold"
                        >
                            {isEnglish ? 'Oracle' : '오라클'}
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

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                menuItems={[
                    ...(status === 'unauthenticated'
                        ? [
                            {
                                type: 'button' as const,
                                icon: User,
                                iconColorClass: 'group-hover:bg-white/10 group-hover:text-white',
                                label: isEnglish ? 'LOGIN' : '로그인',
                                subLabel: isEnglish ? 'Save your reading path' : '나의 운명을 저장하세요',
                                onClick: openLoginModal,
                            },
                        ]
                        : []),
                    {
                        type: 'button',
                        icon: Search,
                        iconColorClass: 'group-hover:bg-purple-500/20 group-hover:text-purple-300',
                        label: isEnglish ? 'FIND ORDERS' : '결제 내역 조회',
                        subLabel: isEnglish ? 'Lookup past readings' : '과거 리딩 내역 확인',
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
                    ...(isEnglish
                        ? [
                            {
                                type: 'link' as const,
                                icon: Sparkles,
                                iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                                label: 'STARTER GUIDES',
                                subLabel: 'Learn Korean Saju first',
                                href: '/guides',
                            },
                        ]
                        : []),
                    {
                        type: 'link',
                        icon: Sparkles,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: isEnglish ? 'START ANALYSIS' : '오라클 시작',
                        subLabel: isEnglish ? 'Begin your cosmic journey' : '코스믹 여정을 시작하세요',
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
