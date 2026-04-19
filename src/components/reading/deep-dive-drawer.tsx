'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeepDiveDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function DeepDiveDrawer({ isOpen, onClose, title, children }: DeepDiveDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (offset.y > 150 || velocity.y > 300) {
                                onClose();
                            }
                        }}
                        className={cn(
                            "fixed inset-x-0 bottom-0 z-50 h-[85vh] md:h-[90vh]",
                            "bg-[#070708] border-t border-[#D4AF37]/20 rounded-t-3xl",
                            "flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                        )}
                    >
                        {/* Noise overlay for paper texture */}
                        <div
                            className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none z-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                            }}
                        />

                        {/* Drag Handle & Header */}
                        <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-4 px-6 border-b border-white/5 bg-gradient-to-b from-[#D4AF37]/5 to-transparent relative z-10">
                            <div className="w-12 h-1 bg-[#D4AF37]/40 rounded-full mb-4 cursor-grab active:cursor-grabbing" />
                            <h2 className="text-lg md:text-xl font-cinzel font-bold tracking-widest text-[#E8E8E8] text-center drop-shadow-md">
                                {title}
                            </h2>
                            <button 
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                aria-label="Close details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-8 md:px-8 custom-scrollbar relative z-10">
                            <div className="max-w-3xl mx-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
