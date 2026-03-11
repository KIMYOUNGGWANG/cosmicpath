import Image from 'next/image';
import Link from 'next/link';

import type { BlogCategory } from '@/lib/blog';

interface BlogCardProps {
    post: {
        slug: string;
        title: string;
        description: string;
        category: BlogCategory;
        date: string;
        readTime: number;
        ogImage: string;
    };
}

const CATEGORY_LABELS: Record<BlogCategory, string> = {
    saju: 'Saju',
    astrology: 'Astrology',
    match: 'Match',
    guide: 'Guide',
};

export function BlogCard({ post }: BlogCardProps) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37]/30 hover:bg-white/[0.06]"
        >
            <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
                <Image
                    src={post.ogImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-[#05070f]/20 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full border border-[#D4AF37]/30 bg-[#0b1020]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A] backdrop-blur-sm">
                    {CATEGORY_LABELS[post.category]}
                </div>
                <div className="absolute bottom-5 left-5 text-xs text-white/70">
                    {post.date} · {post.readTime} min read
                </div>
            </div>

            <div className="space-y-4 p-6">
                <h3 className="text-xl font-semibold leading-8 text-white transition-colors group-hover:text-[#F4D88A]">
                    {post.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-6 text-white/65">
                    {post.description}
                </p>
                <div className="text-sm font-medium text-[#D4AF37]">
                    Read article →
                </div>
            </div>
        </Link>
    );
}
