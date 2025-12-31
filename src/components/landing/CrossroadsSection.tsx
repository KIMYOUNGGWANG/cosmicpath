'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Pre-generate star data once at module load time
// Pre-generate star data statically to avoid hydration mismatch
const STAR_DATA = [
    { id: 0, initialX: 120, initialY: -50, animateY: -80, duration: 6 },
    { id: 1, initialX: -300, initialY: 200, animateY: -120, duration: 8 },
    { id: 2, initialX: 450, initialY: -150, animateY: -60, duration: 7 },
    { id: 3, initialX: -100, initialY: 300, animateY: -90, duration: 9 },
    { id: 4, initialX: 250, initialY: 100, animateY: -70, duration: 5.5 },
    { id: 5, initialX: -400, initialY: -200, animateY: -100, duration: 7.5 },
    { id: 6, initialX: 300, initialY: 400, animateY: -80, duration: 6.5 },
    { id: 7, initialX: -200, initialY: -300, animateY: -110, duration: 8.5 },
    { id: 8, initialX: 80, initialY: 150, animateY: -50, duration: 6 },
    { id: 9, initialX: -150, initialY: 50, animateY: -90, duration: 7 },
    { id: 10, initialX: 400, initialY: -100, animateY: -130, duration: 9 },
    { id: 11, initialX: -250, initialY: 250, animateY: -60, duration: 5 },
    { id: 12, initialX: 150, initialY: -400, animateY: -100, duration: 8 },
    { id: 13, initialX: -350, initialY: -50, animateY: -70, duration: 6.5 },
    { id: 14, initialX: 500, initialY: 350, animateY: -120, duration: 7.5 },
    { id: 15, initialX: -50, initialY: -250, animateY: -80, duration: 5.5 },
    { id: 16, initialX: 200, initialY: 500, animateY: -90, duration: 8.5 },
    { id: 17, initialX: -450, initialY: 100, animateY: -50, duration: 6 },
    { id: 18, initialX: 350, initialY: -350, animateY: -110, duration: 7 },
    { id: 19, initialX: 0, initialY: 0, animateY: -100, duration: 9 },
];

export function CrossroadsSection() {
    return (
        <section className="relative h-screen flex items-center justify-center bg-void overflow-hidden">

            {/* Background Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-void/50 to-void pointer-events-none" />

            {/* Floating Elements (Dust/Stars) */}
            <div className="absolute inset-0">
                {STAR_DATA.map((star) => (
                    <motion.div
                        key={star.id}
                        initial={{
                            x: star.initialX,
                            y: star.initialY,
                            opacity: 0.2
                        }}
                        animate={{
                            y: [null, star.animateY],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: star.duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                        style={{ left: '50%', top: '50%' }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center px-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <h2 className="font-cinzel text-4xl md:text-6xl text-starlight mb-8 leading-tight">
                        당신의 궤도를 <br /> <span className="text-acc-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">수정하세요.</span>
                    </h2>
                    <p className="text-moonlight text-lg mb-12 max-w-xl mx-auto font-light">
                        인생의 정답지를 미리 볼 수 있다면, <br />
                        당신은 그 기회에 얼마의 가치를 매기시겠습니까?
                    </p>

                    {/* Magnetic Button Area */}
                    <div className="relative group inline-block">
                        <Link
                            href="/start"
                            className="relative z-10 flex flex-col items-center justify-center px-16 py-6 bg-white text-deep-navy rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold tracking-widest text-xl md:text-2xl">내 운명 확인하기</span>
                                <span className="animate-pulse">✨</span>
                            </div>

                            {/* Badger for Discount */}
                            <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                                85% SAVE
                            </div>

                            <span className="text-sm font-medium mt-1 text-gray-500 group-hover:text-deep-navy/80 transition-colors">
                                <span className="line-through opacity-50 mr-2">$29.99</span>
                                <span className="font-bold text-red-500 text-lg">$3.99</span>
                            </span>
                        </Link>
                    </div>

                    <p className="mt-8 text-dim text-xs">
                        * 결과에 만족하지 못할 시, AI가 다시 분석해 드립니다.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
