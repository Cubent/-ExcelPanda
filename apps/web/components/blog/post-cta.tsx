import Link from 'next/link';

type PostCtaProps = {
  heading: string;
  body: string;
  href: string;
  label: string;
  /** Small print under the button. */
  note?: string;
};

export const PostCta = ({ heading, body, href, label, note }: PostCtaProps) => (
  <aside className="not-prose my-10 rounded-2xl bg-[#1F4D3A] p-6 sm:p-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C7F000]">ExcelPanda</p>
    <p className="font-[family-name:var(--font-display)] mt-2 text-2xl font-bold text-white">
      {heading}
    </p>
    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">{body}</p>
    <Link
      href={href}
      className="mt-5 inline-block rounded-full bg-[#C7F000] px-6 py-3 text-sm font-semibold text-[#1F4D3A] transition-colors hover:bg-[#d6ff1a]"
    >
      {label}
    </Link>
    {note && <p className="mt-3 text-xs text-white/50">{note}</p>}
  </aside>
);
