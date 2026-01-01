'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface CTAButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function CTAButton({ children, onClick, className = '' }: CTAButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // Magnetic Effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((e.clientX - centerX) * 0.2); // 20% tracking
        y.set((e.clientY - centerY) * 0.2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`
        relative px-12 py-5 rounded-[4px] font-bold text-lg tracking-wide overflow-hidden
        bg-gradient-to-br from-[#D4AF37] via-[#C4941F] to-[#B8860B]
        text-[#050505] shadow-[0_8px_32px_rgba(212,175,55,0.2)]
        transition-shadow duration-300 hover:shadow-[0_12px_48px_rgba(212,175,55,0.4)]
        ${className}
      `}
        >
            <span className="relative z-10">{children}</span>
            {/* Shine effect */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
        </motion.button>
    );
}
