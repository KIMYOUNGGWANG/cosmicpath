'use client';

interface HistoryBackButtonProps {
    label: string;
}

export function HistoryBackButton({ label }: HistoryBackButtonProps) {
    return (
        <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-cinzel uppercase tracking-widest text-white/50 transition-all hover:text-white"
        >
            <span className="transition-transform hover:-translate-x-1">←</span>
            {label}
        </button>
    );
}
