'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export function RitualSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const language = 'ko';

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const rotateBase = useTransform(scrollYProgress, [0, 1], [0, 90]);
    const gapjaChars = "甲乙丙丁戊己庚辛壬癸";

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative py-48 w-full overflow-hidden bg-void flex flex-col items-center justify-center cursor-crosshair"
        >

            {/* Ambient Background: Deepening the Void */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02)_0%,transparent_80%)] pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mb-8 inline-flex items-center gap-3 px-4 py-1 border border-white/10 rounded-full"
                >
                    <span className={`w-1 h-1 rounded-full transition-colors duration-500 ${isHovered ? 'bg-acc-gold' : 'bg-starlight/30'}`} />
                    <span className="text-[10px] tracking-[0.5em] text-starlight/40 font-mono uppercase">System Integrity: Nominal</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                    className="font-cinzel text-5xl md:text-7xl text-starlight mb-10 tracking-[0.3em]"
                >
                    THE RITUAL
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-moonlight text-xs md:text-sm mb-20 font-light tracking-[0.2em] max-w-lg mx-auto leading-relaxed border-l border-r border-white/10 px-8"
                >
                    {language === 'ko'
                        ? "운명의 좌표가 정밀하게 조율되었습니다. 황금빛 구심점을 통해 당신의 미래를 해독하십시오."
                        : "The coordinates of fate are precisely aligned. Decode your future through the golden center."}
                </motion.p>

                {/* Chronos Dial: Color Hierarchy Refined */}
                <div className="relative flex items-center justify-center w-80 h-80 md:w-[560px] md:h-[560px]">

                    {/* Outer Mechanism: Cold Silver (High Precision) */}
                    <motion.div
                        style={{
                            rotate: rotateBase,
                            x: mousePos.x * 20,
                            y: mousePos.y * 20,
                        }}
                        className="absolute inset-0 rounded-full border border-white/5 flex items-center justify-center"
                    >
                        {[...Array(120)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-full w-[1px] origin-center"
                                style={{ rotate: `${i * 3}deg` }}
                            >
                                <div className={`h-1.5 w-full ${i % 10 === 0 ? 'bg-white/20 h-3' : 'bg-white/5'} mt-[-1px]`} />
                            </div>
                        ))}
                    </motion.div>

                    {/* Middle Ring: Dim Gold (Representing Potential) */}
                    <motion.div
                        style={{
                            rotate: useTransform(scrollYProgress, [0, 1], [0, -180]),
                            x: mousePos.x * 40,
                            y: mousePos.y * 40,
                        }}
                        className="absolute inset-16 md:inset-24 rounded-full border border-white/5 flex items-center justify-center"
                    >
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-full w-4 origin-center flex justify-center pt-2"
                                style={{ rotate: `${i * 36}deg` }}
                            >
                                <span className="text-[10px] text-starlight/20 font-serif tracking-tighter">{gapjaChars[i]}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* The Core: High-Vibrancy Gold (Intuitive Action Point) */}
                    <Link href="/start?reset=true" className="group relative z-30">
                        {/* Radiant Aura: Dynamic Intensity */}
                        <motion.div
                            animate={{
                                scale: isHovered ? [1, 1.1, 1] : 1,
                                opacity: isHovered ? 0.4 : 0.1
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-[-40px] rounded-full bg-acc-gold blur-[60px] pointer-events-none transition-all duration-700"
                        />

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                x: mousePos.x * 60,
                                y: mousePos.y * 60,
                            }}
                            className="relative w-40 h-40 md:w-60 md:h-60 rounded-full bg-void border border-acc-gold/40 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.9)] group-hover:border-acc-gold"
                        >
                            {/* Inner Hot Surface */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)] opacity-30 group-hover:opacity-80 transition-opacity duration-700" />

                            {/* Scanning Pulse Line */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <div className="h-full w-[2px] bg-acc-gold/40 mx-auto group-hover:bg-acc-gold transition-colors" />
                            </motion.div>

                            <span className="relative z-10 font-cinzel text-[10px] tracking-[0.5em] text-acc-gold/60 mb-2 group-hover:text-acc-gold group-hover:tracking-[0.6em] transition-all duration-500">
                                ENTER
                            </span>
                            <span className="relative z-10 font-cinzel text-lg md:text-2xl font-bold tracking-[0.2em] text-starlight group-hover:text-white group-hover:scale-110 transition-all duration-500">
                                {language === 'ko' ? "분석 시작" : "START"}
                            </span>

                            <div className="mt-4 w-8 h-[1px] bg-acc-gold/30 group-hover:w-16 group-hover:bg-acc-gold transition-all duration-700" />
                        </motion.div>
                    </Link>

                    {/* Floating Fine Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.1, 0.5, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i }}
                            style={{
                                left: `${25 + i * 10}%`,
                                top: `${20 + (i % 3) * 20}%`,
                                x: mousePos.x * (i + 1) * 30,
                                y: mousePos.y * (i + 1) * 30,
                            }}
                            className="absolute w-[1px] h-[1px] bg-acc-gold/50 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                        />
                    ))}
                </div>

                {/* Status Indicator: Pure Gold Intuition */}
                <div className="mt-20 flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ opacity: isHovered ? [0.3, 1, 0.3] : 0.2 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="font-cinzel text-[10px] md:text-xs tracking-[0.6em] text-acc-gold uppercase flex items-center gap-4"
                    >
                        <span className="w-12 h-px bg-gradient-to-r from-transparent to-acc-gold" />
                        {isHovered ? "Alignment Locked" : "Scanning Pattern"}
                        <span className="w-12 h-px bg-gradient-to-l from-transparent to-acc-gold" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
