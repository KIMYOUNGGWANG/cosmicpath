import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCTA } from '@/components/blog/BlogCTA';
import {
    formatBlogDate,
    getAllPostSlugs,
    getAllPosts,
    getPostBySlug,
    renderBlogPostHtml,
} from '@/lib/blog';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
    return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found | CosmicPath',
        };
    }

    return {
        title: `${post.title} | CosmicPath Blog`,
        description: post.description,
        keywords: post.keywords,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            images: [post.ogImage],
            type: 'article',
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = getAllPosts()
        .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
        .slice(0, 3)
        .map((candidate) => ({
            slug: candidate.slug,
            title: candidate.title,
            description: candidate.description,
            category: candidate.category,
            date: candidate.date,
            readTime: candidate.readTime,
            ogImage: candidate.ogImage,
        }));

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        image: post.ogImage,
        keywords: post.keywords.join(', '),
        author: {
            '@type': 'Organization',
            name: 'CosmicPath',
        },
        publisher: {
            '@type': 'Organization',
            name: 'CosmicPath',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.cosmicpath.app/og-image.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.cosmicpath.app/blog/${post.slug}`,
        },
    };

    return (
        <main className="min-h-screen bg-[#04060d] pb-24 pt-28 text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />

            <section className="px-6">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/blog"
                        className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
                    >
                        ← Archive home
                    </Link>

                    <div className="mt-6 rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_38%),linear-gradient(145deg,#090c15,#101726)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] md:p-12">
                        <div className="space-y-5">
                            <div className="flex flex-wrap gap-3 text-sm text-white/70">
                                <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A]">
                                    {post.category}
                                </span>
                                <span>{formatBlogDate(post.date)}</span>
                                <span>{post.readTime} min read</span>
                            </div>

                            <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                                {post.title}
                            </h1>
                            <p className="max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                                {post.description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-12">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <article className="rounded-[32px] border border-white/10 bg-white/[0.03] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.25)] md:p-10">
                        <div
                            className="space-y-6"
                            dangerouslySetInnerHTML={{ __html: renderBlogPostHtml(post.content) }}
                        />
                    </article>

                    <aside className="space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                                Focus Keywords
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {post.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <BlogCTA compact />
                    </aside>
                </div>
            </section>

            {relatedPosts.length > 0 && (
                <section className="px-6">
                    <div className="mx-auto max-w-6xl space-y-6">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F4D88A]">
                                Related Reads
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                같은 주제의 글도 이어서 읽어보세요.
                            </h2>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {relatedPosts.map((relatedPost) => (
                                <BlogCard key={relatedPost.slug} post={relatedPost} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
