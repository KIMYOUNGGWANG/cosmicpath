'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { Menu, PenLine, Search, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { MobileMenu } from '@/components/common/MobileMenu';
import UserMenu from '@/components/layout/UserMenu';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { useDocumentScrollLock } from '@/hooks/useDocumentScrollLock';

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
    const isEnglish = language === 'en';
    const decisionStartHref = '/start?reset=true&entry=decision_timing_rebuild_v1';

    useDocumentScrollLock(isMobileMenuOpen);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        const previous = prevScroll;

        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        setPrevScroll(latest);
    });

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
                <div className="absolute inset-0 border-b border-white/8 bg-[#11100d]/88 backdrop-blur-md" />

                <div className="relative mx-auto flex max-w-7xl items-center justify-between">
                    <Link
                        href="/"
                        className="z-20 flex shrink-0 flex-col leading-none text-starlight transition-opacity hover:opacity-80"
                    >
                        <span className="font-cinzel text-lg tracking-[0.18em] md:text-xl">CosmicPath</span>
                        <span className="mt-1 hidden text-[9px] uppercase tracking-[0.24em] text-white/42 sm:block">
                            {isEnglish ? 'Decision Note' : 'Decision Note'}
                        </span>
                    </Link>

                    <div className="hidden items-center gap-4 md:flex xl:gap-6">
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
                        <Link
                            href={decisionStartHref}
                            className="group relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[#d7c59a]/24 bg-[#11100d]/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[inset_3px_0_0_rgba(215,197,154,0.55)] transition-all duration-300 hover:border-[#d7c59a]/55 hover:bg-[#d7c59a]/[0.08] hover:text-[#d7c59a]"
                        >
                            <span className="absolute inset-x-3 top-1 h-px bg-[#d7c59a]/0 transition-colors group-hover:bg-[#d7c59a]/24" />
                            {isEnglish ? 'Open Decision Note' : 'Decision Note 시작'}
                        </Link>
                    </div>

                    <div className="z-20 flex items-center gap-2 md:hidden">
                        <Link
                            href={decisionStartHref}
                            className="inline-flex min-h-[32px] items-center justify-center gap-1 border border-[#d7c59a]/24 bg-[#11100d]/62 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[inset_2px_0_0_rgba(215,197,154,0.55)] transition-all duration-300 hover:border-[#d7c59a]/55 hover:bg-[#d7c59a]/[0.08] hover:text-[#d7c59a]"
                        >
                            {isEnglish ? 'Note' : '노트'}
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="border border-transparent p-2 text-white transition-colors hover:border-white/14 hover:bg-white/5"
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
                                subLabel: isEnglish ? 'Save your decision notes' : '내 정리 기록 저장하기',
                                onClick: openLoginModal,
                            },
                        ]
                        : []),
                    {
                        type: 'button',
                        icon: Search,
                        iconColorClass: 'group-hover:bg-white/10 group-hover:text-white',
                        label: isEnglish ? 'FIND ORDERS' : '결제 내역 조회',
                        subLabel: isEnglish ? 'Lookup past notes' : '지난 정리 내역 확인',
                        onClick: () => setIsOrderModalOpen(true),
                    },
                    ...(isEnglish
                        ? [
                            {
                                type: 'link' as const,
                                icon: PenLine,
                                iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                                label: 'STARTER GUIDES',
                                subLabel: 'Learn the Saju source role',
                                href: '/guides',
                            },
                        ]
                        : []),
                    {
                        type: 'link',
                        icon: PenLine,
                        iconColorClass: 'group-hover:bg-gold/20 group-hover:text-gold',
                        label: isEnglish ? 'DECISION NOTE' : 'DECISION NOTE 시작',
                        subLabel: isEnglish ? 'Saju, timing, tarot signal' : '사주 구조, 타이밍, 타로 신호',
                        href: decisionStartHref,
                    },
                ]}
            />

            <OrderLookupModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
            <LoginModal />
        </>
    );
}
