'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { InputBirthdate } from './InputBirthdate';
import { CTAButton } from '../ui/CTAButton';

interface HeroSectionProps {
    onStart: (birthDate: string) => void;
    language: 'ko' | 'en';
}

export function HeroSection({ onStart, language }: HeroSectionProps) {
    const [birthDate, setBirthDate] = useState('');

    const content = {
        ko: {
            headline: "당신의 2025년은 이미 쓰여져 있다",
            subheadline: "별의 움직임이 말해주는 당신의 운명",
            label: "생년월일 입력",
            cta: "무료로 확인하기"
        },
        en: {
            headline: "Your 2025 is already written",
            subheadline: "The movement of the stars tells your destiny",
            label: "Enter Birthdate",
            cta: "Check for Free"
        }
    };

    const t = content[language];

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto mb-16"
            >
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
                    {t.headline}
                </h1>
                <p className="text-fg-secondary text-lg md:text-xl font-light tracking-wide opacity-80 backdrop-blur-sm">
                    {t.subheadline}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm space-y-12"
            >
                <InputBirthdate label={t.label} onDateSelect={setBirthDate} />

                <CTAButton
                    className="w-full"
                    onClick={() => birthDate && onStart(birthDate)}
                >
                    {t.cta}
                </CTAButton>
            </motion.div>
        </section>
    );
}
