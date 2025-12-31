'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export function RitualSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <section ref={containerRef} className="relative py-32 w-full overflow-hidden bg-void flex flex-col items-center justify-center">

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full" />
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="font-cinzel text-3xl md:text-5xl text-starlight mb-6"
                >
                    THE RITUAL
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-moonlight text-lg mb-12 font-light"
                >
                    운명은 데이터의 좌표입니다. <br />
                    당신의 시공간 좌표를 입력하여 봉인을 해제하세요.
                </motion.p>

                {/* Dial / Portal Interaction */}
                <Link href="/start" className="group relative inline-flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
                    {/* Rotating Rings */}
                    <motion.div
                        style={{ rotate }}
                        className="absolute inset-0 rounded-full border border-white/10 border-dashed group-hover:border-acc-gold/30 transition-colors duration-500"
                    />
                    <motion.div
                        style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]) }}
                        className="absolute inset-4 rounded-full border border-white/5 group-hover:border-acc-gold/20 transition-colors duration-500"
                    />

                    {/* Center Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-surface border border-white/10 flex items-center justify-center group-hover:scale-95 transition-transform duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                            <span className="font-cinzel text-sm md:text-base tracking-widest text-starlight group-hover:text-acc-gold transition-colors">
                                ENTER
                            </span>
                        </div>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-full bg-acc-gold/0 group-hover:bg-acc-gold/5 blur-3xl transition-colors duration-500 -z-10" />
                </Link>

                <p className="mt-8 text-xs text-dim tracking-[0.2em] uppercase">
                    Coordinates Locked
                </p>
            </div>
        </section>
    );
}
