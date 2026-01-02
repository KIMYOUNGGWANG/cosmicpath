'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import Link from 'next/link';

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-void">
            {/* Background: Shader/Nebula Effect */}
            <div className="absolute inset-0 z-0 opacity-40">
                <ShaderGradientCanvas
                    pixelDensity={1}
                    fov={45}
                >
                    <ShaderGradient
                        control='props'
                        color1="#1a1230"  // Deep Cosmic Purple
                        color2="#4A0E0E"  // Deep Mars Red
                        color3="#D4AF37"  // Gold Accent
                        animate="on"
                        uSpeed={0.3}
                        uStrength={2.0}
                        uDensity={1.5}
                    />
                </ShaderGradientCanvas>
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="font-cinzel text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-starlight mb-6 mix-blend-overlay leading-tight"
                >
                    WRITTEN <br className="md:hidden" />
                    IN THE <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">STARS</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="text-lg md:text-2xl text-moonlight font-light max-w-2xl leading-relaxed mb-10"
                >
                    &quot;<span className="text-white font-medium">운명</span>은 침묵하지 않습니다. <br className="hidden md:block" /> 단지 우리가 듣지 못할 뿐.&quot;<br />
                    <span className="text-sm md:text-base text-dim mt-4 block font-sans">
                        당신이 궁금해하는 그 시간, 그 흐름을 <br className="md:hidden" />
                        <span className="text-acc-logic font-semibold">3가지 고대 지혜</span>로 읽어드립니다.
                    </span>
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="flex flex-wrap justify-center gap-4 md:gap-8"
                >
                    {['3-Way Cross Check', 'AI Precision Analysis', '5-Phase Deep Dive'].map((badge, i) => (
                        <div key={i} className="px-4 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
                            <span className="text-xs md:text-sm text-acc-gold tracking-widest uppercase">{badge}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Main CTA Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="mt-12"
                >
                    <Link
                        href="/start?reset=true"
                        className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] animate-shimmer text-deep-navy font-bold text-lg tracking-widest rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            BECOME THE MASTER
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </span>
                    </Link>
                    <p className="text-dim text-xs mt-4 tracking-wider">
                        * No Login Required for Free Analysis
                    </p>
                </motion.div>
            </motion.div>

            {/* Scroll Trigger */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
                <span className="text-[10px] tracking-[0.3em] text-moonlight uppercase">Scroll to Enter</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
            </motion.div>
        </section>
    );
}
