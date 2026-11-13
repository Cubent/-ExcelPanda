import Link from 'next/link';
import { SiteLogo } from './site-header';

export const SiteFooter = () => (
  <footer className="bg-[#1F4D3A] px-6 pb-8 pt-16 text-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
      <div>
        <SiteLogo light />
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
          Master Excel, hands on. Bite-sized, interactive lessons that stick.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm text-white/70">
        <li><Link href="/" className="hover:text-[#C7F000]">Home</Link></li>
        <li><Link href="/blog" className="hover:text-[#C7F000]">Blog</Link></li>
        <li><Link href="/contact" className="hover:text-[#C7F000]">Support</Link></li>
        <li><Link href="/legal/privacy" className="hover:text-[#C7F000]">Privacy</Link></li>
        <li><Link href="/legal/terms" className="hover:text-[#C7F000]">Terms</Link></li>
      </ul>
    </div>
    <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-sm text-white/40">
      © 2026 ExcelPanda. All rights reserved.
    </p>
  </footer>
);
