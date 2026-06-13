'use client';

type SegmentedChoiceProps = {
    readonly label: string;
    readonly leftLabel: string;
    readonly rightLabel: string;
    readonly isLeftSelected: boolean;
    readonly onLeftSelect: () => void;
    readonly onRightSelect: () => void;
};

export function SegmentedChoice({
    label,
    leftLabel,
    rightLabel,
    isLeftSelected,
    onLeftSelect,
    onRightSelect,
}: SegmentedChoiceProps) {
    return (
        <div>
            <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                {label}
            </label>
            <div className="mt-3 flex min-h-[48px] gap-2">
                <button
                    type="button"
                    onClick={onLeftSelect}
                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                        isLeftSelected
                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                    }`}
                >
                    {leftLabel}
                </button>
                <button
                    type="button"
                    onClick={onRightSelect}
                    className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                        !isLeftSelected
                            ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                            : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                    }`}
                >
                    {rightLabel}
                </button>
            </div>
        </div>
    );
}
