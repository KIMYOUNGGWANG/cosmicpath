'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Review {
    id: string;
    nickname: string;
    rating: number;
    content: string;
    isPromoUser: boolean;
    createdAt: string;
}

export function ReviewCarousel({ language = 'ko' }: { language?: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const isInView = useInView(sectionRef, { amount: 0.1 });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/review');
                if (res.ok) {
                    const data = await res.json();
                    let fetchedReviews = data.reviews || [];
                    if (fetchedReviews.length > 0 && fetchedReviews.length < 10) {
                        const multiplier = Math.ceil(10 / fetchedReviews.length);
                        fetchedReviews = Array(multiplier).fill(fetchedReviews).flat();
                    }
                    setReviews(fetchedReviews);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Pause marquee when off-screen — saves GPU/battery on mobile
    useEffect(() => {
        if (isInView) {
            controls.start({
                x: '-50%',
                transition: {
                    ease: 'linear',
                    duration: Math.max(20, reviews.length * 5),
                    repeat: Infinity,
                },
            });
        } else {
            controls.stop();
        }
    }, [isInView, reviews.length, controls]);

    if (isLoading) {
        return (
            <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#030308] to-[#050510] min-h-[500px]">
                <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            </section>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section ref={sectionRef} className="py-20 relative overflow-hidden bg-gradient-to-b from-[#030308] to-[#050510] min-h-[500px]">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900/30 to-transparent" />

            <div className="container px-4 mx-auto mb-10 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-purple-400 text-xs tracking-[0.2em] font-medium uppercase mb-2 block">
                        Real Reviews
                    </span>
                    <h2 className="text-2xl md:text-4xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-indigo-200">
                        {language === 'en' ? 'What People Said After Reading' : '읽어본 사람들이 남긴 후기'}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto opacity-50" />
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden group">
                {/* Edge fade gradients */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-[#030308] to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-[#030308] to-transparent z-20 pointer-events-none" />

                {/* Marquee Track — GPU-accelerated, pauses when off-screen */}
                <div className="flex">
                    <motion.div
                        className="flex gap-6 px-3"
                        animate={controls}
                        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                        onHoverStart={() => controls.stop()}
                        onHoverEnd={() =>
                            controls.start({
                                x: '-50%',
                                transition: { ease: 'linear', duration: Math.max(20, reviews.length * 5), repeat: Infinity },
                            })
                        }
                    >
                        {/* Duplicate array for seamless loop */}
                        {[...reviews, ...reviews].map((review, index) => (
                            <div
                                key={`${review.id}-${index}`}
                                className="flex-shrink-0 w-[300px] md:w-[350px]"
                            >
                                <div className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300 relative group/card">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                        <Quote className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="flex gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-gray-300 font-light leading-relaxed mb-5 font-outfit text-sm line-clamp-3 min-h-[4rem]">
                                        &ldquo;{review.content}&rdquo;
                                    </p>

                                    <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 text-xs font-medium text-purple-300">
                                            {review.nickname[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium text-xs font-outfit">
                                                    {review.nickname}
                                                </span>
                                                {review.rating >= 4 && (
                                                    <span className="text-[10px] text-green-400/80 bg-green-500/5 px-1.5 rounded-full border border-green-500/10">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
