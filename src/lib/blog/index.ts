import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

export const BLOG_CATEGORIES = ['saju', 'astrology', 'match', 'guide'] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPostFrontmatter {
    title: string;
    description: string;
    date: string;
    category: BlogCategory;
    keywords: string[];
    ogImage?: string;
    readTime?: number;
}

export interface BlogPost extends BlogPostFrontmatter {
    slug: string;
    content: string;
    excerpt: string;
    readTime: number;
    ogImage: string;
}

const BLOG_DIRECTORY = path.join(process.cwd(), 'content/blog');
const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n?/;

function stripWrappingQuotes(value: string): string {
    return value.replace(/^['"]|['"]$/g, '').trim();
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseFrontmatter(source: string): { data: BlogPostFrontmatter; content: string } {
    const match = FRONTMATTER_PATTERN.exec(source);
    if (!match) {
        throw new Error('Missing frontmatter block.');
    }

    const rawFrontmatter = match[1];
    const content = source.slice(match[0].length).trim();
    const frontmatter: Partial<BlogPostFrontmatter> = {};

    for (const line of rawFrontmatter.split('\n')) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const separatorIndex = trimmedLine.indexOf(':');
        if (separatorIndex === -1) continue;

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

        switch (key) {
            case 'title':
            case 'description':
            case 'date':
            case 'ogImage':
                frontmatter[key] = stripWrappingQuotes(rawValue);
                break;
            case 'category': {
                const category = stripWrappingQuotes(rawValue) as BlogCategory;
                if (!BLOG_CATEGORIES.includes(category)) {
                    throw new Error(`Invalid blog category: ${category}`);
                }
                frontmatter.category = category;
                break;
            }
            case 'keywords': {
                const keywords = JSON.parse(rawValue) as string[];
                frontmatter.keywords = keywords.map((keyword) => String(keyword).trim()).filter(Boolean);
                break;
            }
            case 'readTime':
                frontmatter.readTime = Number.parseInt(rawValue, 10);
                break;
            default:
                break;
        }
    }

    if (
        !frontmatter.title ||
        !frontmatter.description ||
        !frontmatter.date ||
        !frontmatter.category ||
        !frontmatter.keywords
    ) {
        throw new Error('Frontmatter is missing required blog fields.');
    }

    return {
        data: {
            title: frontmatter.title,
            description: frontmatter.description,
            date: frontmatter.date,
            category: frontmatter.category,
            keywords: frontmatter.keywords,
            ogImage: frontmatter.ogImage,
            readTime: frontmatter.readTime,
        },
        content,
    };
}

function stripMarkdown(markdown: string): string {
    return markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/^[-*]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

function estimateReadTime(content: string): number {
    const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
    return Math.max(4, Math.ceil(words / 180));
}

function getExcerpt(content: string): string {
    const blocks = content.split(/\n\s*\n/);
    for (const block of blocks) {
        const plainText = stripMarkdown(block);
        if (plainText.length >= 80) {
            return plainText.slice(0, 180).trim();
        }
    }

    return stripMarkdown(content).slice(0, 180).trim();
}

function renderInlineMarkdown(text: string): string {
    const escaped = escapeHtml(text);

    return escaped
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
            const safeUrl = escapeHtml(url);
            return `<a href="${safeUrl}" class="text-[#D4AF37] underline decoration-[#D4AF37]/40 underline-offset-4 transition-colors hover:text-white">${label}</a>`;
        })
        .replace(/`([^`]+)`/g, '<code class="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.95em] text-[#F4D88A]">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderMarkdownToHtml(markdown: string): string {
    const lines = markdown.replace(/\r/g, '').split('\n');
    const html: string[] = [];
    let index = 0;

    while (index < lines.length) {
        const currentLine = lines[index];
        const trimmedLine = currentLine.trim();

        if (!trimmedLine) {
            index += 1;
            continue;
        }

        if (trimmedLine.startsWith('```')) {
            const language = trimmedLine.slice(3).trim();
            const codeLines: string[] = [];
            index += 1;

            while (index < lines.length && !lines[index].trim().startsWith('```')) {
                codeLines.push(lines[index]);
                index += 1;
            }

            html.push(
                `<pre class="overflow-x-auto rounded-2xl border border-white/10 bg-[#04060d] p-4 text-sm text-[#E4D39E]"><code class="language-${escapeHtml(language || 'plain')}">${escapeHtml(codeLines.join('\n'))}</code></pre>`
            );
            index += 1;
            continue;
        }

        const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmedLine);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = renderInlineMarkdown(headingMatch[2]);
            const className =
                level <= 2
                    ? 'mt-12 text-2xl font-semibold text-white'
                    : 'mt-8 text-xl font-semibold text-white/95';
            html.push(`<h${level} class="${className}">${text}</h${level}>`);
            index += 1;
            continue;
        }

        if (/^>\s?/.test(trimmedLine)) {
            const quoteLines: string[] = [];
            while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
                quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
                index += 1;
            }
            html.push(
                `<blockquote class="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5 py-4 text-base leading-7 text-white/80">${renderInlineMarkdown(quoteLines.join(' '))}</blockquote>`
            );
            continue;
        }

        if (/^[-*]\s+/.test(trimmedLine)) {
            const items: string[] = [];
            while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
                index += 1;
            }
            html.push(
                `<ul class="space-y-3 pl-6 text-base leading-7 text-white/80">${items
                    .map((item) => `<li class="list-disc marker:text-[#D4AF37]">${renderInlineMarkdown(item)}</li>`)
                    .join('')}</ul>`
            );
            continue;
        }

        if (/^\d+\.\s+/.test(trimmedLine)) {
            const items: string[] = [];
            while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
                items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
                index += 1;
            }
            html.push(
                `<ol class="space-y-3 pl-6 text-base leading-7 text-white/80">${items
                    .map((item) => `<li class="list-decimal marker:text-[#D4AF37]">${renderInlineMarkdown(item)}</li>`)
                    .join('')}</ol>`
            );
            continue;
        }

        const paragraphLines = [trimmedLine];
        index += 1;

        while (
            index < lines.length &&
            lines[index].trim() &&
            !/^(#{1,6})\s+/.test(lines[index].trim()) &&
            !/^>\s?/.test(lines[index].trim()) &&
            !/^[-*]\s+/.test(lines[index].trim()) &&
            !/^\d+\.\s+/.test(lines[index].trim()) &&
            !lines[index].trim().startsWith('```')
        ) {
            paragraphLines.push(lines[index].trim());
            index += 1;
        }

        html.push(
            `<p class="text-base leading-8 text-white/78">${renderInlineMarkdown(paragraphLines.join(' '))}</p>`
        );
    }

    return html.join('\n');
}

