import { SITE_URL, formatPostDate, getAllPosts } from '@/lib/blog';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

export const metadata: Metadata = createMetadata({
  title: 'USMLE Study Guides and Question Bank Reviews',
  description:
    'Guides for USMLE Step 1, Step 2 CK and Step 3 preparation, including question bank comparisons, study strategy and how to use spaced repetition.',
  path: '/blog',
  keywords: ['USMLE study guides', 'USMLE question bank comparison', 'USMLE preparation blog'],
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { 'application/rss+xml': `${SITE_URL}/blog/feed.xml` },
  },
});

const BlogIndexPage = () => {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A5B]">Blog</p>
        <h1 className="font-[family-name:var(--font-display)] mt-3 text-3xl font-bold tracking-tight text-[#1F4D3A] sm:text-4xl">
          USMLE study guides and question bank reviews
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Practical Excel guides from the team behind ExcelPanda.
        </p>

        <div className="mt-12 flex flex-col gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-gray-200 p-6 transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {post.category}
              </p>
              <h2 className="font-[family-name:var(--font-display)] mt-2 text-xl font-bold text-[#1F4D3A]">
                <Link href={`/blog/${post.slug}`} className="hover:text-[#FF8A5B]">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{post.description}</p>
              <p className="mt-4 text-xs text-gray-500">
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                {' · '}
                {post.readingMinutes} min read
              </p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogIndexPage;
