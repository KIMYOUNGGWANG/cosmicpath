'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

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
    // Dynamic prices fetched from Stripe
    const [dynamicPrice, setDynamicPrice] = useState<string>('');
    const [originalPrice, setOriginalPrice] = useState<string>('');

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.metadata?.fallback !== 'true' && data.formattedPrice) {
                        setDynamicPrice(data.formattedPrice);
                    }
                    if (data.metadata?.compare_at_price) {
                        setOriginalPrice(data.metadata.compare_at_price);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dynamic price:', error);
            }
        };
        fetchPrice();
    }, []);
    const displayPrice = dynamicPrice || '$3.99';
    const decisionStartHref = '/start?reset=true&entry=decision_timing_rebuild_v1';

    return (
        <section className="relative min-h-screen py-20 flex items-center justify-center bg-void overflow-hidden">

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
                    <h2 className="font-cinzel text-3xl md:text-6xl text-starlight mb-8 leading-tight">
                        흐름을 읽었다면, <br /> <span className="text-acc-gold">하나만 실행하세요.</span>
                    </h2>
                    <p className="text-moonlight text-base md:text-lg mb-10 md:mb-12 max-w-xl mx-auto font-light">
                        첫 판정으로 방향을 좁히고, 사주·점성술·자미두수 등 5대 엔진은 필요한 근거로만 확인합니다. <br />
                        그다음 오늘 밀어야 할 것과 멈춰야 할 것을 남깁니다.
                    </p>

                    <div className="relative group inline-block">
                        <Link
                            href={decisionStartHref}
                            className="relative z-10 grid min-w-[300px] grid-cols-[minmax(0,1fr)_62px] overflow-hidden border border-[#d7c59a]/58 bg-[#11100d]/48 text-starlight shadow-[0_28px_90px_rgba(0,0,0,0.24),inset_0_0_0_1px_rgba(255,255,255,0.025)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7c59a] hover:bg-[#d7c59a]/[0.07] md:min-w-[390px]"
                        >
                            <div className="px-7 py-6 text-left">
                                <div className="mb-4 inline-flex border border-[#d7c59a]/20 bg-[#d7c59a]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#d7c59a]/75">
                                    첫 판정 무료
                                </div>
                                <div className="font-cinzel text-xl tracking-[0.16em] md:text-2xl">Decision Note 시작</div>
                                <span className="mt-3 block text-sm font-medium text-white/45 transition-colors group-hover:text-moonlight">
                                    {dynamicPrice ? (
                                        <span className="line-through opacity-50 mr-2">{originalPrice}</span>
                                    ) : null}
                                    자세한 기록은 <span className="font-bold text-acc-gold text-lg">{displayPrice}</span>
                                </span>
                            </div>
                            <span className="flex items-center justify-center border-l border-[#d7c59a]/28 text-[#d7c59a]">
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>

                    <p className="mt-8 text-dim text-xs">
                        * 결정 보조용 정리입니다. 의료, 법률, 투자 판단은 전문가 기준을 우선하세요.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
