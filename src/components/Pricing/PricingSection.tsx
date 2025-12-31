'use client';

import { motion } from 'framer-motion';
import { CTAButton } from '../ui/CTAButton';

interface PricingSectionProps {
    language: 'ko' | 'en';
    onSelect: () => void;
}

export function PricingSection({ language, onSelect }: PricingSectionProps) {
    const content = {
        ko: {
            title: "하나의 리포트, 모든 해답",
            price: "$4.99",
            period: "일회성 결제",
            cta: "지금 운명 확인하기",
            features: [
                "50페이지 분량의 초정밀 분석",
                "사주 + 점성술 + 타로 3원 통합",
                "2025년 월별 상세 가이드",
                "평생 소장용 PDF 제공",
                "개인별 맞춤 액션 플랜"
            ],
            guarantee: "7일 이내 만족하지 못할 시 100% 환불"
        },
        en: {
            title: "One Report, All Answers",
            price: "$4.99",
            period: "One-Time Payment",
            cta: "Unlock Your Destiny Now",
            features: [
                "Comprehensive 50-page analysis",
                "Saju + Astrology + Tarot integration",
                "Detailed 2025 monthly guide",
                "Lifetime access to PDF report",
                "Personalized action plan"
            ],
            guarantee: "100% Money-back within 7 days"
        }
    };

    const t = content[language];

    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative glass-card p-12 text-center border-accent-gold/50 shadow-[0_0_80px_rgba(212,175,55,0.1)]"
                >
                    {/* Best Value Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-gold text-bg-void px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        Best Value
                    </div>

                    <h2 className="text-3xl font-bold mb-8 font-cinzel">{t.title}</h2>

                    <div className="mb-10">
                        <span className="text-6xl font-black text-accent-gold">{t.price}</span>
                        <span className="text-fg-secondary ml-2 text-sm uppercase tracking-widest opacity-60">
                            / {t.period}
                        </span>
                    </div>

                    <ul className="text-left space-y-4 mb-12 max-w-xs mx-auto">
                        {t.features.map((feature, i) => (
                            <li key={i} className="flex items-center text-sm md:text-base">
                                <span className="text-accent-gold mr-3">✦</span>
                                <span className="text-fg-primary/80">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <CTAButton onClick={onSelect} className="w-full mb-6">
                        {t.cta}
                    </CTAButton>

                    <p className="text-[10px] text-fg-secondary uppercase tracking-[0.2em] opacity-40">
                        {t.guarantee}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
