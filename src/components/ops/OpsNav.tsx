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
        label: '운영 홈',
        description: '전체 상황 보기',
        Icon: LayoutDashboard,
    },
    {
        key: 'growth',
        href: '/ops/growth',
        label: '사용자 흐름',
        description: '결과부터 결제까지',
        Icon: Sparkles,
    },
    {
        key: 'reviews',
        href: '/ops/reviews',
        label: '후기 관리',
        description: '후기 승인 / 숨기기',
        Icon: MessageSquareQuote,
    },
    {
        key: 'payments',
        href: '/ops/payments',
        label: '결제 상태',
        description: '결제 / 구독 확인',
        Icon: CreditCard,
    },
    {
        key: 'readings',
        href: '/ops/readings',
        label: '리딩 확인',
        description: '소유 / 유료 상태',
        Icon: LifeBuoy,
    },
    {
        key: 'trust',
        href: '/ops/trust',
        label: '오류 / 경고',
        description: '문제 모아보기',
        Icon: ShieldAlert,
    },
    {
        key: 'advisors',
        href: '/ops/advisors',
        label: '가이드 추천',
        description: '어떤 추천이 잘 맞는지',
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
