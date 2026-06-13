'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CTAButton } from '../ui/CTAButton';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import {
    PAID_DECISION_REPORT_NAME_EN,
    PAID_DECISION_REPORT_NAME_KO,
    READING_PRODUCT_PRICE_LABEL,
    THREE_LAYER_ROLE_EXPLANATION_EN,
    THREE_LAYER_ROLE_EXPLANATION_KO,
} from '@/lib/product-positioning';

interface PricingSectionProps {
    language: 'ko' | 'en';
    onSelect: () => void;
}

export function PricingSection({ language, onSelect }: PricingSectionProps) {
    const [priceLabel, setPriceLabel] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadPrice() {
            try {
                const response = await fetch(`/api/payment/price?productId=${READING_PRODUCT.productId}`, {
                    cache: 'no-store',
                });
                const payload = await response.json();

                if (
                    isMounted &&
                    response.ok &&
                    payload?.metadata?.fallback !== 'true' &&
                    typeof payload.formattedPrice === 'string'
                ) {
                    setPriceLabel(payload.formattedPrice);
                }
            } catch (error) {
                console.error('Failed to load reading price:', error);
            }
        }

        void loadPrice();

        return () => {
            isMounted = false;
        };
    }, []);

    const content = {
        ko: {
            title: PAID_DECISION_REPORT_NAME_KO,
            price: priceLabel || READING_PRODUCT_PRICE_LABEL,
            period: "일회성 결제",
            cta: "상세 3단 판정 리포트 열기",
            features: [
                THREE_LAYER_ROLE_EXPLANATION_KO,
                "질문과 생년월일 기반 판정 정밀도",
                "결정 요약, 타이밍, 다음 행동",
                "결제 후 계속 열람 가능한 디지털 리포트",
                "상황별 맞춤 액션 플랜"
            ],
            guarantee: "7일 이내 만족하지 못할 시 100% 환불"
        },
        en: {
            title: PAID_DECISION_REPORT_NAME_EN,
            price: priceLabel || READING_PRODUCT_PRICE_LABEL,
            period: "One-Time Payment",
            cta: "Unlock Detailed Report",
            features: [
                THREE_LAYER_ROLE_EXPLANATION_EN,
                "Question and birth-date calibrated precision",
                "Decision summary, timing, and next action",
                "Digital report access after checkout",
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
