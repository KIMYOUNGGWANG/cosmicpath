'use client';

import { motion } from 'framer-motion';

interface TrustSectionProps {
    language: 'ko' | 'en';
}

export function TrustSection({ language }: TrustSectionProps) {
    const content = {
        ko: {
            title: "과학과 신비의 교차점",
            subtitle: "32만 건의 실제 데이터를 바탕으로 분석된 당신의 운명",
            cards: [
                {
                    title: "데이터 기반",
                    desc: "고대 서적과 현대 통계가 결합된 정밀 알고리즘",
                    icon: "📊"
                },
                {
                    title: "신뢰도 보장",
                    desc: "이미 5만 명 이상의 사용자가 자신의 삶을 점검했습니다",
                    icon: "⭐"
                },
                {
                    title: "완전한 익명성",
                    desc: "당신의 데이터는 리포트 생성 즉시 삭제됩니다",
                    icon: "🔒"
                }
            ]
        },
        en: {
            title: "Where Science Meets Mystery",
            subtitle: "Your destiny analyzed based on 320,000 real-world data points",
            cards: [
                {
                    title: "Data-Driven",
                    desc: "Precision algorithms combining ancient texts and modern stats",
                    icon: "📊"
                },
                {
                    title: "Proven Trust",
                    desc: "Over 50,000 users have already verified their paths",
                    icon: "⭐"
                },
                {
                    title: "Full Privacy",
                    desc: "Your data is deleted immediately after report generation",
                    icon: "🔒"
                }
            ]
        }
    };

    const t = content[language];

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-6 font-cinzel"
                >
                    {t.title}
                </motion.h2>
                <p className="text-fg-secondary text-lg font-light">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {t.cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 text-center hover:border-accent-gold/30 transition-colors"
                    >
                        <div className="text-4xl mb-6">{card.icon}</div>
                        <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                        <p className="text-fg-secondary text-sm leading-relaxed">
                            {card.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
