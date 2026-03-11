import type { Metadata } from 'next';

import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
    title: 'CosmicPath Blog | AI 사주, 신살, 궁합 가이드',
    description:
        'AI 사주 해석, 신살 설명, 궁합 분석 가이드를 한곳에서 읽어보세요. CosmicPath 블로그는 검색 친화적인 운명 콘텐츠 허브입니다.',
    openGraph: {
        title: 'CosmicPath Blog',
        description:
            'AI 사주, 신살, 궁합 가이드를 모아둔 CosmicPath의 SEO 콘텐츠 허브.',
        images: ['/og-image.png'],
    },
};

export const dynamic = 'force-static';

export default function BlogPage() {
    const posts = getAllPosts().map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        date: post.date,
        readTime: post.readTime,
        ogImage: post.ogImage,
    }));

    return (
        <main className="min-h-screen bg-[#04060d] pb-24 pt-28 text-white">
            <section className="px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_36%),linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                        <div className="max-w-3xl space-y-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Organic Growth Engine
                            </p>
                            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
                                검색으로 들어와서,
                                <br />
                                결과까지 이어지는 CosmicPath Blog
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                                AI 사주, 신살, 궁합, 운세 해석을 검색 친화적인 글로 정리했습니다.
                                정보를 읽고 끝나는 블로그가 아니라, 바로 무료 분석까지 이어지는 퍼널의 첫 진입점입니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    <BlogIndexClient posts={posts} />
                </div>
            </section>

            <section className="px-6">
                <div className="mx-auto max-w-7xl">
                    <BlogCTA />
                </div>
            </section>
        </main>
    );
}
