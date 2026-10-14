import { formatPostDate, getAllPosts } from '@/lib/blog';
import Link from 'next/link';

const RELATED_COUNT = 3;

/** Same-category posts first, then the rest by recency, so every post links to siblings. */
export const RelatedPosts = ({ slug, category }: { slug: string; category: string }) => {
  const others = getAllPosts().filter((post) => post.slug !== slug);
  const related = [
    ...others.filter((post) => post.category === category),
    ...others.filter((post) => post.category !== category),
  ].slice(0, RELATED_COUNT);

  if (related.length === 0) return null;

  return (
    <aside aria-labelledby="related-posts" className="mt-16 border-t border-gray-200 pt-10">
      <h2
        id="related-posts"
        className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#06005A]"
      >
        Keep reading
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {related.map((post) => (
          <li key={post.slug} className="rounded-2xl border border-gray-200 p-4 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {post.category}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-2 block text-sm font-bold leading-snug text-[#06005A] hover:text-[#C46B10]"
            >
              {post.title}
            </Link>
            <p className="mt-2 text-xs text-gray-500">{formatPostDate(post.publishedAt)}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
};
