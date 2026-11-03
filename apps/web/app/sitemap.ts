import { BLOG_INDEXABLE, getAllPosts } from '@/lib/blog';
import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.excelpanda.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const blogEntries: MetadataRoute.Sitemap = !BLOG_INDEXABLE ? [] : [
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  return [
    ...blogEntries,
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/sign-up`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
