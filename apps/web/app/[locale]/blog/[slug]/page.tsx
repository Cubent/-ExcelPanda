import { faqToPlainText } from '@/components/blog/faq-list';
import { RelatedPosts } from '@/components/blog/related-posts';
import { TableOfContents } from '@/components/blog/table-of-contents';
import {
  SITE_URL,
  formatPostDate,
  getAllPosts,
  getPostBySlug,
  BLOG_INDEXABLE,
} from '@/lib/blog';
import { JsonLd } from '@repo/seo/json-ld';
import type {
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  WithContext,
} from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';

type BlogPostPageProperties = {
  readonly params: Promise<{ slug: string }>;
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> =>
  getAllPosts().map((post) => ({ slug: post.slug }));

export const generateMetadata = async ({
  params,
}: BlogPostPageProperties): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    noSuffix: true,
    keywords: post.keywords,
    robots: BLOG_INDEXABLE ? undefined : { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
    },
  });
};

const BlogPostPage = async ({ params }: BlogPostPageProperties) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  const article: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: [`${SITE_URL}/og-image.png`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ExcelPanda',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.keywords.join(', '),
  };

  const breadcrumbs: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  const faqPage: WithContext<FAQPage> | null = post.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faqToPlainText(faq.answer) },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      <JsonLd code={article} />
      {faqPage && <JsonLd code={faqPage} />}
      <JsonLd code={breadcrumbs} />
      <SiteHeader />
      <main>
        {/* overflow-x-clip (not hidden): ComparisonTable's full-bleed w-screen trick overflows
            by a scrollbar's width on desktop; clip contains that without turning this into a
            scroll container, which would break position:sticky on anything nested inside. */}
        <article className="overflow-x-clip">
          <header className="relative isolate overflow-hidden bg-[#000C3F]">
            <Image
              src={post.heroImage ?? '/MedPrep (1).png'}
              alt=""
              fill
              priority
              quality={70}
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-b from-[#000C3F]/75 via-[#000C3F]/55 to-[#000C3F]/85"
            />
            <div className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
              <nav aria-label="Breadcrumb" className="text-xs text-white/60">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link href="/" className="hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ol>
              </nav>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF8A5B]">
                {post.category}
              </p>
              <h1 className="font-[family-name:var(--font-display)] mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-white/80">
                {post.description}
              </p>
              <p className="mt-6 text-sm text-white/70">
                By{' '}
                <a
                  href={post.author.url}
                  className="font-medium text-white hover:underline"
                >
                  {post.author.name}
                </a>
                {' · '}
                Published{' '}
                <time dateTime={post.publishedAt}>
                  {formatPostDate(post.publishedAt)}
                </time>
                {post.updatedAt !== post.publishedAt && (
                  <>
                    {' · '}
                    Updated{' '}
                    <time dateTime={post.updatedAt}>
                      {formatPostDate(post.updatedAt)}
                    </time>
                  </>
                )}
                {' · '}
                {post.readingMinutes} min read
              </p>
              {post.reviewer && (
                <p className="mt-1 text-sm text-white/70">
                  Medically reviewed by{' '}
                  <span className="font-medium text-white">
                    {post.reviewer.name}
                  </span>
                  , {post.reviewer.credentials}
                </p>
              )}
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
            <TableOfContents sections={post.sections} />

            <div className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:font-bold prose-headings:text-[#1F4D3A] prose-h2:mt-14 prose-h2:scroll-mt-24 prose-h3:mt-8 prose-h3:scroll-mt-24 prose-a:font-medium prose-a:text-[#FF8A5B] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#000C3F] prose-li:my-1.5">
              <post.Body />
            </div>

            <RelatedPosts slug={post.slug} category={post.category} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogPostPage;
