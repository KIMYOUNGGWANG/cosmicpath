'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';

export function Navigation() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [prevScroll, setPrevScroll] = useState(0);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = prevScroll;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setPrevScroll(latest);
    });

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 mix-blend-difference text-white"
        >
            <div className="absolute inset-0 backdrop-blur-md bg-black/10 border-b border-white/5 noise-overlay" />

            <div className="relative max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="font-cinzel text-xl font-bold tracking-widest text-starlight hover:opacity-80 transition-opacity">
                    COSMIC PATH
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-8">
                    <Link
                        href="/start?reset=true"
                        className="px-5 py-2 bg-white/10 border border-white/20 text-xs font-bold tracking-[0.1em] text-starlight hover:bg-acc-gold hover:text-deep-navy hover:border-acc-gold transition-all duration-300 uppercase backdrop-blur-sm rounded-full"
                    >
                        Start Analysis
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
