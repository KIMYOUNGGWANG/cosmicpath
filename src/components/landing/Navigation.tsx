'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Search, Sparkles, Heart } from 'lucide-react';
import { OrderLookupModal } from '@/components/orders/OrderLookupModal';

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
                                            FIND ORDERS
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Lookup past readings
                                        </div>
                                    </div>
                                </button>

                                <Link
                                    href="/match/new"
                                    className="flex items-center gap-4 text-left group"
                                >
                                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-pink-500/20 text-gray-400 group-hover:text-pink-300 transition-colors">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white group-hover:text-pink-300 transition-colors">
                                            COMPATIBILITY
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Check relationship compatibility
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href="/start?reset=true"
                                    className="flex items-center gap-4 text-left group"
                                >
                                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-gold/20 text-gray-400 group-hover:text-gold transition-colors">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white group-hover:text-gold transition-colors">
                                            START ANALYSIS
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Begin your cosmic journey
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

            <OrderLookupModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />
        </>
    );
}
