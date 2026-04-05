import type { Metadata } from 'next';

import { BlogCTA } from '@/components/blog/BlogCTA';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';
import { StructuredData } from '@/components/seo/StructuredData';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
    title: 'CosmicPath Archive | 참고 글 모음',
    description:
        '메인 오라클 여정을 보조하는 CosmicPath 참고 글 모음입니다.',
    keywords: ['사주 블로그', '신살 뜻', '궁합 가이드', '운세 콘텐츠', 'AI 사주 해석', '타로 가이드'],
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'CosmicPath Archive | 참고 글 모음',
        description: '메인 오라클 여정을 보조하는 CosmicPath 참고 글 모음입니다.',
        url: 'https://cosmicpath.app/blog',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CosmicPath Archive | 참고 글 모음',
        description: '메인 오라클 여정을 보조하는 CosmicPath 참고 글 모음입니다.',
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
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'CosmicPath Archive',
        url: 'https://cosmicpath.app/blog',
        description: '오라클 리딩을 보조하는 CosmicPath 참고 글 모음.',
        inLanguage: 'ko-KR',
        hasPart: posts.slice(0, 10).map((post) => ({
            '@type': 'Article',
            headline: post.title,
            url: `https://cosmicpath.app/blog/${post.slug}`,
            datePublished: post.date,
            description: post.description,
        })),
    };

    return (
        <main className="min-h-screen bg-[#04060d] pb-24 pt-28 text-white">
            <StructuredData data={structuredData} />
            <section className="px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_36%),linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                        <div className="max-w-3xl space-y-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#F4D88A]">
                                Reference Archive
                            </p>
                            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
                                메인 오라클 여정을
                                <br />
                                보조하는 참고 글 모음
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                                사주, 신살, 운세 해석을 읽을 수 있는 아카이브입니다.
                                지금은 메인 유입면이 아니라 참고용 보조 surface로 유지합니다.
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
