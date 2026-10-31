import { posts } from '@/content/blog';
import type { BlogPost } from '@/content/blog/types';

export const SITE_URL = 'https://www.excelpanda.com';

export const getAllPosts = (): BlogPost[] =>
  [...posts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  posts.find((post) => post.slug === slug);

export const formatPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
