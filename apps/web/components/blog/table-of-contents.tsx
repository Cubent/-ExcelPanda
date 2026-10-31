import type { BlogSection } from '@/content/blog/types';

export const TableOfContents = ({ sections }: { sections: BlogSection[] }) => (
  <nav aria-label="Table of contents" className="my-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">In this guide</p>
    <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
      {sections.map((section, index) => (
        <li key={section.id} className="flex gap-2">
          <span className="w-5 shrink-0 text-gray-400">{index + 1}.</span>
          <a href={`#${section.id}`} className="text-[#1F4D3A] hover:text-[#FF8A5B] hover:underline">
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);
