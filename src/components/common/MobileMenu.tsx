'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Search, Sparkles, Heart, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface MenuItem {
    type: 'button' | 'link';
    icon: LucideIcon;
    iconColorClass?: string;
    label: string;
    subLabel?: string;
    href?: string;
    onClick?: () => void;
}

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
}

export function MobileMenu({ isOpen, onClose, menuItems }: MobileMenuProps) {
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-[280px] bg-[#0f0f15] border-l border-white/10 shadow-2xl z-[9999] md:hidden flex flex-col"
                    >
                        {/* Menu Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <span className="font-cinzel font-bold text-lg text-white">MENU</span>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 py-8 px-6 flex flex-col gap-6">
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const colorClass = item.iconColorClass || 'group-hover:bg-purple-500/20 group-hover:text-purple-300';

                                const content = (
                                    <>
                                        <div className={`p-3 rounded-xl bg-white/5 text-gray-400 transition-colors ${colorClass}`}>
                                            <IconComponent size={20} />
                                        </div>
                                        <div>
                                            <div className="text-base font-medium text-white group-hover:text-white/80 transition-colors">
                                                {item.label}
                                            </div>
                                            {item.subLabel && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {item.subLabel}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );

                                if (item.type === 'button' && item.onClick) {
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                item.onClick?.();
                                                onClose();
                                            }}
                                            className="flex items-center gap-4 text-left group"
                                        >
                                            {content}
                                        </button>
                                    );
                                }

                                if (item.type === 'link' && item.href) {
                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className="flex items-center gap-4 text-left group"
                                            onClick={onClose}
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return null;
                            })}
                        </div>

                        {/* Menu Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <p className="text-[10px] text-gray-600 text-center font-cinzel">
                                © 2026 COSMIC PATH
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