function readBlogFile(fileName: string): BlogPost {
    const source = fs.readFileSync(path.join(BLOG_DIRECTORY, fileName), 'utf8');
    const slug = fileName.replace(/\.mdx$/, '');
    const { data, content } = parseFrontmatter(source);

    return {
        ...data,
        slug,
        content,
        excerpt: getExcerpt(content),
        readTime: data.readTime ?? estimateReadTime(content),
        ogImage: data.ogImage ?? '/og-image.png',
    };
}

export function getAllPosts(): BlogPost[] {
    if (!fs.existsSync(BLOG_DIRECTORY)) {
        return [];
    }

    return fs
        .readdirSync(BLOG_DIRECTORY)
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map(readBlogFile)
        .sort((left, right) => right.date.localeCompare(left.date));
}

export function getPostBySlug(slug: string): BlogPost | null {
    const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
        return null;
    }

    return readBlogFile(`${slug}.mdx`);
}

export function getPostsByCategory(category: string): BlogPost[] {
    if (!BLOG_CATEGORIES.includes(category as BlogCategory)) {
        return [];
    }

    return getAllPosts().filter((post) => post.category === category);
}

export function getAllPostSlugs(): string[] {
    return getAllPosts().map((post) => post.slug);
}

export function formatBlogDate(date: string, locale: string = 'ko-KR'): string {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function renderBlogPostHtml(content: string): string {
    return renderMarkdownToHtml(content);
}
