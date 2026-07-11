'use client';

import type { LucideIcon } from 'lucide-react';

export function formatPercent(value: number) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export function formatCompact(value: number) {
    return new Intl.NumberFormat('ko-KR', {
        notation: 'compact',
        maximumFractionDigits: value >= 1000 ? 1 : 0,
    }).format(value);
}

export function formatUsdFromCents(cents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100);
}

export function formatWindowLabel(from: string, to: string) {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });

    return `${formatter.format(new Date(from))} - ${formatter.format(new Date(to))}`;
}

export function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export function OpsMetricCard({
    label,
    value,
    caption,
    icon: Icon,
    iconClassName,
    surfaceClassName,
}: {
    label: string;
    value: string;
    caption: string;
    icon: LucideIcon;
    iconClassName: string;
    surfaceClassName: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-[30px] border border-white/10 p-6 shadow-[0_22px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl ${surfaceClassName}`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(42_79%_74%)]">
                        Signal
                    </p>
                    <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.24em] text-white/54">
                        {label}
                    </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-black/15 ${iconClassName}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-8">
                <p className="font-[var(--font-outfit)] text-[38px] font-semibold tracking-[-0.06em] text-white sm:text-[42px]">
                    {value}
                </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                <p className="text-sm leading-7 text-white/62">{caption}</p>
            </div>
        </div>
    );
}

export function OpsSignalChip({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
            <span className="text-white/44">{label}</span>
            <strong className="ml-2 font-medium text-white">{value}</strong>
        </div>
    );
}

export function OpsInsightRow({
    label,
    value,
    caption,
}: {
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/70">{label}</span>
                <strong className="text-sm text-white">{value}</strong>
            </div>
            <p className="mt-2 text-xs leading-6 text-white/45">{caption}</p>
        </div>
    );
}

export function OpsEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[hsl(42_79%_74%)]">
                <span className="text-lg">+</span>
            </div>
            <h3 className="mt-5 font-[var(--font-outfit)] text-2xl font-semibold tracking-[-0.04em] text-white">
                {title}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
                {description}
            </p>
        </div>
    );
}
