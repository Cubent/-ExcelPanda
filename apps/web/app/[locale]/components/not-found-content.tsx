import Link from 'next/link';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

const popularPages = [
  { label: 'Step 1 Qbank', href: '/usmle-step-1-question-bank' },
  { label: 'Step 2 CK Qbank', href: '/usmle-step-2-question-bank' },
  { label: 'Step 3 Qbank', href: '/usmle-step-3-question-bank' },
  { label: 'ABIM Qbank', href: '/abim-internal-medicine-question-bank' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
];

/** The 404 page: site header, a short message with a few ways back, and the site footer. */
export const NotFoundContent = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />

    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Error 404</p>

      <p
        aria-hidden
        className="font-[family-name:var(--font-display)] mt-4 text-8xl font-bold leading-none tracking-tight text-[#1F4D3A] sm:text-9xl"
      >
        4<span className="text-[#FF8A5B]">0</span>4
      </p>

      <h1 className="font-[family-name:var(--font-display)] mt-8 text-3xl font-bold tracking-tight text-black sm:text-4xl">
        This page could not be found.
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-600">
        The link may be broken, or the page may have moved. Head back home, or pick up where you
        left off.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#FF8A5B] px-8 text-base font-semibold text-white transition-colors hover:bg-[#a95a0d] sm:w-auto"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#1F4D3A] px-8 text-base font-semibold text-[#1F4D3A] transition-colors hover:bg-[#1F4D3A] hover:text-white sm:w-auto"
        >
          Contact support
        </Link>
      </div>

      <div className="mt-14 w-full border-t border-gray-200 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Popular pages
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {popularPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#1F4D3A] hover:text-[#1F4D3A]"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
);
