"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X, MessageCircle } from "lucide-react"; // MessageCircle as Kakao icon proxy
import { create } from "zustand";

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
                        className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 z-[10000] shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-cinzel text-[#D4AF37]">
                                Connect CosmicPath
                            </h2>
                            <button
                                onClick={closeLoginModal}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-white/60 text-sm mb-8 font-outfit leading-relaxed">
                            Sign in to save your readings, track your destiny, and unlock seamless cross-device access.
                        </p>

                        <div className="space-y-3">
                            {/* Kakao Login */}
                            <button
                                onClick={() => signIn("kakao")}
                                className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5 fill-current" />
                                <span>Continue with Kakao</span>
                            </button>

                            {/* Google Login */}
                            <button
                                onClick={() => signIn("google")}
                                className="w-full h-12 bg-white hover:bg-gray-100 text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>

                        <p className="mt-6 text-center text-xs text-white/30 font-outfit">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
