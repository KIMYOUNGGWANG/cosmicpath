import type { PaywallLockedSection, PaywallVisualItem } from './payment-modal-copy';

interface PaymentModalLockedSectionsProps {
    readonly isEnglish: boolean;
    readonly items: readonly PaywallLockedSection[];
}

interface PaymentModalBenefitsProps {
    readonly items: readonly PaywallVisualItem[];
}

export function PaymentModalLockedSections({ isEnglish, items }: PaymentModalLockedSectionsProps) {
    return (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-acc-gold">
                {isEnglish ? 'Locked Sections Inside' : '잠긴 프리미엄 섹션 목록'}
            </p>
            <ul className="space-y-2.5 text-sm text-white/75">
                {items.map(({ label, Icon, tone }) => (
                    <li key={label} className="flex items-center gap-2">
                        <Icon
                            size={14}
                            className={`${tone === 'red' ? 'text-red-400/70' : 'text-acc-gold/70'} flex-shrink-0`}
                        />
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function PaymentModalBenefits({ items }: PaymentModalBenefitsProps) {
    return (
        <div className="mb-6 space-y-3">
            {items.map(({ title, description, Icon }) => (
                <div
                    key={title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/15 hover:bg-white/[0.045]"
                >
                    <div className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-acc-gold/20 bg-acc-gold/10 text-acc-gold">
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/50">{description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
