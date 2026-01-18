'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import { Menu, Search, Sparkles, Heart } from 'lucide-react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';
import { MobileMenu } from '@/components/common/MobileMenu';

export function Navigation() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [prevScroll, setPrevScroll] = useState(0);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 mix-blend-difference text-white"
            >
                <div className="absolute inset-0 backdrop-blur-md bg-black/10 border-b border-white/5 noise-overlay" />

                <div className="relative max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="font-cinzel text-lg md:text-xl font-bold tracking-widest text-starlight hover:opacity-80 transition-opacity truncate z-20">
                        COSMIC PATH
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleOrderModal}
                            className="text-sm font-medium text-starlight hover:text-acc-gold transition-colors font-cinzel tracking-wider uppercase"
                        >
                            FIND ORDERS
                        </button>
                        <Link
                            href="/match/new"
                            className="text-sm font-medium text-starlight hover:text-acc-gold transition-colors font-cinzel tracking-wider"
                        >
                            COMPATIBILITY
                        </Link>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center px-5 py-2 font-cinzel font-bold text-xs text-white border border-white/20 rounded-full transition-all duration-300 hover:border-acc-gold hover:text-acc-gold bg-white/5 backdrop-blur-sm tracking-widest uppercase gap-2"
                        >
                            <Sparkles size={14} className="text-gold" />
                            Start Analysis
                        </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center gap-2 z-20">
                        {/* Primary CTA on Mobile Header - Premium Design */}
                        <Link
                            href="/start?reset=true"
                            className="inline-flex items-center justify-center px-4 py-1.5 font-cinzel font-bold text-[10px] text-white border border-white/20 rounded-full transition-all duration-300 hover:border-acc-gold hover:text-acc-gold bg-white/5 backdrop-blur-sm mr-1 tracking-widest uppercase gap-1"
                        >
                            <Sparkles size={12} className="text-gold" />
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
        </>
    );
}
