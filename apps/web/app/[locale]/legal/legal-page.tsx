import type { ReactNode } from 'react';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

export type LegalSection = { readonly title: string; readonly body: ReactNode };

export const LegalPage = ({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
}) => (
  <div className="min-h-screen bg-white text-[#1F4D3A]">
    <SiteHeader />
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-16 sm:pt-24">
      <p className="text-sm text-[#1F4D3A]/50">Last updated {updated}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-6 text-[17px] leading-relaxed text-[#1F4D3A]/75">{intro}</p>
      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold tracking-tight">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-[#1F4D3A]/75 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </main>
    <SiteFooter />
  </div>
);
