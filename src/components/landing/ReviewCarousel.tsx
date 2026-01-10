'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote, User } from 'lucide-react';

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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/review');
                if (res.ok) {
                    const data = await res.json();
                    // 최소 5개는 있어야 캐러셀이 예쁘므로, 데이터가 적으면 복제해서 채움
                    let fetchedReviews = data.reviews || [];
                    if (fetchedReviews.length > 0 && fetchedReviews.length < 5) {
                        fetchedReviews = [...fetchedReviews, ...fetchedReviews, ...fetchedReviews].slice(0, 10);
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

    const maskNickname = (name: string) => {
        if (!name) return 'Anonymous';
        if (name.length <= 2) return name[0] + '*';
        if (name.includes(' ')) return name.split(' ')[0] + ' **'; // 영문 이름 등
        return name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
    };

    if (isLoading) return null; // 로딩 중에는 아무것도 안 보여줌 (스켈레톤 대신)
    if (reviews.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />

            <div className="container px-4 mx-auto mb-12 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-indigo-200">
                        {language === 'en' ? 'Seeker\'s Voices' : '운명을 확인한 사람들의 이야기'}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto opacity-50" />
                </motion.div>
            </div>

            {/* Carousel Container */}
            <div className="relative w-full">
                {/* Gradients for fade effect on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-[#030308] to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-[#030308] to-transparent z-20 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-8 pt-4 px-4 md:px-0 gap-6 snap-x snap-mandatory scrollbar-hide no-scrollbar"
                    style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                >
                    {/* Spacer for centering first item */}
                    <div className="w-4 md:w-[calc(50vw-180px)] flex-shrink-0" />

                    {reviews.map((review, index) => (
                        <motion.div
                            key={`${review.id}-${index}`}
                            className="flex-shrink-0 w-[300px] md:w-[360px] snap-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-colors duration-300 relative group">
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-500/20 group-hover:text-purple-500/40 transition-colors" />

                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-300 font-light leading-relaxed mb-6 font-outfit text-sm md:text-base line-clamp-4 min-h-[5rem]">
                                    "{review.content}"
                                </p>

                                <div className="flex items-center gap-3 mt-auto border-top border-white/5 pt-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10">
                                        <User className="w-5 h-5 text-purple-300" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium text-sm font-outfit">
                                                {maskNickname(review.nickname)}
                                            </p>
                                            {/* Verified Badge (optional) */}
                                            {review.rating >= 4 && (
                                                <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Spacer for centering last item */}
                    <div className="w-4 md:w-[calc(50vw-180px)] flex-shrink-0" />
                </div>
            </div>
        </section>
    );
}
