'use client';

import { useMemo, useState } from 'react';

import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogCategory } from '@/lib/blog';

interface BlogIndexClientProps {
    posts: Array<{
        slug: string;
        title: string;
        description: string;
        category: BlogCategory;
        date: string;
        readTime: number;
        ogImage: string;
    }>;
}

const FILTER_OPTIONS: Array<{ value: 'all' | BlogCategory; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'guide', label: 'Guide' },
    { value: 'saju', label: 'Saju' },
    { value: 'astrology', label: 'Astrology' },
    { value: 'match', label: 'Match' },
];

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | BlogCategory>('all');

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'all') {
            return posts;
        }

        return posts.filter((post) => post.category === activeFilter);
    }, [activeFilter, posts]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
                {FILTER_OPTIONS.map((option) => {
                    const isActive = option.value === activeFilter;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setActiveFilter(option.value)}
                            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F4D88A]'
                                : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
                    선택한 카테고리에 해당하는 글이 아직 없습니다.
                </div>
            )}
        </div>
    );
}
