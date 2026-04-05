import Link from 'next/link';
import {
    CreditCard,
    LayoutDashboard,
    LifeBuoy,
    MessageSquareQuote,
    ShieldAlert,
    Sparkles,
    WandSparkles,
} from 'lucide-react';

type OpsNavKey = 'hub' | 'growth' | 'reviews' | 'payments' | 'readings' | 'trust' | 'advisors';

interface OpsNavProps {
    active: OpsNavKey;
}

const NAV_ITEMS = [
    {
        key: 'hub',
        href: '/ops',
        label: 'Ops Hub',
        description: '전체 운영 허브',
        Icon: LayoutDashboard,
    },
    {
        key: 'growth',
        href: '/ops/growth',
        label: 'Growth Ops',
        description: '코어 루프 지표',
        Icon: Sparkles,
    },
    {
        key: 'reviews',
        href: '/ops/reviews',
        label: 'Review Ops',
        description: '후기 검수 / 승인',
        Icon: MessageSquareQuote,
    },
    {
        key: 'payments',
        href: '/ops/payments',
        label: 'Payment Ops',
        description: '결제 / 구독 / recovery',
        Icon: CreditCard,
    },
    {
        key: 'readings',
        href: '/ops/readings',
        label: 'Reading Support',
        description: 'owner / premium / credits',
        Icon: LifeBuoy,
    },
    {
        key: 'trust',
        href: '/ops/trust',
        label: 'Trust Ops',
        description: 'alert / job / incident',
        Icon: ShieldAlert,
    },
    {
        key: 'advisors',
        href: '/ops/advisors',
        label: 'Advisor Ops',
        description: 'intent / advisor / routing',
        Icon: WandSparkles,
    },
] as const;

export function OpsNav({ active }: OpsNavProps) {
    return (
        <nav className="mb-8 flex flex-wrap gap-3">
            {NAV_ITEMS.map(({ key, href, label, description, Icon }) => {
                const isActive = active === key;

                return (
                    <Link
                        key={key}
                        href={href}
                        className={`group inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 ${
                            isActive
                                ? 'border-[hsl(42_79%_74%/0.34)] bg-[hsl(42_79%_74%/0.12)] text-white'
                                : 'border-white/10 bg-white/[0.04] text-white/72 hover:border-white/18 hover:bg-white/[0.07]'
                        }`}
                    >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            isActive
                                ? 'border-[hsl(42_79%_74%/0.32)] bg-[hsl(42_79%_74%/0.12)] text-[hsl(42_79%_74%)]'
                                : 'border-white/10 bg-black/15 text-white/62'
                        }`}>
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="block font-medium text-white">{label}</span>
                            <span className="block text-[11px] text-white/48">{description}</span>
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
