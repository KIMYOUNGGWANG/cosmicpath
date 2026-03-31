"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { create } from "zustand";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

import { AuthEntryCard } from "@/components/auth/AuthEntryCard";

interface LoginModalStore {
    isOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

export const useLoginModal = create<LoginModalStore>((set) => ({
    isOpen: false,
    openLoginModal: () => set({ isOpen: true }),
    closeLoginModal: () => set({ isOpen: false }),
}));

export function LoginModal() {
    const { isOpen, closeLoginModal } = useLoginModal();
    useBodyScrollLock(isOpen);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLoginModal}
                        data-lenis-prevent
                        className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        data-lenis-prevent
                        className="fixed left-1/2 top-1/2 z-[10000] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
                    >
                        <div className="relative">
                            <button
                                onClick={closeLoginModal}
                                className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2 text-white/50 transition-colors hover:text-white"
                                aria-label="로그인 모달 닫기"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <AuthEntryCard />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
