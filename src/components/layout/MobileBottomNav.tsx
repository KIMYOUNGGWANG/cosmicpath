"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calendar,
    Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/my", icon: Sparkles, label: "Hub" },
    { href: "/relationship/contact-timing", icon: Calendar, label: "Next" },
] as const;

/** Routes where the mobile bottom nav should be visible */
const VISIBLE_ROUTES = ["/my", "/start", "/orders", "/relationship"];

export default function MobileBottomNav() {
    const pathname = usePathname();

    const shouldShow = VISIBLE_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!shouldShow) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden items-center justify-around border-t border-white/[0.08] bg-[#050505]/95 px-2 pb-safe pt-3 backdrop-blur-lg">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                            isActive
                                ? "text-[#D4AF37]"
                                : "text-white/50 hover:text-white"
                        }`}
                    >
                        <Icon size={20} />
                        <span
                            className={`text-[10px] uppercase tracking-[0.1em] ${
                                isActive ? "font-semibold" : "font-medium"
                            }`}
                        >
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
