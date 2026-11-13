import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { SupportForm } from '../(app)/support/support-form';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

export const metadata: Metadata = createMetadata({
  title: 'Support',
  description: 'Get help with ExcelPanda. Report a bug, ask about billing, or share an idea.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1F4D3A]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#1F4D3A]/50">Support</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          We are here to <span className="rounded-2xl bg-[#C7F000] px-2">help</span>
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[#1F4D3A]/70">
          Stuck, found a bug or have an idea? Send us a message and the ExcelPanda team will get back to you by email.
        </p>
        <div className="mt-8">
          <SupportForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
