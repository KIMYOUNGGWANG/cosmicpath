'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PaymentModalFrameProps {
    readonly isOpen: boolean;
    readonly children: ReactNode;
    readonly onClose: () => void;
}

const modalSpring = {
    type: 'spring',
    stiffness: 260,
    damping: 24,
} as const;

export function PaymentModalFrame({ isOpen, children, onClose }: PaymentModalFrameProps) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    data-lenis-prevent
                    className="fixed inset-0 z-[10010] overflow-y-auto overscroll-contain touch-pan-y bg-black/82 backdrop-blur-md"
                    onClick={onClose}
                >
                    <div className="flex min-h-[100dvh] items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-6 md:pb-8 md:pt-8">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={modalSpring}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Decision Note payment"
                            data-lenis-prevent
                            className="relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] w-full max-w-xl min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#f0d487]/12 bg-[#0b0d18] shadow-[0_28px_80px_rgba(0,0,0,0.58)] md:max-h-[calc(100dvh-4rem)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,216,138,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%)]" />
                            <motion.button
                                aria-label="Close payment modal"
                                onClick={onClose}
                                whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.12)' }}
                                whileTap={{ scale: 0.97 }}
                                className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70 md:right-6 md:top-6"
                            >
                                <X size={20} className="text-white/40" />
                            </motion.button>
                            <div data-lenis-prevent className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 pb-6 pt-14 sm:px-6 md:px-10 md:pb-10 md:pt-10">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
