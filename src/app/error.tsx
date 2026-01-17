'use client';

import { useEffect } from 'react';
import { RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an efficient error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience - Red for Error */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-lg">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 font-cinzel">
                    Cosmic Disturbance
                </h1>

                <div className="space-y-4">
                    <h2 className="text-xl text-red-400/90 font-medium">
                        시스템 오류가 감지되었습니다.
                    </h2>
                    <p className="text-white/60 leading-relaxed font-light text-sm">
                        우주적 신호를 처리하는 도중 예상치 못한 교란이 발생했습니다.
                        <br />
                        잠시 후 다시 시도해주시기 바랍니다.
                    </p>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 font-mono text-left overflow-hidden">
                        <p>Error Code: {error.digest || 'UNKNOWN_ANOMALY'}</p>
                    </div>
                </div>

                <div className="pt-8 flex justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-white/90 rounded-full transition-all duration-300 font-bold"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>시스템 재가동</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
