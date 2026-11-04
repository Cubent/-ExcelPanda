import { BLOG_INDEXABLE, SITE_URL, formatPostDate, getAllPosts } from '@/lib/blog';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

export const metadata: Metadata = createMetadata({
  title: 'Excel Guides and Study Plans',
  description:
    'Practical Excel guides: certification prep, formula comparisons and step-by-step learning plans from the team behind ExcelPanda.',
  path: '/blog',
  keywords: ['Excel guides', 'learn Excel', 'Excel study plan', 'Excel tutorials'],
  robots: BLOG_INDEXABLE ? undefined : { index: false, follow: false },
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
          Excel guides and study plans
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
