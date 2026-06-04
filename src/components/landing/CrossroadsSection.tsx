'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
    const [originalPrice, setOriginalPrice] = useState<string>('$29.99');

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
                        애매하게 미뤄둔 선택, <br /> <span className="text-acc-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">오늘 끝내세요.</span>
                    </h2>
                    <p className="text-moonlight text-base md:text-lg mb-10 md:mb-12 max-w-xl mx-auto font-light">
                        질문 하나만 적으면 첫 결과가 바로 열립니다. <br />
                        관계, 커리어, 돈 중 어디서든 오늘 보낼 말과 다음 행동부터 정리해보세요.
                    </p>

                    {/* Magnetic Button Area */}
                    <div className="relative group inline-block">
                        <Link
                            href={decisionStartHref}
                            className="relative z-10 flex flex-col items-center justify-center px-16 py-6 bg-white text-deep-navy rounded-xl hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-bold tracking-widest text-lg md:text-2xl">미뤄둔 선택 끝내기</span>
                            </div>

                            {/* Badger for Discount */}
                            <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                                첫 결과 무료
                            </div>

                            <span className="text-sm font-medium mt-1 text-gray-500 group-hover:text-deep-navy/80 transition-colors">
                                {dynamicPrice ? (
                                    <span className="line-through opacity-50 mr-2">{originalPrice}</span>
                                ) : null}
                                전체 리딩 <span className="font-bold text-red-500 text-lg">{displayPrice}</span>
                            </span>
                        </Link>
                    </div>

                    <p className="mt-8 text-dim text-xs">
                        * 결과가 잘 안 맞으면 다시 읽어드려요.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
