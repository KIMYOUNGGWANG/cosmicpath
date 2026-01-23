'use client';

import React from 'react';

interface BirthDateInputProps {
    date: string;
    time: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
    buttonText?: string;
}

export function BirthDateInput({
    date,
    time,
    onDateChange,
    onTimeChange,
    onSubmit,
    isLoading = false,
    buttonText = "Reveal My Day"
}: BirthDateInputProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase tracking-wider text-starlight/50 mb-1">Birth Date</label>
                <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-starlight focus:border-acc-gold outline-none transition-colors"
                    disabled={isLoading}
                />
            </div>
            <div>
                <label className="block text-xs uppercase tracking-wider text-starlight/50 mb-1">Birth Time (Optional)</label>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-starlight focus:border-acc-gold outline-none transition-colors"
                    disabled={isLoading}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 bg-acc-gold text-bg-void font-bold rounded hover:bg-white transition-colors mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {buttonText}
            </button>
        </form>
    );
}
